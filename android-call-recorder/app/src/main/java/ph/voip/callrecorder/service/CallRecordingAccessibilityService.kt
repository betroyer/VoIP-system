package ph.voip.callrecorder.service

import android.accessibilityservice.AccessibilityService
import android.telephony.PhoneStateListener
import android.telephony.TelephonyCallback
import android.telephony.TelephonyManager
import android.util.Log
import android.view.accessibility.AccessibilityEvent
import android.widget.Toast
import androidx.core.content.getSystemService
import ph.voip.callrecorder.audio.CallAudioRecorder
import java.util.concurrent.Executors

/**
 * Prompt 3 — Accessibility service hosts the recording engine and watches
 * telephony call state (incoming / off-hook / idle).
 *
 * Accessibility itself does not magically unlock call audio; Shizuku unlock
 * + CAPTURE_AUDIO_OUTPUT (when grantable) + VOICE_CALL source do the heavy lifting.
 */
class CallRecordingAccessibilityService : AccessibilityService() {

    private val tag = "CallRecA11y"
    private var recorder: CallAudioRecorder? = null
    private var telephonyManager: TelephonyManager? = null
    private var modernCallback: TelephonyCallback? = null

    @Suppress("DEPRECATION")
    private var legacyListener: PhoneStateListener? = null

    override fun onServiceConnected() {
        super.onServiceConnected()
        recorder = CallAudioRecorder(this)
        telephonyManager = getSystemService()
        registerCallState()
        Log.i(tag, "Accessibility service connected; waiting for call state.")
        Toast.makeText(this, "Call recorder service on", Toast.LENGTH_SHORT).show()
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        // Optional: some OEMs only surface dialer UI changes here.
        // Call start/stop is driven by TelephonyManager below.
    }

    override fun onInterrupt() {
        stopRecordingQuietly()
    }

    override fun onDestroy() {
        unregisterCallState()
        stopRecordingQuietly()
        recorder = null
        super.onDestroy()
    }

    private fun registerCallState() {
        val tm = telephonyManager ?: return
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.S) {
            val callback = object : TelephonyCallback(), TelephonyCallback.CallStateListener {
                override fun onCallStateChanged(state: Int) = handleCallState(state)
            }
            modernCallback = callback
            tm.registerTelephonyCallback(Executors.newSingleThreadExecutor(), callback)
        } else {
            @Suppress("DEPRECATION")
            val listener = object : PhoneStateListener() {
                @Deprecated("Deprecated in Java")
                override fun onCallStateChanged(state: Int, phoneNumber: String?) {
                    handleCallState(state)
                }
            }
            legacyListener = listener
            @Suppress("DEPRECATION")
            tm.listen(listener, PhoneStateListener.LISTEN_CALL_STATE)
        }
    }

    private fun unregisterCallState() {
        val tm = telephonyManager ?: return
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.S) {
            modernCallback?.let { tm.unregisterTelephonyCallback(it) }
            modernCallback = null
        } else {
            @Suppress("DEPRECATION")
            legacyListener?.let { tm.listen(it, PhoneStateListener.LISTEN_NONE) }
            legacyListener = null
        }
    }

    private fun handleCallState(state: Int) {
        when (state) {
            TelephonyManager.CALL_STATE_OFFHOOK -> {
                Log.i(tag, "Call connected (OFFHOOK) → start recording")
                startRecordingQuietly()
            }
            TelephonyManager.CALL_STATE_IDLE -> {
                Log.i(tag, "Call idle → stop recording")
                stopRecordingQuietly()
            }
            TelephonyManager.CALL_STATE_RINGING -> {
                Log.i(tag, "Ringing — wait for OFFHOOK before recording")
            }
        }
    }

    private fun startRecordingQuietly() {
        val engine = recorder ?: return
        if (engine.isRecording) return
        try {
            val file = engine.start()
            Log.i(tag, "Started: ${file.absolutePath}")
        } catch (t: Throwable) {
            Log.e(tag, "Start failed", t)
            Toast.makeText(
                this,
                "Record start failed: ${t.message}",
                Toast.LENGTH_LONG,
            ).show()
        }
    }

    private fun stopRecordingQuietly() {
        val engine = recorder ?: return
        if (!engine.isRecording) return
        val file = engine.stop()
        Log.i(tag, "Saved: ${file?.absolutePath}")
        file?.let {
            Toast.makeText(this, "Saved ${it.name}", Toast.LENGTH_SHORT).show()
        }
    }
}
