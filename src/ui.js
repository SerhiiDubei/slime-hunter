// ==================== UI / HUD ====================
// Compact Diablo-style user interface with minimap

import { CONFIG } from './config.js';
import { GS } from './state.js';
import { KEYS } from './keyboard.js';
import { HEROES } from './data/heroes.js';
import { getLevel } from './data/levels.js';
import { getHeroSkills, getHeroPassive } from './data/heroSkills.js';
import { getSkillCooldown } from './abilities.js';
import { Logger } from './logger.js';

export function createHUD() {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/cfda9218-06fc-4cdd-8ace-380746c59fe7',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'ui.js:12',message:'createHUD entry',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    Logger.debug('[DBG$] createHUD entry');
    // #endregion
    
    // Use viewport dimensions for UI positioning
    const VW = CONFIG.VIEWPORT_WIDTH;
    const VH = CONFIG.VIEWPORT_HEIGHT;
    
    // ==================== TOP UI (Level, Room, Score, Gold) ====================
    
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
    
    // ==================== HERO PANEL (Bottom, Dota-style) ====================
    const heroPanelHeight = 120;
    const heroPanelY = VH - heroPanelHeight;
    
    // Hero panel background (full width at bottom)
    const heroPanelBg = add([
        rect(VW, heroPanelHeight),
        pos(0, heroPanelY),
        color(20, 15, 10),
        opacity(0.95),
        fixed(),
        z(95)
    ]);
    
    const heroPanelFrame = add([
        rect(VW, 2),
        pos(0, heroPanelY),
        color(80, 60, 40),
        fixed(),
        z(96)
    ]);
    
    // Hero portrait (left side)
    const hero = HEROES[GS.selectedHero];
    const portraitSize = 80;
    const portraitX = 20;
    const portraitY = heroPanelY + heroPanelHeight / 2;
    
    if (hero) {
        // Portrait background
        add([
            rect(portraitSize + 4, portraitSize + 4),
            pos(portraitX, portraitY),
            anchor("center"),
            color(40, 30, 25),
            fixed(),
            z(97)
        ]);
        
        // Portrait icon
        const heroPortrait = add([
            text(hero.icon, { size: 56 }),
            pos(portraitX, portraitY - 8),
            anchor("center"),
            fixed(),
            z(98)
        ]);
        
        // Hero name
        const heroNameTxt = add([
            text(hero.name, { size: 12 }),
            pos(portraitX, portraitY + 38),
            anchor("center"),
            color(...hero.color),
            fixed(),
            z(98)
        ]);
    }
    
    // HP and Mana bars (right of portrait)
    const barsX = portraitX + portraitSize / 2 + 20;
    const barsY = portraitY - 25;
    const barWidth = 200;
    const barHeight = 16;
    
    // HP bar
    add([
        rect(barWidth + 4, barHeight + 4),
        pos(barsX, barsY),
        anchor("topleft"),
        color(40, 30, 25),
        fixed(),
        z(97)
    ]);
    const hpBar = add([
        rect(barWidth, barHeight),
        pos(barsX + 2, barsY + 2),
        anchor("topleft"),
        color(180, 50, 50),
        fixed(),
        z(98)
    ]);
    const hpTxt = add([
        text("100/100", { size: 11 }),
        pos(barsX + barWidth / 2, barsY + barHeight / 2 + 1),
        anchor("center"),
        color(255, 255, 255),
        fixed(),
        z(99)
    ]);
    
    // Mana bar
    const manaBarY = barsY + barHeight + 8;
    add([
        rect(barWidth + 4, barHeight + 4),
        pos(barsX, manaBarY),
        anchor("topleft"),
        color(40, 30, 25),
        fixed(),
        z(97)
    ]);
    const manaBar = add([
        rect(barWidth, barHeight),
        pos(barsX + 2, manaBarY + 2),
        anchor("topleft"),
        color(100, 100, 255),
        fixed(),
        z(98)
    ]);
    const manaTxt = add([
        text("100/100", { size: 11 }),
        pos(barsX + barWidth / 2, manaBarY + barHeight / 2 + 1),
        anchor("center"),
        color(200, 200, 255),
        fixed(),
        z(99)
    ]);
    
    // Stats panel (right side of bars)
    const statsX = barsX + barWidth + 30;
    const statsY = barsY;
    const statsGap = 18;
    
    // Attack Damage (Melee)
    const meleeDmgTxt = add([
        text("⚔️ Melee: 0", { size: 11 }),
        pos(statsX, statsY),
        anchor("topleft"),
        color(255, 150, 100),
        fixed(),
        z(98)
    ]);
    
    // Attack Damage (Ranged)
    const rangedDmgTxt = add([
        text("🏹 Ranged: 0", { size: 11 }),
        pos(statsX, statsY + statsGap),
        anchor("topleft"),
        color(150, 200, 255),
        fixed(),
        z(98)
    ]);
    
    // Attack Range
    const attackRangeTxt = add([
        text("📏 Range: 0px", { size: 11 }),
        pos(statsX, statsY + statsGap * 2),
        anchor("topleft"),
        color(200, 200, 150),
        fixed(),
        z(98)
    ]);
    
    // Level
    const lvTxt = add([
        text("LV.1", { size: 12 }),
        pos(statsX, statsY + statsGap * 3),
        anchor("topleft"),
        color(255, 220, 100),
        fixed(),
        z(98)
    ]);
    
    // XP bar (below level)
    const xpBarY = statsY + statsGap * 3 + 18;
    add([
        rect(150, 6),
        pos(statsX, xpBarY),
        anchor("topleft"),
        color(40, 30, 25),
        fixed(),
        z(97)
    ]);
    const xpBar = add([
        rect(0, 4),
        pos(statsX + 1, xpBarY + 1),
        anchor("topleft"),
        color(220, 180, 80),
        fixed(),
        z(98)
    ]);
    
    // Skill points indicator
    const skillPointsTxt = add([
        text("", { size: 11 }),
        pos(statsX, xpBarY + 10),
        anchor("topleft"),
        color(255, 220, 100),
        fixed(),
        z(98)
    ]);
    
    // Stamina bar (below mana)
    const stamBarY = manaBarY + barHeight + 8;
    add([
        rect(barWidth + 4, 8),
        pos(barsX, stamBarY),
        anchor("topleft"),
        color(40, 30, 25),
        fixed(),
        z(97)
    ]);
    const stamBar = add([
        rect(barWidth, 6),
        pos(barsX + 2, stamBarY + 1),
        anchor("topleft"),
        color(80, 160, 200),
        fixed(),
        z(98)
    ]);
    const stamExhaust = add([
        text("", { size: 9 }),
        pos(barsX + barWidth / 2, stamBarY + 4),
        anchor("center"),
        color(255, 100, 100),
        fixed(),
        z(99)
    ]);
    
    // ==================== HERO SKILLS UI (Above hero panel) ====================
    // Show active hero skills above hero panel
    const skillsBarY = heroPanelY - 70;
    const skillIconSize = 50;  // Square icons
    const skillIconGap = 6;
    const skillsBarWidth = skillIconSize * 4 + skillIconGap * 3;
    const skillsBarHeight = skillIconSize * 2 + skillIconGap;  // 2 rows
    
    // Skills bar background (square container)
    const skillsBarBg = add([
        rect(skillsBarWidth + 8, skillsBarHeight + 8),
        pos(VW / 2, skillsBarY),
        anchor("center"),
        color(40, 30, 25),
        opacity(0.9),
        fixed(),
        z(98)
    ]);
    
    const skillsBarFrame = add([
        rect(skillsBarWidth + 4, skillsBarHeight + 4),
        pos(VW / 2, skillsBarY),
        anchor("center"),
        color(20, 15, 12),
        opacity(0.95),
        fixed(),
        z(99)
    ]);
    
    // Skill icons container (4 slots: Q, R, T, Y) - 1x4 row
    const skillIcons = [];
    const totalWidth = skillIconSize * 4 + skillIconGap * 3;
    const startX = VW / 2 - totalWidth / 2;
    const startY = skillsBarY - skillIconSize / 2 - 10; // Move up for dots
    
    // Layout: [Q] [R] [T] [Y] - all in one row
    const skillPositions = [
        { key: 'Q', index: 0 },
        { key: 'R', index: 1 },
        { key: 'T', index: 2 },
        { key: 'Y', index: 3 },
    ];
    
    // Get hero skills
    const heroSkills = getHeroSkills(GS.selectedHero);
    
    Logger.debug('[DBG$] before skill icons loop', { slots: skillPositions.length, hero: GS.selectedHero });
    
    for (let i = 0; i < 4; i++) {
        const slotPos = skillPositions[i];
        const skillX = startX + slotPos.index * (skillIconSize + skillIconGap);
        const skillY = startY;
        
        // Get skill data
        let skill = null;
        if (slotPos.key === 'Q') skill = heroSkills.skillQ;
        else if (slotPos.key === 'R') skill = heroSkills.skillR;
        else if (slotPos.key === 'T') skill = heroSkills.skillT;
        else if (slotPos.key === 'Y') skill = heroSkills.skillY;
        
        // Skill slot background (square) - always visible
        const skillBg = add([
            rect(skillIconSize, skillIconSize),
            pos(skillX, skillY),
            color(30, 25, 20),
            area(),
            fixed(),
            z(99),
            `skillIcon${i}`,
            { skillKey: slotPos.key, skill: skill }
        ]);
        
        // Skill icon - always show (gray if not learned, colored if learned)
        const skillIcon = add([
            text(skill ? skill.icon : "?", { size: 28 }),
            pos(skillX + skillIconSize / 2, skillY + skillIconSize / 2 - 6),
            anchor("center"),
            color(150, 150, 150), // Gray by default, will be updated in onUpdate
            fixed(),
            z(100),
            `skillIconText${i}`
        ]);
        
        // Key label (Q, R, T, Y) - always visible
        const keyLabel = add([
            text(skill ? skill.key : slotPos.key, { size: 12 }),
            pos(skillX + skillIconSize / 2, skillY + skillIconSize - 12),
            anchor("center"),
            color(150, 150, 150), // Will be updated in onUpdate
            fixed(),
            z(101),
            `skillKey${i}`
        ]);
        
        // Skill level indicator (4 dots below icon)
        const levelDots = [];
        const dotSize = 4;
        const dotGap = 2;
        const dotsY = skillY + skillIconSize + 4;
        const dotsTotalWidth = dotSize * 4 + dotGap * 3;
        const dotsStartX = skillX + (skillIconSize - dotsTotalWidth) / 2;
        
        for (let dotIndex = 0; dotIndex < 4; dotIndex++) {
            const dotX = dotsStartX + dotIndex * (dotSize + dotGap);
            const dot = add([
                rect(dotSize, dotSize),
                pos(dotX, dotsY),
                color(60, 60, 60), // Gray by default
                fixed(),
                z(101),
                `skillLevelDot${i}_${dotIndex}`
            ]);
            levelDots.push(dot);
        }
        
        // Cooldown overlay (circular animation)
        const cooldownOverlay = add([
            rect(skillIconSize, skillIconSize),
            pos(skillX, skillY),
            color(0, 0, 0),
            opacity(0),
            fixed(),
            z(102),
            `skillCooldown${i}`
        ]);
        
        // Cooldown text (shows remaining time)
        const cooldownText = add([
            text("", { size: 14 }),
            pos(skillX + skillIconSize / 2, skillY + skillIconSize / 2),
            anchor("center"),
            color(255, 255, 255),
            opacity(0),
            fixed(),
            z(103),
            `skillCooldownText${i}`
        ]);
        
        // Tooltip (shown on hover)
        const tooltipBg = add([
            rect(280, 200, { radius: 6 }),
            pos(skillX + skillIconSize / 2, skillY - 120),
            anchor("center"),
            color(20, 15, 10),
            opacity(0),
            fixed(),
            z(200),
            `skillTooltipBg${i}`
        ]);
        
        const tooltipName = add([
            text("", { size: 16 }),
            pos(skillX + skillIconSize / 2, skillY - 200),
            anchor("center"),
            color(255, 220, 100),
            opacity(0),
            fixed(),
            z(201),
            `skillTooltipName${i}`
        ]);
        
        const tooltipDesc = add([
            text("", { size: 11, width: 260 }),
            pos(skillX + skillIconSize / 2, skillY - 180),
            anchor("center"),
            color(200, 190, 180),
            opacity(0),
            fixed(),
            z(201),
            `skillTooltipDesc${i}`
        ]);
        
        const tooltipStats = add([
            text("", { size: 10, width: 260 }),
            pos(skillX + skillIconSize / 2, skillY - 100),
            anchor("center"),
            color(150, 200, 255),
            opacity(0),
            fixed(),
            z(201),
            `skillTooltipStats${i}`
        ]);
        
        // Hover handlers
        skillBg.onHoverUpdate(() => {
            if (skill) {
                const level = GS.getSkillLevel(slotPos.key);
                tooltipBg.opacity = 0.95;
                tooltipName.opacity = 1;
                tooltipDesc.opacity = 1;
                tooltipStats.opacity = 1;
                
                tooltipName.text = skill.name || slotPos.key;
                tooltipDesc.text = skill.description || "";
                
                // Build stats text (like Dota)
                let statsText = "";
                if (level > 0 && skill.levels && skill.levels[level - 1]) {
                    const lvl = skill.levels[level - 1];
                    const stats = [];
                    
                    if (lvl.damage) stats.push(`Damage: ${lvl.damage}`);
                    if (lvl.range) stats.push(`Range: ${lvl.range}px`);
                    if (lvl.stunDuration) stats.push(`Stun: ${lvl.stunDuration}s`);
                    if (lvl.knockback) stats.push(`Knockback: ${lvl.knockback}`);
                    if (lvl.cooldown) stats.push(`Cooldown: ${lvl.cooldown}s`);
                    if (lvl.manaCost) stats.push(`Mana: ${lvl.manaCost}`);
                    if (lvl.duration) stats.push(`Duration: ${lvl.duration}s`);
                    if (lvl.speedBoost) stats.push(`Speed: +${Math.floor((lvl.speedBoost - 1) * 100)}%`);
                    if (lvl.radius) stats.push(`Radius: ${lvl.radius}px`);
                    if (lvl.poisonDamage) stats.push(`Poison: ${lvl.poisonDamage}/tick`);
                    if (lvl.poisonDuration) stats.push(`Poison Duration: ${lvl.poisonDuration}s`);
                    if (lvl.critChance) stats.push(`Crit Chance: ${Math.floor(lvl.critChance * 100)}%`);
                    if (lvl.critMultiplier) stats.push(`Crit Damage: ${lvl.critMultiplier}x`);
                    if (lvl.meleeDamageBonus) stats.push(`Melee Dmg: +${Math.floor(lvl.meleeDamageBonus * 100)}%`);
                    if (lvl.rangedDamageBonus) stats.push(`Ranged Dmg: +${Math.floor(lvl.rangedDamageBonus * 100)}%`);
                    if (lvl.maxPierceCount) stats.push(`Pierce: ${lvl.maxPierceCount}`);
                    if (lvl.homingStrengthBonus) stats.push(`Homing: +${Math.floor(lvl.homingStrengthBonus * 100)}%`);
                    if (lvl.arrowCount) stats.push(`Arrows: ${lvl.arrowCount}`);
                    if (lvl.strikes) stats.push(`Strikes: ${lvl.strikes}`);
                    if (lvl.invulnDuration) stats.push(`Invulnerability: ${lvl.invulnDuration}s`);
                    
                    statsText = stats.join("\n");
                } else if (skill.levels && skill.levels[0]) {
                    // Show level 1 stats if not learned
                    const lvl = skill.levels[0];
                    const stats = [];
                    
                    if (lvl.damage) stats.push(`Damage: ${lvl.damage}`);
                    if (lvl.range) stats.push(`Range: ${lvl.range}px`);
                    if (lvl.stunDuration) stats.push(`Stun: ${lvl.stunDuration}s`);
                    if (lvl.knockback) stats.push(`Knockback: ${lvl.knockback}`);
                    if (lvl.cooldown) stats.push(`Cooldown: ${lvl.cooldown}s`);
                    if (lvl.manaCost) stats.push(`Mana: ${lvl.manaCost}`);
                    if (lvl.duration) stats.push(`Duration: ${lvl.duration}s`);
                    if (lvl.speedBoost) stats.push(`Speed: +${Math.floor((lvl.speedBoost - 1) * 100)}%`);
                    if (lvl.radius) stats.push(`Radius: ${lvl.radius}px`);
                    if (lvl.poisonDamage) stats.push(`Poison: ${lvl.poisonDamage}/tick`);
                    if (lvl.poisonDuration) stats.push(`Poison Duration: ${lvl.poisonDuration}s`);
                    if (lvl.critChance) stats.push(`Crit Chance: ${Math.floor(lvl.critChance * 100)}%`);
                    if (lvl.critMultiplier) stats.push(`Crit Damage: ${lvl.critMultiplier}x`);
                    if (lvl.meleeDamageBonus) stats.push(`Melee Dmg: +${Math.floor(lvl.meleeDamageBonus * 100)}%`);
                    if (lvl.rangedDamageBonus) stats.push(`Ranged Dmg: +${Math.floor(lvl.rangedDamageBonus * 100)}%`);
                    if (lvl.maxPierceCount) stats.push(`Pierce: ${lvl.maxPierceCount}`);
                    if (lvl.homingStrengthBonus) stats.push(`Homing: +${Math.floor(lvl.homingStrengthBonus * 100)}%`);
                    if (lvl.arrowCount) stats.push(`Arrows: ${lvl.arrowCount}`);
                    if (lvl.strikes) stats.push(`Strikes: ${lvl.strikes}`);
                    if (lvl.invulnDuration) stats.push(`Invulnerability: ${lvl.invulnDuration}s`);
                    
                    statsText = "Level 1:\n" + stats.join("\n");
                }
                
                tooltipStats.text = statsText;
            }
        });
        
        skillBg.onHoverEnd(() => {
            tooltipBg.opacity = 0;
            tooltipName.opacity = 0;
            tooltipDesc.opacity = 0;
            tooltipStats.opacity = 0;
        });
        
        skillIcons.push({ 
            bg: skillBg, 
            icon: skillIcon, 
            level: null, // Will be set in onUpdate
            levelDots: levelDots,
            keyLabel: keyLabel,
            skillKey: slotPos.key,
            cooldownOverlay: cooldownOverlay,
            cooldownText: cooldownText
        });
    }

    // Hero indicator (bottom left) - compact
    const hero = HEROES[GS.selectedHero];
    if (hero) {
        add([rect(90, 24), pos(10, VH - 34), color(40, 30, 25), fixed(), z(99)]);
        add([rect(86, 20), pos(12, VH - 32), color(25, 20, 15), fixed(), z(100)]);
        add([text(`${hero.icon} ${hero.name}`, { size: 12 }), pos(14, VH - 22), color(...hero.color), fixed(), z(101)]);
    }
    
    // ==================== DUNGEON MAP (Full Level Overview) ====================
    // Shows entire dungeon level with all rooms, corridors, and connections
    const minimapSize = 180; // Larger for full dungeon view
    const minimapX = 10;
    const minimapY = VH - 200;
    
    // Minimap frame (parchment style)
    add([rect(minimapSize + 8, minimapSize + 8), pos(minimapX - 4, minimapY - 4), color(139, 90, 43), fixed(), z(97)]);
    add([rect(minimapSize + 4, minimapSize + 4), pos(minimapX - 2, minimapY - 2), color(101, 67, 33), fixed(), z(98)]);
    const minimapBg = add([rect(minimapSize, minimapSize), pos(minimapX, minimapY), color(220, 200, 170), fixed(), z(99)]); // Parchment color
    
    // Title
    const minimapTitle = add([
        text("DUNGEON MAP", { size: 10 }), 
        pos(minimapX + minimapSize / 2, minimapY - 12), 
        anchor("center"), color(80, 60, 40), fixed(), z(100)
    ]);
    
    // Store minimap elements
    let minimapRooms = [];
    let minimapCorridors = [];
    let minimapPlayerDot = null;
    let dungeonMapData = null;
    
    // Create full dungeon map
    function createDungeonMap() {
        if (!GS.dungeon) return;
        
        dungeonMapData = GS.dungeon.map;
        if (!dungeonMapData || !dungeonMapData.rooms) return;
        
        // Clear old elements
        minimapRooms.forEach(r => { if (r && r.exists()) destroy(r); });
        minimapCorridors.forEach(c => { if (c && c.exists()) destroy(c); });
        minimapRooms = [];
        minimapCorridors = [];
        
        const rooms = dungeonMapData.rooms;
        const currentRoom = GS.dungeon.getCurrentRoom();
        
        // Find bounds for scaling
        let minX = Infinity, maxX = -Infinity;
        let minY = Infinity, maxY = -Infinity;
        rooms.forEach(room => {
            minX = Math.min(minX, room.x);
            maxX = Math.max(maxX, room.x);
            minY = Math.min(minY, room.y);
            maxY = Math.max(maxY, room.y);
        });
        
        const rangeX = maxX - minX + 1;
        const rangeY = maxY - minY + 1;
        const roomSize = Math.min(minimapSize / (rangeX * 1.5), minimapSize / (rangeY * 1.5), 12); // Max room size
        const padding = 10;
        const mapScale = Math.min(
            (minimapSize - padding * 2) / (rangeX * 1.5),
            (minimapSize - padding * 2) / (rangeY * 1.5)
        );
        
        const offsetX = minimapX + minimapSize / 2;
        const offsetY = minimapY + minimapSize / 2;
        
        // Draw corridors/connections first (so they appear behind rooms)
        rooms.forEach(room => {
            room.doors.forEach(door => {
                const targetRoom = rooms[door.to];
                if (!targetRoom) return;
                
                const x1 = offsetX + (room.x - (minX + maxX) / 2) * mapScale * 1.5;
                const y1 = offsetY + (room.y - (minY + maxY) / 2) * mapScale * 1.5;
                const x2 = offsetX + (targetRoom.x - (minX + maxX) / 2) * mapScale * 1.5;
                const y2 = offsetY + (targetRoom.y - (minY + maxY) / 2) * mapScale * 1.5;
                
                // Draw corridor line
                const dx = x2 - x1;
                const dy = y2 - y1;
                const len = Math.sqrt(dx * dx + dy * dy);
                const angle = Math.atan2(dy, dx) * 180 / Math.PI;
                
                const corridor = add([
                    rect(len, 2),
                    pos(x1, y1),
                    anchor("left"),
                    rotate(angle),
                    color(120, 100, 80), // Brown corridor
                    opacity(0.6),
                    fixed(),
                    z(100)
                ]);
                minimapCorridors.push(corridor);
            });
        });
        
        // Draw rooms
        rooms.forEach(room => {
            const roomX = offsetX + (room.x - (minX + maxX) / 2) * mapScale * 1.5;
            const roomY = offsetY + (room.y - (minY + maxY) / 2) * mapScale * 1.5;
            
            // Room color based on type and state
            let roomColor;
            let roomBorderColor;
            if (room.id === currentRoom.id) {
                roomColor = [255, 220, 100]; // Current room - gold
                roomBorderColor = [255, 200, 50];
            } else if (!room.visited) {
                roomColor = [180, 160, 140]; // Unexplored - gray
                roomBorderColor = [120, 100, 80];
            } else if (room.type === 'boss') {
                roomColor = [200, 80, 80]; // Boss - red
                roomBorderColor = [150, 50, 50];
            } else if (room.type === 'treasure') {
                roomColor = [200, 180, 120]; // Treasure - gold
                roomBorderColor = [180, 150, 80];
            } else if (room.type === 'elite') {
                roomColor = [180, 120, 200]; // Elite - purple
                roomBorderColor = [150, 80, 180];
            } else if (room.cleared) {
                roomColor = [150, 200, 150]; // Cleared - green
                roomBorderColor = [100, 180, 100];
            } else {
                roomColor = [200, 150, 120]; // Combat - orange
                roomBorderColor = [180, 120, 80];
            }
            
            // Room rectangle
            const roomRect = add([
                rect(roomSize, roomSize),
                pos(roomX, roomY),
                anchor("center"),
                color(...roomColor),
                opacity(room.visited ? 0.8 : 0.4),
                fixed(),
                z(101)
            ]);
            
            // Room border
            const roomBorder = add([
                rect(roomSize + 2, roomSize + 2),
                pos(roomX, roomY),
                anchor("center"),
                color(...roomBorderColor),
                opacity(room.visited ? 1 : 0.5),
                fixed(),
                z(100)
            ]);
            
            // Room icon/type indicator
            let icon = "";
            if (room.type === 'boss') icon = "👹";
            else if (room.type === 'treasure') icon = "💎";
            else if (room.type === 'elite') icon = "⭐";
            else if (room.type === 'start') icon = "🚪";
            else icon = "⚔️";
            
            if (room.visited || room.id === currentRoom.id) {
                const roomIcon = add([
                    text(icon, { size: 10 }),
                    pos(roomX, roomY),
                    anchor("center"),
                    opacity(0.9),
                    fixed(),
                    z(102)
                ]);
                minimapRooms.push(roomIcon);
            }
            
            minimapRooms.push(roomRect, roomBorder);
        });
        
        // Create/update player dot
        if (minimapPlayerDot) destroy(minimapPlayerDot);
        const currentRoomX = offsetX + (currentRoom.x - (minX + maxX) / 2) * mapScale * 1.5;
        const currentRoomY = offsetY + (currentRoom.y - (minY + maxY) / 2) * mapScale * 1.5;
        minimapPlayerDot = add([
            circle(4),
            pos(currentRoomX, currentRoomY),
            color(100, 255, 150),
            fixed(),
            z(103),
            outline(2, rgb(255, 255, 255))
        ]);
    }
    
    // Update dungeon map when room changes
    function updateDungeonMap() {
        if (!GS.dungeon) return;
        
        // Recreate map if dungeon data changed
        const currentMap = GS.dungeon.map;
        if (!dungeonMapData || dungeonMapData !== currentMap) {
            createDungeonMap();
        } else {
            // Just update player dot position
            if (minimapPlayerDot && GS.dungeon) {
                const currentRoom = GS.dungeon.getCurrentRoom();
                if (!dungeonMapData || !dungeonMapData.rooms) return;
                
                const rooms = dungeonMapData.rooms;
                let minX = Infinity, maxX = -Infinity;
                let minY = Infinity, maxY = -Infinity;
                rooms.forEach(room => {
                    minX = Math.min(minX, room.x);
                    maxX = Math.max(maxX, room.x);
                    minY = Math.min(minY, room.y);
                    maxY = Math.max(maxY, room.y);
                });
                
                const rangeX = maxX - minX + 1;
                const rangeY = maxY - minY + 1;
                const mapScale = Math.min(
                    (minimapSize - 20) / (rangeX * 1.5),
                    (minimapSize - 20) / (rangeY * 1.5)
                );
                
                const offsetX = minimapX + minimapSize / 2;
                const offsetY = minimapY + minimapSize / 2;
                
                const roomX = offsetX + (currentRoom.x - (minX + maxX) / 2) * mapScale * 1.5;
                const roomY = offsetY + (currentRoom.y - (minY + maxY) / 2) * mapScale * 1.5;
                
                minimapPlayerDot.pos.x = roomX;
                minimapPlayerDot.pos.y = roomY;
                
                // Pulse effect
                minimapPlayerDot.radius = 4 + Math.sin(time() * 6) * 0.5;
            }
        }
    }
    
    // Store grid for updates (legacy support - now creates full dungeon map)
    GS.setRoomGrid = (grid) => {
        // When room changes, update the full dungeon map
        updateDungeonMap();
    };

    // Regen timer
    let regenTimer = 0;
    
    // Initialize dungeon map on first load
    if (GS.dungeon) {
        createDungeonMap();
    }
    
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
        
        // ==================== HERO PANEL UPDATE ====================
        
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
        
        // Mana bar
        const maxMana = pl.maxMana || 100;
        const manaPct = Math.max(0, pl.mana / maxMana);
        manaBar.width = 200 * manaPct;
        manaTxt.text = `${Math.floor(Math.max(0, pl.mana))}/${Math.floor(maxMana)}`;
        
        // Mana color gradient
        if (manaPct > 0.5) {
            manaBar.color = rgb(100, 100, 255);
        } else if (manaPct > 0.25) {
            manaBar.color = rgb(150, 150, 255);
        } else {
            manaBar.color = rgb(200, 100, 100);
            manaBar.opacity = 0.7 + Math.sin(time() * 10) * 0.3;
        }
        
        // Stamina
        const maxStam = pl.maxStamina || CONFIG.SPRINT_MAX_STAMINA;
        const stamPct = pl.stamina / maxStam;
        stamBar.width = 200 * stamPct;
        
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
        
        // Stats display
        const hero = HEROES[GS.selectedHero];
        const heroMelee = hero?.melee || {};
        const heroRanged = hero?.ranged || {};
        const meleeRange = heroMelee.meleeRange || CONFIG.PLAYER_ATTACK_RADIUS;
        const meleeDamageMult = heroMelee.meleeDamageMultiplier || (heroMelee.isMeleeSpecialist !== false ? 1.5 : 0.5);
        const rangedDamageMult = heroRanged.damageMultiplier || 1.0;
        
        const finalMeleeDmg = Math.floor(stats.meleeDamage * meleeDamageMult);
        const finalRangedDmg = Math.floor(stats.rangedDamage * rangedDamageMult);
        
        meleeDmgTxt.text = `⚔️ Melee: ${finalMeleeDmg}`;
        rangedDmgTxt.text = `🏹 Ranged: ${finalRangedDmg}`;
        attackRangeTxt.text = `📏 Range: ${meleeRange}px`;
        
        // Level and XP
        lvTxt.text = `LV.${GS.playerLevel}`;
        xpBar.width = 150 * GS.getXPProgress();
        
        // Skill points indicator
        if (GS.skillPoints > 0) {
            skillPointsTxt.text = `⭐ Skill Points: ${GS.skillPoints}`;
            skillPointsTxt.color = rgb(255, 220, 100);
        } else {
            skillPointsTxt.text = "";
        }
        
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
        
        // ==================== DUNGEON MAP UPDATE ====================
        // Update full dungeon map (already throttled by uiUpdateTimer)
        updateDungeonMap();
        
        // Passive skills (shop perks)
        const owned = [];
        if (GS.passiveSkills.poison > 0) owned.push(`☠️${GS.passiveSkills.poison}`);
        if (GS.passiveSkills.vampirism > 0) owned.push(`🧛${GS.passiveSkills.vampirism}`);
        if (GS.passiveSkills.thorns > 0) owned.push(`🌵${GS.passiveSkills.thorns}`);
        if (GS.passiveSkills.critical > 0) owned.push(`💥${GS.passiveSkills.critical}`);
        if (GS.passiveSkills.goldMagnet > 0) owned.push(`🧲${GS.passiveSkills.goldMagnet}`);
        if (GS.passiveSkills.regeneration > 0) owned.push(`💚${GS.passiveSkills.regeneration}`);
        skillsTxt.text = owned.join(' ');
        
        // ==================== UPDATE HERO SKILLS UI ====================
        const heroSkills = getHeroSkills(GS.selectedHero);
        
        // Update each skill slot
    Logger.debug('[DBG$] HUD update start', { slots: skillIcons.length, hero: GS.selectedHero });
        skillIcons.forEach((slot, index) => {
        if (!slot) {
            Logger.error('[DBG$] HUD slot missing', { index });
            return;
        }
        if (!slot.icon || !slot.keyLabel) {
            Logger.error('[DBG$] HUD slot missing fields', { index, hasIcon: !!slot.icon, hasKeyLabel: !!slot.keyLabel });
            return;
        }
            const skillKey = slot.skillKey;
            let skill = null;
            let level = 0;
            
            if (skillKey === 'Q') {
                skill = heroSkills.skillQ;
                level = GS.heroSkills.skillQ;
            } else if (skillKey === 'R') {
                skill = heroSkills.skillR;
                level = GS.heroSkills.skillR;
            } else if (skillKey === 'T') {
                skill = heroSkills.skillT;
                level = GS.heroSkills.skillT;
            } else if (skillKey === 'Y') {
                skill = heroSkills.skillY;
                level = GS.heroSkills.skillY;
            }
            
            // Always show skill icon (gray if not learned, colored if learned)
            if (skill) {
                // #region agent log
                Logger.debug('[DBG$] HUD setting icon/keyLabel', { 
                    index, 
                    skillKey, 
                    hasIcon: !!slot.icon, 
                    hasKeyLabel: !!slot.keyLabel,
                    iconExists: slot.icon && slot.icon.exists ? slot.icon.exists() : 'no_exists_method',
                    keyLabelExists: slot.keyLabel && slot.keyLabel.exists ? slot.keyLabel.exists() : 'no_exists_method'
                });
                // #endregion
                
                if (slot.icon && slot.icon.exists && slot.icon.exists()) {
                    slot.icon.text = skill.icon;
                } else {
                    Logger.warn('[DBG$] HUD icon invalid', { index, skillKey, icon: slot.icon });
                }
                
                if (slot.keyLabel && slot.keyLabel.exists && slot.keyLabel.exists()) {
                    slot.keyLabel.text = skill.key || skillKey;
                } else {
                    Logger.warn('[DBG$] HUD keyLabel invalid', { index, skillKey, keyLabel: slot.keyLabel });
                }
                
                // Check if skill is passive (no cooldown/manaCost) or active
                const isPassive = !skill.levels || !skill.levels[0] || (!skill.levels[0].cooldown && !skill.levels[0].manaCost);
                
                if (level > 0) {
                    // Skill is learned - show colored
                    if (slot.icon && slot.icon.exists && slot.icon.exists()) {
                        slot.icon.color = rgb(255, 255, 255);
                    }
                    if (slot.bg && slot.bg.exists && slot.bg.exists()) {
                        slot.bg.color = isPassive ? rgb(60, 80, 60) : rgb(80, 70, 60); // Green tint for passive, brown for active
                    }
                    if (slot.keyLabel && slot.keyLabel.exists && slot.keyLabel.exists()) {
                        slot.keyLabel.color = rgb(200, 200, 200);
                    }
                    
                    // Update level dots - gold for learned, gray for not learned
                    if (slot.levelDots && Array.isArray(slot.levelDots)) {
                        slot.levelDots.forEach((dot, dotIndex) => {
                            if (dot && dot.exists && dot.exists()) {
                                if (dotIndex < level) {
                                    dot.color = rgb(255, 220, 100); // Gold for learned levels
                                } else {
                                    dot.color = rgb(60, 60, 60); // Gray for not learned
                                }
                            }
                        });
                    }
                    
                    // Show mana cost if active skill
                    if (slot.cooldownManaText && slot.cooldownManaText.exists && slot.cooldownManaText.exists()) {
                        if (!isPassive && skill.levels[level - 1] && skill.levels[level - 1].manaCost) {
                            slot.cooldownManaText.text = `${skill.levels[level - 1].manaCost}`;
                            slot.cooldownManaText.color = rgb(200, 200, 255);
                        } else {
                            slot.cooldownManaText.text = "";
                        }
                    }
                    
                    // Check cooldown for active skills
                    let cooldown = 0;
                    let maxCooldown = 0;
                    let manaCost = 0;
                    let hasMana = true;
                    
                    if (!isPassive && (skillKey === 'Q' || skillKey === 'R' || skillKey === 'T' || skillKey === 'Y')) {
                        cooldown = getSkillCooldown(skillKey);
                        if (skill.levels[level - 1]) {
                            maxCooldown = skill.levels[level - 1].cooldown || 0;
                            manaCost = skill.levels[level - 1].manaCost || 0;
                            hasMana = pl.mana >= manaCost;
                        }
                    }
                    
                    // Cooldown animation (circular overlay)
                    if (slot.cooldownOverlay && slot.cooldownOverlay.exists && slot.cooldownOverlay.exists()) {
                        if (cooldown > 0 && maxCooldown > 0) {
                            const cooldownPct = cooldown / maxCooldown;
                            const cooldownSeconds = Math.ceil(cooldown);
                            
                            slot.cooldownOverlay.opacity = 0.6 * cooldownPct;
                            slot.cooldownOverlay.color = rgb(0, 0, 0);
                            
                            const angle = 270 - (1 - cooldownPct) * 360;
                            slot.cooldownOverlay.angle = angle;
                        } else {
                            slot.cooldownOverlay.opacity = 0;
                            slot.cooldownOverlay.angle = 0;
                        }
                    }
                    
                    if (slot.cooldownText && slot.cooldownText.exists && slot.cooldownText.exists()) {
                        if (cooldown > 0 && maxCooldown > 0) {
                            const cooldownSeconds = Math.ceil(cooldown);
                            slot.cooldownText.text = cooldownSeconds > 0 ? `${cooldownSeconds}` : "";
                            slot.cooldownText.opacity = 1;
                            slot.cooldownText.color = rgb(255, 255, 255);
                        } else {
                            slot.cooldownText.opacity = 0;
                            slot.cooldownText.text = "";
                        }
                    }
                    
                    // Check if skill can be used (has mana)
                    if (!hasMana && !isPassive && slot.bg && slot.bg.exists && slot.bg.exists()) {
                        slot.bg.color = rgb(100, 50, 50); // Red tint when no mana
                    }
                    
                    // Ultimate (Y) gets special treatment
                    if (skillKey === 'Y' && skill.isUltimate && GS.ultimateReady && hasMana) {
                        if (slot.bg && slot.bg.exists && slot.bg.exists()) {
                            const pulse = Math.sin(time() * 6) * 0.5 + 0.5;
                            slot.bg.color = rgb(255, 200 + pulse * 55, 50);
                            slot.bg.opacity = 0.7 + pulse * 0.3;
                        }
                    } else {
                        if (slot.bg && slot.bg.exists && slot.bg.exists()) {
                            slot.bg.opacity = 1;
                        }
                    }
                } else {
                    // Skill not learned yet - show gray
                    if (slot.icon && slot.icon.exists && slot.icon.exists()) {
                        slot.icon.color = rgb(100, 100, 100); // Gray
                    }
                    if (slot.bg && slot.bg.exists && slot.bg.exists()) {
                        slot.bg.color = rgb(30, 25, 20); // Dark background
                    }
                    if (slot.keyLabel && slot.keyLabel.exists && slot.keyLabel.exists()) {
                        slot.keyLabel.color = rgb(100, 100, 100);
                    }
                    
                    // All dots gray
                    if (slot.levelDots && Array.isArray(slot.levelDots)) {
                        slot.levelDots.forEach(dot => {
                            if (dot && dot.exists && dot.exists()) {
                                dot.color = rgb(40, 40, 40); // Very dark gray
                            }
                        });
                    }
                    
                    if (slot.cooldownManaText && slot.cooldownManaText.exists && slot.cooldownManaText.exists()) {
                        slot.cooldownManaText.text = "";
                    }
                    if (slot.cooldownOverlay && slot.cooldownOverlay.exists && slot.cooldownOverlay.exists()) {
                        slot.cooldownOverlay.opacity = 0;
                    }
                    if (slot.cooldownText && slot.cooldownText.exists && slot.cooldownText.exists()) {
                        slot.cooldownText.opacity = 0;
                    }
                    
                    // Show "Level 5+" requirement for ultimate (Y) if not available
                    if (skillKey === 'Y' && skill.isUltimate && GS.playerLevel < 5) {
                        if (slot.icon && slot.icon.exists && slot.icon.exists()) {
                            slot.icon.text = "🔒";
                            slot.icon.color = rgb(150, 100, 100);
                        }
                        if (slot.keyLabel && slot.keyLabel.exists && slot.keyLabel.exists()) {
                            slot.keyLabel.text = "Lv5+";
                            slot.keyLabel.color = rgb(200, 150, 150);
                        }
                    }
                }
            } else {
                // No skill data - show placeholder
                if (slot.icon && slot.icon.exists && slot.icon.exists()) {
                    slot.icon.text = "?";
                    slot.icon.color = rgb(80, 80, 80);
                }
                if (slot.bg && slot.bg.exists && slot.bg.exists()) {
                    slot.bg.color = rgb(20, 20, 20);
                }
                if (slot.keyLabel && slot.keyLabel.exists && slot.keyLabel.exists()) {
                    slot.keyLabel.text = skillKey;
                    slot.keyLabel.color = rgb(80, 80, 80);
                }
                
                if (slot.levelDots && Array.isArray(slot.levelDots)) {
                    slot.levelDots.forEach(dot => {
                        if (dot && dot.exists && dot.exists()) {
                            dot.color = rgb(30, 30, 30);
                        }
                    });
                }
            }
        });
        
        // ==================== UPDATE SKILL SELECTION BUTTONS (on level up) ====================
        // Show skill selection buttons if level up happened
        if (GS.showSkillSelection) {
            // This will be handled in game scene
        }
    });
}

export default { createHUD };
