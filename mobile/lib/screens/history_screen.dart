import 'dart:async';

import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../models/call_recording_entry.dart';
import '../services/recording_history_service.dart';
import '../services/supabase_repository.dart';
import '../utils/phone.dart';
import '../widgets/recording_playback_sheet.dart';
import 'settings_action.dart';

class HistoryScreen extends StatefulWidget {
  const HistoryScreen({super.key, required this.repository});

  final SupabaseRepository repository;

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  Future<void> _retryUpload(CallRecordingEntry entry) async {
    try {
      final path = await widget.repository.uploadCallRecording(
        localPath: entry.localPath,
        phoneNumber: entry.phoneNumber,
      );
      await widget.repository.insertCallRecording(
        phoneNumber: entry.phoneNumber,
        storagePath: path,
        durationSeconds: entry.durationSeconds,
        notes: entry.notes,
      );
      await RecordingHistoryService.instance.markUploaded(entry.id, path);
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Uploaded to cloud.')),
      );
    } catch (error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(error.toString())),
      );
    }
  }

  Future<void> _delete(CallRecordingEntry entry) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete recording?'),
        content: Text(
          'Remove ${formatPhone(entry.phoneNumber)} from History on this phone?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
    if (ok == true) {
      await RecordingHistoryService.instance.deleteEntry(entry.id);
    }
  }

  @override
  Widget build(BuildContext context) {
    final formatter = DateFormat('MMM d, yyyy · h:mm a');

    return Scaffold(
      appBar: AppBar(
        title: const Text('History'),
        actions: [settingsAction(context, widget.repository)],
      ),
      body: ListenableBuilder(
        listenable: RecordingHistoryService.instance,
        builder: (context, _) {
          final entries = RecordingHistoryService.instance.entries;
          if (entries.isEmpty) {
            return const Center(
              child: Padding(
                padding: EdgeInsets.all(24),
                child: Text(
                  'No call recordings yet.\n'
                  'Use Dial → Call & record, then Stop & save.',
                  textAlign: TextAlign.center,
                ),
              ),
            );
          }

          return ListView.separated(
            padding: const EdgeInsets.all(12),
            itemCount: entries.length,
            separatorBuilder: (_, _) => const SizedBox(height: 8),
            itemBuilder: (context, index) {
              final entry = entries[index];
              return Card(
                child: ListTile(
                  leading: const Icon(
                    Icons.graphic_eq,
                    color: Color(0xFF0F5F5B),
                  ),
                  title: Text(
                    entry.customerName ?? formatPhone(entry.phoneNumber),
                  ),
                  subtitle: Text(
                    '${formatPhone(entry.phoneNumber)}\n'
                    '${formatter.format(entry.createdAt.toLocal())}'
                    '${entry.durationSeconds != null ? ' · ${entry.durationSeconds}s' : ''}\n'
                    '${entry.uploaded ? 'Synced to cloud' : 'Saved on this phone'}',
                  ),
                  isThreeLine: true,
                  onTap: () => RecordingPlaybackSheet.show(context, entry),
                  trailing: PopupMenuButton<String>(
                    onSelected: (value) {
                      if (value == 'upload') {
                        unawaited(_retryUpload(entry));
                      } else if (value == 'delete') {
                        unawaited(_delete(entry));
                      }
                    },
                    itemBuilder: (context) => [
                      if (!entry.uploaded)
                        const PopupMenuItem(
                          value: 'upload',
                          child: Text('Upload to cloud'),
                        ),
                      const PopupMenuItem(
                        value: 'delete',
                        child: Text('Delete'),
                      ),
                    ],
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
