import 'package:flutter/material.dart';

import '../services/sms_service.dart';
import '../services/supabase_repository.dart';
import 'contacts_screen.dart';
import 'inbox_screen.dart';
import 'orders_screen.dart';

class AppShell extends StatefulWidget {
  const AppShell({super.key, required this.repository});

  final SupabaseRepository repository;

  @override
  State<AppShell> createState() => _AppShellState();
}

class _AppShellState extends State<AppShell> {
  var _index = 0;
  final _sms = SmsService();

  @override
  void initState() {
    super.initState();
    _startInboundSms();
  }

  Future<void> _startInboundSms() async {
    await _sms.ensurePermissions();
    _sms.listenInbound((from, body) async {
      try {
        await widget.repository.insertMessage(
          phoneNumber: from,
          direction: 'inbound',
          body: body,
          staffId: null,
        );
      } catch (error) {
        debugPrint('Inbound SMS sync failed: $error');
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final pages = [
      InboxScreen(repository: widget.repository),
      ContactsScreen(repository: widget.repository),
      OrdersScreen(repository: widget.repository),
    ];

    return Scaffold(
      body: pages[_index],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (value) => setState(() => _index = value),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.inbox_outlined),
            selectedIcon: Icon(Icons.inbox),
            label: 'Inbox',
          ),
          NavigationDestination(
            icon: Icon(Icons.contacts_outlined),
            selectedIcon: Icon(Icons.contacts),
            label: 'Contacts',
          ),
          NavigationDestination(
            icon: Icon(Icons.local_shipping_outlined),
            selectedIcon: Icon(Icons.local_shipping),
            label: 'Orders',
          ),
        ],
      ),
    );
  }
}
