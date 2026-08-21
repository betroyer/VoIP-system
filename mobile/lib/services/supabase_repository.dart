import 'dart:io';

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

  /// Upload local m4a to private `call-recordings` bucket. Returns storage path.
  Future<String> uploadCallRecording({
    required String localPath,
    required String phoneNumber,
  }) async {
    final staffId = currentUser?.id;
    if (staffId == null) {
      throw StateError('Sign in required to upload recordings.');
    }

    final file = File(localPath);
    final bytes = await file.readAsBytes();
    final stamp = DateTime.now().toUtc().toIso8601String().replaceAll(':', '-');
    final key = phoneKey(phoneNumber);
    final path = '$staffId/${key}_$stamp.m4a';

    await _client.storage.from('call-recordings').uploadBinary(
          path,
          bytes,
          fileOptions: const FileOptions(
            contentType: 'audio/mp4',
            upsert: false,
          ),
        );

    return path;
  }

  Future<void> insertCallRecording({
    required String phoneNumber,
    required String storagePath,
    String? customerId,
    String? orderId,
    int? durationSeconds,
    String? notes,
  }) async {
    final staffId = currentUser?.id;
    if (staffId == null) {
      throw StateError('Sign in required to save recording metadata.');
    }

    await _client.from('call_recordings').insert({
      'staff_id': staffId,
      'phone_number': phoneKey(phoneNumber),
      'customer_id': customerId,
      'order_id': orderId,
      'storage_path': storagePath,
      'duration_seconds': durationSeconds,
      'notes': notes,
    });

    if (orderId != null) {
      await logCall(
        orderId: orderId,
        staffId: staffId,
        outcome: 'answered',
        notes: notes ?? 'Recorded call for parcel proof.',
        recordingPath: storagePath,
      );
    }
  }
}
