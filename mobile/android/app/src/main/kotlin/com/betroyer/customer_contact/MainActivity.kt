package com.betroyer.customer_contact

import android.content.Context
import android.media.AudioManager
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class MainActivity : FlutterActivity() {
    private val channelName = "com.betroyer.customer_contact/call_audio"
    private var savedSpeakerphone: Boolean? = null
    private var savedMode: Int? = null

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, channelName)
            .setMethodCallHandler { call, result ->
                val audioManager =
                    getSystemService(Context.AUDIO_SERVICE) as AudioManager
                when (call.method) {
                    "beginCallRecording" -> {
                        if (savedMode == null) {
                            savedSpeakerphone = audioManager.isSpeakerphoneOn
                            savedMode = audioManager.mode
                        }
                        audioManager.mode = AudioManager.MODE_IN_CALL
                        audioManager.isSpeakerphoneOn = true
                        result.success(true)
                    }

                    "keepSpeakerOn" -> {
                        audioManager.mode = AudioManager.MODE_IN_CALL
                        audioManager.isSpeakerphoneOn = true
                        result.success(audioManager.isSpeakerphoneOn)
                    }

                    "endCallRecording" -> {
                        savedMode?.let { audioManager.mode = it }
                        savedSpeakerphone?.let { audioManager.isSpeakerphoneOn = it }
                        savedMode = null
                        savedSpeakerphone = null
                        result.success(true)
                    }

                    else -> result.notImplemented()
                }
            }
    }
}
