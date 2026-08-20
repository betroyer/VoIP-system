import 'package:flutter/material.dart';

import '../models/order.dart';
import '../services/supabase_repository.dart';
import '../utils/phone.dart';
import 'thread_screen.dart';

class OrdersScreen extends StatefulWidget {
  const OrdersScreen({super.key, required this.repository});

  final SupabaseRepository repository;

  @override
  State<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends State<OrdersScreen> {
  var _loading = true;
  List<ParcelOrder> _orders = [];
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
      final orders = await widget.repository.fetchOrders();
      setState(() => _orders = orders);
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
        title: const Text('Orders'),
        actions: [
          IconButton(onPressed: _load, icon: const Icon(Icons.refresh)),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : _error != null
              ? Center(child: Text(_error!))
              : _orders.isEmpty
                  ? const Center(child: Text('No orders yet.'))
                  : ListView.separated(
                      padding: const EdgeInsets.all(12),
                      itemCount: _orders.length,
                      separatorBuilder: (_, _) => const SizedBox(height: 8),
                      itemBuilder: (context, index) {
                        final order = _orders[index];
                        final customer = order.customer;
                        return Card(
                          child: ListTile(
                            title: Text(customer?.name ?? 'Customer'),
                            subtitle: Text(
                              '${labelStatus(order.parcelStatus)}'
                              '${order.trackingNumber != null ? ' · ${order.trackingNumber}' : ''}',
                            ),
                            trailing: order.needsContact
                                ? const Chip(label: Text('Contact'))
                                : null,
                            onTap: customer == null
                                ? null
                                : () {
                                    Navigator.of(context).push(
                                      MaterialPageRoute(
                                        builder: (_) => ThreadScreen(
                                          repository: widget.repository,
                                          phoneNumber: customer.phoneNumber,
                                          customer: null,
                                        ),
                                      ),
                                    );
                                  },
                          ),
                        );
                      },
                    ),
    );
  }
}
