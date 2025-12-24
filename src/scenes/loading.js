// ==================== LOADING SCENE ====================
// Shows loading screen during room/level transitions

import { CONFIG } from '../config.js';
import { GS } from '../state.js';

export function createLoadingScene() {
    scene("loading", () => {
        // Reset camera
        camPos(CONFIG.VIEWPORT_WIDTH / 2, CONFIG.VIEWPORT_HEIGHT / 2);
        const W = CONFIG.VIEWPORT_WIDTH;
        const H = CONFIG.VIEWPORT_HEIGHT;
        
        // Dark background
        add([rect(W, H), pos(0, 0), color(5, 5, 10), z(-2)]);
        
        // Loading text
        const loadingText = add([
            text("LOADING...", { size: 32 }),
            pos(W / 2, H / 2 - 40),
            anchor("center"),
            color(200, 160, 100),
            z(10)
        ]);
        
        // Animated dots
        let dotCount = 0;
        const dots = loop(0.5, () => {
            dotCount = (dotCount + 1) % 4;
            loadingText.text = "LOADING" + ".".repeat(dotCount);
        });
        
        // Progress bar background
        const barBg = add([
            rect(300, 20),
            pos(W / 2, H / 2 + 20),
            anchor("center"),
            color(40, 30, 25),
            z(10)
        ]);
        
        const barFill = add([
            rect(0, 16),
            pos(W / 2 - 150, H / 2 + 20),
            anchor("left"),
            color(200, 150, 50),
            z(11)
        ]);
        
        // Simulate progress (will be replaced with actual loading)
        let progress = 0;
        const progressLoop = loop(0.05, () => {
            progress = Math.min(1, progress + 0.02);
            barFill.width = progress * 296;
            
            if (progress >= 1) {
                dots.cancel();
                progressLoop.cancel();
                // Transition happens automatically via go("game") call
            }
        });
        
        // Auto-transition after short delay (room generation happens in next scene)
        // This gives time for cleanup and prevents frame drops
        wait(0.3, () => {
            dots.cancel();
            progressLoop.cancel();
            barFill.width = 296;
            wait(0.1, () => {
                if (GS.loadingTargetScene) {
                    go(GS.loadingTargetScene);
                    GS.loadingTargetScene = null;
                } else {
                    go("game");
                }
            });
        });
    });
}

export default createLoadingScene;

