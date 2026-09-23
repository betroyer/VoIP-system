package ph.voip.callrecorder.shizuku

import android.content.pm.PackageManager
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import rikka.shizuku.Shizuku

/**
 * Prompt 1 — Check Shizuku service + whether this app has binder permission.
 *
 * User must: install Shizuku → start via Wireless Debugging → Grant this app.
 */
object ShizukuManager {

    enum class Status {
        NotInstalledOrDead,
        RunningNotGranted,
        Ready,
    }

    data class Snapshot(
        val status: Status,
        val message: String,
        val uid: Int = -1,
    )

    private val _snapshot = MutableStateFlow(
        Snapshot(Status.NotInstalledOrDead, "Shizuku not checked yet"),
    )
    val snapshot: StateFlow<Snapshot> = _snapshot.asStateFlow()

    private val binderDeadListener = Shizuku.OnBinderDeadListener {
        refresh("Shizuku binder died — Wireless Debugging may have dropped.")
    }

    private val binderReceivedListener = Shizuku.OnBinderReceivedListener {
        refresh("Shizuku binder connected.")
    }

    private val permissionResultListener =
        Shizuku.OnRequestPermissionResultListener { _, grantResult ->
            refresh(
                if (grantResult == PackageManager.PERMISSION_GRANTED) {
                    "Shizuku permission granted."
                } else {
                    "Shizuku permission denied."
                },
            )
        }

    fun startListening() {
        Shizuku.addBinderDeadListener(binderDeadListener)
        Shizuku.addBinderReceivedListenerSticky(binderReceivedListener)
        Shizuku.addRequestPermissionResultListener(permissionResultListener)
        refresh("Listening for Shizuku.")
    }

    fun stopListening() {
        Shizuku.removeBinderDeadListener(binderDeadListener)
        Shizuku.removeBinderReceivedListener(binderReceivedListener)
        Shizuku.removeRequestPermissionResultListener(permissionResultListener)
    }

    fun refresh(reason: String = ""): Snapshot {
        val snap = compute(reason)
        _snapshot.value = snap
        return snap
    }

    fun isReady(): Boolean = refresh().status == Status.Ready

    fun requestPermission(requestCode: Int = REQUEST_CODE) {
        if (!Shizuku.pingBinder()) return
        if (Shizuku.checkSelfPermission() == PackageManager.PERMISSION_GRANTED) return
        if (Shizuku.shouldShowRequestPermissionRationale()) {
            // Still request; UI should explain why.
        }
        Shizuku.requestPermission(requestCode)
    }

    private fun compute(reason: String): Snapshot {
        if (!Shizuku.pingBinder()) {
            return Snapshot(
                Status.NotInstalledOrDead,
                buildString {
                    append("Shizuku service is not running. ")
                    append("Open the Shizuku app and start it with Wireless Debugging. ")
                    if (reason.isNotBlank()) append("($reason)")
                },
            )
        }
        val granted = Shizuku.checkSelfPermission() == PackageManager.PERMISSION_GRANTED
        if (!granted) {
            return Snapshot(
                Status.RunningNotGranted,
                buildString {
                    append("Shizuku is running, but this app is not granted yet. Tap Grant. ")
                    if (reason.isNotBlank()) append("($reason)")
                },
                uid = Shizuku.getUid(),
            )
        }
        return Snapshot(
            Status.Ready,
            buildString {
                append("Shizuku ready (uid=${Shizuku.getUid()}, api=${Shizuku.getVersion()}). ")
                if (reason.isNotBlank()) append("($reason)")
            },
            uid = Shizuku.getUid(),
        )
    }

    const val REQUEST_CODE = 2401
}
