#!/usr/bin/env powershell
<#
.SYNOPSIS
    Automated publishing script for tensorchat-streaming Python package

.DESCRIPTION
    This script automates the complete publishing workflow:
    1. Creates a clean virtual environment
    2. Installs build and publishing tools
    3. Builds the package
    4. Validates the package
    5. Publishes to PyPI
    6. Cleans up build artifacts
    7. Deactivates and removes virtual environment

.PARAMETER Version
    Version number to set (optional). If not provided, version will be incremented automatically.

.PARAMETER SkipCleanup
    Skip cleanup of build artifacts and virtual environment

.EXAMPLE
    .\publish.ps1
    .\publish.ps1 -Version "1.0.2"
    .\publish.ps1 -SkipCleanup
#>

param(
    [string]$Version,
    [switch]$SkipCleanup
)

# Error handling
$ErrorActionPreference = "Stop"

# Colors for output
function Write-Success { param($Message) Write-Host "✅ $Message" -ForegroundColor Green }
function Write-Info { param($Message) Write-Host "🔵 $Message" -ForegroundColor Blue }
function Write-Warning { param($Message) Write-Host "⚠️  $Message" -ForegroundColor Yellow }
function Write-Error { param($Message) Write-Host "❌ $Message" -ForegroundColor Red }

# Main function
function Main {
    Write-Host "🚀 TensorChat Streaming - Automated Publishing Script" -ForegroundColor Cyan
    Write-Host "=" * 60 -ForegroundColor Cyan
    
    try {
        # Step 1: Check prerequisites
        Write-Info "Checking prerequisites..."
        Check-Prerequisites
        
        # Step 2: Version management
        if ($Version) {
            Write-Info "Setting version to $Version..."
            Set-Version $Version
        } else {
            Write-Info "Auto-incrementing version..."
            $Version = Auto-Increment-Version
            Write-Info "New version: $Version"
        }
        
        # Step 3: Clean previous builds
        Write-Info "Cleaning previous builds..."
        Clean-Previous-Builds
        
        # Step 4: Create virtual environment
        Write-Info "Creating virtual environment..."
        Create-VirtualEnvironment
        
        # Step 5: Install dependencies
        Write-Info "Installing build tools..."
        Install-BuildTools
        
        # Step 6: Build package
        Write-Info "Building package..."
        Build-Package
        
        # Step 7: Validate package
        Write-Info "Validating package..."
        Validate-Package
        
        # Step 8: Publish to PyPI
        Write-Info "Publishing to PyPI..."
        Publish-Package
        
        # Step 9: Test installation
        Write-Info "Testing package installation..."
        Test-Installation
        
        Write-Success "Package successfully published to PyPI!"
        Write-Info "🔗 View at: https://pypi.org/project/tensorchat-streaming/$Version/"
        
    } catch {
        Write-Error "Publishing failed: $($_.Exception.Message)"
        exit 1
    } finally {
        if (-not $SkipCleanup) {
            Write-Info "Cleaning up..."
            Cleanup
        }
    }
}

function Check-Prerequisites {
    # Check if Python is available
    try {
        $pythonVersion = py --version 2>&1
        Write-Success "Python found: $pythonVersion"
    } catch {
        throw "Python (py command) not found. Please install Python."
    }
    
    # Check if we're in the right directory
    if (-not (Test-Path "setup.py") -or -not (Test-Path "pyproject.toml")) {
        throw "Please run this script from the python/ directory containing setup.py and pyproject.toml"
    }
    
    # Check if tensorchat_streaming directory exists
    if (-not (Test-Path "tensorchat_streaming")) {
        throw "tensorchat_streaming package directory not found"
    }
}

function Set-Version {
    param($NewVersion)
    
    # Update setup.py
    $setupContent = Get-Content "setup.py" -Raw
    $setupContent = $setupContent -replace 'version="[^"]*"', "version=`"$NewVersion`""
    Set-Content "setup.py" $setupContent
    
    # Update pyproject.toml
    $pyprojectContent = Get-Content "pyproject.toml" -Raw
    $pyprojectContent = $pyprojectContent -replace 'version = "[^"]*"', "version = `"$NewVersion`""
    Set-Content "pyproject.toml" $pyprojectContent
    
    Write-Success "Version updated to $NewVersion"
}

