import 'package:flutter/material.dart';

import '../services/supabase_repository.dart';
import 'settings_screen.dart';

IconButton settingsAction(BuildContext context, SupabaseRepository repository) {
  return IconButton(
    icon: const Icon(Icons.settings_outlined),
    tooltip: 'Settings',
    onPressed: () {
      Navigator.of(context).push(
        MaterialPageRoute(
          builder: (_) => SettingsScreen(repository: repository),
        ),
      );
    },
  );
}
