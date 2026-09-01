import 'dart:io';

import 'package:path_provider/path_provider.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:record/record.dart';

import 'call_audio_service.dart';

/// Best-effort call recording via speakerphone routing + microphone.
///
/// Android blocks full cellular duplex capture for normal apps. Forcing
/// speakerphone and recording in communication mode is the Cube ACR-style path.
class RecordingService {
  final AudioRecorder _recorder = AudioRecorder();
  String? _activePath;
  DateTime? _startedAt;

  bool get isRecording => _activePath != null;
  String? get activePath => _activePath;

  Future<bool> ensurePermissions() async {
    if (!Platform.isAndroid) return false;
    final statuses = await [
      Permission.microphone,
      Permission.phone,
      Permission.notification,
    ].request();
    return (statuses[Permission.microphone]?.isGranted ?? false) &&
        (statuses[Permission.phone]?.isGranted ?? false);
  }

  Future<String> startRecording({required String phoneNumber}) async {
    if (!Platform.isAndroid) {
      throw UnsupportedError('Call recording is Android-only.');
    }
    final granted = await ensurePermissions();
    if (!granted) {
      throw StateError(
        'Microphone and phone permissions are required to record.',
      );
    }
    if (!await _recorder.hasPermission()) {
      throw StateError('Microphone permission denied by the recorder.');
    }
    if (await _recorder.isRecording()) {
      await _recorder.stop();
    }

    final docs = await getApplicationDocumentsDirectory();
    final tempDir = Directory('${docs.path}/call_temp');
    if (!await tempDir.exists()) {
      await tempDir.create(recursive: true);
    }
    final stamp = DateTime.now().toUtc().millisecondsSinceEpoch;
    final safePhone = phoneNumber.replaceAll(RegExp(r'\D'), '');
    final path = '${tempDir.path}/call_${safePhone}_$stamp.m4a';

    await CallAudioService.instance.beginCallRecording();

    await _recorder.start(
      const RecordConfig(
        encoder: AudioEncoder.aacLc,
        bitRate: 128000,
        sampleRate: 44100,
        numChannels: 1,
        androidConfig: AndroidRecordConfig(
          useLegacy: true,
          audioSource: AndroidAudioSource.mic,
          speakerphone: true,
          audioManagerMode: AudioManagerMode.modeInCall,
          manageBluetooth: false,
        ),
      ),
      path: path,
    );

    // Confirm the recorder actually started.
    await Future<void>.delayed(const Duration(milliseconds: 300));
    if (!await _recorder.isRecording()) {
      throw StateError(
        'Recorder did not start. Grant microphone permission and try again.',
      );
    }

    _activePath = path;
    _startedAt = DateTime.now();
    return path;
  }

  Future<RecordingResult?> stopRecording() async {
    final path = _activePath;
    final started = _startedAt;

    String? stoppedPath;
    try {
      if (await _recorder.isRecording()) {
        stoppedPath = await _recorder.stop();
      }
    } catch (_) {
      try {
        stoppedPath = await _recorder.stop();
      } catch (_) {}
    }

    _activePath = null;
    _startedAt = null;
    await CallAudioService.instance.endCallRecording();

    final filePath = stoppedPath ?? path;
    if (filePath == null) return null;

    final file = File(filePath);
    // Wait briefly for filesystem flush after dialer returns.
    for (var i = 0; i < 5; i++) {
      if (await file.exists() && await file.length() > 0) break;
      await Future<void>.delayed(const Duration(milliseconds: 200));
    }

    if (!await file.exists()) return null;
    final length = await file.length();
    if (length < 256) {
      // Essentially empty — dialer likely blocked mic.
      return null;
    }

    final seconds = started == null
        ? null
        : DateTime.now().difference(started).inSeconds;

    return RecordingResult(
      filePath: filePath,
      durationSeconds: seconds,
      bytes: length,
    );
  }

  Future<void> cancelRecording() async {
    try {
      if (await _recorder.isRecording()) {
        await _recorder.stop();
      }
    } catch (_) {}
    final path = _activePath;
    _activePath = null;
    _startedAt = null;
    await CallAudioService.instance.endCallRecording();
    if (path != null) {
      final file = File(path);
      if (await file.exists()) {
        await file.delete();
      }
    }
  }

  Future<void> dispose() async {
    try {
      await _recorder.dispose();
    } catch (_) {}
  }
}

class RecordingResult {
  const RecordingResult({
    required this.filePath,
    this.durationSeconds,
    this.bytes,
  });

  final String filePath;
  final int? durationSeconds;
  final int? bytes;
}
