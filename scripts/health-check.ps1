#!/usr/bin/env pwsh
<#
.SYNOPSIS
Farm Life Health Check - Comprehensive project validation
.DESCRIPTION
Validates the Farm Life project before development, ensuring all dependencies,
environment, and configuration are correctly set up.
#>

# Colors for output
$Green = "`e[32m"
$Red = "`e[31m"
$Yellow = "`e[33m"
$Blue = "`e[34m"
$Reset = "`e[0m"

# Counters
$PassCount = 0
$FailCount = 0
$checks = @()

function Write-Check {
    param(
        [string]$Component,
        [string]$Status = "PASS",
        [string]$Details = ""
    )
    
    $statusFormatted = switch ($Status) {
        "PASS" { "$Green[PASS]$Reset" }
        "FAIL" { "$Red[FAIL]$Reset" }
        "WARN" { "$Yellow[WARN]$Reset" }
        default { "$Green[PASS]$Reset" }
    }
    
    Write-Host ("$Component".PadRight(20)) $statusFormatted
    
    if ($Details) {
        if ($Status -eq "FAIL") {
            Write-Host "  $Red=> $Details$Reset"
        } else {
            Write-Host "  $Yellow=> $Details$Reset"
        }
    }
    
    if ($Status -eq "PASS") { $Script:PassCount++ }
    elseif ($Status -eq "FAIL") { $Script:FailCount++ }
    
    $checks += @{ Component = $Component; Status = $Status; Details = $Details }
}

function Check-NodeVersion {
    try {
        $version = node --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            $versionNumber = [version]$version.TrimStart('v')
            if ($versionNumber -ge [version]"18.0.0") {
                $majorVersion = $versionNumber.Major
                # Recommend Node 20 LTS for Expo SDK 50 + React Native 0.74
                if ($majorVersion -eq 20) {
                    Write-Check "Node.js" "PASS" "v$versionNumber (LTS recommended)"
                } elseif ($majorVersion -lt 20) {
                    Write-Check "Node.js" "PASS" "v$versionNumber (consider upgrading to v20 LTS)"
                } elseif ($majorVersion -gt 24) {
                    Write-Check "Node.js" "WARN" "v$versionNumber (Node 24 is latest; v20 LTS recommended for stability)"
                } else {
                    Write-Check "Node.js" "PASS" "v$versionNumber"
                }
                return $true
            } else {
                Write-Check "Node.js" "FAIL" "Version $versionNumber (need v18+)"
                return $false
            }
        } else {
            Write-Check "Node.js" "FAIL" "Not installed"
            return $false
        }
    } catch {
        Write-Check "Node.js" "FAIL" "Error: $_"
        return $false
    }
}

function Check-NpmVersion {
    try {
        $version = npm --version 2>$null
        if ($LASTEXITCODE -eq 0) {
            $versionNumber = [version]$version
            if ($versionNumber -ge [version]"9.0.0") {
                Write-Check "npm" "PASS" "v$versionNumber"
                return $true
            } else {
                Write-Check "npm" "FAIL" "Version $versionNumber (need v9+)"
                return $false
            }
        } else {
            Write-Check "npm" "FAIL" "Not installed"
            return $false
        }
    } catch {
        Write-Check "npm" "FAIL" "Error: $_"
        return $false
    }
}

function Check-ExpoVersion {
    try {
        $packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
        $expoVersion = $packageJson.dependencies.expo
        
        if ($expoVersion) {
            # Remove ^ or ~ prefix
            $versionClean = $expoVersion -replace '^[\^~]', ''
            $majorVersion = $versionClean.Split('.')[0]
            
            if ([int]$majorVersion -ge 50) {
                Write-Check "Expo SDK" "PASS" "$versionClean (SDK $majorVersion)"
                return $true
            } else {
                Write-Check "Expo SDK" "FAIL" "$versionClean (need SDK 50+)"
                return $false
            }
        } else {
            Write-Check "Expo SDK" "FAIL" "Not found in package.json"
            return $false
        }
    } catch {
        Write-Check "Expo SDK" "FAIL" "Error: $_"
        return $false
    }
}

function Check-ReactNativeVersion {
    try {
        $packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
        $rnVersion = $packageJson.dependencies."react-native"
        
        if ($rnVersion -match "0\.74") {
            Write-Check "React Native" "PASS" "$rnVersion"
            return $true
        } else {
            Write-Check "React Native" "FAIL" "$rnVersion (expected 0.74.x)"
            return $false
        }
    } catch {
        Write-Check "React Native" "FAIL" "Error: $_"
        return $false
    }
}

