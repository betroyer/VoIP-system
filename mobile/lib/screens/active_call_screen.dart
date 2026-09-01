import 'dart:async';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:phone_state/phone_state.dart';

import '../config/app_config.dart';
import '../services/audio_cleanup_service.dart';
import '../services/call_recording_foreground.dart';
import '../services/call_service.dart';
import '../services/recording_history_service.dart';
import '../services/recording_service.dart';
import '../services/supabase_repository.dart';
import '../utils/phone.dart';

/// Consent → foreground mic → dial → save to History (then optional cloud upload).
Future<void> startRecordedCall({
  required BuildContext context,
  required SupabaseRepository repository,
  required String phoneNumber,
  String? customerId,
  String? orderId,
  String? customerName,
}) async {
  final confirmed = await showDialog<bool>(
    context: context,
    builder: (context) => AlertDialog(
      title: const Text('Record this call?'),
      content: SingleChildScrollView(
        child: Text(
          '${AppConfig.disclosureScript}\n\n'
          'Say this at the start of the call (RA 4200).\n\n'
          'The recording is saved in History on this phone as parcel proof. '
          'Turn on speakerphone so more of the customer is heard.\n\n'
          'Calling: ${formatPhone(phoneNumber)}'
          '${customerName != null ? '\nCustomer: $customerName' : ''}',
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context, false),
          child: const Text('Cancel'),
        ),
        FilledButton(
          onPressed: () => Navigator.pop(context, true),
          child: const Text('Call & record'),
        ),
      ],
    ),
  );

  if (confirmed != true || !context.mounted) return;

  await Navigator.of(context).push(
    MaterialPageRoute(
      builder: (_) => ActiveCallScreen(
        repository: repository,
        phoneNumber: phoneNumber,
        customerId: customerId,
        orderId: orderId,
        customerName: customerName,
      ),
    ),
  );
}

class ActiveCallScreen extends StatefulWidget {
  const ActiveCallScreen({
    super.key,
    required this.repository,
    required this.phoneNumber,
    this.customerId,
    this.orderId,
    this.customerName,
  });

  final SupabaseRepository repository;
  final String phoneNumber;
  final String? customerId;
  final String? orderId;
  final String? customerName;

  @override
  State<ActiveCallScreen> createState() => _ActiveCallScreenState();
}

