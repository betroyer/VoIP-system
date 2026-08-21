class CallRecordingEntry {
  const CallRecordingEntry({
    required this.id,
    required this.phoneNumber,
    required this.localPath,
    required this.createdAt,
    this.customerName,
    this.storagePath,
    this.durationSeconds,
    this.uploaded = false,
    this.notes,
  });

  final String id;
  final String phoneNumber;
  final String localPath;
  final DateTime createdAt;
  final String? customerName;
  final String? storagePath;
  final int? durationSeconds;
  final bool uploaded;
  final String? notes;

  CallRecordingEntry copyWith({
    String? storagePath,
    bool? uploaded,
    int? durationSeconds,
    String? notes,
  }) {
    return CallRecordingEntry(
      id: id,
      phoneNumber: phoneNumber,
      localPath: localPath,
      createdAt: createdAt,
      customerName: customerName,
      storagePath: storagePath ?? this.storagePath,
      durationSeconds: durationSeconds ?? this.durationSeconds,
      uploaded: uploaded ?? this.uploaded,
      notes: notes ?? this.notes,
    );
  }

  Map<String, dynamic> toJson() => {
        'id': id,
        'phoneNumber': phoneNumber,
        'localPath': localPath,
        'createdAt': createdAt.toIso8601String(),
        'customerName': customerName,
        'storagePath': storagePath,
        'durationSeconds': durationSeconds,
        'uploaded': uploaded,
        'notes': notes,
      };

  factory CallRecordingEntry.fromJson(Map<String, dynamic> json) {
    return CallRecordingEntry(
      id: json['id'] as String,
      phoneNumber: json['phoneNumber'] as String,
      localPath: json['localPath'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
      customerName: json['customerName'] as String?,
      storagePath: json['storagePath'] as String?,
      durationSeconds: json['durationSeconds'] as int?,
      uploaded: json['uploaded'] as bool? ?? false,
      notes: json['notes'] as String?,
    );
  }
}
