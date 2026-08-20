import '../models/customer.dart';
import '../models/message.dart';
import '../utils/phone.dart';

class InboxThread {
  final String phoneNumber;
  final String lastBody;
  final DateTime lastAt;
  final String direction;
  final Customer? customer;

  InboxThread({
    required this.phoneNumber,
    required this.lastBody,
    required this.lastAt,
    required this.direction,
    this.customer,
  });
}

List<InboxThread> buildThreads(List<Message> messages, List<Customer> customers) {
  final byPhone = <String, List<Message>>{};
  for (final message in messages) {
    final key = phoneKey(message.phoneNumber);
    byPhone.putIfAbsent(key, () => []).add(message);
  }

  final threads = <InboxThread>[];
  for (final entry in byPhone.entries) {
    final sorted = [...entry.value]
      ..sort((a, b) => b.createdAt.compareTo(a.createdAt));
    final last = sorted.first;
    Customer? customer;
    for (final c in customers) {
      if (phoneKey(c.phoneNumber) == entry.key) {
        customer = c;
        break;
      }
    }
    threads.add(
      InboxThread(
        phoneNumber: entry.key,
        lastBody: last.body,
        lastAt: last.createdAt,
        direction: last.direction,
        customer: customer,
      ),
    );
  }

  threads.sort((a, b) => b.lastAt.compareTo(a.lastAt));
  return threads;
}
