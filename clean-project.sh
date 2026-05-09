#!/bin/bash
set -e

# Root projektu, czyli folder gdzie leży ten skrypt
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_NAME="PMAB20026TSaran"

cd "$PROJECT_DIR"

echo "🧹 Cleaning project: $PROJECT_NAME"
echo "📁 Project directory: $PROJECT_DIR"
echo ""

# Node / React Native
echo "Deleting node_modules..."
find . -type d -name "node_modules" -prune -exec rm -rf {} \; 2>/dev/null || true

# .NET build output
echo "Deleting .NET bin/obj..."
find . -type d \( -name "bin" -o -name "obj" \) -prune -exec rm -rf {} \; 2>/dev/null || true

# Visual Studio cache
echo "Deleting .vs..."
find . -type d -name ".vs" -prune -exec rm -rf {} \; 2>/dev/null || true

# NuGet packages folder, jeśli istnieje
echo "Deleting packages..."
find . -type d -name "packages" -prune -exec rm -rf {} \; 2>/dev/null || true

# JetBrains IDE cache
echo "Deleting .idea..."
find . -type d -name ".idea" -prune -exec rm -rf {} \; 2>/dev/null || true

# Test results
echo "Deleting TestResults..."
find . -type d -name "TestResults" -prune -exec rm -rf {} \; 2>/dev/null || true

# Logs
echo "Deleting Logs/logs..."
find . -type d \( -name "Logs" -o -name "logs" \) -prune -exec rm -rf {} \; 2>/dev/null || true

# Artifacts
echo "Deleting artifacts..."
find . -type d -name "artifacts" -prune -exec rm -rf {} \; 2>/dev/null || true

# User-specific files
echo "Deleting user-specific files..."
find . -type f \( \
  -name "*.user" \
  -o -name "*.suo" \
  -o -name "*.rsuser" \
  -o -name "*.log" \
  -o -name "npm-debug.log" \
  -o -name ".DS_Store" \
\) -delete 2>/dev/null || true

# React Native - iOS
echo "Deleting ios/Pods..."
find . -type d -path "*/ios/Pods" -prune -exec rm -rf {} \; 2>/dev/null || true

echo "Deleting ios/build..."
find . -type d -path "*/ios/build" -prune -exec rm -rf {} \; 2>/dev/null || true

# React Native - Android
echo "Deleting android/build and android/app/build..."
find . -type d -path "*/android/build" -prune -exec rm -rf {} \; 2>/dev/null || true
find . -type d -path "*/android/app/build" -prune -exec rm -rf {} \; 2>/dev/null || true

echo "Deleting android/.gradle..."
find . -type d -path "*/android/.gradle" -prune -exec rm -rf {} \; 2>/dev/null || true

echo "Deleting android/app/.cxx..."
find . -type d -path "*/android/app/.cxx" -prune -exec rm -rf {} \; 2>/dev/null || true

# Metro / React Native cache
echo "Deleting .metro..."
find . -type d -name ".metro" -prune -exec rm -rf {} \; 2>/dev/null || true

echo "Deleting .expo..."
find . -type d -name ".expo" -prune -exec rm -rf {} \; 2>/dev/null || true

echo "Deleting .react-native..."
find . -type d -name ".react-native" -prune -exec rm -rf {} \; 2>/dev/null || true

echo ""
echo "✅ Cleaning complete!"
echo ""

# ZIP archive
ZIP_NAME="${PROJECT_NAME}-$(date +%Y%m%d-%H%M).zip"

echo "📦 Creating zip archive: $ZIP_NAME..."

cd "$(dirname "$PROJECT_DIR")"

zip -r "$ZIP_NAME" "$(basename "$PROJECT_DIR")" \
  -x "*/node_modules/*" \
  -x "*/.git/*" \
  -x "*/.vs/*" \
  -x "*/.vscode/*" \
  -x "*/.idea/*" \
  -x "*/bin/*" \
  -x "*/obj/*" \
  -x "*/packages/*" \
  -x "*/TestResults/*" \
  -x "*/Logs/*" \
  -x "*/logs/*" \
  -x "*/artifacts/*" \
  -x "*/ios/Pods/*" \
  -x "*/ios/build/*" \
  -x "*/android/build/*" \
  -x "*/android/app/build/*" \
  -x "*/android/.gradle/*" \
  -x "*/android/app/.cxx/*" \
  -x "*/.metro/*" \
  -x "*/.expo/*" \
  -x "*/.react-native/*" \
  -x "*/local.properties" \
  -x "*/.env" \
  -x "*/secrets.*" \
  -x "*/${PROJECT_NAME}-*.zip"

mv "$ZIP_NAME" "$PROJECT_DIR/"

echo ""
echo "✅ Ready!"
echo "   Project size: $(du -sh "$PROJECT_DIR" 2>/dev/null | awk '{print $1}' || echo 'N/A')"
echo "   Zip archive: $PROJECT_DIR/$ZIP_NAME"
echo ""
echo "After cleaning React Native dependencies, run:"
echo "   cd SolutionOrdersMobile"
echo "   pnpm install"