import 'package:flutter_dotenv/flutter_dotenv.dart';

class AppConfig {
  static String get supabaseUrl => dotenv.env['SUPABASE_URL'] ?? '';
  static String get supabaseAnonKey => dotenv.env['SUPABASE_ANON_KEY'] ?? '';

  /// Fallback when Settings has not overridden the line.
  static String get defaultBusinessPhone =>
      dotenv.env['BUSINESS_PHONE']?.trim().isNotEmpty == true
          ? dotenv.env['BUSINESS_PHONE']!.trim()
          : '09171392170';

  /// Prefer [SettingsService.instance.businessPhone] at runtime.
  @Deprecated('Use SettingsService.instance.businessPhone')
  static String get businessPhone => defaultBusinessPhone;

  static const disclosureScript =
      'This call may be recorded for delivery verification purposes.';

  static bool get isConfigured =>
      supabaseUrl.isNotEmpty && supabaseAnonKey.isNotEmpty;
}
