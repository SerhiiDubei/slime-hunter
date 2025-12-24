// ==================== SHOP SCENE ====================
// Diablo-style upgrade shop between levels

import { CONFIG } from '../config.js';
import { GS, STAT_INFO, UPGRADE_COSTS } from '../state.js';
import { PASSIVE_SKILLS, getSkillCost } from '../data/skills.js';
import { playSound, initAudio } from '../audio.js';

// English stat names
const STAT_NAMES = {
    str: { name: 'STRENGTH', icon: '⚔️', desc: 'Melee damage' },
    spd: { name: 'SPEED', icon: '👟', desc: 'Movement speed' },
    vit: { name: 'VITALITY', icon: '❤️', desc: 'Maximum HP' },
    mag: { name: 'MAGIC', icon: '🔮', desc: 'Ranged damage & cooldown' },
    sta: { name: 'STAMINA', icon: '💨', desc: 'Sprint duration' },
};

export function createShopScene() {
    scene("shop", () => {
        initAudio();
        
        // Reset camera for menu
        camPos(CONFIG.VIEWPORT_WIDTH / 2, CONFIG.VIEWPORT_HEIGHT / 2);
        const W = CONFIG.VIEWPORT_WIDTH;
        const H = CONFIG.VIEWPORT_HEIGHT;
        
        // Dark background
        add([rect(W, H), pos(0, 0), color(12, 10, 18), z(-2)]);
        
        // Atmospheric particles
        for (let i = 0; i < 25; i++) {
            const p = add([
                circle(rand(1, 2)),
                pos(rand(0, W), rand(0, H)),
                color(180, 140, 80),
                opacity(rand(0.1, 0.3)),
                z(-1),
                { vy: rand(-15, -30), life: rand(3, 8) }
            ]);
            p.onUpdate(() => {
                p.pos.y += p.vy * dt();
                p.life -= dt();
                if (p.life <= 0 || p.pos.y < -10) {
                    p.pos.y = H + 10;
                    p.pos.x = rand(0, W);
                    p.life = rand(3, 8);
                }
            });
        }
        
        // Top border
        add([rect(W, 2), pos(0, 0), color(139, 90, 43), z(50)]);
        add([rect(W, 2), pos(0, H - 2), color(139, 90, 43), z(50)]);
        
        // Title
        add([
            text("SANCTUARY", { size: 28 }),
            pos(W / 2, 30),
            anchor("center"),
            color(180, 140, 90),
        ]);
        
        add([
            text(`Level ${GS.currentLevel - 1} Complete`, { size: 12 }),
            pos(W / 2, 52),
            anchor("center"),
            color(100, 180, 100),
        ]);
        
        // Gold display
        add([
            rect(140, 35, { radius: 4 }),
            pos(W / 2, 80),
            anchor("center"),
            color(35, 30, 25),
            outline(2, rgb(139, 90, 43)),
        ]);
        
        add([
            text(`💰 ${GS.gold}`, { size: 18 }),
            pos(W / 2, 80),
            anchor("center"),
            color(255, 220, 100),
        ]);
        
        // ========== LEFT PANEL: ATTRIBUTES ==========
        const leftX = 180;
        
        add([
            text("ATTRIBUTES", { size: 14 }),
            pos(leftX, 115),
            anchor("center"),
            color(139, 90, 43),
        ]);
        
        add([rect(280, 1), pos(leftX, 130), anchor("center"), color(60, 50, 40)]);
        
        const stats = ['str', 'spd', 'vit', 'mag', 'sta'];
        const statButtons = [];
        let statY = 155;
        
        stats.forEach((stat) => {
            const info = STAT_NAMES[stat];
            const level = GS.stats[stat];
            const cost = GS.getUpgradeCost(stat);
            const maxed = cost < 0;
            
            // Stat row background
            add([
                rect(300, 40, { radius: 3 }),
                pos(leftX, statY),
                anchor("center"),
                color(25, 22, 30),
            ]);
            
            // Icon
            add([
                text(info.icon, { size: 16 }),
                pos(leftX - 130, statY),
                anchor("center"),
            ]);
            
            // Name
            add([
                text(info.name, { size: 11 }),
                pos(leftX - 95, statY - 6),
                anchor("left"),
                color(180, 170, 160),
            ]);
            
            // Description
            add([
                text(info.desc, { size: 8 }),
                pos(leftX - 95, statY + 8),
                anchor("left"),
                color(100, 95, 90),
            ]);
            
            // Level dots
            const maxLevel = 9;
            for (let j = 0; j < maxLevel; j++) {
                const filled = j < level;
                add([
                    circle(4),
                    pos(leftX + 15 + j * 12, statY),
                    anchor("center"),
                    color(filled ? 180 : 40, filled ? 140 : 35, filled ? 90 : 45),
                ]);
            }
            
            // Upgrade button
            if (!maxed) {
                const canAfford = GS.gold >= cost;
                const btn = add([
                    rect(55, 26, { radius: 3 }),
                    pos(leftX + 130, statY),
                    anchor("center"),
                    color(canAfford ? 60 : 35, canAfford ? 50 : 30, canAfford ? 40 : 28),
                    area(),
                    { stat: stat, cost: cost, type: 'stat' },
                    "shopBtn",
                ]);
                
                add([
                    text(`${cost}g`, { size: 10 }),
                    pos(leftX + 130, statY),
                    anchor("center"),
                    color(canAfford ? 200 : 80, canAfford ? 180 : 70, canAfford ? 100 : 60),
                ]);
                
                statButtons.push(btn);
            } else {
                add([
                    text("MAX", { size: 10 }),
                    pos(leftX + 130, statY),
                    anchor("center"),
                    color(180, 140, 90),
                ]);
            }
            
            statY += 48;
        });
        
        // ========== RIGHT PANEL: PASSIVE SKILLS ==========
        const rightX = W - 180;
        
        add([
            text("PASSIVE SKILLS", { size: 14 }),
            pos(rightX, 115),
            anchor("center"),
            color(139, 90, 43),
        ]);
        
        add([rect(280, 1), pos(rightX, 130), anchor("center"), color(60, 50, 40)]);
        
        const skills = Object.values(PASSIVE_SKILLS);
        let skillY = 155;
        
        skills.forEach((skill) => {
            const level = GS.passiveSkills[skill.id];
            const cost = getSkillCost(skill.id, level);
            const maxed = level >= skill.maxLevel;
            
            // Skill row background
            add([
                rect(300, 40, { radius: 3 }),
                pos(rightX, skillY),
                anchor("center"),
                color(30, 25, 35),
            ]);
            
            // Icon
            add([
                text(skill.icon, { size: 16 }),
                pos(rightX - 130, skillY),
                anchor("center"),
            ]);
            
            // Name + level
            const levelStr = level > 0 ? ` [${level}/${skill.maxLevel}]` : '';
            add([
                text(skill.name + levelStr, { size: 11 }),
                pos(rightX - 95, skillY - 6),
                anchor("left"),
                color(level > 0 ? [200, 180, 100] : [150, 145, 140]),
            ]);
            
            // Effect preview
            let effectStr = skill.description;
            if (level > 0) {
                if (skill.id === 'poison') effectStr = `${skill.effect.poisonDamage[level-1]} dmg/s`;
                if (skill.id === 'vampirism') effectStr = `+${skill.effect.healOnKill[level-1]} HP/kill`;
                if (skill.id === 'thorns') effectStr = `${skill.effect.reflectPercent[level-1]}% reflect`;
                if (skill.id === 'critical') effectStr = `${skill.effect.critChance[level-1]}% crit`;
                if (skill.id === 'goldMagnet') effectStr = `+${skill.effect.goldBonus[level-1]}% gold`;
                if (skill.id === 'regeneration') effectStr = `${skill.effect.hpPerSecond[level-1]} HP/s`;
            }
            add([
                text(effectStr, { size: 8 }),
                pos(rightX - 95, skillY + 8),
                anchor("left"),
                color(level > 0 ? [100, 180, 150] : [90, 85, 80]),
            ]);
            
            // Buy/Upgrade button
            if (!maxed) {
                const canAfford = GS.gold >= cost;
                const btn = add([
                    rect(55, 26, { radius: 3 }),
                    pos(rightX + 130, skillY),
                    anchor("center"),
                    color(canAfford ? 70 : 35, canAfford ? 50 : 30, canAfford ? 50 : 28),
                    area(),
                    { skillId: skill.id, cost: cost, type: 'skill' },
                    "shopBtn",
                ]);
                
                add([
                    text(`${cost}g`, { size: 10 }),
                    pos(rightX + 130, skillY),
                    anchor("center"),
                    color(canAfford ? 200 : 80, canAfford ? 180 : 70, canAfford ? 100 : 60),
                ]);
            } else {
                add([
                    text("MAX", { size: 10 }),
                    pos(rightX + 130, skillY),
                    anchor("center"),
                    color(180, 140, 90),
                ]);
            }
            
            skillY += 48;
        });
        
        // ========== CONTINUE BUTTON ==========
        const btnY = H - 55;
        
        add([
            rect(180, 45, { radius: 4 }),
            pos(W / 2, btnY),
            anchor("center"),
            color(139, 90, 43),
            opacity(0.3),
            z(19),
        ]);
        
        const continueBtn = add([
            rect(170, 40, { radius: 3 }),
            pos(W / 2, btnY),
            anchor("center"),
            color(50, 40, 30),
            area(),
            z(20),
            "continueBtn",
        ]);
        
        add([
            text(`ENTER LEVEL ${GS.currentLevel}`, { size: 14 }),
            pos(W / 2, btnY),
            anchor("center"),
            color(200, 170, 120),
            z(21),
        ]);
        
        // ========== CLICK HANDLERS ==========
        onClick("shopBtn", (btn) => {
            if (btn.type === 'stat') {
                if (GS.upgradeStat(btn.stat)) {
                    playSound('levelup');
                    go("shop");
                } else {
                    playSound('hit');
                }
            } else if (btn.type === 'skill') {
                if (GS.upgradePassiveSkill(btn.skillId, btn.cost)) {
                    playSound('levelup');
                    go("shop");
                } else {
                    playSound('hit');
                }
            }
        });
        
        onClick("continueBtn", () => {
            playSound('start');
            GS.resetLevel();
            go("levelIntro");
        });
        
        // Hover effects
        onHover("shopBtn", (btn) => {
            if (GS.gold >= btn.cost) {
                btn.color = rgb(100, 80, 60);
            }
        });
        
        onHoverEnd("shopBtn", (btn) => {
            const canAfford = GS.gold >= btn.cost;
            btn.color = rgb(canAfford ? 60 : 35, canAfford ? 50 : 30, canAfford ? 40 : 28);
        });
        
        onHover("continueBtn", () => { continueBtn.color = rgb(70, 55, 40); });
        onHoverEnd("continueBtn", () => { continueBtn.color = rgb(50, 40, 30); });
        
        // Keyboard
        onKeyPress("space", () => { playSound('start'); GS.resetLevel(); go("levelIntro"); });
        onKeyPress("enter", () => { playSound('start'); GS.resetLevel(); go("levelIntro"); });
        
        // Mobile touch support for continue button
        onTouchStart((touchPos) => {
            // Continue button
            if (touchPos.x >= W / 2 - 85 && touchPos.x <= W / 2 + 85 &&
                touchPos.y >= btnY - 20 && touchPos.y <= btnY + 20) {
                playSound('start');
                GS.resetLevel();
                go("levelIntro");
            }
        });
        
        // Stats summary
        const s = GS.getStats();
        add([
            text(`DMG:${s.meleeDamage} MAG:${s.rangedDamage} SPD:${s.moveSpeed} HP:${s.maxHp}`, { size: 9 }),
            pos(W / 2, H - 18),
            anchor("center"),
            color(80, 75, 70),
        ]);
    });
}

export default { createShopScene };
