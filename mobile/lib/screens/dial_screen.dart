import 'package:flutter/material.dart';

import '../services/settings_service.dart';
import '../services/supabase_repository.dart';
import '../utils/phone.dart';
import 'active_call_screen.dart';
import 'settings_action.dart';
import 'thread_screen.dart';

/// Free dial pad — call or SMS via the SIM in this phone.
class DialScreen extends StatefulWidget {
  const DialScreen({super.key, required this.repository});

  final SupabaseRepository repository;

  @override
  State<DialScreen> createState() => _DialScreenState();
}

class _DialScreenState extends State<DialScreen> {
  final _controller = TextEditingController();
  var _busy = false;

  static const _keys = [
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '*',
    '0',
    '#',
  ];

  String get _phone => phoneKey(_controller.text);
  bool get _valid => isPhilippineMobile(_phone);

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _press(String key) {
    final next = ('${_controller.text}$key').replaceAll(RegExp(r'[^\d*#]'), '');
    _controller.text = next.length > 15 ? next.substring(0, 15) : next;
    setState(() {});
  }

  void _delete() {
    final text = _controller.text;
    if (text.isEmpty) return;
    _controller.text = text.substring(0, text.length - 1);
    setState(() {});
  }

  Future<void> _call() async {
    if (!_valid) return;
    setState(() => _busy = true);
    try {
      await startRecordedCall(
        context: context,
        repository: widget.repository,
        phoneNumber: _phone,
      );
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  void _message() {
    if (!_valid) return;
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => ThreadScreen(
          repository: widget.repository,
          phoneNumber: _phone,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Dial'),
        actions: [settingsAction(context, widget.repository)],
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            children: [
              ListenableBuilder(
                listenable: SettingsService.instance,
                builder: (context, _) {
                  final line =
                      formatPhone(SettingsService.instance.businessPhone);
                  return Text(
                    'Business line: $line\nCalls and SMS use the SIM in this phone.',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Colors.black54,
                        ),
                    textAlign: TextAlign.center,
                  );
                },
              ),
              const SizedBox(height: 24),
              TextField(
                controller: _controller,
                keyboardType: TextInputType.phone,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 28,
                  fontFamily: 'monospace',
                  letterSpacing: 2,
                ),
                decoration: const InputDecoration(
                  hintText: '09xx xxx xxxx',
                  border: OutlineInputBorder(),
                ),
                onChanged: (_) => setState(() {}),
              ),
              if (_controller.text.isNotEmpty && !_valid)
                const Padding(
                  padding: EdgeInsets.only(top: 8),
                  child: Text(
                    'Use a Philippine mobile number.',
                    style: TextStyle(color: Color(0xFFB42318)),
                  ),
                ),
              const SizedBox(height: 16),
              Expanded(
                child: GridView.count(
                  crossAxisCount: 3,
                  mainAxisSpacing: 8,
                  crossAxisSpacing: 8,
                  childAspectRatio: 1.4,
                  children: [
                    for (final key in _keys)
                      OutlinedButton(
                        onPressed: () => _press(key),
                        child: Text(key, style: const TextStyle(fontSize: 22)),
                      ),
                  ],
                ),
              ),
              Row(
                children: [
                  Expanded(
                    child: FilledButton.icon(
                      onPressed: _valid && !_busy ? _call : null,
                      icon: const Icon(Icons.call),
                      label: Text(_busy ? '…' : 'Call'),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: FilledButton.tonalIcon(
                      onPressed: _valid ? _message : null,
                      icon: const Icon(Icons.message),
                      label: const Text('Message'),
                    ),
                  ),
                  const SizedBox(width: 8),
                  IconButton.outlined(
                    onPressed: _controller.text.isEmpty ? null : _delete,
                    icon: const Icon(Icons.backspace_outlined),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
