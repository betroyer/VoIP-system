package ph.voip.callrecorder.audio

import android.content.Context
import android.media.AudioFormat
import android.media.AudioRecord
import android.media.MediaRecorder
import android.os.Build
import android.util.Log
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.concurrent.atomic.AtomicBoolean

/**
 * Prompt 4 — Two-way oriented capture.
 *
 * Prefers MediaRecorder AudioSource.VOICE_CALL when the platform allows it
 * (often needs CAPTURE_AUDIO_OUTPUT / OEM support). Falls back to
 * VOICE_COMMUNICATION then MIC so the app still saves *something*.
 */
class CallAudioRecorder(private val context: Context) {

    private val tag = "CallAudioRecorder"
    private var mediaRecorder: MediaRecorder? = null
    private var outputFile: File? = null
    private val recording = AtomicBoolean(false)

    val isRecording: Boolean get() = recording.get()
    val lastOutputFile: File? get() = outputFile

    fun start(): File {
        check(!recording.get()) { "Already recording" }

        val dir = File(context.getExternalFilesDir(null), "recordings").apply { mkdirs() }
        val name = "call_" + SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US).format(Date()) + ".m4a"
        val file = File(dir, name)

        val sources = preferredSources()
        var lastError: Throwable? = null

        for (source in sources) {
            try {
                val recorder = createRecorder(source, file)
                recorder.prepare()
                recorder.start()
                mediaRecorder = recorder
                outputFile = file
                recording.set(true)
                Log.i(tag, "Recording started source=$source → ${file.absolutePath}")
                return file
            } catch (t: Throwable) {
                lastError = t
                Log.w(tag, "AudioSource $source failed: ${t.message}")
                runCatching { mediaRecorder?.release() }
                mediaRecorder = null
            }
        }

        throw IllegalStateException(
            "Could not start call recording with any AudioSource. " +
                "Last error: ${lastError?.message}. " +
                "On many phones VOICE_CALL stays blocked even after Shizuku.",
            lastError,
        )
    }

    fun stop(): File? {
        if (!recording.getAndSet(false)) return outputFile
        val file = outputFile
        try {
            mediaRecorder?.apply {
                runCatching { stop() }
                release()
            }
        } finally {
            mediaRecorder = null
        }
        Log.i(tag, "Recording stopped → ${file?.absolutePath}")
        return file
    }

    private fun preferredSources(): List<Int> = buildList {
        // Best chance at uplink+downlink when OEM + privilege allow it.
        add(MediaRecorder.AudioSource.VOICE_CALL)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            add(MediaRecorder.AudioSource.VOICE_COMMUNICATION)
        }
        add(MediaRecorder.AudioSource.VOICE_RECOGNITION)
        add(MediaRecorder.AudioSource.MIC)
    }

    private fun createRecorder(source: Int, file: File): MediaRecorder {
        val recorder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            MediaRecorder(context)
        } else {
            @Suppress("DEPRECATION")
            MediaRecorder()
        }
        recorder.setAudioSource(source)
        recorder.setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
        recorder.setAudioEncoder(MediaRecorder.AudioEncoder.AAC)
        recorder.setAudioEncodingBitRate(128_000)
        recorder.setAudioSamplingRate(44_100)
        recorder.setOutputFile(file.absolutePath)
        return recorder
    }

    companion object {
        /** Optional probe: can we open VOICE_CALL with AudioRecord at all? */
        fun canOpenVoiceCall(): Boolean {
            val sampleRate = 44_100
            val channel = AudioFormat.CHANNEL_IN_MONO
            val encoding = AudioFormat.ENCODING_PCM_16BIT
            val min = AudioRecord.getMinBufferSize(sampleRate, channel, encoding)
            if (min <= 0) return false
            return try {
                val record = AudioRecord(
                    MediaRecorder.AudioSource.VOICE_CALL,
                    sampleRate,
                    channel,
                    encoding,
                    min * 2,
                )
                val ok = record.state == AudioRecord.STATE_INITIALIZED
                record.release()
                ok
            } catch (_: SecurityException) {
                false
            } catch (_: Throwable) {
                false
            }
        }
    }
}
