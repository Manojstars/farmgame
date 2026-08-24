#!/usr/bin/env node

/**
 * Direct Android build script that bypasses Expo CLI.
 * Creates Android project and builds debug APK.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const projectRoot = __dirname;
const androidDir = path.join(projectRoot, 'android');

console.log(`Project root: ${projectRoot}`);
console.log(`Android dir: ${androidDir}`);

function runCommand(cmd, cwd = projectRoot) {
    console.log(`\n>>> Running: ${cmd}`);
    try {
        const result = execSync(cmd, { cwd, stdio: 'inherit', shell: true });
        return true;
    } catch (e) {
        console.error(`Command failed: ${e.message}`);
        return false;
    }
}

async function main() {
    try {
        // Step 1: Check if android directory exists
        if (fs.existsSync(androidDir)) {
            console.log('Android directory exists. Cleaning...');
            fs.rmSync(androidDir, { recursive: true, force: true });
        }

        // Step 2: Prebuild Android
        console.log('\n=== Prebuilding Android ===');
        
        // Try expo prebuild
        const prebuildCmd = 'npx expo prebuild --clean --platform android --yes 2>&1';
        const success = runCommand(prebuildCmd);

        // Check if android directory was created
        if (!fs.existsSync(androidDir)) {
            console.log('Prebuild did not create android directory. Attempting alternative...');
            
            // Try creating with react-native init
            console.log('\n=== Creating React Native template ===');
            runCommand('npx react-native init FarmGameApp --template typescript');
            
            const tempAndroid = path.join(projectRoot, 'FarmGameApp', 'android');
            if (fs.existsSync(tempAndroid)) {
                fs.cpSync(tempAndroid, androidDir, { recursive: true });
                fs.rmSync(path.join(projectRoot, 'FarmGameApp'), { recursive: true });
                console.log('Copied Android template');
            } else {
                console.error('Failed to create Android template');
                process.exit(1);
            }
        }

        // Step 3: Check gradle wrapper
        console.log('\n=== Checking Gradle ===');
        const gradlew = path.join(androidDir, process.platform === 'win32' ? 'gradlew.bat' : 'gradlew');
        
        if (!fs.existsSync(gradlew)) {
            console.error(`Gradle wrapper not found at ${gradlew}`);
            console.log('Contents of android directory:');
            fs.readdirSync(androidDir).forEach(f => console.log(`  - ${f}`));
            process.exit(1);
        }

        console.log(`Found gradle wrapper: ${gradlew}`);

        // Step 4: Build APK
        console.log('\n=== Building Debug APK ===');
        const buildCmd = process.platform === 'win32' 
            ? `cd ${androidDir} && gradlew.bat assembleDebug`
            : `cd ${androidDir} && ./gradlew assembleDebug`;
        
        if (!runCommand(buildCmd)) {
            console.error('Build failed');
            process.exit(1);
        }

        // Step 5: Verify APK
        console.log('\n=== Verifying APK ===');
        const apkPath = path.join(androidDir, 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
        
        if (fs.existsSync(apkPath)) {
            const size = (fs.statSync(apkPath).size / (1024 * 1024)).toFixed(2);
            console.log(`✅ SUCCESS: APK created`);
            console.log(`   Location: ${apkPath}`);
            console.log(`   Size: ${size} MB`);
            
            // Copy to output
            const outputPath = path.join(projectRoot, 'game.apk');
            fs.copyFileSync(apkPath, outputPath);
            console.log(`   Copied to: ${outputPath}`);
        } else {
            console.error(`APK not found at ${apkPath}`);
            process.exit(1);
        }

    } catch (error) {
        console.error(`Fatal error: ${error.message}`);
        process.exit(1);
    }
}

main();
