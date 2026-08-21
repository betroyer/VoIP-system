import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

import 'config/app_config.dart';
import 'screens/app_shell.dart';
import 'screens/login_screen.dart';
import 'services/settings_service.dart';
import 'services/supabase_repository.dart';
import 'theme/app_theme.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load(fileName: '.env');
  await SettingsService.instance.load();

  if (!AppConfig.isConfigured) {
    throw StateError('Set SUPABASE_URL and SUPABASE_ANON_KEY in mobile/.env');
  }

  await Supabase.initialize(
    url: AppConfig.supabaseUrl,
    anonKey: AppConfig.supabaseAnonKey, // ignore: deprecated_member_use
  );

  runApp(const CustomerContactApp());
}

class CustomerContactApp extends StatelessWidget {
  const CustomerContactApp({super.key});

  @override
  Widget build(BuildContext context) {
    final repository = SupabaseRepository();

    return MaterialApp(
      title: 'Customer Contact',
      theme: buildAppTheme(),
      home: StreamBuilder<AuthState>(
        stream: repository.authChanges,
        builder: (context, snapshot) {
          final session = snapshot.data?.session;
          if (session == null) {
            return LoginScreen(repository: repository);
          }
          return AppShell(repository: repository);
        },
      ),
    );
  }
}