function Auto-Increment-Version {
    # Read current version from setup.py
    $setupContent = Get-Content "setup.py" -Raw
    if ($setupContent -match 'version="([^"]*)"') {
        $currentVersion = $matches[1]
        $versionParts = $currentVersion.Split('.')
        
        # Increment patch version
        $major = [int]$versionParts[0]
        $minor = [int]$versionParts[1]
        $patch = [int]$versionParts[2] + 1
        
        $newVersion = "$major.$minor.$patch"
        Set-Version $newVersion
        return $newVersion
    } else {
        throw "Could not parse current version from setup.py"
    }
}

function Clean-Previous-Builds {
    Remove-Item -Recurse -Force "dist", "build", "*.egg-info", "venv_publish" -ErrorAction SilentlyContinue
    Write-Success "Previous builds cleaned"
}

function Create-VirtualEnvironment {
    py -m venv venv_publish
    if (-not $?) { throw "Failed to create virtual environment" }
    Write-Success "Virtual environment created"
}

function Install-BuildTools {
    & "venv_publish\Scripts\python.exe" -m pip install --upgrade pip
    if (-not $?) { throw "Failed to upgrade pip" }
    
    & "venv_publish\Scripts\python.exe" -m pip install build twine
    if (-not $?) { throw "Failed to install build tools" }
    
    Write-Success "Build tools installed"
}

function Build-Package {
    & "venv_publish\Scripts\python.exe" -m build
    if (-not $?) { throw "Package build failed" }
    
    # Check if files were created
    $wheelFiles = Get-ChildItem "dist\*.whl"
    $tarFiles = Get-ChildItem "dist\*.tar.gz"
    
    if ($wheelFiles.Count -eq 0 -or $tarFiles.Count -eq 0) {
        throw "Build did not produce expected files"
    }
    
    Write-Success "Package built successfully"
    Write-Info "Generated files:"
    Get-ChildItem "dist" | ForEach-Object { Write-Info "  - $($_.Name)" }
}

function Validate-Package {
    & "venv_publish\Scripts\twine.exe" check dist/*
    if (-not $?) { throw "Package validation failed" }
    Write-Success "Package validation passed"
}

function Publish-Package {
    Write-Warning "About to publish to PyPI. You will need your API token."
    Write-Info "When prompted:"
    Write-Info "  Username: __token__"
    Write-Info "  Password: [your-pypi-api-token]"
    Write-Info ""
    
    $confirm = Read-Host "Continue with publishing? (y/N)"
    if ($confirm -notmatch '^[Yy]$') {
        throw "Publishing cancelled by user"
    }
    
    & "venv_publish\Scripts\twine.exe" upload dist/*
    if (-not $?) { throw "Package upload failed" }
    Write-Success "Package uploaded to PyPI"
}

function Test-Installation {
    Write-Info "Testing package installation from PyPI..."
    
    # Create a separate test environment
    py -m venv venv_test
    & "venv_test\Scripts\python.exe" -m pip install --upgrade pip
    
    # Wait a moment for PyPI to update
    Start-Sleep 10
    
    # Try to install the package
    & "venv_test\Scripts\python.exe" -m pip install tensorchat-streaming --no-cache-dir
    if (-not $?) { 
        Write-Warning "Package installation test failed (this might be normal if PyPI is still indexing)"
        return
    }
    
    # Test import
    $importTest = & "venv_test\Scripts\python.exe" -c "from tensorchat_streaming import TensorchatStreaming; print('Import successful')" 2>&1
    if ($importTest -match "Import successful") {
        Write-Success "Package installation and import test passed"
    } else {
        Write-Warning "Import test failed: $importTest"
    }
    
    # Cleanup test environment
    Remove-Item -Recurse -Force "venv_test" -ErrorAction SilentlyContinue
}

function Cleanup {
    Write-Info "Cleaning up build artifacts and virtual environments..."
    
    Remove-Item -Recurse -Force "dist", "build", "*.egg-info", "venv_publish", "venv_test" -ErrorAction SilentlyContinue
    
    Write-Success "Cleanup completed"
}

# Run the main function
Main