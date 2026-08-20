import 'package:flutter/material.dart';

import '../models/customer.dart';
import '../models/message.dart';
import '../services/call_service.dart';
import '../services/sms_service.dart';
import '../services/supabase_repository.dart';
import '../utils/phone.dart';

class ThreadScreen extends StatefulWidget {
  const ThreadScreen({
    super.key,
    required this.repository,
    required this.phoneNumber,
    this.customer,
  });

  final SupabaseRepository repository;
  final String phoneNumber;
  final Customer? customer;

  @override
  State<ThreadScreen> createState() => _ThreadScreenState();
}

class _ThreadScreenState extends State<ThreadScreen> {
  final _composer = TextEditingController();
  final _sms = SmsService();
  final _calls = CallService();
  var _loading = true;
  var _sending = false;
  List<Message> _messages = [];
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _composer.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final messages = await widget.repository.fetchThread(widget.phoneNumber);
      setState(() => _messages = messages);
    } catch (error) {
      setState(() => _error = error.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _send() async {
    final body = _composer.text.trim();
    if (body.isEmpty) return;
    setState(() => _sending = true);
    try {
      await _sms.sendSms(widget.phoneNumber, body);
      await widget.repository.insertMessage(
        phoneNumber: widget.phoneNumber,
        direction: 'outbound',
        body: body,
        customerId: widget.customer?.id,
        staffId: widget.repository.currentUser?.id,
      );
      _composer.clear();
      await _load();
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(error.toString())),
        );
      }
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  Future<void> _call() async {
    try {
      final ok = await _calls.placeCall(widget.phoneNumber);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            ok ? 'Calling ${formatPhone(widget.phoneNumber)}…' : 'Call failed.',
          ),
        ),
      );
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(error.toString())),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final title = widget.customer?.name ?? formatPhone(widget.phoneNumber);
    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: const TextStyle(fontSize: 16)),
            Text(
              formatPhone(widget.phoneNumber),
              style: const TextStyle(fontSize: 12, color: Colors.white70),
            ),
          ],
        ),
        actions: [
          IconButton(
            onPressed: _call,
            icon: const Icon(Icons.call),
            tooltip: 'Call',
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _error != null
                    ? Center(child: Text(_error!))
                    : ListView.builder(
                        padding: const EdgeInsets.all(12),
                        itemCount: _messages.length,
                        itemBuilder: (context, index) {
                          final message = _messages[index];
                          final outbound = message.isOutbound;
                          return Align(
                            alignment: outbound
                                ? Alignment.centerRight
                                : Alignment.centerLeft,
                            child: Container(
                              margin: const EdgeInsets.only(bottom: 8),
                              padding: const EdgeInsets.all(12),
                              constraints: BoxConstraints(
                                maxWidth: MediaQuery.sizeOf(context).width * 0.8,
                              ),
                              decoration: BoxDecoration(
                                color: outbound
                                    ? const Color(0xFF0F5F5B)
                                    : Colors.white,
                                borderRadius: BorderRadius.circular(16),
                                border: outbound
                                    ? null
                                    : Border.all(color: const Color(0xFFE7E0D4)),
                              ),
                              child: Text(
                                message.body,
                                style: TextStyle(
                                  color: outbound ? Colors.white : Colors.black87,
                                ),
                              ),
                            ),
                          );
                        },
                      ),
          ),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(12),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _composer,
                      minLines: 1,
                      maxLines: 4,
                      decoration: const InputDecoration(
                        hintText: 'Type a message…',
                        border: OutlineInputBorder(),
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  FilledButton(
                    onPressed: _sending ? null : _send,
                    child: Text(_sending ? '…' : 'Send'),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
