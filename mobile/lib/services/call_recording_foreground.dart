import 'dart:io';

import 'package:flutter_foreground_task/flutter_foreground_task.dart';

/// Keeps the process alive with a microphone foreground service so recording
/// can continue while the phone dialer is in front.
@pragma('vm:entry-point')
void callRecordingTaskCallback() {
  FlutterForegroundTask.setTaskHandler(_CallRecordingTaskHandler());
}

class _CallRecordingTaskHandler extends TaskHandler {
  @override
  Future<void> onStart(DateTime timestamp, TaskStarter starter) async {}

  @override
  void onRepeatEvent(DateTime timestamp) {}

  @override
  Future<void> onDestroy(DateTime timestamp, bool isTimeout) async {}
}

class CallRecordingForeground {
  static void init() {
    FlutterForegroundTask.initCommunicationPort();
    FlutterForegroundTask.init(
      androidNotificationOptions: AndroidNotificationOptions(
        channelId: 'call_recording',
        channelName: 'Call recording',
        channelDescription:
            'Shows while a parcel call is being recorded for proof.',
        onlyAlertOnce: true,
      ),
      iosNotificationOptions: const IOSNotificationOptions(
        showNotification: false,
        playSound: false,
      ),
      foregroundTaskOptions: ForegroundTaskOptions(
        eventAction: ForegroundTaskEventAction.repeat(15000),
        autoRunOnBoot: false,
        allowWakeLock: true,
        allowWifiLock: false,
      ),
    );
  }

  static Future<void> start({required String phoneLabel}) async {
    if (!Platform.isAndroid) return;

    final notificationPermission =
        await FlutterForegroundTask.checkNotificationPermission();
    if (notificationPermission != NotificationPermission.granted) {
      await FlutterForegroundTask.requestNotificationPermission();
    }

    if (await FlutterForegroundTask.isRunningService) {
      await FlutterForegroundTask.updateService(
        notificationTitle: 'Recording call',
        notificationText: 'Parcel proof · $phoneLabel',
      );
      return;
    }

    await FlutterForegroundTask.startService(
      serviceId: 4217,
      serviceTypes: [
        ForegroundServiceTypes.microphone,
      ],
      notificationTitle: 'Recording call',
      notificationText: 'Parcel proof · $phoneLabel — tap to return',
      callback: callRecordingTaskCallback,
    );
  }

  static Future<void> stop() async {
    if (!Platform.isAndroid) return;
    if (await FlutterForegroundTask.isRunningService) {
      await FlutterForegroundTask.stopService();
    }
  }
}
