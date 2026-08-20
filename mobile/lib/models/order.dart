class ParcelOrder {
  final String id;
  final String customerId;
  final String parcelStatus;
  final String? trackingNumber;
  final String? notes;
  final bool needsContact;
  final DateTime updatedAt;
  final CustomerSummary? customer;

  const ParcelOrder({
    required this.id,
    required this.customerId,
    required this.parcelStatus,
    this.trackingNumber,
    this.notes,
    required this.needsContact,
    required this.updatedAt,
    this.customer,
  });

  factory ParcelOrder.fromJson(Map<String, dynamic> json) {
    final nested = json['customers'];
    return ParcelOrder(
      id: json['id'] as String,
      customerId: json['customer_id'] as String,
      parcelStatus: json['parcel_status'] as String,
      trackingNumber: json['tracking_number'] as String?,
      notes: json['notes'] as String?,
      needsContact: json['needs_contact'] as bool? ?? true,
      updatedAt: DateTime.parse(json['updated_at'] as String),
      customer: nested is Map<String, dynamic>
          ? CustomerSummary.fromJson(nested)
          : null,
    );
  }
}

class CustomerSummary {
  final String id;
  final String name;
  final String phoneNumber;

  const CustomerSummary({
    required this.id,
    required this.name,
    required this.phoneNumber,
  });

  factory CustomerSummary.fromJson(Map<String, dynamic> json) {
    return CustomerSummary(
      id: json['id'] as String,
      name: json['name'] as String,
      phoneNumber: json['phone_number'] as String,
    );
  }
}
