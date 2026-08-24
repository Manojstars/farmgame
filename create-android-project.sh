#!/bin/bash

# Minimal manual React Native Android build
# This script works around the Expo CLI bug by manually creating necessary files

set -e

echo "=== Manual React Native Android Build ==="

if [ -d "android" ]; then
  echo "Cleaning existing android directory..."
  rm -rf android
fi

echo "Creating Android project structure..."

# Create base directories
mkdir -p android/{app/src/main/{java/com/farmgame,res/{values,mipmap-xxhdpi}},gradle/wrapper}

# Create build.gradle (project level)
cat > android/build.gradle << 'EOF'
// Top-level build file where you can add configuration options common to all sub-projects/modules.

buildscript {
    ext {
        buildToolsVersion = "34.0.0"
        minSdkVersion = 21
        compileSdkVersion = 34
        targetSdkVersion = 34
        ndkVersion = "21.1.6352462"
    }
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath("com.android.tools.build:gradle:7.6.0")
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
        mavenLocal()
    }
}
EOF

# Create app/build.gradle
cat > android/app/build.gradle << 'EOF'
apply plugin: "com.android.application"

android {
    namespace "com.farmgame.app"
    compileSdkVersion 34
    buildToolsVersion "34.0.0"

    defaultConfig {
        applicationId "com.farmgame.app"
        minSdkVersion 21
        targetSdkVersion 34
        versionCode 1
        versionName "1.0.0"
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
        }
        debug {
            debuggable true
        }
    }

    packagingOptions {
        pickFirst 'lib/armeabi-v7a/libc++_shared.so'
        pickFirst 'lib/arm64-v8a/libc++_shared.so'
        pickFirst 'lib/x86/libc++_shared.so'
        pickFirst 'lib/x86_64/libc++_shared.so'
    }
}

dependencies {
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'androidx.core:core:1.12.0'
    testImplementation 'junit:junit:4.13.2'
}
EOF

# Create AndroidManifest.xml
cat > android/app/src/main/AndroidManifest.xml << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.farmgame.app">

    <application
        android:allowBackup="true"
        android:debuggable="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:theme="@style/AppTheme">

        <activity
            android:name=".MainActivity"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

    </application>

</manifest>
EOF

# Create MainActivity.kt
cat > android/app/src/main/java/com/farmgame/MainActivity.kt << 'EOF'
package com.farmgame

import android.app.Activity
import android.os.Bundle

class MainActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
    }
}
EOF

# Create activity_main.xml layout
mkdir -p android/app/src/main/res/layout
cat > android/app/src/main/res/layout/activity_main.xml << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:gravity="center"
    android:orientation="vertical">

    <TextView
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:text="FarmGame"
        android:textSize="32sp" />

</LinearLayout>
EOF

# Create strings.xml
cat > android/app/src/main/res/values/strings.xml << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">FarmGame</string>
</resources>
EOF

# Create styles.xml
cat > android/app/src/main/res/values/styles.xml << 'EOF'
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <style name="AppTheme" parent="android:Theme.Material.Light">
    </style>
</resources>
EOF

# Create gradle-wrapper.properties
cat > android/gradle/wrapper/gradle-wrapper.properties << 'EOF'
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\://services.gradle.org/distributions/gradle-8.5-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
EOF

# Create gradle wrapper scripts
# Linux/Mac version
cat > android/gradlew << 'SCRIPT'
#!/bin/bash
# Gradle wrapper - downloads and runs gradle

DEFAULT_JVM_OPTS='"-Xmx64m" "-Xms64m"'
APP_NAME="Gradle"
APP_HOME="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

CLASSPATH="$APP_HOME/gradle/wrapper/gradle-wrapper.jar"

exec java $DEFAULT_JVM_OPTS -classpath "$CLASSPATH" org.gradle.wrapper.GradleWrapperMain "$@"
SCRIPT

# Windows version
cat > android/gradlew.bat << 'SCRIPT'
@if "%DEBUG%"=="" @echo off
@rem Gradle wrapper for Windows

setlocal enabledelayedexpansion
set DEFAULT_JVM_OPTS="-Xmx64m" "-Xms64m"
set APP_NAME="Gradle"
set APP_HOME=%~dp0

set CLASSPATH=%APP_HOME%gradle\wrapper\gradle-wrapper.jar

java %DEFAULT_JVM_OPTS% -classpath "%CLASSPATH%" org.gradle.wrapper.GradleWrapperMain %*
setlocal
SCRIPT

chmod +x android/gradlew

# Create settings.gradle
cat > android/settings.gradle << 'EOF'
rootProject.name = 'FarmGame'
include ':app'
EOF

echo "✓ Android project structure created"
echo "Next: Download gradle wrapper JAR and build"
