package ph.voip.callrecorder.ui

import android.content.Intent
import android.os.Bundle
import android.provider.Settings
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import ph.voip.callrecorder.databinding.ActivityWizardBinding
import ph.voip.callrecorder.shizuku.ShizukuManager

/**
 * Full step-by-step activation guide for both-sides SIM call recording.
 */
class WizardActivity : AppCompatActivity() {

    private lateinit var binding: ActivityWizardBinding
    private var step = 0

    private enum class Action {
        None,
        OpenDeveloperSettings,
        OpenShizukuOrPlay,
        GrantShizuku,
        RunUnlockHint,
        OpenAccessibility,
        Done,
    }

    private data class GuideStep(
        val title: String,
        val body: String,
        val tip: String,
        val actionLabel: String? = null,
        val action: Action = Action.None,
        val showPairing: Boolean = false,
    )

    private val steps = listOf(
        GuideStep(
            title = "What this app does",
            body = "This app records Unli SIM calls on this phone so you can hear both voices:\n" +
                "• Your voice (call taker)\n" +
                "• The customer’s voice (person you called)\n\n" +
                "It needs Shizuku + Wireless Debugging once per phone. After setup, calls record automatically when connected.",
            tip = "RA 4200: on every call say — “This call may be recorded for quality purposes.”",
        ),
        GuideStep(
            title = "Install Shizuku",
            body = "1. Install the Shizuku app (Play Store or GitHub release from rikka.shizuku).\n" +
                "2. Keep this VoIP Call Recorder app installed.\n" +
                "3. You will pair them with Wireless Debugging next.",
            tip = "Shizuku is required. Without it, Android blocks system call audio for normal apps.",
            actionLabel = "Open app settings / store",
            action = Action.OpenShizukuOrPlay,
        ),
        GuideStep(
            title = "Turn on Developer options",
            body = "1. Open Settings → About phone.\n" +
                "2. Tap Build number seven times until you see “You are now a developer.”\n" +
                "3. Go back → System → Developer options.",
            tip = "Menu names can differ slightly by brand (Samsung, Xiaomi, Oppo).",
            actionLabel = "Open Developer settings",
            action = Action.OpenDeveloperSettings,
        ),
        GuideStep(
            title = "Enable Wireless debugging",
            body = "1. In Developer options, turn on Wireless debugging.\n" +
                "2. Tap the Wireless debugging row to open details.\n" +
                "3. Stay on normal Wi‑Fi (not guest/VPN if possible).",
            tip = "Wireless debugging must stay on while Shizuku is running.",
            actionLabel = "Open Developer settings",
            action = Action.OpenDeveloperSettings,
        ),
        GuideStep(
            title = "Pair with a pairing code",
            body = "1. Tap “Pair device with pairing code”.\n" +
                "2. Write down the 6-digit code and IP:port.\n" +
                "3. Open Shizuku → use Wireless debugging pairing → enter the code.\n" +
                "4. In Shizuku, tap Start.",
            tip = "Optional: type the code below so you do not forget it while switching apps.",
            showPairing = true,
        ),
        GuideStep(
            title = "Grant this app in Shizuku",
            body = "1. Return to VoIP Call Recorder home.\n" +
                "2. Tap “Grant Shizuku permission”.\n" +
                "3. Approve the Shizuku prompt.\n" +
                "4. Status should say Shizuku ready.",
            tip = "If Grant fails, open Shizuku and confirm it still shows Running.",
            actionLabel = "Grant Shizuku now",
            action = Action.GrantShizuku,
        ),
        GuideStep(
            title = "Run ADB unlock",
            body = "1. On the home screen tap “Run ADB unlock commands”.\n" +
                "2. Wait for the log to finish.\n" +
                "3. This tries to allow Accessibility + call-audio privileges.",
            tip = "If CAPTURE_AUDIO_OUTPUT is “NOT granted”, your phone may still record mic-only. Test a short call.",
            actionLabel = "I’ll do this on Home",
            action = Action.RunUnlockHint,
        ),
        GuideStep(
            title = "Enable Accessibility",
            body = "1. Open Accessibility settings.\n" +
                "2. Find VoIP Call Recorder.\n" +
                "3. Turn it ON and confirm.\n" +
                "4. Allow Microphone and Phone permissions if asked.",
            tip = "Accessibility keeps the recorder alive and watches when a call connects.",
            actionLabel = "Open Accessibility",
            action = Action.OpenAccessibility,
        ),
        GuideStep(
            title = "Test: hear both voices",
            body = "1. Call a coworker for 20–30 seconds.\n" +
                "2. Say the RA 4200 disclosure.\n" +
                "3. Hang up.\n" +
                "4. Open folder:\n" +
                "Android/data/ph.voip.callrecorder/files/recordings/\n" +
                "5. Play the newest .m4a — you should hear both sides.",
            tip = "Only hear yourself? That OEM blocked VOICE_CALL. Try another staff phone, or use the Phone app’s built-in Record and upload to the web dashboard.",
            actionLabel = "Finish & go home",
            action = Action.Done,
        ),
    )

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityWizardBinding.inflate(layoutInflater)
        setContentView(binding.root)

