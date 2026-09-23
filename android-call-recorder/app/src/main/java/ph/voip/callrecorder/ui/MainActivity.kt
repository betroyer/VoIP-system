package ph.voip.callrecorder.ui

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import ph.voip.callrecorder.databinding.ActivityMainBinding
import ph.voip.callrecorder.shizuku.AdbPrivilegeHelper
import ph.voip.callrecorder.shizuku.ShizukuManager
import ph.voip.callrecorder.shizuku.ShizukuManager.Status
import java.io.File

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding

    private val permissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions(),
    ) {
        refreshChecklist()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        ShizukuManager.startListening()
        requestRuntimePermissions()

        lifecycleScope.launch {
            ShizukuManager.snapshot.collectLatest { snap ->
                binding.statusText.text = "Shizuku: ${snap.message}"
                refreshChecklist(snap.status)
            }
        }

        binding.btnRefreshShizuku.setOnClickListener {
            ShizukuManager.refresh("Manual refresh")
        }
        binding.btnGrantShizuku.setOnClickListener {
            ShizukuManager.requestPermission()
        }
        binding.btnUnlock.setOnClickListener { runUnlock() }
        binding.btnWizard.setOnClickListener { openGuide() }
        binding.btnOpenAccessibility.setOnClickListener {
            startActivity(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS))
        }
        binding.btnOpenRecordings.setOnClickListener {
            val dir = File(getExternalFilesDir(null), "recordings").apply { mkdirs() }
            Toast.makeText(
                this,
                "Recordings folder:\n${dir.absolutePath}",
                Toast.LENGTH_LONG,
            ).show()
        }

        maybeOpenGuideOnFirstLaunch()
    }

    override fun onResume() {
        super.onResume()
        ShizukuManager.refresh()
        refreshChecklist()
    }

    override fun onDestroy() {
        ShizukuManager.stopListening()
        super.onDestroy()
    }

    private fun maybeOpenGuideOnFirstLaunch() {
        val prefs = getSharedPreferences(WizardActivity.PREFS, MODE_PRIVATE)
        if (!prefs.getBoolean(WizardActivity.KEY_GUIDE_DONE, false)) {
            openGuide()
        }
    }

    private fun openGuide() {
        startActivity(Intent(this, WizardActivity::class.java))
    }

    private fun refreshChecklist(status: Status = ShizukuManager.snapshot.value.status) {
        val micOk = ContextCompat.checkSelfPermission(
            this,
            Manifest.permission.RECORD_AUDIO,
        ) == PackageManager.PERMISSION_GRANTED
        val phoneOk = ContextCompat.checkSelfPermission(
            this,
            Manifest.permission.READ_PHONE_STATE,
        ) == PackageManager.PERMISSION_GRANTED
        val shizukuOk = status == Status.Ready
        val guideDone = getSharedPreferences(WizardActivity.PREFS, MODE_PRIVATE)
            .getBoolean(WizardActivity.KEY_GUIDE_DONE, false)

        fun mark(ok: Boolean, label: String) = (if (ok) "✓" else "○") + "  $label"

        binding.checklistText.text = listOf(
            mark(guideDone, "Finished step-by-step setup guide"),
            mark(shizukuOk, "Shizuku running + permission granted"),
            mark(micOk, "Microphone permission"),
            mark(phoneOk, "Phone state permission"),
            mark(false, "Accessibility ON (check in system settings)"),
            mark(false, "Test call saved under recordings/"),
        ).joinToString("\n") +
            "\n\nAfter a call, play the newest .m4a — both voices means setup worked."
    }

    private fun requestRuntimePermissions() {
        val needed = mutableListOf(
            Manifest.permission.RECORD_AUDIO,
            Manifest.permission.READ_PHONE_STATE,
        )
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            needed += Manifest.permission.POST_NOTIFICATIONS
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            needed += Manifest.permission.READ_CALL_LOG
        }
        val missing = needed.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }
        if (missing.isNotEmpty()) {
            permissionLauncher.launch(missing.toTypedArray())
        }
    }

    private fun runUnlock() {
        binding.unlockLog.text = "Running elevated shell…"
        lifecycleScope.launch {
            val result = withContext(Dispatchers.IO) {
                AdbPrivilegeHelper.unlockRestrictedCapabilities(this@MainActivity)
            }
            val detail = result.results.joinToString("\n\n") { r ->
                val streams = listOf(r.stdout, r.stderr).filter { it.isNotBlank() }.joinToString(" | ")
                "\$ ${r.command}\nexit=${r.exitCode} ok=${r.ok}" +
                    if (streams.isNotBlank()) "\n$streams" else ""
            }
            binding.unlockLog.text = result.summary + "\n\n" + detail
            getSharedPreferences(WizardActivity.PREFS, MODE_PRIVATE).edit()
                .putBoolean("unlock_ran", true)
                .apply()
            refreshChecklist()
            Toast.makeText(this@MainActivity, result.summary, Toast.LENGTH_LONG).show()
        }
    }
}
