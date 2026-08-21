String phoneKey(String phone) {
  final digits = phone.replaceAll(RegExp(r'\D'), '');
  if (digits.startsWith('63') && digits.length >= 12) {
    return '0${digits.substring(2)}';
  }
  if (digits.length == 10 && digits.startsWith('9')) {
    return '0$digits';
  }
  return digits;
}

String formatPhone(String phone) {
  final key = phoneKey(phone);
  if (key.length == 11 && key.startsWith('09')) {
    return '${key.substring(0, 4)} ${key.substring(4, 7)} ${key.substring(7)}';
  }
  return phone;
}

bool isPhilippineMobile(String phone) {
  final key = phoneKey(phone);
  return RegExp(r'^09\d{9}$').hasMatch(key);
}

String labelStatus(String status) {
  return status
      .split('_')
      .map((part) =>
          part.isEmpty ? part : '${part[0].toUpperCase()}${part.substring(1)}')
      .join(' ');
}