        step = intent.getIntExtra(EXTRA_START_STEP, 0).coerceIn(0, steps.lastIndex)

        binding.btnBack.setOnClickListener {
            if (step == 0) finish() else {
                step--
                render()
            }
        }
        binding.btnNext.setOnClickListener {
            if (step < steps.lastIndex) {
                step++
                render()
            } else {
                finishGuide(markComplete = true)
            }
        }
        binding.btnAction.setOnClickListener { runStepAction() }

        render()
    }

    private fun render() {
        val s = steps[step]
        val total = steps.size
        binding.stepCounter.text = "Step ${step + 1} of $total"
        binding.stepProgress.progress = ((step + 1) * 100) / total
        binding.stepLabel.text = s.title
        binding.stepBody.text = s.body
        binding.stepTip.text = "Tip: ${s.tip}"
        binding.pairingBox.visibility = if (s.showPairing) View.VISIBLE else View.GONE

        if (s.actionLabel != null) {
            binding.btnAction.visibility = View.VISIBLE
            binding.btnAction.text = s.actionLabel
        } else {
            binding.btnAction.visibility = View.GONE
        }

        binding.btnNext.text = if (step == steps.lastIndex) "Done" else "Next"
        binding.btnBack.text = if (step == 0) "Close" else "Back"
    }

    private fun runStepAction() {
        when (steps[step].action) {
            Action.OpenDeveloperSettings -> {
                runCatching {
                    startActivity(Intent("android.settings.APPLICATION_DEVELOPMENT_SETTINGS"))
                }.onFailure {
                    startActivity(Intent(Settings.ACTION_SETTINGS))
                }
            }
            Action.OpenShizukuOrPlay -> {
                val play = Intent(
                    Intent.ACTION_VIEW,
                    android.net.Uri.parse("market://details?id=moe.shizuku.privileged.api"),
                )
                runCatching { startActivity(play) }.onFailure {
                    startActivity(
                        Intent(
                            Intent.ACTION_VIEW,
                            android.net.Uri.parse(
                                "https://play.google.com/store/apps/details?id=moe.shizuku.privileged.api",
                            ),
                        ),
                    )
                }
            }
            Action.GrantShizuku -> {
                ShizukuManager.startListening()
                ShizukuManager.requestPermission()
                Toast.makeText(this, "Approve the Shizuku prompt", Toast.LENGTH_SHORT).show()
            }
            Action.RunUnlockHint -> {
                Toast.makeText(
                    this,
                    "Tap Next, then on Home use “Run ADB unlock commands”.",
                    Toast.LENGTH_LONG,
                ).show()
            }
            Action.OpenAccessibility -> {
                startActivity(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS))
            }
            Action.Done -> finishGuide(markComplete = true)
            Action.None -> Unit
        }
    }

    private fun finishGuide(markComplete: Boolean) {
        val code = binding.inputPairingCode.text?.toString().orEmpty()
        val endpoint = binding.inputPairingPort.text?.toString().orEmpty()
        val prefs = getSharedPreferences(PREFS, MODE_PRIVATE).edit()
        if (code.isNotBlank()) {
            prefs.putString("last_pairing_code", code)
            prefs.putString("last_endpoint", endpoint)
        }
        if (markComplete) {
            prefs.putBoolean(KEY_GUIDE_DONE, true)
        }
        prefs.apply()
        setResult(RESULT_OK)
        finish()
    }

    companion object {
        const val PREFS = "wizard"
        const val KEY_GUIDE_DONE = "guide_done"
        const val EXTRA_START_STEP = "start_step"
    }
}
