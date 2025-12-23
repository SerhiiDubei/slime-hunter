// ==================== UI / HUD ====================
// Diablo-style user interface

import { CONFIG } from './config.js';
import { GS } from './state.js';
import { KEYS } from './keyboard.js';
import { HEROES } from './data/heroes.js';
import { getLevel } from './data/levels.js';

export function createHUD() {
    // HP bar frame
    add([rect(208, 28), pos(16, 16), color(40, 30, 25), fixed(), z(99)]);
    add([rect(204, 24), pos(18, 18), color(20, 15, 12), fixed(), z(100)]);
    const hpBar = add([rect(200, 20), pos(20, 20), color(180, 50, 50), fixed(), z(101)]);
    const hpTxt = add([text("100/100", { size: 12 }), pos(120, 30), anchor("center"), color(255, 255, 255), fixed(), z(102)]);
    
    // Stamina bar
    add([rect(158, 14), pos(16, 48), color(40, 30, 25), fixed(), z(99)]);
    add([rect(154, 10), pos(18, 50), color(20, 15, 12), fixed(), z(100)]);
    const stamBar = add([rect(150, 6), pos(20, 52), color(80, 160, 200), fixed(), z(101)]);
    add([text("STAM", { size: 7 }), pos(90, 53), anchor("center"), color(255, 255, 255), fixed(), z(102)]);
    
    // XP bar
    add([rect(158, 14), pos(16, 66), color(40, 30, 25), fixed(), z(99)]);
    add([rect(154, 10), pos(18, 68), color(20, 15, 12), fixed(), z(100)]);
    const xpBar = add([rect(0, 6), pos(20, 70), color(220, 180, 80), fixed(), z(101)]);
    const lvTxt = add([text("LV.1", { size: 7 }), pos(90, 71), anchor("center"), color(255, 255, 255), fixed(), z(102)]);
    
    // Ultimate bar (golden)
    add([rect(158, 18), pos(16, 84), color(60, 45, 30), fixed(), z(99)]);
    add([rect(154, 14), pos(18, 86), color(25, 20, 15), fixed(), z(100)]);
    const ultGlow = add([rect(154, 14), pos(18, 86), color(255, 200, 50), opacity(0), fixed(), z(100.5)]);
    const ultBar = add([rect(0, 10), pos(20, 88), color(200, 150, 50), fixed(), z(101)]);
    const ultTxt = add([text("Q", { size: 9 }), pos(30, 93), anchor("center"), color(200, 180, 140), fixed(), z(102)]);
    const ultReady = add([text("", { size: 9 }), pos(120, 93), anchor("center"), color(255, 220, 100), fixed(), z(102)]);
    
    // Ranged cooldown (bottom left square)
    add([rect(48, 48), pos(16, 108), color(40, 30, 25), fixed(), z(99)]);
    add([rect(44, 44), pos(18, 110), color(20, 15, 12), fixed(), z(100)]);
    const rangedBar = add([rect(40, 40), pos(20, 112), color(80, 140, 180), fixed(), z(101)]);
    add([text("E", { size: 16 }), pos(40, 132), anchor("center"), color(255, 255, 255), fixed(), z(102)]);
    const bulletTxt = add([text("x1", { size: 9 }), pos(54, 148), anchor("center"), color(150, 200, 220), fixed(), z(103)]);
    
    // Level indicator (top center)
    add([rect(130, 30), pos(CONFIG.MAP_WIDTH / 2, 20), anchor("top"), color(40, 30, 25), fixed(), z(99)]);
    add([rect(126, 26), pos(CONFIG.MAP_WIDTH / 2, 22), anchor("top"), color(25, 20, 15), fixed(), z(100)]);
    add([text(`LEVEL ${GS.currentLevel}`, { size: 16 }), pos(CONFIG.MAP_WIDTH / 2, 27), anchor("top"), color(200, 170, 120), fixed(), z(101)]);
    const enemyTxt = add([text("0/6", { size: 11 }), pos(CONFIG.MAP_WIDTH / 2, 48), anchor("top"), color(180, 170, 160), fixed(), z(100)]);
    const keyTxt = add([text("", { size: 12 }), pos(CONFIG.MAP_WIDTH / 2, 65), anchor("top"), color(255, 220, 100), fixed(), z(100)]);
    
    // Score & Gold (top right)
    add([rect(110, 50), pos(CONFIG.MAP_WIDTH - 20, 18), anchor("topright"), color(40, 30, 25), fixed(), z(99)]);
    add([rect(106, 46), pos(CONFIG.MAP_WIDTH - 22, 20), anchor("topright"), color(25, 20, 15), fixed(), z(100)]);
    const scoreTxt = add([text("0", { size: 12 }), pos(CONFIG.MAP_WIDTH - 30, 28), anchor("topright"), color(200, 200, 200), fixed(), z(101)]);
    const goldTxt = add([text("💰 0", { size: 14 }), pos(CONFIG.MAP_WIDTH - 30, 48), anchor("topright"), color(255, 220, 100), fixed(), z(101)]);
    
    // Passive skills (bottom right)
    const skillsTxt = add([text("", { size: 11 }), pos(CONFIG.MAP_WIDTH - 15, CONFIG.MAP_HEIGHT - 15), anchor("botright"), color(180, 160, 120), fixed(), z(100)]);

    // Hero indicator (bottom left)
    const hero = HEROES[GS.selectedHero];
    if (hero) {
        add([rect(90, 25), pos(16, CONFIG.MAP_HEIGHT - 50), color(40, 30, 25), fixed(), z(99)]);
        add([rect(86, 21), pos(18, CONFIG.MAP_HEIGHT - 48), color(25, 20, 15), fixed(), z(100)]);
        add([text(`${hero.icon} ${hero.name}`, { size: 10 }), pos(22, CONFIG.MAP_HEIGHT - 40), color(...hero.color), fixed(), z(101)]);
    }

    // Regen timer
    let regenTimer = 0;

    // Update loop
    onUpdate(() => {
        if (!GS.player) return;
        const pl = GS.player;
        const stats = GS.getStats();
        
        // HP bar
        const hpPct = Math.max(0, pl.hp / pl.maxHp);
        hpBar.width = 200 * hpPct;
        hpTxt.text = `${Math.floor(Math.max(0, pl.hp))}/${Math.floor(pl.maxHp)}`;
        
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
        
        // Stamina
        const maxStam = pl.maxStamina || CONFIG.SPRINT_MAX_STAMINA;
        const stamPct = pl.stamina / maxStam;
        stamBar.width = 150 * stamPct;
        stamBar.color = pl.isSlowed ? rgb(100, 200, 240) : rgb(80, 160, 200);
        
        // XP
        xpBar.width = 150 * GS.getXPProgress();
        lvTxt.text = `LV.${GS.playerLevel}`;
        
        // Ultimate - pulsing animation when ready
        const ultPct = GS.ultimateCharge / GS.ultimateMax;
        ultBar.width = 150 * ultPct;
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
        
        // Ranged cooldown
        if (pl.rangedCD <= 0) {
            rangedBar.color = rgb(80, 140, 180);
            rangedBar.height = 40;
            rangedBar.pos.y = 112;
        } else {
            const pct = 1 - pl.rangedCD / stats.rangedCooldown;
            rangedBar.color = rgb(50, 50, 60);
            rangedBar.height = 40 * pct;
            rangedBar.pos.y = 112 + 40 * (1 - pct);
        }
        
        // Bullets
        bulletTxt.text = `x${stats.bulletCount}`;
        bulletTxt.color = stats.bulletCount >= 3 ? rgb(255, 150, 100) : stats.bulletCount >= 2 ? rgb(255, 220, 100) : rgb(150, 200, 220);
        
        // Score, gold, enemies
        const levelConfig = getLevel(GS.currentLevel);
        const maxEnemies = levelConfig?.enemyCount || CONFIG.ENEMIES_PER_LEVEL;
        scoreTxt.text = `${GS.score}`;
        goldTxt.text = `💰 ${GS.gold}`;
        enemyTxt.text = `Enemies: ${GS.enemiesKilled}/${maxEnemies}`;
        keyTxt.text = GS.hasKey ? "🔑 KEY ACQUIRED!" : "";
        
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
