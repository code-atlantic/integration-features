#!/bin/bash
# Release script for Integration Features block
# Builds plugin and deploys to test site

set -e

PLUGIN_SLUG="integration-features"
BUILD_DIR="release"
TARGET_DIR="/Users/danieliser/wppopupmaker.com/wp-content/plugins/${PLUGIN_SLUG}"

echo "🔨 Building plugin..."
npm run build

echo "📦 Creating release package..."
rm -rf ${BUILD_DIR}
mkdir -p ${BUILD_DIR}/${PLUGIN_SLUG}

# Copy production files only
cp -r build ${BUILD_DIR}/${PLUGIN_SLUG}/
cp -r src ${BUILD_DIR}/${PLUGIN_SLUG}/
cp integration-features.php ${BUILD_DIR}/${PLUGIN_SLUG}/
cp readme.txt ${BUILD_DIR}/${PLUGIN_SLUG}/
cp README.md ${BUILD_DIR}/${PLUGIN_SLUG}/
cp package.json ${BUILD_DIR}/${PLUGIN_SLUG}/

echo "🔗 Creating symlink to test site..."
rm -rf ${TARGET_DIR}
ln -s "$(pwd)/${BUILD_DIR}/${PLUGIN_SLUG}" ${TARGET_DIR}

echo "✅ Plugin symlinked to ${TARGET_DIR}"
echo ""
echo "Next steps:"
echo "1. Sync via SFTP to push to server"
echo "2. Activate plugin in WordPress admin"
echo "3. Test Integration Feature block in editor"
