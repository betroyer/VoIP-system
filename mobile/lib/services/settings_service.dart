import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../config/app_config.dart';
import '../utils/phone.dart';

/// Persisted staff preferences (business line shown in the app).
class SettingsService extends ChangeNotifier {
  SettingsService._();
  static final SettingsService instance = SettingsService._();

  static const _businessPhoneKey = 'business_phone';

  SharedPreferences? _prefs;
  String _businessPhone = AppConfig.defaultBusinessPhone;

  String get businessPhone => _businessPhone;

  Future<void> load() async {
    _prefs = await SharedPreferences.getInstance();
    final stored = _prefs?.getString(_businessPhoneKey)?.trim();
    if (stored != null && stored.isNotEmpty) {
      _businessPhone = phoneKey(stored);
    } else {
      _businessPhone = AppConfig.defaultBusinessPhone;
    }
    notifyListeners();
  }

  Future<void> setBusinessPhone(String value) async {
    final normalized = phoneKey(value);
    if (!isPhilippineMobile(normalized)) {
      throw ArgumentError('Enter a Philippine mobile number (09xxxxxxxxx).');
    }
    _prefs ??= await SharedPreferences.getInstance();
    await _prefs!.setString(_businessPhoneKey, normalized);
    _businessPhone = normalized;
    notifyListeners();
  }

  Future<void> resetBusinessPhone() async {
    _prefs ??= await SharedPreferences.getInstance();
    await _prefs!.remove(_businessPhoneKey);
    _businessPhone = AppConfig.defaultBusinessPhone;
    notifyListeners();
  }
}
