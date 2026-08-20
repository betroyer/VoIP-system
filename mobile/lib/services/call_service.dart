import 'dart:io';

import 'package:flutter_phone_direct_caller/flutter_phone_direct_caller.dart';
import 'package:permission_handler/permission_handler.dart';

import '../config/app_config.dart';

class CallService {
  Future<bool> ensurePermissions() async {
    if (!Platform.isAndroid) return false;
    final statuses = await [
      Permission.phone,
    ].request();
    return statuses[Permission.phone]?.isGranted ?? false;
  }

  Future<bool> placeCall(String phoneNumber) async {
    if (!Platform.isAndroid) {
      throw UnsupportedError('Calls are Android-only in Plan v7.');
    }
    final granted = await ensurePermissions();
    if (!granted) {
      throw StateError('Phone permission not granted.');
    }

    final digits = phoneNumber.replaceAll(RegExp(r'\D'), '');
    final normalized = digits.startsWith('0') ? digits : '0$digits';

    // TODO(phase 5): play AppConfig.disclosureScript via TTS/recording before dial.
    final result = await FlutterPhoneDirectCaller.callNumber(normalized);
    return result == true;
  }

  String get disclosureScript => AppConfig.disclosureScript;
}
