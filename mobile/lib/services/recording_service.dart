import 'dart:io';

import 'package:path_provider/path_provider.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:record/record.dart';

/// Best-effort call recording via the device microphone.
///
/// Android does not allow third-party apps to capture the full cellular voice
/// stream. With speakerphone on, this still captures staff audio and usually
/// enough of the customer for parcel-proof notes. Always use RA 4200 consent.
class RecordingService {
  final AudioRecorder _recorder = AudioRecorder();
  String? _activePath;
  DateTime? _startedAt;

  bool get isRecording => _activePath != null;

  Future<bool> ensurePermissions() async {
    if (!Platform.isAndroid) return false;
    final mic = await Permission.microphone.request();
    final phone = await Permission.phone.request();
    return mic.isGranted && phone.isGranted;
  }

  Future<String> startRecording({required String phoneNumber}) async {
    if (!Platform.isAndroid) {
      throw UnsupportedError('Call recording is Android-only.');
    }
    final granted = await ensurePermissions();
    if (!granted) {
      throw StateError('Microphone and phone permissions are required to record.');
    }
    if (await _recorder.isRecording()) {
      await _recorder.stop();
    }

    final dir = await getApplicationDocumentsDirectory();
    final stamp = DateTime.now().toUtc().toIso8601String().replaceAll(':', '-');
    final safePhone = phoneNumber.replaceAll(RegExp(r'\D'), '');
    final path = '${dir.path}/call_${safePhone}_$stamp.m4a';

    await _recorder.start(
      const RecordConfig(
        encoder: AudioEncoder.aacLc,
        bitRate: 128000,
        sampleRate: 44100,
        numChannels: 1,
      ),
      path: path,
    );

    _activePath = path;
    _startedAt = DateTime.now();
    return path;
  }

  Future<RecordingResult?> stopRecording() async {
    final path = _activePath;
    final started = _startedAt;
    _activePath = null;
    _startedAt = null;

    final stoppedPath = await _recorder.stop();
    final filePath = stoppedPath ?? path;
    if (filePath == null) return null;

    final file = File(filePath);
    if (!await file.exists() || await file.length() == 0) {
      return null;
    }

    final seconds = started == null
        ? null
        : DateTime.now().difference(started).inSeconds;

    return RecordingResult(filePath: filePath, durationSeconds: seconds);
  }

  Future<void> cancelRecording() async {
    try {
      await _recorder.stop();
    } catch (_) {}
    final path = _activePath;
    _activePath = null;
    _startedAt = null;
    if (path != null) {
      final file = File(path);
      if (await file.exists()) {
        await file.delete();
      }
    }
  }

  Future<void> dispose() async {
    await _recorder.dispose();
  }
}

class RecordingResult {
  const RecordingResult({
    required this.filePath,
    this.durationSeconds,
  });

  final String filePath;
  final int? durationSeconds;
}
