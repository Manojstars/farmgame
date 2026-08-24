#!/usr/bin/env python3
"""
Direct Android build script that bypasses Expo CLI.
Uses react-native CLI to prebuild, then gradle to assemble APK.
"""

import os
import sys
import subprocess
import shutil
import json
from pathlib import Path

def run_command(cmd, cwd=None):
    """Run a shell command and return the result."""
    print(f"\n>>> Running: {' '.join(cmd)}")
    try:
        result = subprocess.run(
            cmd,
            cwd=cwd,
            capture_output=False,
            text=True,
            shell=False
        )
        return result.returncode == 0
    except Exception as e:
        print(f"ERROR: {e}")
        return False

def main():
    project_root = Path(__file__).parent.absolute()
    android_dir = project_root / "android"
    
    print(f"Project root: {project_root}")
    print(f"Android dir: {android_dir}")
    
    # Check if android directory already exists
    if android_dir.exists():
        print("Android directory already exists. Cleaning...")
        shutil.rmtree(android_dir)
    
    # Read package.json to get app config
    package_json = project_root / "package.json"
    with open(package_json) as f:
        pkg = json.load(f)
    
    print(f"App name: {pkg.get('name')}")
    print(f"Version: {pkg.get('version')}")
    
    # Step 1: Prebuild Android using react-native
    print("\n=== Step 1: Prebuilding Android ===")
    os.chdir(project_root)
    
    # Use npx expo prebuild but handle the error
    cmd = [
        "npx", "expo", "prebuild",
        "--clean",
        "--platform", "android",
        "--yes"
    ]
    
    # Try to run it, but don't fail if it has the Expo CLI bug
    # We'll create the android directory manually if needed
    result = run_command(cmd)
    
    # If prebuild failed, try alternative approach
    if not result or not android_dir.exists():
        print("Prebuild failed or didn't create android directory. Trying alternative...")
        
        # Try using react-native init to create a template
        print("Creating Android template with React Native...")
        temp_project = project_root / "temp_rn_project"
        
        cmd = ["npx", "react-native", "init", "FarmGameApp", "--template", "typescript"]
        if not run_command(cmd, cwd=project_root):
            print("Failed to create React Native project")
            return False
        
        # Copy android directory from temp project
        temp_android = temp_project / "FarmGameApp" / "android"
        if temp_android.exists():
            shutil.copytree(temp_android, android_dir)
            shutil.rmtree(temp_project)
            print(f"Copied Android template to {android_dir}")
    
    # Step 2: Verify gradle exists
    print("\n=== Step 2: Checking Gradle ===")
    gradlew = android_dir / "gradlew.bat"
    if not gradlew.exists():
        gradlew = android_dir / "gradlew"
    
    if not gradlew.exists():
        print(f"ERROR: Gradle wrapper not found in {android_dir}")
        print("Contents:")
        for item in android_dir.iterdir():
            print(f"  - {item.name}")
        return False
    
    print(f"Found gradle wrapper: {gradlew}")
    
    # Step 3: Build debug APK
    print("\n=== Step 3: Building Debug APK ===")
    os.chdir(android_dir)
    
    if sys.platform == "win32":
        cmd = [str(gradlew), "assembleDebug"]
    else:
        cmd = ["./gradlew", "assembleDebug"]
    
    if not run_command(cmd):
        print("Gradle build failed")
        return False
    
    # Step 4: Verify APK was created
    print("\n=== Step 4: Verifying APK ===")
    apk_path = android_dir / "app" / "build" / "outputs" / "apk" / "debug" / "app-debug.apk"
    
    if apk_path.exists():
        apk_size = apk_path.stat().st_size / (1024 * 1024)  # Convert to MB
        print(f"✅ SUCCESS: APK created at {apk_path}")
        print(f"   Size: {apk_size:.2f} MB")
        
        # Copy to output
        output_path = project_root / "game.apk"
        shutil.copy2(apk_path, output_path)
        print(f"   Copied to: {output_path}")
        
        return True
    else:
        print(f"ERROR: APK not found at {apk_path}")
        print("Build outputs:")
        outputs_dir = android_dir / "app" / "build" / "outputs"
        if outputs_dir.exists():
            for root, dirs, files in os.walk(outputs_dir):
                level = root.replace(str(outputs_dir), "").count(os.sep)
                indent = " " * 2 * level
                print(f"{indent}{os.path.basename(root)}/")
                for file in files:
                    print(f"{indent}  {file}")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
