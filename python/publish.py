#!/usr/bin/env python3
"""
Automated publishing script for tensorchat-streaming Python package

This script automates the complete publishing workflow:
1. Creates a clean virtual environment
2. Installs build and publishing tools  
3. Builds the package
4. Validates the package
5. Publishes to PyPI
6. Cleans up build artifacts

Usage:
    python publish.py                    # Auto-increment patch version
    python publish.py --version 1.0.2   # Set specific version
    python publish.py --skip-cleanup    # Skip cleanup
"""

import os
import sys
import subprocess
import shutil
import re
import argparse
from pathlib import Path

def run_command(cmd, description, shell=False):
    """Run a command and handle errors."""
    print(f"🔄 {description}...")
    try:
        if isinstance(cmd, str) and not shell:
            cmd = cmd.split()
        result = subprocess.run(cmd, shell=shell, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed")
        return result.stdout
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed:")
        print(f"Error: {e.stderr}")
        sys.exit(1)

def check_prerequisites():
    """Check if required files exist and Python is available."""
    print("🔍 Checking prerequisites...")
    
    # Check Python
    try:
        result = subprocess.run([sys.executable, "--version"], capture_output=True, text=True)
        print(f"✅ Python found: {result.stdout.strip()}")
    except:
        print("❌ Python not found")
        sys.exit(1)
    
    # Check required files
    required_files = ["setup.py", "pyproject.toml", "tensorchat_streaming"]
    for file in required_files:
        if not Path(file).exists():
            print(f"❌ {file} not found. Please run from the correct directory.")
            sys.exit(1)
    
    print("✅ All prerequisites met")

def clean_previous_builds():
    """Remove previous build artifacts."""
    print("🧹 Cleaning previous builds...")
    
    dirs_to_remove = ["dist", "build", "venv_publish"]
    for dir_name in dirs_to_remove:
        if Path(dir_name).exists():
            shutil.rmtree(dir_name)
    
    # Remove egg-info directories
    for path in Path(".").glob("*.egg-info"):
        if path.is_dir():
            shutil.rmtree(path)
    
    print("✅ Previous builds cleaned")

def get_current_version():
    """Get current version from setup.py."""
    setup_content = Path("setup.py").read_text()
    match = re.search(r'version="([^"]*)"', setup_content)
    if match:
        return match.group(1)
    else:
        print("❌ Could not parse version from setup.py")
        sys.exit(1)

def set_version(new_version):
    """Update version in setup.py and pyproject.toml."""
    print(f"🔄 Setting version to {new_version}...")
    
    # Update setup.py
    setup_content = Path("setup.py").read_text()
    setup_content = re.sub(r'version="[^"]*"', f'version="{new_version}"', setup_content)
    Path("setup.py").write_text(setup_content)
    
    # Update pyproject.toml
    pyproject_content = Path("pyproject.toml").read_text()
    pyproject_content = re.sub(r'version = "[^"]*"', f'version = "{new_version}"', pyproject_content)
    Path("pyproject.toml").write_text(pyproject_content)
    
    print(f"✅ Version updated to {new_version}")

def auto_increment_version():
    """Auto-increment the patch version."""
    current_version = get_current_version()
    major, minor, patch = map(int, current_version.split('.'))
    new_version = f"{major}.{minor}.{patch + 1}"
    set_version(new_version)
    return new_version

def create_virtual_environment():
    """Create a clean virtual environment."""
    venv_path = "venv_publish"
    run_command([sys.executable, "-m", "venv", venv_path], "Creating virtual environment")
    
    # Determine the correct python executable path
    if os.name == 'nt':  # Windows
        python_exe = Path(venv_path) / "Scripts" / "python.exe"
        pip_exe = Path(venv_path) / "Scripts" / "pip.exe"
    else:  # Unix-like
        python_exe = Path(venv_path) / "bin" / "python"
        pip_exe = Path(venv_path) / "bin" / "pip"
    
    return str(python_exe), str(pip_exe)

def build_and_publish(python_exe, pip_exe, skip_cleanup=False):
    """Build and publish the package."""
    try:
        # Upgrade pip
        run_command([python_exe, "-m", "pip", "install", "--upgrade", "pip"], "Upgrading pip")
        
        # Install build tools
        run_command([python_exe, "-m", "pip", "install", "build", "twine"], "Installing build tools")
        
        # Build package
        run_command([python_exe, "-m", "build"], "Building package")
        
        # Check package
        run_command([python_exe, "-m", "twine", "check", "dist/*"], "Checking package")
        
        # Show built files
        print("\n📦 Built packages:")
        for file in Path("dist").glob("*"):
            print(f"  - {file.name}")
        
        # Confirm upload
        print("\n🚀 Ready to publish to PyPI!")
        print("📝 You'll need your PyPI API token:")
        print("   Username: __token__")
        print("   Password: [your-api-token]")
        
        confirm = input("\n🤔 Continue with publishing? (y/N): ").lower().strip()
        if confirm != 'y':
            print("⏸️  Publishing cancelled")
            return
        
        # Upload to PyPI
        run_command([python_exe, "-m", "twine", "upload", "dist/*"], "Uploading to PyPI")
        
        version = get_current_version()
        print(f"\n🎉 SUCCESS! Package published to PyPI")
        print(f"🔗 View at: https://pypi.org/project/tensorchat-streaming/{version}/")
        
    finally:
        if not skip_cleanup:
            print("\n🧹 Cleaning up...")
            dirs_to_clean = ["venv_publish", "dist", "build"]
            for dir_name in dirs_to_clean:
                if Path(dir_name).exists():
                    shutil.rmtree(dir_name)
            
            # Remove egg-info directories
            for path in Path(".").glob("*.egg-info"):
                if path.is_dir():
                    shutil.rmtree(path)
            
            print("✅ Cleanup completed")

def main():
    parser = argparse.ArgumentParser(description="Publish tensorchat-streaming to PyPI")
    parser.add_argument("--version", help="Specific version to set")
    parser.add_argument("--skip-cleanup", action="store_true", help="Skip cleanup of build artifacts")
    args = parser.parse_args()
    
    print("🚀 Tensorchat Streaming - Automated Publishing Script")
    print("=" * 60)
    
    try:
        check_prerequisites()
        clean_previous_builds()
        
        if args.version:
            set_version(args.version)
            version = args.version
        else:
            version = auto_increment_version()
            print(f"📈 Auto-incremented to version {version}")
        
        python_exe, pip_exe = create_virtual_environment()
        build_and_publish(python_exe, pip_exe, args.skip_cleanup)
        
    except KeyboardInterrupt:
        print("\n⏸️  Process interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()