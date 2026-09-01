import 'dart:io';

import 'package:permission_handler/permission_handler.dart';
import 'package:telephony/telephony.dart';

class SmsService {
  final Telephony _telephony = Telephony.instance;

  Future<bool> ensurePermissions() async {
    if (!Platform.isAndroid) return false;
    final statuses = await [
      Permission.sms,
    ].request();
    return statuses[Permission.sms]?.isGranted ?? false;
  }

  Future<void> sendSms(String to, String body) async {
    if (!Platform.isAndroid) {
      throw UnsupportedError('SMS is Android-only in Plan v7.');
    }
    final granted = await ensurePermissions();
    if (!granted) {
      throw StateError('SMS permission not granted.');
    }
    await _telephony.sendSms(
      to: phoneKeyForSms(to),
      message: body,
    );
  }

  String phoneKeyForSms(String phone) {
    final digits = phone.replaceAll(RegExp(r'\D'), '');
    if (digits.startsWith('0') && digits.length == 11) {
      return digits;
    }
    if (digits.startsWith('63') && digits.length >= 12) {
      return '0${digits.substring(2)}';
    }
    return digits;
  }

  void listenInbound({
    required void Function(SmsMessage message) onMessage,
    MessageHandler? onBackgroundMessage,
  }) {
    if (!Platform.isAndroid) return;
    _telephony.listenIncomingSms(
      onNewMessage: onMessage,
      onBackgroundMessage: onBackgroundMessage,
      listenInBackground: onBackgroundMessage != null,
    );
  }

  Future<List<SmsMessage>> fetchRecentInbox({int limit = 200}) async {
    if (!Platform.isAndroid) return const [];
    final granted = await ensurePermissions();
    if (!granted) return const [];

    final messages = await _telephony.getInboxSms(
      sortOrder: [OrderBy(SmsColumn.DATE, sort: Sort.DESC)],
    );
    if (messages.length <= limit) return messages;
    return messages.sublist(0, limit);
  }
}
