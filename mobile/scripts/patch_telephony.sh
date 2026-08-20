#!/usr/bin/env bash
# telephony 0.2.0 lacks android.namespace — required by AGP 8+
set -euo pipefail

CACHE_ROOT="${PUB_CACHE:-$HOME/AppData/Local/Pub/Cache}"
GRADLE_FILE="$CACHE_ROOT/hosted/pub.dev/telephony-0.2.0/android/build.gradle"

if [[ ! -f "$GRADLE_FILE" ]]; then
  echo "telephony not in pub cache; run flutter pub get first"
  exit 1
fi

python - <<'PY'
from pathlib import Path
import os
import re

cache = Path(os.environ.get("PUB_CACHE", Path.home() / "AppData/Local/Pub/Cache"))
gradle = cache / "hosted/pub.dev/telephony-0.2.0/android/build.gradle"
text = gradle.read_text(encoding="utf-8")
changed = False

if 'namespace "com.shounakmulay.telephony"' not in text:
    text = text.replace("android {", 'android {\n    namespace "com.shounakmulay.telephony"', 1)
    changed = True

text, n = re.subn(r'jvmTarget\s*=\s*"1\.8"', 'jvmTarget = "11"', text)
if n:
    changed = True

text, n = re.subn(r"compileSdkVersion\s+31", "compileSdkVersion 36", text)
if n:
    changed = True

if "compileOptions" not in text:
    text = text.replace(
        "    kotlinOptions {\n        jvmTarget = \"11\"\n    }",
        "    compileOptions {\n        sourceCompatibility JavaVersion.VERSION_11\n        targetCompatibility JavaVersion.VERSION_11\n    }\n\n    kotlinOptions {\n        jvmTarget = \"11\"\n    }",
        1,
    )
    changed = True

if changed:
    gradle.write_text(text, encoding="utf-8")
    print(f"Patched {gradle}")
else:
    print("Already patched")
PY