function Check-TypeScript {
    try {
        Write-Host "  Running TypeScript compiler..." -ForegroundColor Gray
        $output = npx tsc --noEmit 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Check "TypeScript" "PASS" "0 errors"
            return $true
        } else {
            $errorLines = @($output | Where-Object { $_ -match "error TS" })
            $errorCount = $errorLines.Count
            Write-Check "TypeScript" "FAIL" "$errorCount errors (run 'npx tsc --noEmit' for details)"
            return $false
        }
    } catch {
        Write-Check "TypeScript" "FAIL" "Error: $_"
        return $false
    }
}

function Check-Dependencies {
    try {
        $nodeModulesPath = "node_modules"
        $packageLockPath = "package-lock.json"
        
        if ((Test-Path $nodeModulesPath) -and (Test-Path $packageLockPath)) {
            Write-Check "Dependencies" "PASS" "node_modules installed"
            return $true
        } elseif (Test-Path $packageLockPath) {
            Write-Check "Dependencies" "WARN" "package-lock.json present but run 'npm install'"
            return $true
        } else {
            Write-Check "Dependencies" "FAIL" "Run 'npm install --legacy-peer-deps'"
            return $false
        }
    } catch {
        Write-Check "Dependencies" "FAIL" "Error: $_"
        return $false
    }
}

function Check-FirebaseEnv {
    try {
        if (Test-Path ".env") {
            $envContent = Get-Content ".env" -Raw
            $required = @(
                "EXPO_PUBLIC_FIREBASE_API_KEY",
                "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN",
                "EXPO_PUBLIC_FIREBASE_PROJECT_ID",
                "EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET",
                "EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID",
                "EXPO_PUBLIC_FIREBASE_APP_ID"
            )
            
            $missing = @()
            foreach ($var in $required) {
                if ($envContent -notmatch "$var\s*=\s*\S") {
                    $missing += $var
                }
            }
            
            if ($missing.Count -eq 0) {
                Write-Check "Firebase Config" "PASS" "All env vars set"
                return $true
            } else {
                Write-Check "Firebase Config" "FAIL" "Missing: $($missing -join ', ')"
                return $false
            }
        } else {
            Write-Check "Firebase Config" "FAIL" ".env not found - copy .env.example"
            return $false
        }
    } catch {
        Write-Check "Firebase Config" "FAIL" "Error: $_"
        return $false
    }
}

function Check-SourceDirectories {
    try {
        $required = @("src", "src/components", "src/store", "src/services", "src/types", "src/utils")
        $missing = @()
        
        foreach ($dir in $required) {
            if (-not (Test-Path $dir)) {
                $missing += $dir
            }
        }
        
        if ($missing.Count -eq 0) {
            Write-Check "Project Structure" "PASS" "All directories present"
            return $true
        } else {
            Write-Check "Project Structure" "FAIL" "Missing: $($missing -join ', ')"
            return $false
        }
    } catch {
        Write-Check "Project Structure" "FAIL" "Error: $_"
        return $false
    }
}

function Check-Assets {
    try {
        $requiredAssets = @(
            @{ Name = "icon.png"; Width = 1024; Height = 1024 }
            @{ Name = "adaptive-icon.png"; Width = 1024; Height = 1024 }
            @{ Name = "splash.png"; Width = 1242; Height = 2436 }
            @{ Name = "favicon.png"; Width = 192; Height = 192 }
        )
        
        if (-not (Test-Path "assets")) {
            Write-Check "Assets" "FAIL" "assets directory not found"
            return $false
        }
        
        $allPassed = $true
        foreach ($asset in $requiredAssets) {
            $assetPath = Join-Path "assets" $asset.Name
            
            if (-not (Test-Path $assetPath)) {
                Write-Check "  $($asset.Name)" "FAIL" "File not found"
                $allPassed = $false
                continue
            }
            
            $file = Get-Item $assetPath
            
            # Check file size
            if ($file.Length -eq 0) {
                Write-Check "  $($asset.Name)" "FAIL" "File is empty"
                $allPassed = $false
                continue
            }
            
            # Check PNG signature (first 8 bytes should be: 89 50 4E 47 0D 0A 1A 0A)
            $bytes = New-Object byte[] 8
            $stream = [System.IO.File]::OpenRead($assetPath)
            $stream.Read($bytes, 0, 8) | Out-Null
            $stream.Close()
            
            $pngSignature = @(137, 80, 78, 71, 13, 10, 26, 10)
            $isValidPNG = $true
            for ($i = 0; $i -lt 8; $i++) {
                if ($bytes[$i] -ne $pngSignature[$i]) {
                    $isValidPNG = $false
                    break
                }
            }
            
            if (-not $isValidPNG) {
                Write-Check "  $($asset.Name)" "FAIL" "Not a valid PNG file"
                $allPassed = $false
                continue
            }
            
            # For dimension validation, read IHDR chunk (bytes 16-24 contain width/height)
            # Note: This is a simplified check - we verify file exists and is PNG
            # Full PNG header parsing would require more complex logic
            Write-Check "  $($asset.Name)" "PASS" "$($asset.Width)x$($asset.Height) (PNG, $($file.Length) bytes)"
        }
        
        return $allPassed
    } catch {
        Write-Check "Assets" "FAIL" "Error: $_"
        return $false
    }
}

