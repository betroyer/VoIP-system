import 'dart:async';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:phone_state/phone_state.dart';

import '../config/app_config.dart';
import '../services/call_service.dart';
import '../services/recording_service.dart';
import '../services/supabase_repository.dart';
import '../utils/phone.dart';

/// Consent → record → dial → save recording for parcel proof.
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
          'Recording is saved as parcel delivery proof. '
          'Use speakerphone so more of the customer’s voice is captured.\n\n'
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

class _ActiveCallScreenState extends State<ActiveCallScreen> {
  final _calls = CallService();
  final _recorder = RecordingService();
  StreamSubscription<PhoneState>? _phoneSub;
  var _status = 'Starting…';
  var _recording = false;
  var _saving = false;
  var _dialed = false;
  var _finished = false;

  @override
  void initState() {
    super.initState();
    _begin();
  }

  @override
  void dispose() {
    _phoneSub?.cancel();
    unawaited(_recorder.dispose());
    super.dispose();
  }

  Future<void> _begin() async {
    try {
      setState(() => _status = 'Starting recorder…');
      await _recorder.startRecording(phoneNumber: widget.phoneNumber);
      setState(() {
        _recording = true;
        _status = 'Recording — placing call…';
      });

      _phoneSub = PhoneState.stream.listen((state) {
        if (_finished) return;
        if (state.status == PhoneStateStatus.CALL_ENDED) {
          unawaited(_finish(auto: true));
        }
      });

      final ok = await _calls.placeCall(widget.phoneNumber);
      if (!mounted) return;
      setState(() {
        _dialed = ok;
        _status = ok
            ? 'On call — recording for parcel proof.\n'
                'Use speakerphone. Tap Stop when the call ends.'
            : 'Dial failed. You can still stop and discard.';
      });
    } catch (error) {
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
          ? 'Call ended — saving recording…'
          : 'Stopping — saving recording…';
    });
    _finished = true;
    await _phoneSub?.cancel();
    _phoneSub = null;

    try {
      final result = await _recorder.stopRecording();
      setState(() => _recording = false);

      if (result == null) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text(
              'No audio was captured. Log the call outcome manually.',
            ),
          ),
        );
        Navigator.of(context).pop();
        return;
      }

      final path = await widget.repository.uploadCallRecording(
        localPath: result.filePath,
        phoneNumber: widget.phoneNumber,
      );

      await widget.repository.insertCallRecording(
        phoneNumber: widget.phoneNumber,
        storagePath: path,
        customerId: widget.customerId,
        orderId: widget.orderId,
        durationSeconds: result.durationSeconds,
        notes: 'Parcel call recording (RA 4200 disclosure given).',
      );

      try {
        final file = File(result.filePath);
        if (await file.exists()) await file.delete();
      } catch (_) {}

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'Recording saved for ${formatPhone(widget.phoneNumber)} '
            '(${result.durationSeconds ?? 0}s).',
          ),
        ),
      );
      Navigator.of(context).pop();
    } catch (error) {
      _finished = false;
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
              content: Text('Tap Stop & save when the call ends.'),
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
              const Icon(Icons.mic, size: 56, color: Color(0xFF0F5F5B)),
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
              if (_dialed)
                const Text(
                  'Stay on this screen until the call ends so the recording can upload.',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 13, color: Colors.black54),
                ),
              const SizedBox(height: 16),
              FilledButton.icon(
                onPressed: _saving || !_recording
                    ? null
                    : () => _finish(auto: false),
                icon: const Icon(Icons.stop),
                label: Text(_saving ? 'Saving…' : 'Stop & save recording'),
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
