import 'package:flutter/material.dart';

const _accent = Color(0xFF0F5F5B);
const _background = Color(0xFFF3EFE6);
const _card = Color(0xFFFFFCF7);
const _line = Color(0xFFE7E0D4);
const _muted = Color(0xFF78716C);

ThemeData buildAppTheme() {
  final base = ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: _accent,
      surface: _background,
    ),
  );

  return base.copyWith(
    scaffoldBackgroundColor: _background,
    appBarTheme: const AppBarTheme(
      backgroundColor: Color(0xFF102422),
      foregroundColor: Colors.white,
      elevation: 0,
    ),
    cardTheme: const CardThemeData(
      color: _card,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.all(Radius.circular(12)),
        side: BorderSide(color: _line),
      ),
    ),
    navigationBarTheme: NavigationBarThemeData(
      backgroundColor: _card,
      indicatorColor: _accent.withValues(alpha: 0.12),
      labelTextStyle: WidgetStateProperty.all(
        const TextStyle(fontSize: 12, color: _muted),
      ),
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        backgroundColor: _accent,
        foregroundColor: Colors.white,
      ),
    ),
  );
}
