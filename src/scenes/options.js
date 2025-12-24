// ==================== OPTIONS / KEYBINDS SCENE ====================

import { CONFIG } from '../config.js';
import { GS, KEYBINDS, setKeybind, resetKeybinds } from '../state.js';
import { playSound, initAudio } from '../audio.js';

export function createOptionsScene() {
    scene("options", () => {
        initAudio();
        
        // Reset camera for menu
        camPos(CONFIG.VIEWPORT_WIDTH / 2, CONFIG.VIEWPORT_HEIGHT / 2);
        const W = CONFIG.VIEWPORT_WIDTH;
        const H = CONFIG.VIEWPORT_HEIGHT;
        
        // Dark background
        add([rect(W, H), pos(0, 0), color(12, 10, 18), z(-2)]);
        
        // Title
        add([
            text("⚙️ OPTIONS", { size: 32 }),
            pos(W / 2, 40),
            anchor("center"), color(200, 160, 100)
        ]);
        
        add([
            text("Key Bindings", { size: 18 }),
            pos(W / 2, 80),
            anchor("center"), color(150, 140, 130)
        ]);
        
        // Keybind list
        const keybindItems = [
            { key: 'meleeAttack', label: 'Melee Attack', desc: 'Close-range attack' },
            { key: 'rangedAttack', label: 'Ranged Attack', desc: 'Shoot projectile' },
            { key: 'ultimate', label: 'Ultimate', desc: 'Super ability (when charged)' },
            { key: 'sprint', label: 'Sprint', desc: 'Move faster (uses stamina)' },
        ];
        
        let waitingForKey = null;
        let waitingButton = null;
        const buttons = [];
        
        keybindItems.forEach((item, i) => {
            const y = 140 + i * 70;
            
            // Label
            add([
                text(item.label, { size: 16 }),
                pos(100, y), color(200, 180, 150)
            ]);
            
            // Description
            add([
                text(item.desc, { size: 10 }),
                pos(100, y + 22), color(120, 110, 100)
            ]);
            
            // Current key button
            const currentKey = KEYBINDS[item.key] || '?';
            const btn = add([
                rect(120, 40, { radius: 5 }),
                pos(550, y + 10), anchor("center"),
                color(50, 40, 35), area(),
                { bindKey: item.key, isWaiting: false }
            ]);
            
            const keyText = add([
                text(formatKey(currentKey), { size: 14 }),
                pos(550, y + 10), anchor("center"),
                color(255, 220, 100)
            ]);
            
            btn.keyText = keyText;
            buttons.push(btn);
            
            btn.onClick(() => {
                if (waitingButton && waitingButton !== btn) {
                    waitingButton.color = rgb(50, 40, 35);
                    waitingButton.isWaiting = false;
                }
                
                btn.isWaiting = !btn.isWaiting;
                if (btn.isWaiting) {
                    waitingForKey = item.key;
                    waitingButton = btn;
                    btn.color = rgb(100, 80, 50);
                    keyText.text = "Press a key...";
                    keyText.color = rgb(255, 255, 150);
                } else {
                    waitingForKey = null;
                    waitingButton = null;
                    btn.color = rgb(50, 40, 35);
                    keyText.text = formatKey(KEYBINDS[item.key]);
                    keyText.color = rgb(255, 220, 100);
                }
                playSound('click');
            });
            
            btn.onHoverUpdate(() => {
                if (!btn.isWaiting) btn.color = rgb(70, 55, 45);
            });
            btn.onHoverEnd(() => {
                if (!btn.isWaiting) btn.color = rgb(50, 40, 35);
            });
        });
        
        // Listen for key input
        onKeyPress((key) => {
            if (waitingForKey && waitingButton) {
                // Map Kaboom key names
                const mappedKey = key;
                
                setKeybind(waitingForKey, mappedKey);
                waitingButton.keyText.text = formatKey(mappedKey);
                waitingButton.keyText.color = rgb(255, 220, 100);
                waitingButton.color = rgb(50, 40, 35);
                waitingButton.isWaiting = false;
                
                playSound('click');
                waitingForKey = null;
                waitingButton = null;
            }
        });
        
        // Reset button
        const resetBtn = add([
            rect(180, 40, { radius: 5 }),
            pos(W / 2, 450), anchor("center"),
            color(120, 60, 60), area()
        ]);
        add([
            text("Reset to Default", { size: 14 }),
            pos(W / 2, 450), anchor("center"),
            color(255, 220, 200)
        ]);
        
        resetBtn.onClick(() => {
            resetKeybinds();
            playSound('click');
            go("options"); // Refresh
        });
        resetBtn.onHoverUpdate(() => resetBtn.color = rgb(150, 80, 80));
        resetBtn.onHoverEnd(() => resetBtn.color = rgb(120, 60, 60));
        
        // Back button
        const backBtn = add([
            rect(180, 45, { radius: 5 }),
            pos(W / 2, 520), anchor("center"),
            color(50, 40, 35), area()
        ]);
        add([
            text("← Back to Menu", { size: 16 }),
            pos(W / 2, 520), anchor("center"),
            color(200, 180, 150)
        ]);
        
        backBtn.onClick(() => {
            playSound('click');
            go("start");
        });
        backBtn.onHoverUpdate(() => backBtn.color = rgb(70, 55, 45));
        backBtn.onHoverEnd(() => backBtn.color = rgb(50, 40, 35));
        
        onKeyPress("escape", () => {
            playSound('click');
            go("start");
        });
        
        // Instructions
        add([
            text("Click a key box and press a new key to rebind", { size: 10 }),
            pos(W / 2, H - 30),
            anchor("center"), color(80, 70, 60)
        ]);
    });
}

function formatKey(key) {
    if (!key) return '?';
    const keyMap = {
        'space': 'SPACE',
        'shift': 'SHIFT',
        'enter': 'ENTER',
        'escape': 'ESC',
        'up': '↑', 'down': '↓', 'left': '←', 'right': '→',
    };
    return keyMap[key.toLowerCase()] || key.toUpperCase();
}

export default createOptionsScene;



