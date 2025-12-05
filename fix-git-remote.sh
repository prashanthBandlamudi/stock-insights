#!/bin/bash

echo "🔧 Fixing Git remote URL..."
echo ""

# Show current remote URL
echo "📋 Current remote URL:"
git remote -v

echo ""
echo "🔄 Updating remote URL to use 'thisIsPrashanth' username..."

# Remove existing remote
git remote remove origin

# Add new remote with correct username
git remote add origin https://github.com/thisIsPrashanth/stock-insights.git

echo ""
echo "✅ Updated remote URL:"
git remote -v

echo ""
echo "🚀 Remote URL updated successfully!"
echo "You can now push with: git push -u origin main"