import 'package:supabase_flutter/supabase_flutter.dart';

import '../models/customer.dart';
import '../models/message.dart';
import '../models/order.dart';
import '../utils/phone.dart';

class SupabaseRepository {
  SupabaseClient get _client => Supabase.instance.client;

  User? get currentUser => _client.auth.currentUser;

  Stream<AuthState> get authChanges => _client.auth.onAuthStateChange;

  Future<void> signIn(String email, String password) async {
    await _client.auth.signInWithPassword(email: email, password: password);
  }

  Future<void> signOut() async {
    await _client.auth.signOut();
  }

  Future<List<Customer>> fetchCustomers() async {
    final data = await _client
        .from('customers')
        .select()
        .order('name', ascending: true);
    return (data as List)
        .map((row) => Customer.fromJson(row as Map<String, dynamic>))
        .toList();
  }

  Future<List<Message>> fetchMessages() async {
    final data = await _client
        .from('messages')
        .select()
        .order('created_at', ascending: false)
        .limit(500);
    return (data as List)
        .map((row) => Message.fromJson(row as Map<String, dynamic>))
        .toList();
  }

  Future<List<Message>> fetchThread(String phoneNumber) async {
    final key = phoneKey(phoneNumber);
    final data = await _client
        .from('messages')
        .select()
        .eq('phone_number', key)
        .order('created_at', ascending: true);
    return (data as List)
        .map((row) => Message.fromJson(row as Map<String, dynamic>))
        .toList();
  }

  Future<void> insertMessage({
    required String phoneNumber,
    required String direction,
    required String body,
    String? customerId,
    String? staffId,
  }) async {
    await _client.from('messages').insert({
      'phone_number': phoneKey(phoneNumber),
      'customer_id': customerId,
      'staff_id': staffId,
      'direction': direction,
      'body': body,
    });
  }

  Future<List<ParcelOrder>> fetchOrders() async {
    final data = await _client
        .from('orders')
        .select('*, customers (id, name, phone_number)')
        .order('updated_at', ascending: false);
    return (data as List)
        .map((row) => ParcelOrder.fromJson(row as Map<String, dynamic>))
        .toList();
  }

  Future<void> logSmsToOrder({
    required String orderId,
    required String staffId,
    required String body,
  }) async {
    await _client.from('contact_logs').insert({
      'order_id': orderId,
      'staff_id': staffId,
      'contact_type': 'sms',
      'outcome': 'sent',
      'notes': body.length > 500 ? body.substring(0, 500) : body,
    });
  }

  Future<void> logCall({
    required String orderId,
    required String staffId,
    required String outcome,
    String? notes,
    String? recordingPath,
  }) async {
    await _client.from('contact_logs').insert({
      'order_id': orderId,
      'staff_id': staffId,
      'contact_type': 'call',
      'outcome': outcome,
      'notes': notes,
      'recording_link': recordingPath,
    });
  }
}
