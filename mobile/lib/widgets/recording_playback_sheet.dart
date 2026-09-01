import 'dart:async';
import 'dart:io';

import 'package:audioplayers/audioplayers.dart';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';

import '../models/call_recording_entry.dart';
import '../utils/phone.dart';

String _formatClock(Duration duration) {
  final totalSeconds = duration.inSeconds;
  final minutes = totalSeconds ~/ 60;
  final seconds = totalSeconds % 60;
  return '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
}

/// Modal player with play/pause and a seekable playhead.
class RecordingPlaybackSheet extends StatefulWidget {
  const RecordingPlaybackSheet({super.key, required this.entry});

  final CallRecordingEntry entry;

  static Future<void> show(BuildContext context, CallRecordingEntry entry) {
    return showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => RecordingPlaybackSheet(entry: entry),
    );
  }

  @override
  State<RecordingPlaybackSheet> createState() => _RecordingPlaybackSheetState();
}

class _RecordingPlaybackSheetState extends State<RecordingPlaybackSheet> {
  final _player = AudioPlayer();
  StreamSubscription<Duration>? _positionSub;
  StreamSubscription<Duration>? _durationSub;
  StreamSubscription<PlayerState>? _stateSub;

  var _position = Duration.zero;
  var _duration = Duration.zero;
  var _ready = false;
  var _loading = true;
  String? _error;

  bool get _isPlaying => _player.state == PlayerState.playing;

  @override
  void initState() {
    super.initState();
    _initPlayer();
  }

  Future<void> _initPlayer() async {
    final file = File(widget.entry.localPath);
    if (!await file.exists()) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _error = 'Recording file is missing on this phone.';
      });
      return;
    }

    _positionSub = _player.onPositionChanged.listen((position) {
      if (!mounted) return;
      setState(() => _position = position);
    });
    _durationSub = _player.onDurationChanged.listen((duration) {
      if (!mounted) return;
      setState(() => _duration = duration);
    });
    _stateSub = _player.onPlayerStateChanged.listen((_) {
      if (mounted) setState(() {});
    });

    try {
      await _player.setSource(DeviceFileSource(widget.entry.localPath));
      final total = await _player.getDuration();
      if (!mounted) return;
      setState(() {
        _duration = total ?? Duration.zero;
        _ready = true;
        _loading = false;
      });
      await _player.resume();
    } catch (error) {
      if (!mounted) return;
      setState(() {
        _loading = false;
        _error = error.toString();
      });
    }
  }

  @override
  void dispose() {
    _positionSub?.cancel();
    _durationSub?.cancel();
    _stateSub?.cancel();
    unawaited(_player.stop());
    _player.dispose();
    super.dispose();
  }

  Future<void> _togglePlayPause() async {
    if (!_ready) return;
    if (_isPlaying) {
      await _player.pause();
    } else {
      if (_position >= _duration && _duration > Duration.zero) {
        await _player.seek(Duration.zero);
      }
      await _player.resume();
    }
  }

  Future<void> _seek(double value) async {
    if (!_ready || _duration == Duration.zero) return;
    final target = Duration(milliseconds: value.round());
    await _player.seek(target);
    if (mounted) setState(() => _position = target);
  }

  @override
  Widget build(BuildContext context) {
    final formatter = DateFormat('MMM d, yyyy · h:mm a');
    final title =
        widget.entry.customerName ?? formatPhone(widget.entry.phoneNumber);
    final maxMs = _duration.inMilliseconds > 0
        ? _duration.inMilliseconds.toDouble()
        : 1.0;
    final positionMs = _position.inMilliseconds
        .clamp(0, _duration.inMilliseconds > 0 ? _duration.inMilliseconds : 0)
        .toDouble();

    return Padding(
      padding: EdgeInsets.only(
        left: 16,
        right: 16,
        bottom: MediaQuery.paddingOf(context).bottom + 16,
      ),
      child: Material(
        color: const Color(0xFFFFFCF7),
        borderRadius: BorderRadius.circular(20),
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 40,
                height: 4,
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  color: const Color(0xFFE7E0D4),
                  borderRadius: BorderRadius.circular(99),
                ),
              ),
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          title,
                          style: Theme.of(context).textTheme.titleMedium,
                        ),
                        const SizedBox(height: 4),
                        Text(
                          formatPhone(widget.entry.phoneNumber),
                          style: const TextStyle(color: Color(0xFF78716C)),
                        ),
                        Text(
                          formatter.format(widget.entry.createdAt.toLocal()),
                          style: const TextStyle(
                            fontSize: 12,
                            color: Color(0xFF78716C),
                          ),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    onPressed: () => Navigator.of(context).pop(),
                    icon: const Icon(Icons.close),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              if (_loading)
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: 24),
                  child: CircularProgressIndicator(),
                )
              else if (_error != null)
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  child: Text(
                    _error!,
                    textAlign: TextAlign.center,
                    style: const TextStyle(color: Color(0xFFB42318)),
                  ),
                )
              else ...[
                Slider(
                  value: positionMs,
                  max: maxMs,
                  activeColor: const Color(0xFF0F5F5B),
                  onChanged: _ready ? _seek : null,
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        _formatClock(_position),
                        style: const TextStyle(
                          fontFamily: 'monospace',
                          color: Color(0xFF78716C),
                        ),
                      ),
                      Text(
                        _formatClock(_duration),
                        style: const TextStyle(
                          fontFamily: 'monospace',
                          color: Color(0xFF78716C),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 8),
                FilledButton.icon(
                  onPressed: _togglePlayPause,
                  icon: Icon(_isPlaying ? Icons.pause : Icons.play_arrow),
                  label: Text(_isPlaying ? 'Pause' : 'Play'),
                ),
                if (widget.entry.notes != null &&
                    widget.entry.notes!.isNotEmpty) ...[
                  const SizedBox(height: 12),
                  Text(
                    widget.entry.notes!,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 12,
                      color: Color(0xFF78716C),
                    ),
                  ),
                ],
              ],
            ],
          ),
        ),
      ),
    );
  }
}
