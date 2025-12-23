// ==================== UI / HUD ====================
// Diablo-style user interface

import { CONFIG } from './config.js';
import { GS } from './state.js';
import { KEYS } from './keyboard.js';
import { HEROES } from './data/heroes.js';
import { getLevel } from './data/levels.js';

export function createHUD() {
    // ==================== BIGGER, CLEARER UI ====================
    
    // HP bar frame - LARGER
    add([rect(250, 36), pos(16, 16), color(40, 30, 25), fixed(), z(99)]);
    add([rect(246, 32), pos(18, 18), color(20, 15, 12), fixed(), z(100)]);
    const hpBar = add([rect(242, 28), pos(20, 20), color(180, 50, 50), fixed(), z(101)]);
    const hpTxt = add([text("100/100", { size: 18 }), pos(140, 34), anchor("center"), color(255, 255, 255), fixed(), z(102)]);
    
    // Stamina bar - LARGER
    add([rect(200, 20), pos(16, 58), color(40, 30, 25), fixed(), z(99)]);
    add([rect(196, 16), pos(18, 60), color(20, 15, 12), fixed(), z(100)]);
    const stamBar = add([rect(192, 12), pos(20, 62), color(80, 160, 200), fixed(), z(101)]);
    add([text("STAMINA", { size: 12 }), pos(115, 68), anchor("center"), color(255, 255, 255), fixed(), z(102)]);
    
    // XP bar - LARGER
    add([rect(200, 20), pos(16, 84), color(40, 30, 25), fixed(), z(99)]);
    add([rect(196, 16), pos(18, 86), color(20, 15, 12), fixed(), z(100)]);
    const xpBar = add([rect(0, 12), pos(20, 88), color(220, 180, 80), fixed(), z(101)]);
    const lvTxt = add([text("LV.1", { size: 14 }), pos(115, 94), anchor("center"), color(255, 255, 255), fixed(), z(102)]);
    
    // Ultimate bar (golden) - LARGER
    add([rect(200, 28), pos(16, 110), color(60, 45, 30), fixed(), z(99)]);
    add([rect(196, 24), pos(18, 112), color(25, 20, 15), fixed(), z(100)]);
    const ultGlow = add([rect(196, 24), pos(18, 112), color(255, 200, 50), opacity(0), fixed(), z(100.5)]);
    const ultBar = add([rect(0, 20), pos(20, 114), color(200, 150, 50), fixed(), z(101)]);
    const ultTxt = add([text("[Q]", { size: 14 }), pos(40, 124), anchor("center"), color(200, 180, 140), fixed(), z(102)]);
    const ultReady = add([text("", { size: 14 }), pos(135, 124), anchor("center"), color(255, 220, 100), fixed(), z(102)]);
    
    // Ranged cooldown (larger square)
    add([rect(60, 60), pos(16, 145), color(40, 30, 25), fixed(), z(99)]);
    add([rect(56, 56), pos(18, 147), color(20, 15, 12), fixed(), z(100)]);
    const rangedBar = add([rect(52, 52), pos(20, 149), color(80, 140, 180), fixed(), z(101)]);
    add([text("[E]", { size: 20 }), pos(46, 175), anchor("center"), color(255, 255, 255), fixed(), z(102)]);
    const bulletTxt = add([text("x1", { size: 14 }), pos(65, 195), anchor("center"), color(150, 200, 220), fixed(), z(103)]);
    
    // Level & Room indicator (top center) - LARGER
    add([rect(220, 60), pos(CONFIG.MAP_WIDTH / 2, 12), anchor("top"), color(40, 30, 25), fixed(), z(99)]);
    add([rect(216, 56), pos(CONFIG.MAP_WIDTH / 2, 14), anchor("top"), color(25, 20, 15), fixed(), z(100)]);
    add([text(`LEVEL ${GS.currentLevel}`, { size: 20 }), pos(CONFIG.MAP_WIDTH / 2, 20), anchor("top"), color(200, 170, 120), fixed(), z(101)]);
    
    // Room indicator
    const isBossRoom = GS.isBossRoom ? GS.isBossRoom() : false;
    const roomLabel = isBossRoom ? "🔥 BOSS" : `Room ${GS.currentRoom + 1}/${GS.totalRooms}`;
    const roomTxt = add([text(roomLabel, { size: 12 }), pos(CONFIG.MAP_WIDTH / 2, 40), anchor("top"), color(150, 150, 180), fixed(), z(101)]);
    
    const enemyTxt = add([text("0/6", { size: 14 }), pos(CONFIG.MAP_WIDTH / 2, 56), anchor("top"), color(180, 170, 160), fixed(), z(100)]);
    const keyTxt = add([text("", { size: 16 }), pos(CONFIG.MAP_WIDTH / 2, 78), anchor("top"), color(255, 220, 100), fixed(), z(100)]);
    
    // Score & Gold (top right) - LARGER
    add([rect(140, 65), pos(CONFIG.MAP_WIDTH - 15, 12), anchor("topright"), color(40, 30, 25), fixed(), z(99)]);
    add([rect(136, 61), pos(CONFIG.MAP_WIDTH - 17, 14), anchor("topright"), color(25, 20, 15), fixed(), z(100)]);
    const scoreTxt = add([text("SCORE: 0", { size: 16 }), pos(CONFIG.MAP_WIDTH - 25, 26), anchor("topright"), color(200, 200, 200), fixed(), z(101)]);
    const goldTxt = add([text("💰 0", { size: 20 }), pos(CONFIG.MAP_WIDTH - 25, 52), anchor("topright"), color(255, 220, 100), fixed(), z(101)]);
    
    // Passive skills (bottom right) - LARGER
    const skillsTxt = add([text("", { size: 16 }), pos(CONFIG.MAP_WIDTH - 15, CONFIG.MAP_HEIGHT - 15), anchor("botright"), color(180, 160, 120), fixed(), z(100)]);

    // Hero indicator (bottom left) - LARGER
    const hero = HEROES[GS.selectedHero];
    if (hero) {
        add([rect(130, 35), pos(16, CONFIG.MAP_HEIGHT - 55), color(40, 30, 25), fixed(), z(99)]);
        add([rect(126, 31), pos(18, CONFIG.MAP_HEIGHT - 53), color(25, 20, 15), fixed(), z(100)]);
        add([text(`${hero.icon} ${hero.name}`, { size: 16 }), pos(22, CONFIG.MAP_HEIGHT - 40), color(...hero.color), fixed(), z(101)]);
    }

    // Regen timer
    let regenTimer = 0;

    // Update loop
    onUpdate(() => {
        if (!GS.player) return;
        const pl = GS.player;
        const stats = GS.getStats();
        
        // HP bar (wider bar = 242)
        const hpPct = Math.max(0, pl.hp / pl.maxHp);
        hpBar.width = 242 * hpPct;
        hpTxt.text = `HP: ${Math.floor(Math.max(0, pl.hp))}/${Math.floor(pl.maxHp)}`;
        
        // HP color gradient
        if (hpPct > 0.5) {
            hpBar.color = rgb(180, 50, 50);
        } else if (hpPct > 0.25) {
            hpBar.color = rgb(200, 150, 50);
        } else {
            hpBar.color = rgb(200, 50, 50);
            // Low HP pulse
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
        
        // Stamina (wider = 192)
        const maxStam = pl.maxStamina || CONFIG.SPRINT_MAX_STAMINA;
        const stamPct = pl.stamina / maxStam;
        stamBar.width = 192 * stamPct;
        stamBar.color = pl.isSlowed ? rgb(100, 200, 240) : rgb(80, 160, 200);
        
        // XP (wider = 192)
        xpBar.width = 192 * GS.getXPProgress();
        lvTxt.text = `LV.${GS.playerLevel}`;
        
        // Ultimate - pulsing animation when ready (wider = 192)
        const ultPct = GS.ultimateCharge / GS.ultimateMax;
        ultBar.width = 192 * ultPct;
        if (GS.ultimateReady) {
            // Pulsing glow effect
            const pulse = Math.sin(time() * 6) * 0.5 + 0.5;
            ultBar.color = rgb(255, 200 + pulse * 55, 50);
            ultBar.opacity = 0.7 + pulse * 0.3;
            ultGlow.opacity = pulse * 0.4;
            ultReady.text = "⚡ READY! ⚡";
            ultReady.color = rgb(255, 200 + pulse * 55, 100 + pulse * 100);
            ultTxt.color = rgb(255, 220, 100);
            // Scale pulse
            ultBar.scale = vec2(1 + pulse * 0.05, 1 + pulse * 0.1);
        } else {
            ultBar.color = rgb(160, 120, 60);
            ultReady.text = `${GS.ultimateCharge}/${GS.ultimateMax}`;
            ultReady.color = rgb(255, 220, 100);
            ultTxt.color = rgb(200, 180, 140);
            ultBar.opacity = 1;
            ultBar.scale = vec2(1, 1);
            ultGlow.opacity = 0;
        }
        
        // Ranged cooldown (larger = 52)
        if (pl.rangedCD <= 0) {
            rangedBar.color = rgb(80, 140, 180);
            rangedBar.height = 52;
            rangedBar.pos.y = 149;
        } else {
            const pct = 1 - pl.rangedCD / stats.rangedCooldown;
            rangedBar.color = rgb(50, 50, 60);
            rangedBar.height = 52 * pct;
            rangedBar.pos.y = 149 + 52 * (1 - pct);
        }
        
        // Bullets
        bulletTxt.text = `x${stats.bulletCount}`;
        bulletTxt.color = stats.bulletCount >= 3 ? rgb(255, 150, 100) : stats.bulletCount >= 2 ? rgb(255, 220, 100) : rgb(150, 200, 220);
        
        // Score, gold, enemies (room-based)
        const roomEnemies = GS.roomEnemyCount || 0;
        const roomKilled = GS.roomEnemiesKilled || 0;
        const isBoss = GS.isBossRoom ? GS.isBossRoom() : false;
        
        scoreTxt.text = `SCORE: ${GS.score}`;
        goldTxt.text = `💰 ${GS.gold}`;
        
        if (isBoss) {
            enemyTxt.text = GS.bossSpawned ? "⚔️ DEFEAT THE BOSS!" : "...";
        } else {
            enemyTxt.text = `${roomKilled}/${roomEnemies} Killed`;
        }
        
        if (GS.roomCleared) {
            keyTxt.text = "🚪 DOOR OPEN!";
        } else if (GS.hasKey) {
            keyTxt.text = "🔑 KEY!";
        } else {
            keyTxt.text = "";
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
