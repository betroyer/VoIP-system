import 'dart:async';
import 'dart:io';

import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../models/call_recording_entry.dart';
import '../services/recording_history_service.dart';
import '../services/supabase_repository.dart';
import '../utils/phone.dart';
import 'settings_action.dart';

class HistoryScreen extends StatefulWidget {
  const HistoryScreen({super.key, required this.repository});

  final SupabaseRepository repository;

  @override
  State<HistoryScreen> createState() => _HistoryScreenState();
}

class _HistoryScreenState extends State<HistoryScreen> {
  final _player = AudioPlayer();
  StreamSubscription<void>? _completeSub;
  String? _playingId;

  @override
  void initState() {
    super.initState();
    _completeSub = _player.onPlayerComplete.listen((_) {
      if (mounted) setState(() => _playingId = null);
    });
  }

  @override
  void dispose() {
    _completeSub?.cancel();
    _player.dispose();
    super.dispose();
  }

  Future<void> _togglePlay(CallRecordingEntry entry) async {
    final file = File(entry.localPath);
    if (!await file.exists()) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Recording file is missing on this phone.')),
      );
      return;
    }

    if (_playingId == entry.id) {
      await _player.stop();
      setState(() => _playingId = null);
      return;
    }

    await _player.stop();
    await _player.play(DeviceFileSource(entry.localPath));
    setState(() => _playingId = entry.id);
  }

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
      if (_playingId == entry.id) {
        await _player.stop();
        setState(() => _playingId = null);
      }
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
              final playing = _playingId == entry.id;
              return Card(
                child: ListTile(
                  leading: IconButton(
                    icon: Icon(playing ? Icons.stop_circle : Icons.play_circle),
                    color: const Color(0xFF0F5F5B),
                    onPressed: () => _togglePlay(entry),
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
