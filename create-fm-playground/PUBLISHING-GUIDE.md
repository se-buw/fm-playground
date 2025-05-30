# GitHub Actions Publishing Setup Guide

This guide will help you set up automated publishing of the `create-fm-playground` package to npm using GitHub Actions.

## Prerequisites

1. **npm account**: Make sure you have an npm account at [npmjs.com](https://www.npmjs.com/)
2. **GitHub repository**: Your code should be in a GitHub repository
3. **npm access token**: You'll need to create an npm access token

## Step 1: Create npm Access Token

1. Go to [npmjs.com](https://www.npmjs.com/) and log in
2. Click on your profile picture → "Access Tokens"
3. Click "Generate New Token" → "Classic Token"
4. Choose "Automation" (recommended for CI/CD)
5. Copy the token (you won't see it again!)

## Step 2: Add npm Token to GitHub Secrets

1. Go to your GitHub repository
2. Navigate to "Settings" → "Secrets and variables" → "Actions"
3. Click "New repository secret"
4. Name: `NPM_TOKEN`
5. Value: Paste your npm access token
6. Click "Add secret"

## Step 3: Set up Package for Publishing

The package.json is already configured correctly with:

- ✅ Correct `name`: "create-fm-playground"
- ✅ Proper `bin` configuration for npx
- ✅ `files` array specifying what to include
- ✅ `prepublishOnly` script to build before publishing

## Step 4: Publishing Workflows

Two GitHub Actions workflows have been created:

### 1. `publish-npm.yml` - Automatic Publishing

Triggers on:

- Git tags starting with `v` (e.g., `v2.7.1`)
- GitHub releases
- Manual workflow dispatch

### 2. `test-npm-package.yml` - Testing

Triggers on:

- Push to main/develop branches
- Pull requests to main
- Tests multiple Node.js versions (16, 18, 20)

## Step 5: Publishing Process

### Method 1: Using Git Tags (Recommended)

1. Update the version in package.json:

    ```bash
    cd create-fm-playground
    npm version patch  # or minor, major
    ```

2. Push the tag:

    ```bash
    git push origin main --tags
    ```

3. The GitHub Action will automatically:
    - Build the package
    - Run tests
    - Publish to npm
    - Create a GitHub release

### Method 2: Manual Trigger

1. Go to your GitHub repository
2. Navigate to "Actions" → "Publish to npm"
3. Click "Run workflow"
4. Enter the version number (e.g., "2.7.1")
5. Click "Run workflow"

### Method 3: GitHub Releases

1. Go to your repository's "Releases" page
2. Click "Create a new release"
3. Create a new tag (e.g., `v2.7.1`)
4. Fill in release notes
5. Publish the release
6. The workflow will trigger automatically

## Step 6: Verify Publication

After the workflow completes:

1. Check npm: https://www.npmjs.com/package/create-fm-playground
2. Test installation:
    ```bash
    npx create-fm-playground@latest
    ```

## Step 7: Version Management

Follow semantic versioning:

- **Patch** (2.7.0 → 2.7.1): Bug fixes
- **Minor** (2.7.0 → 2.8.0): New features, backward compatible
- **Major** (2.7.0 → 3.0.0): Breaking changes

Use npm version commands:

```bash
npm version patch   # 2.7.0 → 2.7.1
npm version minor   # 2.7.0 → 2.8.0
npm version major   # 2.7.0 → 3.0.0
```

## Troubleshooting

### Common Issues:

1. **403 Forbidden Error**

    - Check npm token is correct
    - Ensure token has "Automation" permissions
    - Verify package name isn't taken

2. **Build Failures**

    - Check TypeScript compilation errors
    - Ensure all dependencies are installed
    - Verify templates directory exists

3. **Missing Files in Package**

    - Check the `files` array in package.json
    - Run `npm pack --dry-run` locally to verify

4. **Version Conflicts**
    - Ensure version in package.json matches git tag
    - Check if version already exists on npm

### Testing Locally Before Publishing:

```bash
# Build and test locally
cd create-fm-playground
npm run build
npm pack --dry-run

# Test the packed package
npm pack
npm install -g create-fm-playground-2.7.0.tgz
create-fm-playground

# Clean up
npm uninstall -g create-fm-playground
rm create-fm-playground-2.7.0.tgz
```

## Security Best Practices

1. **Never commit npm tokens** to your repository
2. **Use scoped tokens** when possible
3. **Regularly rotate** access tokens
4. **Monitor** npm downloads and usage
5. **Enable 2FA** on your npm account

## Workflow Status

You can monitor the workflow progress at:

- https://github.com/[your-username]/[your-repo]/actions

The workflows will show:

- ✅ Build and test status
- 📦 Package publication status
- 🏷️ Version and release information
