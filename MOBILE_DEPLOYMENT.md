# 手機應用程式部署指南

這個文檔說明如何將 Phaser 事件冒險遊戲轉換為 Android 和 iOS 原生應用程式。

## 🎮 遊戲特色 (適合手機)

### � 移動優化設計
- **直立式螢幕**：375x667 像素，完美適配手機
- **觸控友善**：大按鈕設計，無需精確點擊
- **多場景系統**：首頁、遊戲、強化三個場景
- **本地存儲**：金錢和強化進度自動保存

### 🎯 手機遊戲特色
- **快速遊玩**：每回合30秒內完成
- **離線遊戲**：無需網路連接
- **持久進度**：金錢系統和角色強化
- **響應式UI**：自動適應不同螢幕尺寸

## �🚀 快速開始

### 📋 前置需求
- **Node.js** (v16 或更高版本)
- **Cordova CLI** 或 **Capacitor** (推薦)
- **Android Studio** (Android 開發)
- **Xcode** (iOS 開發，僅限 macOS)

### ⚡ 推薦技術棧
建議使用 **Capacitor** 而非 Cordova，因為：
- 更好的效能
- 現代化的開發體驗
- 更容易除錯
- 更好的原生功能整合

### 🛠️ 安裝依賴
```bash
# 安裝 Capacitor
npm install -g @capacitor/cli
npm install @capacitor/core @capacitor/android @capacitor/ios

# 或者使用 Cordova
npm install -g cordova
```

## 📱 Android 部署 (Capacitor)

### 1. 初始化專案
```bash
# 初始化 Capacitor
npx cap init "事件冒險遊戲" "com.yourcompany.eventadventure"

# 添加 Android 平台
npx cap add android
```

### 2. 準備遊戲檔案
```bash
# 創建 build 資料夾並複製遊戲檔案
mkdir -p www
cp index.html www/
cp game_fixed.js www/
cp events.js www/
cp -r assets www/
```

### 3. 配置 Android
編輯 `capacitor.config.ts`：
```typescript
const config: CapacitorConfig = {
  appId: 'com.yourcompany.eventadventure',
  appName: '事件冒險遊戲',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  },
  android: {
    allowMixedContent: true,
    captureInput: true
  }
};
```

### 4. 建置 APK
```bash
# 同步檔案到 Android 專案
npx cap sync android

# 打開 Android Studio
npx cap open android

# 在 Android Studio 中建置和運行
```

### 5. 設備測試
```bash
# 連接 Android 設備並運行
npx cap run android
```

## 🍎 iOS 部署 (Capacitor)

### 1. 安裝 iOS 開發環境 (僅限 macOS)
```bash
# 安裝 Xcode 命令列工具
xcode-select --install

# 添加 iOS 平台
npx cap add ios
```

### 2. 配置 iOS
編輯 `ios/App/App/Info.plist`：
```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
</dict>
```

### 3. 建置 IPA
```bash
# 同步檔案到 iOS 專案
npx cap sync ios

# 打開 Xcode
npx cap open ios

# 在 Xcode 中建置和運行
```

## 📱 Cordova 部署 (備選方案)

### Android (Cordova)
```bash
# 初始化專案
cordova create EventAdventure com.yourcompany.eventadventure "事件冒險遊戲"
cd EventAdventure

# 複製遊戲檔案到 www 資料夾
cp ../index.html www/
cp ../game_fixed.js www/
cp ../events.js www/
cp -r ../assets www/

# 添加平台和建置
cordova platform add android
cordova build android --release
```

### iOS (Cordova)
```bash
cordova platform add ios
cordova build ios --release
```

## ⚙️ 配置檔案

### package.json
```json
{
  "name": "event-adventure-game",
  "version": "1.0.0",
  "description": "事件冒險遊戲 - Phaser 手機遊戲",
  "main": "index.html",
  "scripts": {
    "serve": "python3 -m http.server 8080",
    "build:android": "npx cap sync android",
    "build:ios": "npx cap sync ios",
    "dev": "npx cap run android"
  },
  "devDependencies": {
    "@capacitor/cli": "^5.0.0"
  },
  "dependencies": {
    "@capacitor/android": "^5.0.0",
    "@capacitor/core": "^5.0.0",
    "@capacitor/ios": "^5.0.0"
  }
}
```

### config.xml (如果使用 Cordova)
```xml
<?xml version='1.0' encoding='utf-8'?>
<widget id="com.yourcompany.eventadventure" version="1.0.0">
    <name>事件冒險遊戲</name>
    <description>
        使用 Phaser 3 開發的手機冒險遊戲
    </description>
    <author email="dev@example.com" href="http://example.com">
        Your Company
    </author>
    
    <content src="index.html" />
    
    <preference name="DisallowOverscroll" value="true" />
    <preference name="android-minSdkVersion" value="22" />
    <preference name="android-targetSdkVersion" value="33" />
    
    <platform name="android">
        <preference name="Orientation" value="portrait" />
        <icon density="ldpi" src="assets/icons/android/ldpi.png" />
        <icon density="mdpi" src="assets/icons/android/mdpi.png" />
        <icon density="hdpi" src="assets/icons/android/hdpi.png" />
        <icon density="xhdpi" src="assets/icons/android/xhdpi.png" />
    </platform>
    
    <platform name="ios">
        <preference name="Orientation" value="portrait" />
        <icon height="57" src="assets/icons/ios/icon-57.png" width="57" />
        <icon height="114" src="assets/icons/ios/icon-57-2x.png" width="114" />
        <icon height="72" src="assets/icons/ios/icon-72.png" width="72" />
        <icon height="144" src="assets/icons/ios/icon-72-2x.png" width="144" />
    </platform>
</widget>
```
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