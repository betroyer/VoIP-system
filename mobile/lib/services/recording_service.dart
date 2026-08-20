/// Best-effort call recording — device-dependent (Android 10+).
///
/// Phase 5: integrate with a tested recorder on target hardware.
/// Until then, rely on [contact_logs] outcome + notes as the baseline record.
class RecordingService {
  Future<bool> isSupportedOnDevice() async {
    // Placeholder — must be validated on the exact staff phone model(s).
    return false;
  }

  Future<String?> startRecording() async {
    return null;
  }

  Future<void> stopRecording() async {}
}
