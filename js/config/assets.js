// 遊戲資源配置
const ASSETS = {
    images: {
        background: 'assets/images/background.jpg',
        player: 'assets/images/player.png'
        ,
        // 怪物素材
        wolf: 'assets/images/wolf.png',
        wolf_king: 'assets/images/wolf_king.png'
    },
    audio: {
        // 常用音效
        backgroundMusic: 'assets/music/background_music.mp3',
        buttonClick: 'assets/music/button_click.mp3',
        eventPositive: 'assets/music/event_positive.mp3',
        eventNegative: 'assets/music/event_negative.mp3',
        levelUp: 'assets/music/level_up.mp3',
        gameOver: 'assets/music/game_over.mp3'
    }
};

// 確保 ASSETS 可以在全域範圍內使用
window.ASSETS = ASSETS;