# Publishing Guide for Tensorchat Streaming NPM Package

This guide explains how to publish new versions of the `@tensorchat.io/streaming` package to npm.

## Prerequisites

Before publishing, ensure you have:

1. **npm Account**: Register at [npmjs.com](https://www.npmjs.com/signup)
2. **npm CLI**: Install with `npm install -g npm` and login with `npm login`
3. **Organization Access**: Ensure you have publish access to the `@tensorchat.io` organization
4. **Write Access**: Ensure you have maintainer/owner access to the `@tensorchat.io/streaming` package

## Step-by-Step Publishing Process

### Step 1: Update Version Number

**IMPORTANT**: You must manually update the version in `package.json` before publishing.

#### Update `package.json`
```json
{
  "name": "@tensorchat.io/streaming",
  "version": "1.0.X",  // ← Increment this version number
  // ... rest of package.json
}
```

**Version Numbering Convention:**
- **Patch releases** (bug fixes): `1.0.3` → `1.0.4`
- **Minor releases** (new features): `1.0.X` → `1.1.0`
- **Major releases** (breaking changes): `1.X.X` → `2.0.0`

### Step 2: Build and Test

#### 2.1 Install Dependencies
```bash
npm install
```

#### 2.2 Build the Package
```bash
npm run build
```

This will:
- ✅ Compile TypeScript to JavaScript
- ✅ Generate type definitions (.d.ts files)
- ✅ Create both CommonJS and ESM builds
- ✅ Output everything to the `dist/` folder

#### 2.3 Test the Build
```bash
# Test the built package locally
npm run test  # if tests are available
```

#### 2.4 Verify Package Contents
```bash
# Preview what will be published
npm pack --dry-run
```

### Step 3: npm Authentication

#### 3.1 Login to npm
```bash
npm login
```

When prompted, enter:
- **Username**: Your npm username
- **Password**: Your npm password
- **Email**: Your npm email
- **One-time password**: If 2FA is enabled

#### 3.2 Verify Organization Access
```bash
# Check if you have access to @tensorchat.io organization
npm org ls @tensorchat.io
```

### Step 4: Publishing Options

#### Option A: Standard Publishing (Recommended)
```bash
npm publish
```

#### Option B: Publishing with Tag
```bash
# For beta/alpha releases
npm publish --tag beta
npm publish --tag alpha
```

#### Option C: Dry Run (Test Publishing)
```bash
# Test the publish process without actually publishing
npm publish --dry-run
```

### Step 5: What to Expect During Publishing

#### 5.1 Pre-publish Validation
npm will automatically:
- ✅ Run the `prepare` script (builds the package)
- ✅ Validate package.json
- ✅ Check for required files
- ✅ Verify authentication

#### 5.2 Publishing Process
```
npm notice 
npm notice 📦  @tensorchat.io/streaming@1.0.X
npm notice === Tarball Contents === 
npm notice 2.1kB  dist/index.d.ts
npm notice 4.5kB  dist/index.js
npm notice 3.8kB  dist/index.esm.js
npm notice 1.2kB  package.json
npm notice 8.9kB  README.md
npm notice === Tarball Details === 
npm notice name:          @tensorchat.io/streaming
npm notice version:       1.0.X
npm notice package size:  XX.X kB
npm notice unpacked size: XX.X kB
npm notice shasum:        [hash]
npm notice integrity:     [integrity-hash]
npm notice total files:   5
npm notice 
+ @tensorchat.io/streaming@1.0.X
```

#### 5.3 Success Confirmation
Upon successful publishing:
```
✅ SUCCESS! Package published to npm
🔗 View at: https://www.npmjs.com/package/@tensorchat.io/streaming/v/1.0.X
```

## npm Access Tokens (Alternative to Password)

### Creating an Access Token:

1. Log into [npmjs.com](https://www.npmjs.com/)
2. Go to **Access Tokens** in your account settings
3. Click **"Generate New Token"**
4. **Token type**: Choose **"Granular Access Token"** for better security
5. **Scope**: Select specific packages or organizations
6. **Permissions**: Choose "Read and write"
7. Copy the token and store it securely

### Using Access Token:
```bash
# Set the token in your .npmrc file
echo "//registry.npmjs.org/:_authToken=npm_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX" >> ~/.npmrc

# Or use environment variable
export NPM_TOKEN=npm_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### Security Best Practices:

- ❌ **Never** commit tokens to version control
- ✅ Store tokens in environment variables or secure password manager
- ✅ Use granular access tokens (not classic tokens)
- ✅ Set expiration dates for tokens
- ✅ Regenerate tokens periodically

## Generated Files and Structure

### Build Output (`dist/` folder):
- `index.js` - CommonJS build for Node.js
- `index.esm.js` - ES Modules build for modern bundlers
- `index.d.ts` - TypeScript type definitions
- Source maps (if configured)

### Published Files:
Only files listed in `package.json` "files" array are published:
```json
{
  "files": [
    "dist"
  ]
}
```

## Common Issues and Solutions

### Issue: "You do not have permission to publish"
**Cause**: No access to the @tensorchat.io organization
**Solution**: 
- Contact organization owner for access
- Verify you're logged into the correct npm account

### Issue: "Version already exists"
**Cause**: Trying to republish the same version
**Solution**: Increment the version number in package.json

### Issue: "Package name too similar to existing package"
**Cause**: npm detecting potential typosquatting
**Solution**: This shouldn't happen with @tensorchat.io scope, but contact npm support if it does

### Issue: "Build failed during prepare script"
**Cause**: TypeScript compilation errors or missing dependencies
**Solution**: 
- Run `npm run build` locally to check for errors
- Fix TypeScript/build issues before publishing

### Issue: "Module not found" after installation
**Cause**: Incorrect main/module/types fields in package.json
**Solution**: Verify the paths in package.json point to correct built files

## Publishing Checklist

Before publishing, ensure:

- [ ] Version number updated in `package.json`
- [ ] All changes committed to git
- [ ] README.md is up to date
- [ ] Build completes successfully (`npm run build`)
- [ ] Package contents verified (`npm pack --dry-run`)
- [ ] Logged into npm (`npm whoami` shows correct user)
- [ ] Have access to @tensorchat.io organization

## Version History Tracking

Keep track of published versions:

| Version | Date | Changes | npm Link |
|---------|------|---------|----------|
| 1.0.0 | 2025-09-17 | Initial release | [npm](https://www.npmjs.com/package/@tensorchat.io/streaming/v/1.0.0) |
| 1.0.1 | 2025-09-17 | Bug fixes | [npm](https://www.npmjs.com/package/@tensorchat.io/streaming/v/1.0.1) |
| 1.0.2 | 2025-09-17 | Documentation updates | [npm](https://www.npmjs.com/package/@tensorchat.io/streaming/v/1.0.2) |
| 1.0.3 | 2025-09-17 | Emoji cleanup | [npm](https://www.npmjs.com/package/@tensorchat.io/streaming/v/1.0.3) |
| 1.0.X | TBD | Next release | TBD |

## Verification After Publishing

After successful publishing:

1. **Check npm page**: Visit the provided link to verify package details
2. **Test installation**: Try installing in a fresh project:
   ```bash
   npm install @tensorchat.io/streaming@1.0.X
   ```
3. **Import test**: Verify the package imports correctly:
   ```javascript
   import { TensorchatStreaming } from '@tensorchat.io/streaming';
   console.log('✅ Package installed successfully!');
   ```

## Automated Publishing with GitHub Actions (Optional)

For automated publishing, you can set up GitHub Actions:

```yaml
# .github/workflows/publish.yml
name: Publish to npm

on:
  push:
    tags:
      - 'v*'

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm run build
      - run: npm publish
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

## Support

- **Package Issues**: [GitHub Issues](https://github.com/datacorridor/tensorchat-streaming/issues)
- **npm Support**: [npm Support](https://www.npmjs.com/support)
- **Company**: Data Corridor Limited - [tensorchat.io](https://tensorchat.io)

---

**Remember**: Always increment the version number in `package.json` before publishing! 🚀
