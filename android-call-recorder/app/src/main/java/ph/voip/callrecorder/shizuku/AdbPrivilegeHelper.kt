package ph.voip.callrecorder.shizuku

import android.content.Context
import android.content.pm.PackageManager
import android.util.Log
import rikka.shizuku.Shizuku
import java.io.BufferedReader
import java.util.concurrent.TimeUnit

/**
 * Run elevated shell via Shizuku (same idea as Cube Helper).
 *
 * OEM note: `pm grant … CAPTURE_AUDIO_OUTPUT` often fails on stock Android.
 * Shizuku 13 made `Shizuku.newProcess` private — invoked reflectively here.
 */
object AdbPrivilegeHelper {

    private const val TAG = "AdbPrivilegeHelper"

    data class CommandResult(
        val command: String,
        val exitCode: Int,
        val stdout: String,
        val stderr: String,
        val ok: Boolean,
    )

    data class UnlockResult(
        val results: List<CommandResult>,
        val allOk: Boolean,
        val summary: String,
    )

    fun unlockRestrictedCapabilities(context: Context): UnlockResult {
        if (!ShizukuManager.isReady()) {
            return UnlockResult(
                emptyList(),
                false,
                "Shizuku not ready — reconnect Wireless Debugging, then Grant this app.",
            )
        }

        val pkg = context.packageName
        val commands = listOf(
            "appops set $pkg ACCESS_RESTRICTED_SETTINGS allow",
            "pm grant $pkg android.permission.CAPTURE_AUDIO_OUTPUT",
            "pm grant $pkg android.permission.READ_PHONE_STATE",
            "pm grant $pkg android.permission.RECORD_AUDIO",
            "appops set $pkg PROJECT_MEDIA allow",
        )

        val results = mutableListOf<CommandResult>()
        for (cmd in commands) {
            results += runShell(cmd)
        }

        val captureGranted = context.checkSelfPermission(
            "android.permission.CAPTURE_AUDIO_OUTPUT",
        ) == PackageManager.PERMISSION_GRANTED

        val failed = results.filterNot { it.ok }
        val summary = buildString {
            append("Ran ${results.size} shell commands. ")
            if (failed.isEmpty()) append("All reported exit 0. ")
            else append("${failed.size} failed or timed out. ")
            append(
                if (captureGranted) {
                    "CAPTURE_AUDIO_OUTPUT appears granted."
                } else {
                    "CAPTURE_AUDIO_OUTPUT NOT granted (common on stock Android). " +
                        "Two-way audio may still fail; test a call recording."
                },
            )
        }

        Log.i(TAG, summary)
        failed.forEach { Log.w(TAG, "fail: ${it.command} → ${it.stderr.ifBlank { it.stdout }}") }

        return UnlockResult(
            results = results,
            allOk = results.any { it.ok },
            summary = summary,
        )
    }

    fun runShell(command: String, timeoutSec: Long = 15): CommandResult {
        if (!Shizuku.pingBinder()) {
            return CommandResult(
                command = command,
                exitCode = -1,
                stdout = "",
                stderr = "Shizuku binder not connected (Wireless Debugging dropped?).",
                ok = false,
            )
        }
        if (Shizuku.checkSelfPermission() != PackageManager.PERMISSION_GRANTED) {
            return CommandResult(
                command = command,
                exitCode = -1,
                stdout = "",
                stderr = "Shizuku permission not granted to this app.",
                ok = false,
            )
        }

        return try {
            val process = newShizukuProcess(arrayOf("sh", "-c", command))
                ?: return CommandResult(command, -1, "", "Could not start Shizuku process", false)

            val stdout = process.inputStream.bufferedReader().use(BufferedReader::readText)
            val stderr = process.errorStream.bufferedReader().use(BufferedReader::readText)
            val finished = process.waitFor(timeoutSec, TimeUnit.SECONDS)
            if (!finished) {
                process.destroy()
                return CommandResult(
                    command,
                    -1,
                    stdout,
                    stderr.ifBlank { "Command timed out after ${timeoutSec}s" },
                    false,
                )
            }
            val code = process.exitValue()
            CommandResult(
                command = command,
                exitCode = code,
                stdout = stdout.trim(),
                stderr = stderr.trim(),
                ok = code == 0,
            )
        } catch (t: Throwable) {
            Log.e(TAG, "runShell failed: $command", t)
            CommandResult(
                command = command,
                exitCode = -1,
                stdout = "",
                stderr = t.message ?: t.javaClass.simpleName,
                ok = false,
            )
        }
    }

    private fun newShizukuProcess(args: Array<String>): Process? {
        val method = Shizuku::class.java.getDeclaredMethod(
            "newProcess",
            Array<String>::class.java,
            Array<String>::class.java,
            String::class.java,
        )
        method.isAccessible = true
        return method.invoke(null, args, null, null) as? Process
    }
}
