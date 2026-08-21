import 'dart:convert';
import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:path_provider/path_provider.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:uuid/uuid.dart';

import '../models/call_recording_entry.dart';

/// On-device call recording history (always available, even offline).
class RecordingHistoryService extends ChangeNotifier {
  RecordingHistoryService._();
  static final RecordingHistoryService instance = RecordingHistoryService._();

  static const _prefsKey = 'call_recording_history_v1';
  final _uuid = const Uuid();

  SharedPreferences? _prefs;
  List<CallRecordingEntry> _entries = [];

  List<CallRecordingEntry> get entries => List.unmodifiable(_entries);

  Future<void> load() async {
    _prefs = await SharedPreferences.getInstance();
    final raw = _prefs?.getString(_prefsKey);
    if (raw == null || raw.isEmpty) {
      _entries = [];
      notifyListeners();
      return;
    }
    try {
      final list = jsonDecode(raw) as List<dynamic>;
      _entries = list
          .map((e) => CallRecordingEntry.fromJson(e as Map<String, dynamic>))
          .toList()
        ..sort((a, b) => b.createdAt.compareTo(a.createdAt));
    } catch (_) {
      _entries = [];
    }
    notifyListeners();
  }

  Future<Directory> recordingsDir() async {
    final docs = await getApplicationDocumentsDirectory();
    final dir = Directory('${docs.path}/call_history');
    if (!await dir.exists()) {
      await dir.create(recursive: true);
    }
    return dir;
  }

  Future<CallRecordingEntry> saveRecording({
    required String sourcePath,
    required String phoneNumber,
    String? customerName,
    int? durationSeconds,
    String? notes,
  }) async {
    final id = _uuid.v4();
    final dir = await recordingsDir();
    final destPath = '${dir.path}/$id.m4a';
    final source = File(sourcePath);
    if (!await source.exists()) {
      throw StateError('Recording file missing.');
    }
    await source.copy(destPath);
    // Keep a spare if copy worked; remove temp source when different.
    if (sourcePath != destPath) {
      try {
        await source.delete();
      } catch (_) {}
    }

    final entry = CallRecordingEntry(
      id: id,
      phoneNumber: phoneNumber,
      customerName: customerName,
      localPath: destPath,
      createdAt: DateTime.now(),
      durationSeconds: durationSeconds,
      uploaded: false,
      notes: notes,
    );

    _entries = [entry, ..._entries];
    await _persist();
    notifyListeners();
    return entry;
  }

  Future<void> markUploaded(String id, String storagePath) async {
    final index = _entries.indexWhere((e) => e.id == id);
    if (index < 0) return;
    _entries[index] = _entries[index].copyWith(
      uploaded: true,
      storagePath: storagePath,
    );
    await _persist();
    notifyListeners();
  }

  Future<void> deleteEntry(String id) async {
    final index = _entries.indexWhere((e) => e.id == id);
    if (index < 0) return;
    final path = _entries[index].localPath;
    _entries.removeAt(index);
    await _persist();
    notifyListeners();
    try {
      final file = File(path);
      if (await file.exists()) await file.delete();
    } catch (_) {}
  }

  Future<void> _persist() async {
    _prefs ??= await SharedPreferences.getInstance();
    final encoded = jsonEncode(_entries.map((e) => e.toJson()).toList());
    await _prefs!.setString(_prefsKey, encoded);
  }
}
