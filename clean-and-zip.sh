#!/bin/bash
set -e

# Get project root (directory where this script is located)
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo "🧹 Cleaning project ($PROJECT_DIR)..."

# Delete node_modules
echo "Deleting node_modules..."
find . -type d -name "node_modules" -prune -exec rm -rf {} \; 2>/dev/null || true

# Delete .NET build output
echo "Deleting .NET bin/obj..."
find . -type d \( -name "bin" -o -name "obj" \) -prune -exec rm -rf {} \; 2>/dev/null || true

# Delete Visual Studio cache
echo "Deleting .vs..."
find . -type d -name ".vs" -prune -exec rm -rf {} \; 2>/dev/null || true

# Delete NuGet packages (can be restored with dotnet restore)
echo "Deleting packages..."
find . -type d -name "packages" -prune -exec rm -rf {} \; 2>/dev/null || true

# Delete JetBrains IDE
echo "Deleting .idea..."
find . -type d -name ".idea" -prune -exec rm -rf {} \; 2>/dev/null || true

# Delete test results
echo "Deleting TestResults..."
find . -type d -name "TestResults" -prune -exec rm -rf {} \; 2>/dev/null || true

# Delete logs
echo "Deleting Logs..."
find . -type d -name "Logs" -prune -exec rm -rf {} \; 2>/dev/null || true

# Delete artifacts
echo "Deleting artifacts..."
find . -type d -name "artifacts" -prune -exec rm -rf {} \; 2>/dev/null || true

# Delete user-specific project files
echo "Deleting *.user files..."
find . -type f -name "*.user" -delete 2>/dev/null || true

# --- React Native ---
# iOS: CocoaPods (restore with: cd ios && pod install)
echo "Deleting ios/Pods..."
find . -type d -path "*/ios/Pods" -prune -exec rm -rf {} \; 2>/dev/null || true
# iOS: Xcode build output
echo "Deleting ios/build..."
find . -type d -path "*/ios/build" -prune -exec rm -rf {} \; 2>/dev/null || true
# Android: Gradle build output
echo "Deleting android/build and app/build..."
find . -type d -path "*/android/build" -prune -exec rm -rf {} \; 2>/dev/null || true
find . -type d -path "*/android/app/build" -prune -exec rm -rf {} \; 2>/dev/null || true
# Android: Gradle cache
echo "Deleting android/.gradle..."
find . -type d -path "*/android/.gradle" -prune -exec rm -rf {} \; 2>/dev/null || true
# Metro bundler cache
echo "Deleting .metro..."
find . -type d -name ".metro" -prune -exec rm -rf {} \; 2>/dev/null || true
# Expo cache (if using Expo)
echo "Deleting .expo..."
find . -type d -name ".expo" -prune -exec rm -rf {} \; 2>/dev/null || true
# React Native temp/cache
echo "Deleting .react-native..."
find . -type d -name ".react-native" -prune -exec rm -rf {} \; 2>/dev/null || true

echo ""
echo "✅ Cleaning complete!"

# Create zip archive
ZIP_NAME="KochaneZaoczkiPMAB2026-$(date +%Y%m%d-%H%M).zip"
echo "📦 Creating zip archive: $ZIP_NAME..."
cd "$(dirname "$PROJECT_DIR")"
zip -r "$ZIP_NAME" "$(basename "$PROJECT_DIR")" \
  -x "*/node_modules/*" -x "*/.git/*" -x "*/bin/*" -x "*/obj/*" \
  -x "*/ios/Pods/*" -x "*/ios/build/*" -x "*/android/build/*" -x "*/android/app/build/*" \
  -x "*/android/.gradle/*" -x "*/.metro/*" -x "*/.expo/*" -x "*/.react-native/*"
mv "$ZIP_NAME" "$PROJECT_DIR/"

echo ""
echo "✅ Ready!"
echo "   Project size: $(du -sh "$PROJECT_DIR" 2>/dev/null | awk '{print $1}' || echo 'N/A')"
echo "   Zip archive: $PROJECT_DIR/$ZIP_NAME"