#!/bin/bash
set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_NAME="$(basename "$PROJECT_DIR")"
ZIP_NAME="${PROJECT_NAME}-for-submit-$(date +%Y%m%d-%H%M).zip"
ZIP_PATH="$PROJECT_DIR/$ZIP_NAME"

echo "============================================================"
echo "📦 Creating ZIP archive for project: $PROJECT_NAME"
echo "📁 Project directory: $PROJECT_DIR"
echo "⚠️  This script does NOT delete any files from your project."
echo "============================================================"
echo ""

PROJECT_DIR_WIN="$(cygpath -w "$PROJECT_DIR")"
ZIP_PATH_WIN="$(cygpath -w "$ZIP_PATH")"

powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "
\$ErrorActionPreference = 'Stop'

\$ProjectDir = '$PROJECT_DIR_WIN'
\$ProjectName = '$PROJECT_NAME'
\$ZipPath = '$ZIP_PATH_WIN'

\$TempRoot = Join-Path \$env:TEMP ('zip-project-' + [guid]::NewGuid().ToString())
\$TempProject = Join-Path \$TempRoot \$ProjectName

try {
    Write-Host 'Creating temporary folder...'
    New-Item -ItemType Directory -Path \$TempProject -Force | Out-Null

    Write-Host 'Copying project without unnecessary folders...'

    robocopy \$ProjectDir \$TempProject /E /XD .git node_modules bin obj .vs .idea packages TestResults Logs logs artifacts Pods build .gradle .metro .expo .react-native .vscode-test .cxx .externalNativeBuild /XF *.zip *.log *.tmp *.user *.suo *.rsuser .DS_Store Thumbs.db | Out-Null

    \$RoboExit = \$LASTEXITCODE

    if (\$RoboExit -gt 7) {
        throw ('Robocopy failed with exit code ' + \$RoboExit)
    }

    if (Test-Path \$ZipPath) {
        Remove-Item \$ZipPath -Force
    }

    Write-Host 'Creating ZIP archive...'
    Compress-Archive -Path \$TempProject -DestinationPath \$ZipPath -Force

    Write-Host ''
    Write-Host 'ZIP created successfully:'
    Write-Host \$ZipPath
}
finally {
    if (Test-Path \$TempRoot) {
        Write-Host 'Removing temporary folder...'
        Remove-Item \$TempRoot -Recurse -Force -ErrorAction SilentlyContinue
    }
}
"

echo ""
echo "✅ Ready!"
echo "Zip archive:"
echo "   $ZIP_PATH"