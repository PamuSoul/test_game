# 資源文件結構

```
test_game/
├── assets/
│   ├── images/
│   │   ├── README.md
│   │   ├── player.png          # 玩家角色圖片 (80x80)
│   │   ├── background.jpg      # 遊戲背景 (375x667)
│   │   ├── button.png          # 按鈕背景 (200x60) [可選]
│   │   ├── health_bar_bg.png   # 血量條背景 (250x25) [可選]
│   │   ├── health_bar.png      # 血量條 (250x25) [可選]
│   │   └── text_box.png        # 文字框背景 (335x180) [可選]
│   └── music/
│       ├── README.md
│       ├── background_music.mp3    # 背景音樂
│       ├── button_click.mp3        # 按鈕點擊音效
│       ├── event_positive.mp3      # 正面事件音效
│       ├── event_negative.mp3      # 負面事件音效
│       ├── level_up.mp3           # 血量提升音效
│       └── game_over.mp3          # 遊戲結束音效
├── index.html
├── game.js
├── config.xml
├── package.json
├── README.md
└── MOBILE_DEPLOYMENT.md
```

## 🎮 功能特色

### 自動資源檢測
- 遊戲會自動嘗試載入 assets 資料夾中的圖片和音頻
- 如果文件不存在，會使用程式生成的預設圖形
- 無需修改代碼即可更換資源

### 支援格式
- **圖片**: PNG, JPG, JPEG
- **音頻**: MP3, OGG, WAV

### 備用機制
- 所有外部資源都有程式生成的備用版本
- 確保遊戲在任何情況下都能正常運行

## 🔧 使用方法

1. **添加圖片**: 將圖片文件放入 `assets/images/` 資料夾
2. **添加音樂**: 將音頻文件放入 `assets/music/` 資料夾
3. **重新載入**: 重新整理瀏覽器頁面
4. **檢查**: 開啟瀏覽器開發者工具查看載入狀態

## 🎨 建議資源

### 免費圖片資源
- OpenGameArt.org
- Itch.io (免費資源)
- Pixabay
- Unsplash

### 免費音樂資源
- Freesound.org
- Incompetech.com
- OpenGameArt.org
- YouTube Audio Library

記住要檢查版權和使用條款！