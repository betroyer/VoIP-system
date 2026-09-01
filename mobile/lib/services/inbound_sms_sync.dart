import 'package:flutter/widgets.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:telephony/telephony.dart';

import '../config/app_config.dart';
import '../utils/phone.dart';
import 'sms_service.dart';

/// Notifies inbox and thread screens to reload after inbound SMS is saved.
class InboundSmsNotifier extends ChangeNotifier {
  InboundSmsNotifier._();

  static final InboundSmsNotifier instance = InboundSmsNotifier._();

  String? _lastPhone;

  String? get lastPhone => _lastPhone;

  void ping({String? phoneNumber}) {
    _lastPhone = phoneNumber == null ? null : phoneKey(phoneNumber);
    notifyListeners();
  }
}

Future<void> ensureSupabaseForSmsIsolate() async {
  WidgetsFlutterBinding.ensureInitialized();
  if (Supabase.instance.isInitialized) return;
  await dotenv.load(fileName: '.env');
  if (!AppConfig.isConfigured) return;
  await Supabase.initialize(
    url: AppConfig.supabaseUrl,
    anonKey: AppConfig.supabaseAnonKey, // ignore: deprecated_member_use
  );
}

Future<bool> saveInboundSms({
  required String from,
  required String body,
  String? providerSid,
}) async {
  final client = Supabase.instance.client;
  if (client.auth.currentSession == null) return false;

  final key = phoneKey(from);
  final trimmedBody = body.trim();
  if (key.isEmpty || trimmedBody.isEmpty) return false;

  final sid = providerSid?.trim();
  if (sid != null && sid.isNotEmpty) {
    final existing = await client
        .from('messages')
        .select('id')
        .eq('provider_sid', sid)
        .maybeSingle();
    if (existing != null) return false;
  }

  String? customerId;
  final customer = await client
      .from('customers')
      .select('id')
      .eq('phone_number', key)
      .maybeSingle();
  if (customer != null) {
    customerId = customer['id'] as String?;
  }

  await client.from('messages').insert({
    'phone_number': key,
    'customer_id': customerId,
    'direction': 'inbound',
    'body': trimmedBody,
    if (sid != null && sid.isNotEmpty) 'provider_sid': sid,
  });
  return true;
}

Future<void> handleInboundSmsMessage(SmsMessage message) async {
  final from = message.address ?? '';
  final body = message.body ?? '';
  if (from.isEmpty || body.trim().isEmpty) return;

  await ensureSupabaseForSmsIsolate();
  final saved = await saveInboundSms(
    from: from,
    body: body,
    providerSid: message.id?.toString(),
  );
  if (saved) {
    InboundSmsNotifier.instance.ping(phoneNumber: from);
  }
}

@pragma('vm:entry-point')
Future<void> smsBackgroundMessageHandler(SmsMessage message) async {
  try {
    await handleInboundSmsMessage(message);
  } catch (error) {
    debugPrint('Background inbound SMS failed: $error');
  }
}

Future<int> syncDeviceInbox(SmsService sms) async {
  if (!await sms.ensurePermissions()) return 0;

  final client = Supabase.instance.client;
  if (client.auth.currentSession == null) return 0;

  final inbox = await sms.fetchRecentInbox(limit: 200);
  var synced = 0;
  for (final message in inbox) {
    try {
      final saved = await saveInboundSms(
        from: message.address ?? '',
        body: message.body ?? '',
        providerSid: message.id?.toString(),
      );
      if (saved) synced++;
    } catch (error) {
      debugPrint('Device inbox sync failed: $error');
    }
  }
  if (synced > 0) {
    InboundSmsNotifier.instance.ping();
  }
  return synced;
}
