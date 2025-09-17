# 📦 Publishing Guide for TensorChat Streaming

This guide explains how to publish new versions of the `tensorchat-streaming` package to PyPI.

## 🔄 Prerequisites

Before publishing, ensure you have:

1. **PyPI Account**: Register at [pypi.org](https://pypi.org/account/register/)
2. **API Token**: Generate an API token at [PyPI Account Settings](https://pypi.org/manage/account/token/)
3. **Write Access**: Ensure you have maintainer/owner access to the `tensorchat-streaming` package

## 📋 Step-by-Step Publishing Process

### Step 1: Update Version Numbers

**IMPORTANT**: You must manually update the version in both files before running any publish script.

#### Update `setup.py`
```python
setup(
    name="tensorchat-streaming",
    version="1.0.X",  # ← Increment this patch number
    # ... rest of setup
)
```

#### Update `pyproject.toml`
```toml
[project]
name = "tensorchat-streaming"
version = "1.0.X"  # ← Increment this patch number (must match setup.py)
```

**Version Numbering Convention:**
- **Patch releases** (bug fixes): `1.0.1` → `1.0.2`
- **Minor releases** (new features): `1.0.X` → `1.1.0`
- **Major releases** (breaking changes): `1.X.X` → `2.0.0`

### Step 2: Choose Your Publishing Method

You have three automation options:

#### Option A: PowerShell Script (Recommended for Windows)
```powershell
.\publish.ps1
```

#### Option B: Batch Script (Simple Windows)
```cmd
.\publish.bat
```

#### Option C: Python Script (Cross-platform)
```bash
python publish.py
```

### Step 3: What to Expect During Publishing

#### 3.1 Automated Setup
The script will:
- ✅ Create a clean virtual environment (`venv_publish`)
- ✅ Install build tools (`build`, `twine`)
- ✅ Build the package (creates `dist/` folder)
- ✅ Validate package integrity

#### 3.2 PyPI Authentication Prompt
When prompted for credentials, use:
- **Username**: `__token__`
- **Password**: `[your-api-token-here]`

**Example:**
```
Enter your username: __token__
Enter your password: pypi-AgEIcHlwaS5vcmcCJGZhZGE5...
```

#### 3.3 Success Confirmation
Upon successful publishing, you'll see:
```
🎉 SUCCESS! Package published to PyPI
🔗 View at: https://pypi.org/project/tensorchat-streaming/1.0.X/
```

## 🔐 PyPI API Token Setup

### Creating an API Token:

1. Log into [PyPI](https://pypi.org/account/login/)
2. Go to [Account Settings](https://pypi.org/manage/account/token/)
3. Click **"Add API token"**
4. **Token name**: `tensorchat-streaming-publishing`
5. **Scope**: Select **"Project: tensorchat-streaming"** (more secure than "Entire account")
6. Click **"Add token"**
7. **Copy the token** (starts with `pypi-`) and store it securely

### Security Best Practices:

- ❌ **Never** commit API tokens to version control
- ✅ Store tokens in a secure password manager
- ✅ Use project-scoped tokens (not account-wide)
- ✅ Regenerate tokens periodically

## 📁 Generated Files and Cleanup

### During Publishing:
- `venv_publish/` - Temporary virtual environment
- `dist/` - Built package files (.whl and .tar.gz)
- `build/` - Build artifacts
- `*.egg-info/` - Package metadata

### After Publishing:
All temporary files are automatically cleaned up unless you use the `--skip-cleanup` flag.

## 🚨 Common Issues and Solutions

### Issue: "File already exists"
**Cause**: Version number hasn't been incremented
**Solution**: Update version in both `setup.py` and `pyproject.toml`

### Issue: "Invalid credentials"
**Cause**: Wrong username or API token
**Solution**: 
- Username should be exactly `__token__`
- Password should be your full API token (including `pypi-` prefix)

### Issue: "Package not found"
**Cause**: First time publishing or missing permissions
**Solution**: Ensure you have upload permissions for the package

### Issue: "Version already exists"
**Cause**: Trying to republish the same version
**Solution**: Increment the version number and try again

## 📊 Version History Tracking

Keep track of published versions:

| Version | Date | Changes | PyPI Link |
|---------|------|---------|-----------|
| 1.0.0 | 2025-09-17 | Initial release | [PyPI](https://pypi.org/project/tensorchat-streaming/1.0.0/) |
| 1.0.1 | 2025-09-17 | License fixes | [PyPI](https://pypi.org/project/tensorchat-streaming/1.0.1/) |
| 1.0.X | TBD | Next release | TBD |

## 🔍 Verification After Publishing

After successful publishing:

1. **Check PyPI page**: Visit the provided link to verify package details
2. **Test installation**: Try `pip install tensorchat-streaming==1.0.X` in a fresh environment
3. **Import test**: Verify the package imports correctly:
   ```python
   from tensorchat_streaming import TensorchatStreaming
   print("✅ Package installed successfully!")
   ```

## 📞 Support

- **Package Issues**: [GitHub Issues](https://github.com/datacorridor/tensorchat-streaming/issues)
- **PyPI Support**: [PyPI Help](https://pypi.org/help/)
- **Company**: Data Corridor Limited - [tensorchat.io](https://tensorchat.io)

---

**Remember**: Always increment the version numbers in both `setup.py` and `pyproject.toml` before running any publish script! 🚀