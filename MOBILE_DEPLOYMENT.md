# 手機應用程式部署指南

這個文檔說明如何將 Phaser 遊戲轉換為 Android 和 iOS 原生應用程式。

## 🚀 快速開始

### 前置需求
- Node.js (v14 或更高版本)
- Cordova CLI
- Android Studio (Android 開發)
- Xcode (iOS 開發，僅限 macOS)

### 安裝依賴
```bash
npm install -g cordova
npm install
```

## 📱 Android 部署

### 1. 安裝 Android 開發環境
- 下載並安裝 Android Studio
- 設置 Android SDK
- 配置環境變數 ANDROID_HOME

### 2. 初始化 Cordova 專案
```bash
cordova platform add android
cordova requirements android
```

### 3. 建置 APK
```bash
# 開發版本
cordova build android

# 發布版本
cordova build android --release
```

### 4. 在設備上測試
```bash
# 連接 Android 設備並啟用 USB 調試
cordova run android
```

## 🍎 iOS 部署

### 1. 安裝 iOS 開發環境 (僅限 macOS)
- 安裝 Xcode
- 註冊 Apple Developer 帳號
- 配置開發者證書

### 2. 初始化 Cordova 專案
```bash
cordova platform add ios
cordova requirements ios
```

### 3. 建置 iOS 專案
```bash
# 建置專案
cordova build ios

# 在 Xcode 中開啟專案
open platforms/ios/事件冒險遊戲.xcworkspace
```

### 4. 使用 Xcode 部署
1. 在 Xcode 中開啟專案
2. 選擇目標設備或模擬器
3. 點擊運行按鈕

## ⚙️ 建置配置

### 螢幕方向
- 配置為直立式 (Portrait)
- 防止橫向旋轉

### 效能優化
- 啟用硬體加速
- 優化記憶體使用
- 適當的圖片壓縮

### 圖示和啟動畫面
需要為不同解析度準備圖示：

#### Android 圖示尺寸
- mdpi: 48x48
- hdpi: 72x72
- xhdpi: 96x96
- xxhdpi: 144x144
- xxxhdpi: 192x192

#### iOS 圖示尺寸
- 57x57, 114x114 (iPhone)
- 72x72, 144x144 (iPad)
- 60x60, 120x120, 180x180 (iPhone 6+)
- 76x76, 152x152 (iPad)
- 167x167 (iPad Pro)
- 1024x1024 (App Store)

## 🔧 故障排除

### 常見問題
1. **建置失敗**：檢查 SDK 版本和路徑
2. **權限錯誤**：確認開發者證書配置
3. **效能問題**：優化遊戲資源和程式碼

### 除錯工具
- Chrome DevTools (遠端除錯)
- Safari Web Inspector (iOS)
- Android Studio Logcat

## 📦 發布準備

### Android (Google Play)
1. 產生簽名金鑰
2. 建置簽名的 APK
3. 上傳至 Google Play Console

### iOS (App Store)
1. 在 Xcode 中設定 App Store 配置
2. 建置和歸檔
3. 使用 Xcode 上傳至 App Store Connect

## 🎯 最佳實踐

1. **測試多種設備**：確保在不同螢幕尺寸上正常運作
2. **效能監控**：監控記憶體使用和電池消耗
3. **使用者體驗**：確保觸控回應靈敏
4. **離線功能**：考慮添加離線遊戲支援

這個配置已經優化為直立式手機遊戲，可以直接用於 Android 和 iOS 部署。