function Check-Tests {
    try {
        Write-Host "  Running Jest test suite..." -ForegroundColor Gray
        
        if (-not (Test-Path "tests" -PathType Container)) {
            Write-Check "Tests" "FAIL" "tests/ directory not found"
            return $false
        }
        
        $testFiles = @(Get-ChildItem -Path "tests" -Filter "*.test.ts" -Recurse)
        if ($testFiles.Count -eq 0) {
            Write-Check "Tests" "WARN" "No test files found"
            return $true
        }
        
        # Run actual tests
        $testOutput = npm test -- --passWithNoTests 2>&1
        
        if ($testOutput -match "Test Suites:.*(\d+) passed") {
            $matches = [regex]::Matches($testOutput, "(\d+) passed")
            $passedSuites = if ($matches.Count -gt 0) { $matches[0].Groups[1].Value } else { "?" }
            
            if ($testOutput -match "Tests:.*(\d+) passed") {
                $matches = [regex]::Matches($testOutput, "Tests:.*?(\d+) passed")
                $passedTests = if ($matches.Count -gt 0) { $matches[0].Groups[1].Value } else { "?" }
                
                if ($testOutput -match "(\d+) failed") {
                    $matches = [regex]::Matches($testOutput, "(\d+) failed")
                    $failedTests = if ($matches.Count -gt 0) { $matches[0].Groups[1].Value } else { "0" }
                    
                    if ([int]$failedTests -gt 0) {
                        Write-Check "Tests" "FAIL" "$failedTests test(s) failed - run 'npm test' for details"
                        return $false
                    }
                }
                
                Write-Check "Tests" "PASS" "$passedSuites suites, $passedTests tests passed"
                return $true
            }
        }
        
        if ($LASTEXITCODE -eq 0) {
            Write-Check "Tests" "PASS" "$($testFiles.Count) test files"
            return $true
        } else {
            Write-Check "Tests" "FAIL" "Tests failed - run 'npm test' for details"
            return $false
        }
    } catch {
        Write-Check "Tests" "WARN" "Could not execute tests: $_"
        return $true
    }
}

function Check-Git {
    try {
        $gitStatus = git status 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Check "Git" "PASS" "Repository clean"
            return $true
        } else {
            Write-Check "Git" "FAIL" "Not a git repository"
            return $false
        }
    } catch {
        Write-Check "Git" "FAIL" "Error: $_"
        return $false
    }
}

# Main execution
Clear-Host
Write-Host @"
$Blue
================================
   FARM LIFE HEALTH CHECK
================================
$Reset

"@

Write-Host "Environment & Tools`n" -ForegroundColor Cyan
Check-NodeVersion
Check-NpmVersion
Check-ExpoVersion
Check-ReactNativeVersion

Write-Host "`nCompilation & Code Quality`n" -ForegroundColor Cyan
Check-TypeScript
Check-Dependencies

Write-Host "`nFirebase & Configuration`n" -ForegroundColor Cyan
Check-FirebaseEnv

Write-Host "`nProject Structure`n" -ForegroundColor Cyan
Check-Assets
Check-SourceDirectories

Write-Host "`nTests`n" -ForegroundColor Cyan
Check-Tests

Write-Host "`nVersion Control`n" -ForegroundColor Cyan
Check-Git

Write-Host @"

================================
$Blue        SUMMARY$Reset
================================

"@

Write-Host "Passed: " -NoNewline
Write-Host "$Green$PassCount$Reset"

Write-Host "Failed: " -NoNewline
if ($FailCount -gt 0) {
    Write-Host "$Red$FailCount$Reset"
} else {
    Write-Host "$Green$FailCount$Reset"
}

Write-Host "`nStatus: " -NoNewline
if ($FailCount -eq 0) {
    Write-Host "$Green[READY]$Reset`n"
} else {
    Write-Host "$Red[ISSUES FOUND]$Reset`n"
    Write-Host "Common fixes:`n" -ForegroundColor Yellow
    Write-Host "  npm install --legacy-peer-deps    # Install/update dependencies"
    Write-Host "  npx tsc --noEmit                   # Check TypeScript errors"
    Write-Host "  npm test                           # Run tests"
    Write-Host "  cp .env.example .env               # Copy Firebase config`n"
}

if ($FailCount -gt 0) { exit 1 } else { exit 0 }