class _ActiveCallScreenState extends State<ActiveCallScreen>
    with WidgetsBindingObserver {
  final _calls = CallService();
  final _recorder = RecordingService();
  StreamSubscription<PhoneState>? _phoneSub;
  var _status = 'Starting…';
  var _recording = false;
  var _saving = false;
  var _dialed = false;
  var _finished = false;
  var _sawCallStarted = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _begin();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _phoneSub?.cancel();
    unawaited(CallRecordingForeground.stop());
    unawaited(_recorder.dispose());
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed &&
        _dialed &&
        _recording &&
        !_finished &&
        mounted) {
      setState(() {
        _status =
            'Back in the app — if the call is over, tap Stop & save to History.';
      });
    }
  }

  Future<void> _begin() async {
    try {
      setState(() => _status = 'Starting recorder…');
      await CallRecordingForeground.start(
        phoneLabel: formatPhone(widget.phoneNumber),
      );
      await _recorder.startRecording(phoneNumber: widget.phoneNumber);
      setState(() {
        _recording = true;
        _status = 'Recording — placing call…';
      });

      _phoneSub = PhoneState.stream.listen((state) {
        if (_finished) return;
        if (state.status == PhoneStateStatus.CALL_STARTED ||
            state.status == PhoneStateStatus.CALL_OUTGOING) {
          _sawCallStarted = true;
        }
        if (state.status == PhoneStateStatus.CALL_ENDED && _sawCallStarted) {
          unawaited(_finish(auto: true));
        }
      });

      final ok = await _calls.placeCall(widget.phoneNumber);
      if (!mounted) return;
      setState(() {
        _dialed = ok;
        _status = ok
            ? 'On call — recording.\n'
                'Use speakerphone.\n'
                'When finished, return here and tap Stop & save.'
            : 'Dial failed. You can stop and discard.';
      });
    } catch (error) {
      await CallRecordingForeground.stop();
      if (!mounted) return;
      setState(() => _status = error.toString());
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.toString())),
      );
    }
  }

  Future<void> _finish({required bool auto}) async {
    if (_finished || _saving) return;
    setState(() {
      _saving = true;
      _status = auto
          ? 'Call ended — saving to History…'
          : 'Stopping — saving to History…';
    });
    _finished = true;
    await _phoneSub?.cancel();
    _phoneSub = null;

    try {
      final result = await _recorder.stopRecording();
      await CallRecordingForeground.stop();
      setState(() => _recording = false);

      if (result == null) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              'No audio captured. Keep the app recording notification on, '
              'use speakerphone, and tap Stop right after the call.',
            ),
          ),
        );
        Navigator.of(context).pop();
        return;
      }

      // Prepare a speech-focused copy for History. If the filter fails, keep
      // the original recording so the call is not lost.
      final cleanedPath = await AudioCleanupService().cleanForReview(
        sourcePath: result.filePath,
      );
      final reviewPath = cleanedPath ?? result.filePath;

      // Always store on-device History first (works even if cloud fails).
      final entry = await RecordingHistoryService.instance.saveRecording(
        sourcePath: reviewPath,
        phoneNumber: widget.phoneNumber,
        customerName: widget.customerName,
        durationSeconds: result.durationSeconds,
        notes: cleanedPath != null
            ? 'Parcel call recording; background-noise reduction applied.'
            : 'Parcel call recording (RA 4200 disclosure given).',
      );

      // The clean copy was moved into History. Remove the temporary original.
      if (cleanedPath != null && cleanedPath != result.filePath) {
        try {
          final original = File(result.filePath);
          if (await original.exists()) await original.delete();
        } catch (_) {}
      }

      // Best-effort cloud sync.
      try {
        final path = await widget.repository.uploadCallRecording(
          localPath: entry.localPath,
          phoneNumber: widget.phoneNumber,
        );
        await widget.repository.insertCallRecording(
          phoneNumber: widget.phoneNumber,
          storagePath: path,
          customerId: widget.customerId,
          orderId: widget.orderId,
          durationSeconds: result.durationSeconds,
          notes: entry.notes,
        );
        await RecordingHistoryService.instance.markUploaded(entry.id, path);
      } catch (uploadError) {
        debugPrint('Cloud upload skipped: $uploadError');
      }

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'Saved to History · ${formatPhone(widget.phoneNumber)} '
            '(${result.durationSeconds ?? 0}s)',
          ),
        ),
      );
      Navigator.of(context).pop();
    } catch (error) {
      _finished = false;
      await CallRecordingForeground.stop();
      if (!mounted) return;
      setState(() {
        _saving = false;
        _status = 'Save failed: $error\nTap Stop to retry.';
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.toString())),
      );
    }
  }

  Future<void> _discard() async {
    _finished = true;
    await _phoneSub?.cancel();
    await _recorder.cancelRecording();
    await CallRecordingForeground.stop();
    if (mounted) Navigator.of(context).pop();
  }

  @override
  Widget build(BuildContext context) {
    final title = widget.customerName ?? formatPhone(widget.phoneNumber);
    return PopScope(
      canPop: !_recording || _finished,
      onPopInvokedWithResult: (didPop, _) {
        if (!didPop && _recording && !_finished) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Tap Stop & save to keep this call in History.'),
            ),
          );
        }
      },
      child: Scaffold(
        appBar: AppBar(
          title: Text(title),
          automaticallyImplyLeading: false,
        ),
        body: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Icon(
                _recording ? Icons.mic : Icons.mic_none,
                size: 56,
                color: const Color(0xFF0F5F5B),
              ),
              const SizedBox(height: 16),
              Text(
                _recording ? 'Recording call' : 'Call recording',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.headlineSmall,
              ),
              const SizedBox(height: 12),
              Text(
                _status,
                textAlign: TextAlign.center,
                style: const TextStyle(height: 1.4, color: Colors.black54),
              ),
              const SizedBox(height: 12),
              Text(
                AppConfig.disclosureScript,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontStyle: FontStyle.italic,
                  color: Colors.black87,
                ),
              ),
              const Spacer(),
              const Text(
                'Recordings are stored in the History tab on this phone.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 13, color: Colors.black54),
              ),
              const SizedBox(height: 16),
              FilledButton.icon(
                onPressed: _saving || !_recording
                    ? null
                    : () => _finish(auto: false),
                icon: const Icon(Icons.stop),
                label: Text(_saving ? 'Saving…' : 'Stop & save to History'),
              ),
              const SizedBox(height: 8),
              TextButton(
                onPressed: _saving ? null : _discard,
                child: const Text('Cancel without saving'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
