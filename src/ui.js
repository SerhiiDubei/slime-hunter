// ==================== UI / HUD ====================
// Compact Diablo-style user interface with minimap

import { CONFIG } from './config.js';
import { GS } from './state.js';
import { KEYS } from './keyboard.js';
import { HEROES } from './data/heroes.js';
import { getLevel } from './data/levels.js';

export function createHUD() {
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
    add([rect(140, 40), pos(CONFIG.MAP_WIDTH / 2, 8), anchor("top"), color(40, 30, 25), fixed(), z(99)]);
    add([rect(136, 36), pos(CONFIG.MAP_WIDTH / 2, 10), anchor("top"), color(25, 20, 15), fixed(), z(100)]);
    add([text(`LEVEL ${GS.currentLevel}`, { size: 14 }), pos(CONFIG.MAP_WIDTH / 2, 14), anchor("top"), color(200, 170, 120), fixed(), z(101)]);
    
    // Room indicator
    const isBossRoom = GS.isBossRoom ? GS.isBossRoom() : false;
    const roomLabel = isBossRoom ? "🔥 BOSS" : `Room ${GS.currentRoom + 1}/${GS.totalRooms}`;
    const roomTxt = add([text(roomLabel, { size: 10 }), pos(CONFIG.MAP_WIDTH / 2, 30), anchor("top"), color(150, 150, 180), fixed(), z(101)]);
    
    const enemyTxt = add([text("0/6", { size: 11 }), pos(CONFIG.MAP_WIDTH / 2, 50), anchor("top"), color(180, 170, 160), fixed(), z(100)]);
    const keyTxt = add([text("", { size: 12 }), pos(CONFIG.MAP_WIDTH / 2, 65), anchor("top"), color(255, 220, 100), fixed(), z(100)]);
    
    // Score & Gold (top right) - compact
    add([rect(100, 45), pos(CONFIG.MAP_WIDTH - 10, 8), anchor("topright"), color(40, 30, 25), fixed(), z(99)]);
    add([rect(96, 41), pos(CONFIG.MAP_WIDTH - 12, 10), anchor("topright"), color(25, 20, 15), fixed(), z(100)]);
    const scoreTxt = add([text("0", { size: 12 }), pos(CONFIG.MAP_WIDTH - 18, 18), anchor("topright"), color(200, 200, 200), fixed(), z(101)]);
    const goldTxt = add([text("💰 0", { size: 14 }), pos(CONFIG.MAP_WIDTH - 18, 36), anchor("topright"), color(255, 220, 100), fixed(), z(101)]);
    
    // Passive skills (bottom right) - compact
    const skillsTxt = add([text("", { size: 12 }), pos(CONFIG.MAP_WIDTH - 10, CONFIG.MAP_HEIGHT - 10), anchor("botright"), color(180, 160, 120), fixed(), z(100)]);

    // Hero indicator (bottom left) - compact
    const hero = HEROES[GS.selectedHero];
    if (hero) {
        add([rect(90, 24), pos(10, CONFIG.MAP_HEIGHT - 34), color(40, 30, 25), fixed(), z(99)]);
        add([rect(86, 20), pos(12, CONFIG.MAP_HEIGHT - 32), color(25, 20, 15), fixed(), z(100)]);
        add([text(`${hero.icon} ${hero.name}`, { size: 12 }), pos(14, CONFIG.MAP_HEIGHT - 22), color(...hero.color), fixed(), z(101)]);
    }
    
    // ==================== DUNGEON MINIMAP ====================
    const minimapSize = 90;
    const minimapX = 10;
    const minimapY = CONFIG.MAP_HEIGHT - 140;
    const roomSize = 14;
    const roomGap = 4;
    
    // Minimap background
    add([rect(minimapSize + 4, minimapSize + 4), pos(minimapX - 2, minimapY - 2), color(40, 30, 25), fixed(), z(98)]);
    add([rect(minimapSize, minimapSize), pos(minimapX, minimapY), color(15, 15, 25), fixed(), z(99)]);
    
    // Minimap label
    add([text("DUNGEON", { size: 7 }), pos(minimapX + minimapSize / 2, minimapY - 6), anchor("center"), color(100, 100, 120), fixed(), z(100)]);
    
    // Store room indicators for updates
    let minimapRooms = [];
    let minimapConnections = [];
    
    // Create dungeon map visualization
    function createDungeonMinimap() {
        const dungeon = GS.dungeon;
        if (!dungeon) return;
        
        // Clear old elements
        minimapRooms.forEach(r => { if (r.exists()) destroy(r); });
        minimapConnections.forEach(c => { if (c.exists()) destroy(c); });
        minimapRooms = [];
        minimapConnections = [];
        
        const rooms = dungeon.getAllRooms();
        
        // Find bounds
        let minX = 0, maxX = 0, minY = 0, maxY = 0;
        rooms.forEach(r => {
            minX = Math.min(minX, r.x);
            maxX = Math.max(maxX, r.x);
            minY = Math.min(minY, r.y);
            maxY = Math.max(maxY, r.y);
        });
        
        const gridWidth = maxX - minX + 1;
        const gridHeight = maxY - minY + 1;
        const offsetX = minimapX + (minimapSize - gridWidth * (roomSize + roomGap)) / 2;
        const offsetY = minimapY + (minimapSize - gridHeight * (roomSize + roomGap)) / 2;
        
        // Draw connections first
        rooms.forEach(room => {
            const rx = offsetX + (room.x - minX) * (roomSize + roomGap) + roomSize / 2;
            const ry = offsetY + (room.y - minY) * (roomSize + roomGap) + roomSize / 2;
            
            room.doors.forEach(door => {
                const targetRoom = rooms.find(r => r.id === door.to);
                if (!targetRoom || targetRoom.id < room.id) return; // Avoid duplicates
                
                const tx = offsetX + (targetRoom.x - minX) * (roomSize + roomGap) + roomSize / 2;
                const ty = offsetY + (targetRoom.y - minY) * (roomSize + roomGap) + roomSize / 2;
                
                // Connection line
                const lineColor = (room.visited || targetRoom.visited) ? [80, 80, 100] : [40, 40, 50];
                if (rx === tx) {
                    // Vertical connection
                    const conn = add([
                        rect(2, Math.abs(ty - ry)),
                        pos(rx - 1, Math.min(ry, ty)),
                        color(...lineColor),
                        fixed(), z(99.5)
                    ]);
                    minimapConnections.push(conn);
                } else {
                    // Horizontal connection
                    const conn = add([
                        rect(Math.abs(tx - rx), 2),
                        pos(Math.min(rx, tx), ry - 1),
                        color(...lineColor),
                        fixed(), z(99.5)
                    ]);
                    minimapConnections.push(conn);
                }
            });
        });
        
        // Draw rooms
        rooms.forEach(room => {
            const rx = offsetX + (room.x - minX) * (roomSize + roomGap);
            const ry = offsetY + (room.y - minY) * (roomSize + roomGap);
            
            // Room color based on type and state
            let roomColor = [60, 60, 80];
            if (room.id === dungeon.currentRoomId) {
                roomColor = [100, 255, 150]; // Current room - green
            } else if (room.type === 'boss') {
                roomColor = room.cleared ? [100, 50, 50] : [255, 50, 50]; // Boss - red
            } else if (room.type === 'treasure') {
                roomColor = [255, 220, 100]; // Treasure - gold
            } else if (room.type === 'elite') {
                roomColor = room.cleared ? [100, 60, 150] : [180, 80, 255]; // Elite - purple
            } else if (room.cleared) {
                roomColor = [60, 100, 60]; // Cleared - dark green
            } else if (room.visited) {
                roomColor = [100, 100, 120]; // Visited but not cleared
            } else {
                roomColor = [40, 40, 50]; // Unknown
            }
            
            const roomRect = add([
                rect(roomSize, roomSize),
                pos(rx, ry),
                color(...roomColor),
                fixed(), z(100),
                { roomId: room.id }
            ]);
            minimapRooms.push(roomRect);
            
            // Current room pulse
            if (room.id === dungeon.currentRoomId) {
                roomRect.onUpdate(() => {
                    const pulse = Math.sin(time() * 5) * 0.3 + 0.7;
                    roomRect.opacity = pulse;
                });
            }
        });
    }
    
    // Create initial minimap
    createDungeonMinimap();
    
    // Minimap player dot (for position within current room)
    const minimapPlayer = add([
        circle(2), pos(minimapX + minimapSize / 2, minimapY + minimapSize / 2),
        color(255, 255, 255), fixed(), z(103), opacity(0) // Hidden, we use room highlight instead
    ]);
    
    // Minimap enemy dots container (for current room enemies)
    let minimapEnemies = [];

    // Regen timer
    let regenTimer = 0;

    // Update loop
    onUpdate(() => {
        if (!GS.player) return;
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
        
        // ==================== DUNGEON MINIMAP UPDATE ====================
        // Update room colors based on state
        const dungeon = GS.dungeon;
        if (dungeon) {
            minimapRooms.forEach(roomRect => {
                const room = dungeon.getRoom(roomRect.roomId);
                if (!room) return;
                
                let roomColor = [60, 60, 80];
                if (room.id === dungeon.currentRoomId) {
                    roomColor = [100, 255, 150];
                } else if (room.type === 'boss') {
                    roomColor = room.cleared ? [100, 50, 50] : [255, 50, 50];
                } else if (room.type === 'treasure') {
                    roomColor = [255, 220, 100];
                } else if (room.type === 'elite') {
                    roomColor = room.cleared ? [100, 60, 150] : [180, 80, 255];
                } else if (room.cleared) {
                    roomColor = [60, 100, 60];
                } else if (room.visited) {
                    roomColor = [100, 100, 120];
                } else {
                    roomColor = [40, 40, 50];
                }
                
                if (room.id !== dungeon.currentRoomId) {
                    roomRect.color = rgb(...roomColor);
                }
            });
        }
        
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
