@echo off
setlocal enabledelayedexpansion

REM =================================================================
REM TensorChat Streaming - Simple Publishing Script
REM =================================================================

echo.
echo 🚀 TensorChat Streaming - Publishing to PyPI
echo =================================================================

REM Check if we're in the right directory
if not exist "setup.py" (
    echo ❌ Error: setup.py not found. Please run from python/ directory
    exit /b 1
)

if not exist "tensorchat_streaming" (
    echo ❌ Error: tensorchat_streaming directory not found
    exit /b 1
)

REM Clean previous builds
echo 🧹 Cleaning previous builds...
rmdir /s /q "dist" 2>nul
rmdir /s /q "build" 2>nul
rmdir /s /q "venv_publish" 2>nul
for /d %%d in (*.egg-info) do rmdir /s /q "%%d" 2>nul

REM Create virtual environment
echo 📦 Creating virtual environment...
py -m venv venv_publish
if errorlevel 1 (
    echo ❌ Failed to create virtual environment
    exit /b 1
)

REM Activate virtual environment
echo ⚡ Activating virtual environment...
call venv_publish\Scripts\activate.bat

REM Upgrade pip
echo ⬆️  Upgrading pip...
python -m pip install --upgrade pip
if errorlevel 1 (
    echo ❌ Failed to upgrade pip
    goto cleanup
)

REM Install build tools
echo 🔧 Installing build tools...
pip install build twine
if errorlevel 1 (
    echo ❌ Failed to install build tools
    goto cleanup
)

REM Build package
echo 🏗️  Building package...
python -m build
if errorlevel 1 (
    echo ❌ Package build failed
    goto cleanup
)

REM Check package
echo ✅ Validating package...
twine check dist/*
if errorlevel 1 (
    echo ❌ Package validation failed
    goto cleanup
)

echo.
echo 📋 Build Summary:
dir dist /b

echo.
echo 🚀 Ready to publish to PyPI!
echo.
echo When prompted for credentials:
echo   Username: __token__
echo   Password: [your-pypi-api-token]
echo.
set /p "confirm=Continue with publishing? (y/N): "
if /i not "!confirm!"=="y" (
    echo ⏸️  Publishing cancelled
    goto cleanup
)

REM Upload to PyPI
echo 📤 Uploading to PyPI...
twine upload dist/*
if errorlevel 1 (
    echo ❌ Upload failed
    goto cleanup
)

echo.
echo 🎉 SUCCESS! Package published to PyPI
echo 🔗 View at: https://pypi.org/project/tensorchat-streaming/
echo.

:cleanup
echo 🧹 Cleaning up...
deactivate 2>nul
cd /d "%~dp0"
rmdir /s /q "venv_publish" 2>nul
rmdir /s /q "dist" 2>nul
rmdir /s /q "build" 2>nul
for /d %%d in (*.egg-info) do rmdir /s /q "%%d" 2>nul

echo ✅ Cleanup completed
echo.
pause
exit /b 0