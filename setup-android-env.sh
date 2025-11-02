#!/bin/bash
# Script to set up Android environment variables

# Set Android SDK path
export ANDROID_HOME="$HOME/Android/Sdk"
export PATH="$PATH:$ANDROID_HOME/platform-tools"
export PATH="$PATH:$ANDROID_HOME/tools"
export PATH="$PATH:$ANDROID_HOME/tools/bin"

# Add to bashrc if not already there
if ! grep -q "ANDROID_HOME" ~/.bashrc 2>/dev/null; then
    echo "" >> ~/.bashrc
    echo "# Android SDK Configuration" >> ~/.bashrc
    echo "export ANDROID_HOME=\"\$HOME/Android/Sdk\"" >> ~/.bashrc
    echo "export PATH=\"\$PATH:\$ANDROID_HOME/platform-tools\"" >> ~/.bashrc
    echo "export PATH=\"\$PATH:\$ANDROID_HOME/tools\"" >> ~/.bashrc
    echo "export PATH=\"\$PATH:\$ANDROID_HOME/tools/bin\"" >> ~/.bashrc
    echo "✅ Added Android environment variables to ~/.bashrc"
else
    echo "ℹ️  Android environment variables already in ~/.bashrc"
fi

echo "✅ Android SDK configured!"
echo "📱 ANDROID_HOME: $ANDROID_HOME"
echo ""
echo "⚠️  Please run: source ~/.bashrc"
echo "   Or start a new terminal session before running 'npm run android'"

