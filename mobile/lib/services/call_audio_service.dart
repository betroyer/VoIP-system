import 'dart:io';

import 'package:flutter/services.dart';

/// Forces speakerphone and in-call audio routing while recording.
///
/// Android blocks direct cellular capture for normal apps; routing call audio
/// through the speaker and recording via the mic is the Cube ACR-style path.
class CallAudioService {
  CallAudioService._();

  static final CallAudioService instance = CallAudioService._();

  static const _channel = MethodChannel('com.betroyer.customer_contact/call_audio');

  var _active = false;

  bool get isActive => _active;

  Future<void> beginCallRecording() async {
    if (!Platform.isAndroid || _active) return;
    await _channel.invokeMethod<void>('beginCallRecording');
    _active = true;
  }

  Future<void> keepSpeakerOn() async {
    if (!Platform.isAndroid || !_active) return;
    await _channel.invokeMethod<void>('keepSpeakerOn');
  }

  Future<void> endCallRecording() async {
    if (!Platform.isAndroid || !_active) return;
    try {
      await _channel.invokeMethod<void>('endCallRecording');
    } finally {
      _active = false;
    }
  }
}
