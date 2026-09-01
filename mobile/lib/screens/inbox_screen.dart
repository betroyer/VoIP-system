import 'dart:async';

import 'package:flutter/material.dart';

import '../services/inbound_sms_sync.dart';
import '../services/sms_service.dart';
import '../services/supabase_repository.dart';
import '../utils/inbox.dart';
import '../utils/phone.dart';
import 'settings_action.dart';
import 'thread_screen.dart';

class InboxScreen extends StatefulWidget {
  const InboxScreen({super.key, required this.repository});

  final SupabaseRepository repository;

  @override
  State<InboxScreen> createState() => _InboxScreenState();
}

class _InboxScreenState extends State<InboxScreen> {
  final _sms = SmsService();
  var _loading = true;
  List<InboxThread> _threads = [];
  String? _error;

  @override
  void initState() {
    super.initState();
    InboundSmsNotifier.instance.addListener(_onInboundSms);
    unawaited(_load());
  }

  @override
  void dispose() {
    InboundSmsNotifier.instance.removeListener(_onInboundSms);
    super.dispose();
  }

  void _onInboundSms() {
    unawaited(_load(syncDevice: false));
  }

  Future<void> _load({bool syncDevice = true}) async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      if (syncDevice) {
        await syncDeviceInbox(_sms);
      }
      final customers = await widget.repository.fetchCustomers();
      final messages = await widget.repository.fetchMessages();
      setState(() => _threads = buildThreads(messages, customers));
    } catch (error) {
      setState(() => _error = error.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Inbox'),
        actions: [
          settingsAction(context, widget.repository),
          IconButton(onPressed: _load, icon: const Icon(Icons.refresh)),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text(_error!))
              : _threads.isEmpty
                  ? const Center(child: Text('No conversations yet.'))
                  : RefreshIndicator(
                      onRefresh: _load,
                      child: ListView.separated(
                        padding: const EdgeInsets.all(12),
                        itemCount: _threads.length,
                        separatorBuilder: (_, _) => const SizedBox(height: 8),
                        itemBuilder: (context, index) {
                          final thread = _threads[index];
                          return Card(
                            child: ListTile(
                              title: Text(
                                thread.customer?.name ??
                                    formatPhone(thread.phoneNumber),
                              ),
                              subtitle: Text(
                                thread.lastBody,
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              trailing: Text(
                                thread.direction == 'outbound' ? '↑' : '↓',
                              ),
                              onTap: () async {
                                await Navigator.of(context).push(
                                  MaterialPageRoute(
                                    builder: (_) => ThreadScreen(
                                      repository: widget.repository,
                                      phoneNumber: thread.phoneNumber,
                                      customer: thread.customer,
                                    ),
                                  ),
                                );
                                if (mounted) await _load();
                              },
                            ),
                          );
                        },
                      ),
                    ),
    );
  }
}
