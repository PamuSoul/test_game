// 圖片載入工具類
class ImageLoader {
    static loadImages(scene, imageConfigs) {
        return new Promise((resolve, reject) => {
            let loadedCount = 0;
            let errorCount = 0;
            const totalImages = imageConfigs.length;
            
            if (totalImages === 0) {
                resolve();
                return;
            }
            
            // 設置載入完成監聽器
            scene.load.on('filecomplete', (key, type, data) => {
                if (type === 'image') {
                    loadedCount++;
                    console.log(`圖片載入成功: ${key} (${loadedCount}/${totalImages})`);
                    
                    if (loadedCount + errorCount >= totalImages) {
                        resolve();
                    }
                }
            });
            
            // 設置載入錯誤監聽器
            scene.load.on('loaderror', (file) => {
                errorCount++;
                console.error(`圖片載入失敗: ${file.key} - ${file.src}`);
                
                // 創建備用圖片
                ImageLoader.createFallbackImage(scene, file.key);
                
                if (loadedCount + errorCount >= totalImages) {
                    resolve();
                }
            });
            
            // 開始載入圖片
            imageConfigs.forEach(config => {
                try {
                    scene.load.image(config.key, config.src);
                } catch (error) {
                    console.error(`載入圖片時發生錯誤: ${config.key}`, error);
                    errorCount++;
                    ImageLoader.createFallbackImage(scene, config.key);
                }
            });
            
            // 如果沒有圖片需要載入，直接 resolve
            if (scene.load.list.size === 0) {
                resolve();
            }
        });
    }
    
    static createFallbackImage(scene, key) {
        // 根據圖片類型創建不同的備用圖片
        switch (key) {
            case 'backgroundImg':
                if (!scene.textures.exists(key)) {
                    scene.add.graphics()
                        .fillGradientStyle(0x87CEEB, 0x87CEEB, 0x98FB98, 0x98FB98)
                        .fillRect(0, 0, 375, 667)
                        .generateTexture(key, 375, 667);
                }
                break;
                
            case 'player':
                if (!scene.textures.exists(key)) {
                    const graphics = scene.add.graphics();
                    graphics.fillStyle(0x3498db);
                    graphics.fillCircle(0, 0, 20);
                    graphics.fillStyle(0xffffff);
                    graphics.fillCircle(-5, -5, 3);
                    graphics.fillCircle(5, -5, 3);
                    graphics.fillStyle(0x000000);
                    graphics.fillEllipse(0, 5, 10, 5);
                    graphics.generateTexture(key, 40, 40);
                    graphics.destroy();
                }
                break;
                
            case 'healthBarBgImg':
                if (!scene.textures.exists(key)) {
                    scene.add.graphics()
                        .fillStyle(0xe74c3c)
                        .fillRect(0, 0, 200, 15)
                        .generateTexture(key, 200, 15);
                }
                break;
                
            case 'healthBarImg':
                if (!scene.textures.exists(key)) {
                    scene.add.graphics()
                        .fillStyle(0x27ae60)
                        .fillRect(0, 0, 200, 15)
                        .generateTexture(key, 200, 15);
                }
                break;
                
            default:
                // 創建通用的備用圖片
                if (!scene.textures.exists(key)) {
                    scene.add.graphics()
                        .fillStyle(0x95a5a6)
                        .fillRect(0, 0, 64, 64)
                        .lineStyle(2, 0x7f8c8d)
                        .strokeRect(0, 0, 64, 64)
                        .generateTexture(key, 64, 64);
                }
                break;
        }
    }
    
    static ensureImageExists(scene, key) {
        if (!scene.textures.exists(key)) {
            ImageLoader.createFallbackImage(scene, key);
        }
    }
}

// 全域註冊
window.ImageLoader = ImageLoader;