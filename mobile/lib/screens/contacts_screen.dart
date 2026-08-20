import 'package:flutter/material.dart';

import '../models/customer.dart';
import '../services/call_service.dart';
import '../services/supabase_repository.dart';
import '../utils/phone.dart';
import 'thread_screen.dart';

class ContactsScreen extends StatefulWidget {
  const ContactsScreen({super.key, required this.repository});

  final SupabaseRepository repository;

  @override
  State<ContactsScreen> createState() => _ContactsScreenState();
}

class _ContactsScreenState extends State<ContactsScreen> {
  final _calls = CallService();
  var _loading = true;
  List<Customer> _customers = [];
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final customers = await widget.repository.fetchCustomers();
      setState(() => _customers = customers);
    } catch (error) {
      setState(() => _error = error.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _call(Customer customer) async {
    try {
      await _calls.placeCall(customer.phoneNumber);
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
    return Scaffold(
      appBar: AppBar(
        title: const Text('Contacts'),
        actions: [
          IconButton(onPressed: _load, icon: const Icon(Icons.refresh)),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text(_error!))
              : _customers.isEmpty
                  ? const Center(child: Text('No customers yet.'))
                  : ListView.separated(
                      padding: const EdgeInsets.all(12),
                      itemCount: _customers.length,
                      separatorBuilder: (_, _) => const SizedBox(height: 8),
                      itemBuilder: (context, index) {
                        final customer = _customers[index];
                        return Card(
                          child: ListTile(
                            title: Text(customer.name),
                            subtitle: Text(formatPhone(customer.phoneNumber)),
                            trailing: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                IconButton(
                                  icon: const Icon(Icons.message_outlined),
                                  onPressed: () {
                                    Navigator.of(context).push(
                                      MaterialPageRoute(
                                        builder: (_) => ThreadScreen(
                                          repository: widget.repository,
                                          phoneNumber: customer.phoneNumber,
                                          customer: customer,
                                        ),
                                      ),
                                    );
                                  },
                                ),
                                IconButton(
                                  icon: const Icon(Icons.call),
                                  onPressed: () => _call(customer),
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
    );
  }
}
