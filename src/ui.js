// ==================== UI / HUD ====================
// Compact Diablo-style user interface with minimap

import { CONFIG } from './config.js';
import { GS } from './state.js';
import { KEYS } from './keyboard.js';
import { HEROES } from './data/heroes.js';
import { getLevel } from './data/levels.js';

export function createHUD() {
    // Use viewport dimensions for UI positioning
    const VW = CONFIG.VIEWPORT_WIDTH;
    const VH = CONFIG.VIEWPORT_HEIGHT;
    
    // ==================== COMPACT UI ====================
    
    // HP bar frame - compact
    add([rect(160, 22), pos(10, 10), color(40, 30, 25), fixed(), z(99)]);
    add([rect(156, 18), pos(12, 12), color(20, 15, 12), fixed(), z(100)]);
    const hpBar = add([rect(152, 14), pos(14, 14), color(180, 50, 50), fixed(), z(101)]);
    const hpTxt = add([text("100/100", { size: 11 }), pos(90, 21), anchor("center"), color(255, 255, 255), fixed(), z(102)]);
    
    // Stamina bar - compact (inline with HP)
    add([rect(100, 12), pos(10, 34), color(40, 30, 25), fixed(), z(99)]);
    add([rect(96, 8), pos(12, 36), color(20, 15, 12), fixed(), z(100)]);
    const stamBar = add([rect(92, 6), pos(14, 37), color(80, 160, 200), fixed(), z(101)]);
    
    // Stamina exhaustion indicator
    const stamExhaust = add([text("", { size: 9 }), pos(60, 40), anchor("center"), color(255, 100, 100), fixed(), z(102)]);
    
    // XP bar - thin line below stamina
    add([rect(100, 8), pos(10, 48), color(40, 30, 25), fixed(), z(99)]);
    add([rect(96, 4), pos(12, 50), color(20, 15, 12), fixed(), z(100)]);
    const xpBar = add([rect(0, 3), pos(13, 50.5), color(220, 180, 80), fixed(), z(101)]);
    const lvTxt = add([text("LV.1", { size: 10 }), pos(115, 51), anchor("left"), color(255, 220, 100), fixed(), z(102)]);
    
    // Ultimate bar (golden) - compact
    add([rect(100, 18), pos(10, 58), color(60, 45, 30), fixed(), z(99)]);
    add([rect(96, 14), pos(12, 60), color(25, 20, 15), fixed(), z(100)]);
    const ultGlow = add([rect(96, 14), pos(12, 60), color(255, 200, 50), opacity(0), fixed(), z(100.5)]);
    const ultBar = add([rect(0, 12), pos(13, 61), color(200, 150, 50), fixed(), z(101)]);
    const ultTxt = add([text("[Q]", { size: 10 }), pos(25, 67), anchor("center"), color(200, 180, 140), fixed(), z(102)]);
    const ultReady = add([text("", { size: 10 }), pos(75, 67), anchor("center"), color(255, 220, 100), fixed(), z(102)]);
    
    // Ranged cooldown (small square)
    add([rect(36, 36), pos(10, 80), color(40, 30, 25), fixed(), z(99)]);
    add([rect(32, 32), pos(12, 82), color(20, 15, 12), fixed(), z(100)]);
    const rangedBar = add([rect(28, 28), pos(14, 84), color(80, 140, 180), fixed(), z(101)]);
    add([text("[E]", { size: 12 }), pos(28, 98), anchor("center"), color(255, 255, 255), fixed(), z(102)]);
    const bulletTxt = add([text("x1", { size: 10 }), pos(50, 98), anchor("left"), color(150, 200, 220), fixed(), z(103)]);
    
    // Level & Room indicator (top center) - compact
    add([rect(140, 40), pos(VW / 2, 8), anchor("top"), color(40, 30, 25), fixed(), z(99)]);
    add([rect(136, 36), pos(VW / 2, 10), anchor("top"), color(25, 20, 15), fixed(), z(100)]);
    add([text(`LEVEL ${GS.currentLevel}`, { size: 14 }), pos(VW / 2, 14), anchor("top"), color(200, 170, 120), fixed(), z(101)]);
    
    // Room indicator
    const isBossRoom = GS.isBossRoom ? GS.isBossRoom() : false;
    const roomLabel = isBossRoom ? "🔥 BOSS" : `Room ${GS.currentRoom + 1}/${GS.totalRooms}`;
    const roomTxt = add([text(roomLabel, { size: 10 }), pos(VW / 2, 30), anchor("top"), color(150, 150, 180), fixed(), z(101)]);
    
    const enemyTxt = add([text("0/6", { size: 11 }), pos(VW / 2, 50), anchor("top"), color(180, 170, 160), fixed(), z(100)]);
    const keyTxt = add([text("", { size: 12 }), pos(VW / 2, 65), anchor("top"), color(255, 220, 100), fixed(), z(100)]);
    
    // Score & Gold (top right) - compact
    add([rect(100, 45), pos(VW - 10, 8), anchor("topright"), color(40, 30, 25), fixed(), z(99)]);
    add([rect(96, 41), pos(VW - 12, 10), anchor("topright"), color(25, 20, 15), fixed(), z(100)]);
    const scoreTxt = add([text("0", { size: 12 }), pos(VW - 18, 18), anchor("topright"), color(200, 200, 200), fixed(), z(101)]);
    const goldTxt = add([text("💰 0", { size: 14 }), pos(VW - 18, 36), anchor("topright"), color(255, 220, 100), fixed(), z(101)]);
    
    // Passive skills (bottom right) - compact
    const skillsTxt = add([text("", { size: 12 }), pos(VW - 10, VH - 10), anchor("botright"), color(180, 160, 120), fixed(), z(100)]);

    // Hero indicator (bottom left) - compact
    const hero = HEROES[GS.selectedHero];
    if (hero) {
        add([rect(90, 24), pos(10, VH - 34), color(40, 30, 25), fixed(), z(99)]);
        add([rect(86, 20), pos(12, VH - 32), color(25, 20, 15), fixed(), z(100)]);
        add([text(`${hero.icon} ${hero.name}`, { size: 12 }), pos(14, VH - 22), color(...hero.color), fixed(), z(101)]);
    }
    
    // ==================== ROOM LAYOUT MINIMAP (Enter the Gungeon style) ====================
    const minimapSize = 100;
    const minimapX = 10;
    const minimapY = VH - 150;
    
    // Minimap frame
    add([rect(minimapSize + 6, minimapSize + 6), pos(minimapX - 3, minimapY - 3), color(60, 50, 40), fixed(), z(97)]);
    add([rect(minimapSize + 4, minimapSize + 4), pos(minimapX - 2, minimapY - 2), color(30, 25, 20), fixed(), z(98)]);
    const minimapBg = add([rect(minimapSize, minimapSize), pos(minimapX, minimapY), color(10, 12, 18), fixed(), z(99)]);
    
    // Room number label
    const roomLabel = add([
        text("ROOM 1", { size: 8 }), 
        pos(minimapX + minimapSize / 2, minimapY - 8), 
        anchor("center"), color(120, 100, 80), fixed(), z(100)
    ]);
    
    // Store minimap elements
    let minimapTiles = [];
    let minimapPlayer = null;
    let minimapEnemies = [];
    let currentRoomGrid = null;
    
    // Create room layout minimap
    function createRoomMinimap(roomGrid) {
        if (!roomGrid) return;
        currentRoomGrid = roomGrid;
        
        // Clear old tiles
        minimapTiles.forEach(t => { if (t && t.exists()) destroy(t); });
        minimapTiles = [];
        
        const gridW = roomGrid.width;
        const gridH = roomGrid.height;
        const tileSize = Math.min(minimapSize / gridW, minimapSize / gridH);
        const offsetX = minimapX + (minimapSize - gridW * tileSize) / 2;
        const offsetY = minimapY + (minimapSize - gridH * tileSize) / 2;
        
        // Draw room tiles
        for (let gy = 0; gy < gridH; gy++) {
            for (let gx = 0; gx < gridW; gx++) {
                const tileType = roomGrid.grid[gy] ? roomGrid.grid[gy][gx] : 0;
                const tx = offsetX + gx * tileSize;
                const ty = offsetY + gy * tileSize;
                
                let tileColor;
                if (tileType === 1) {
                    tileColor = [35, 40, 55]; // Floor - dark blue-gray
                } else if (tileType === 2) {
                    tileColor = [70, 60, 50]; // Pillar - brown
                } else {
                    tileColor = [15, 18, 25]; // Wall - almost black
                }
                
                const tile = add([
                    rect(tileSize - 0.5, tileSize - 0.5),
                    pos(tx, ty),
                    color(...tileColor),
                    fixed(), z(100)
                ]);
                minimapTiles.push(tile);
            }
        }
        
        // Create player dot
        if (minimapPlayer) destroy(minimapPlayer);
        minimapPlayer = add([
            circle(3),
            pos(minimapX + minimapSize / 2, minimapY + minimapSize / 2),
            color(100, 255, 150),
            fixed(), z(104),
            outline(1, rgb(255, 255, 255))
        ]);
        
        // Update room label
        if (GS.dungeon) {
            const room = GS.dungeon.getCurrentRoom();
            const progress = GS.dungeon.getProgress();
            let labelText = `ROOM ${room.id + 1}/${progress.total}`;
            if (room.type === 'boss') labelText = "⚠ BOSS";
            else if (room.type === 'treasure') labelText = "💎 TREASURE";
            else if (room.type === 'elite') labelText = "⭐ ELITE";
            roomLabel.text = labelText;
        }
    }
    
    // Update player position on minimap
    function updateMinimapPlayer() {
        if (!minimapPlayer || !GS.player || !currentRoomGrid) return;
        
        const gridW = currentRoomGrid.width;
        const gridH = currentRoomGrid.height;
        const tileSize = Math.min(minimapSize / gridW, minimapSize / gridH);
        const offsetX = minimapX + (minimapSize - gridW * tileSize) / 2;
        const offsetY = minimapY + (minimapSize - gridH * tileSize) / 2;
        
        // Convert world position to minimap position
        const px = GS.player.pos.x / CONFIG.MAP_WIDTH * gridW * tileSize + offsetX;
        const py = GS.player.pos.y / CONFIG.MAP_HEIGHT * gridH * tileSize + offsetY;
        
        minimapPlayer.pos.x = px;
        minimapPlayer.pos.y = py;
        
        // Pulse effect
        minimapPlayer.radius = 3 + Math.sin(time() * 6) * 0.5;
    }
    
    // Update enemy positions on minimap
    function updateMinimapEnemies() {
        if (!currentRoomGrid) return;
        
        // Clear old enemy dots
        minimapEnemies.forEach(e => { if (e && e.exists()) destroy(e); });
        minimapEnemies = [];
        
        const gridW = currentRoomGrid.width;
        const gridH = currentRoomGrid.height;
        const tileSize = Math.min(minimapSize / gridW, minimapSize / gridH);
        const offsetX = minimapX + (minimapSize - gridW * tileSize) / 2;
        const offsetY = minimapY + (minimapSize - gridH * tileSize) / 2;
        
        // Draw enemy dots
        GS.enemies.forEach(enemy => {
            if (!enemy || !enemy.exists()) return;
            
            const ex = enemy.pos.x / CONFIG.MAP_WIDTH * gridW * tileSize + offsetX;
            const ey = enemy.pos.y / CONFIG.MAP_HEIGHT * gridH * tileSize + offsetY;
            
            const enemyColor = enemy.isBoss ? [255, 80, 80] : 
                               enemy.tier >= 3 ? [200, 100, 255] : 
                               [255, 100, 100];
            
            const dot = add([
                circle(enemy.isBoss ? 4 : 2),
                pos(ex, ey),
                color(...enemyColor),
                fixed(), z(102),
                opacity(0.9)
            ]);
            minimapEnemies.push(dot);
        });
    }
    
    // Door indicators on minimap edges
    function updateMinimapDoors() {
        if (!GS.dungeon) return;
        
        const room = GS.dungeon.getCurrentRoom();
        const gridW = currentRoomGrid ? currentRoomGrid.width : 40;
        const gridH = currentRoomGrid ? currentRoomGrid.height : 30;
        const tileSize = Math.min(minimapSize / gridW, minimapSize / gridH);
        const offsetX = minimapX + (minimapSize - gridW * tileSize) / 2;
        const offsetY = minimapY + (minimapSize - gridH * tileSize) / 2;
        
        room.doors.forEach(door => {
            const targetRoom = GS.dungeon.getRoom(door.to);
            if (!targetRoom) return;
            
            let dx, dy;
            const doorSize = 6;
            
            switch (door.side) {
                case 'left':
                    dx = offsetX - doorSize;
                    dy = offsetY + gridH * tileSize / 2 - doorSize / 2;
                    break;
                case 'right':
                    dx = offsetX + gridW * tileSize;
                    dy = offsetY + gridH * tileSize / 2 - doorSize / 2;
                    break;
                case 'up':
                    dx = offsetX + gridW * tileSize / 2 - doorSize / 2;
                    dy = offsetY - doorSize;
                    break;
                case 'down':
                    dx = offsetX + gridW * tileSize / 2 - doorSize / 2;
                    dy = offsetY + gridH * tileSize;
                    break;
                default: return;
            }
            
            // Door color based on type
            let doorColor = GS.roomCleared ? [100, 200, 100] : [100, 80, 60];
            if (targetRoom.type === 'boss') doorColor = [255, 80, 80];
            else if (targetRoom.type === 'treasure') doorColor = [255, 220, 100];
            
            const doorDot = add([
                rect(doorSize, doorSize),
                pos(dx, dy),
                color(...doorColor),
                fixed(), z(101)
            ]);
            minimapTiles.push(doorDot);
        });
    }
    
    // Store grid for updates
    GS.setRoomGrid = (grid) => {
        createRoomMinimap(grid);
        updateMinimapDoors();
    };

    // Regen timer
    let regenTimer = 0;
    
    // OPTIMIZATION: Throttle UI updates
    let uiUpdateTimer = 0;
    const UI_UPDATE_RATE = 0.1; // Update 10 times per second instead of 60

    // Update loop
    onUpdate(() => {
        if (!GS.player) return;
        
        // Throttle UI updates
        uiUpdateTimer += dt();
        if (uiUpdateTimer < UI_UPDATE_RATE) return;
        uiUpdateTimer = 0;
        
        const pl = GS.player;
        const stats = GS.getStats();
        
        // HP bar (compact = 152)
        const hpPct = Math.max(0, pl.hp / pl.maxHp);
        hpBar.width = 152 * hpPct;
        hpTxt.text = `${Math.floor(Math.max(0, pl.hp))}/${Math.floor(pl.maxHp)}`;
        
        // HP color gradient
        if (hpPct > 0.5) {
            hpBar.color = rgb(180, 50, 50);
        } else if (hpPct > 0.25) {
            hpBar.color = rgb(200, 150, 50);
        } else {
            hpBar.color = rgb(200, 50, 50);
            hpBar.opacity = 0.7 + Math.sin(time() * 10) * 0.3;
        }
        
        // Regeneration
        const regenLevel = GS.passiveSkills.regeneration;
        if (regenLevel > 0 && pl.hp < pl.maxHp) {
            regenTimer += dt();
            if (regenTimer >= 1) {
                regenTimer = 0;
                const healAmount = GS.getSkillEffect('regeneration', 'hpPerSecond');
                pl.hp = Math.min(pl.hp + healAmount, pl.maxHp);
            }
        }
        
        // Stamina (compact = 92)
        const maxStam = pl.maxStamina || CONFIG.SPRINT_MAX_STAMINA;
        const stamPct = pl.stamina / maxStam;
        stamBar.width = 92 * stamPct;
        
        // Stamina exhaustion indicator
        if (pl.staminaExhausted) {
            stamBar.color = rgb(255, 80, 80);
            stamExhaust.text = "TIRED";
        } else if (pl.isSlowed) {
            stamBar.color = rgb(100, 200, 240);
            stamExhaust.text = "";
        } else {
            stamBar.color = rgb(80, 160, 200);
            stamExhaust.text = "";
        }
        
        // XP (compact = 94)
        xpBar.width = 94 * GS.getXPProgress();
        lvTxt.text = `LV.${GS.playerLevel}`;
        
        // Ultimate (compact = 94)
        const ultPct = GS.ultimateCharge / GS.ultimateMax;
        ultBar.width = 94 * ultPct;
        if (GS.ultimateReady) {
            const pulse = Math.sin(time() * 6) * 0.5 + 0.5;
            ultBar.color = rgb(255, 200 + pulse * 55, 50);
            ultBar.opacity = 0.7 + pulse * 0.3;
            ultGlow.opacity = pulse * 0.4;
            ultReady.text = "⚡READY!";
            ultReady.color = rgb(255, 200 + pulse * 55, 100 + pulse * 100);
            ultTxt.color = rgb(255, 220, 100);
        } else {
            ultBar.color = rgb(160, 120, 60);
            ultReady.text = `${GS.ultimateCharge}/${GS.ultimateMax}`;
            ultReady.color = rgb(255, 220, 100);
            ultTxt.color = rgb(200, 180, 140);
            ultBar.opacity = 1;
            ultGlow.opacity = 0;
        }
        
        // Ranged cooldown (compact = 28)
        if (pl.rangedCD <= 0) {
            rangedBar.color = rgb(80, 140, 180);
            rangedBar.height = 28;
            rangedBar.pos.y = 84;
        } else {
            const pct = 1 - pl.rangedCD / stats.rangedCooldown;
            rangedBar.color = rgb(50, 50, 60);
            rangedBar.height = 28 * pct;
            rangedBar.pos.y = 84 + 28 * (1 - pct);
        }
        
        // Bullets
        bulletTxt.text = `x${stats.bulletCount}`;
        bulletTxt.color = stats.bulletCount >= 3 ? rgb(255, 150, 100) : stats.bulletCount >= 2 ? rgb(255, 220, 100) : rgb(150, 200, 220);
        
        // Score, gold, enemies (room-based)
        const roomEnemies = GS.roomEnemyCount || 0;
        const roomKilled = GS.roomEnemiesKilled || 0;
        const isBoss = GS.isBossRoom ? GS.isBossRoom() : false;
        
        scoreTxt.text = `${GS.score}`;
        goldTxt.text = `💰 ${GS.gold}`;
        
        if (isBoss) {
            enemyTxt.text = GS.bossSpawned ? "⚔️ BOSS!" : "...";
        } else {
            enemyTxt.text = `${roomKilled}/${roomEnemies}`;
        }
        
        if (GS.roomCleared) {
            keyTxt.text = "🚪 GO!";
        } else if (GS.hasKey) {
            keyTxt.text = "🔑";
        } else {
            keyTxt.text = "";
        }
        
        // ==================== ROOM MINIMAP UPDATE ====================
        // Update player/enemy positions on minimap (already throttled by uiUpdateTimer)
        updateMinimapPlayer();
        updateMinimapEnemies();
        
        // Passive skills
        const owned = [];
        if (GS.passiveSkills.poison > 0) owned.push(`☠️${GS.passiveSkills.poison}`);
        if (GS.passiveSkills.vampirism > 0) owned.push(`🧛${GS.passiveSkills.vampirism}`);
        if (GS.passiveSkills.thorns > 0) owned.push(`🌵${GS.passiveSkills.thorns}`);
        if (GS.passiveSkills.critical > 0) owned.push(`💥${GS.passiveSkills.critical}`);
        if (GS.passiveSkills.goldMagnet > 0) owned.push(`🧲${GS.passiveSkills.goldMagnet}`);
        if (GS.passiveSkills.regeneration > 0) owned.push(`💚${GS.passiveSkills.regeneration}`);
        skillsTxt.text = owned.join(' ');
    });
}

export default { createHUD };
