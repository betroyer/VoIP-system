import 'dart:io';

import 'package:ffmpeg_kit_flutter_new_audio/ffmpeg_kit.dart';
import 'package:ffmpeg_kit_flutter_new_audio/return_code.dart';

/// Creates a speech-focused copy for playback in History.
///
/// This reduces steady background noise and trims very low/high frequencies.
/// It cannot recover audio that Android did not capture from the customer.
class AudioCleanupService {
  Future<String?> cleanForReview({required String sourcePath}) async {
    final source = File(sourcePath);
    if (!await source.exists() || await source.length() < 256) {
      return null;
    }

    final dot = sourcePath.lastIndexOf('.');
    final cleanedPath = dot > 0
        ? '${sourcePath.substring(0, dot)}_cleaned${sourcePath.substring(dot)}'
        : '${sourcePath}_cleaned.m4a';

    try {
      final session = await FFmpegKit.executeWithArguments([
        '-y',
        '-hide_banner',
        '-loglevel',
        'error',
        '-i',
        sourcePath,
        '-af',
        'highpass=f=120,lowpass=f=3600,afftdn=nr=14:nf=-35:tn=1,compand=attacks=0.03:decays=0.25:points=-90/-90|-60/-45|-30/-18|-10/-8|0/-4,dynaudnorm=f=150:g=9',
        '-c:a',
        'aac',
        '-b:a',
        '128k',
        cleanedPath,
      ]);
      final returnCode = await session.getReturnCode();
      final cleaned = File(cleanedPath);
      if (ReturnCode.isSuccess(returnCode) &&
          await cleaned.exists() &&
          await cleaned.length() >= 256) {
        return cleanedPath;
      }
      if (await cleaned.exists()) {
        await cleaned.delete();
      }
    } catch (_) {
      // History still keeps the original recording if cleanup is unavailable.
    }
    return null;
  }
}
