class Message {
  final String id;
  final String phoneNumber;
  final String? customerId;
  final String? staffId;
  final String direction;
  final String body;
  final DateTime createdAt;

  const Message({
    required this.id,
    required this.phoneNumber,
    this.customerId,
    this.staffId,
    required this.direction,
    required this.body,
    required this.createdAt,
  });

  bool get isOutbound => direction == 'outbound';

  factory Message.fromJson(Map<String, dynamic> json) {
    return Message(
      id: json['id'] as String,
      phoneNumber: json['phone_number'] as String,
      customerId: json['customer_id'] as String?,
      staffId: json['staff_id'] as String?,
      direction: json['direction'] as String,
      body: json['body'] as String,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  Map<String, dynamic> toInsert({
    required String phoneNumber,
    required String direction,
    required String body,
    String? customerId,
    String? staffId,
  }) {
    return {
      'phone_number': phoneNumber,
      'customer_id': customerId,
      'staff_id': staffId,
      'direction': direction,
      'body': body,
    };
  }
}
