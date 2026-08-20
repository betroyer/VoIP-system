class Customer {
  final String id;
  final String name;
  final String phoneNumber;
  final String network;
  final String? address;
  final DateTime createdAt;

  const Customer({
    required this.id,
    required this.name,
    required this.phoneNumber,
    required this.network,
    this.address,
    required this.createdAt,
  });

  factory Customer.fromJson(Map<String, dynamic> json) {
    return Customer(
      id: json['id'] as String,
      name: json['name'] as String,
      phoneNumber: json['phone_number'] as String,
      network: json['network'] as String? ?? 'other',
      address: json['address'] as String?,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }
}
