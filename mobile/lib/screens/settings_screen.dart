import 'package:flutter/material.dart';

import '../services/settings_service.dart';
import '../services/supabase_repository.dart';
import '../utils/phone.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key, required this.repository});

  final SupabaseRepository repository;

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  final _phone = TextEditingController();
  var _saving = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _phone.text = SettingsService.instance.businessPhone;
  }

  @override
  void dispose() {
    _phone.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    setState(() {
      _saving = true;
      _error = null;
    });
    try {
      await SettingsService.instance.setBusinessPhone(_phone.text.trim());
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(
            'Business number set to ${formatPhone(SettingsService.instance.businessPhone)}',
          ),
        ),
      );
      Navigator.of(context).pop();
    } catch (error) {
      setState(() => _error = error.toString().replaceFirst('ArgumentError: ', ''));
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  Future<void> _reset() async {
    await SettingsService.instance.resetBusinessPhone();
    _phone.text = SettingsService.instance.businessPhone;
    setState(() {});
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Reset to default business number.')),
    );
  }

  Future<void> _signOut() async {
    await widget.repository.signOut();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Text(
            'Business SIM number',
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: 8),
          const Text(
            'This is the line this phone should be using (Unli Call & Text). '
            'Calls and SMS still go through whichever SIM is physically in the device — '
            'swap the SIM if you change this number.',
            style: TextStyle(color: Colors.black54, height: 1.4),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _phone,
            keyboardType: TextInputType.phone,
            decoration: const InputDecoration(
              labelText: 'Business number',
              hintText: '09xx xxx xxxx',
              border: OutlineInputBorder(),
              prefixIcon: Icon(Icons.sim_card_outlined),
            ),
          ),
          if (_error != null) ...[
            const SizedBox(height: 8),
            Text(_error!, style: const TextStyle(color: Color(0xFFB42318))),
          ],
          const SizedBox(height: 16),
          FilledButton(
            onPressed: _saving ? null : _save,
            child: Text(_saving ? 'Saving…' : 'Save business number'),
          ),
          const SizedBox(height: 8),
          TextButton(
            onPressed: _saving ? null : _reset,
            child: const Text('Reset to default'),
          ),
          const Divider(height: 40),
          ListTile(
            contentPadding: EdgeInsets.zero,
            leading: const Icon(Icons.logout),
            title: const Text('Sign out'),
            onTap: _signOut,
          ),
        ],
      ),
    );
  }
}
