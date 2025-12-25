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
    
    
    // Use viewport dimensions for UI positioning
    const VW = CONFIG.VIEWPORT_WIDTH;  // 800
    const VH = CONFIG.VIEWPORT_HEIGHT;  // 600
    
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
    
    // ==================== HERO PANEL (Bottom, Dota-style with sprite-like design) ====================
    const heroPanelHeight = 130;
    const heroPanelY = VH - heroPanelHeight; // 600 - 130 = 470
    
    // Hero panel background with multi-layer sprite-like effect
    // Base dark layer
    const heroPanelBg = add([
        rect(VW, heroPanelHeight),
        pos(0, heroPanelY),
        color(12, 10, 8),
        opacity(0.98),
        fixed(),
        z(95)
    ]);
    
    // Middle layer (texture effect)
    add([
        rect(VW, heroPanelHeight - 4),
        pos(0, heroPanelY + 2),
        color(18, 15, 12),
        opacity(0.6),
        fixed(),
        z(96)
    ]);
    
    // Top decorative border (golden metallic)
    const heroPanelFrameTop = add([
        rect(VW, 4),
        pos(0, heroPanelY),
        color(140, 120, 80),
        fixed(),
        z(97)
    ]);
    // Top border highlight
    add([
        rect(VW, 1),
        pos(0, heroPanelY),
        color(180, 160, 100),
        fixed(),
        z(98)
    ]);
    
    // Bottom border (darker)
    const heroPanelFrameBottom = add([
        rect(VW, 3),
        pos(0, VH - 3),
        color(50, 40, 30),
        fixed(),
        z(97)
    ]);
    
    // Left decorative border (thick metallic frame)
    add([
        rect(6, heroPanelHeight),
        pos(0, heroPanelY),
        color(60, 50, 40),
        fixed(),
        z(97)
    ]);
    add([
        rect(2, heroPanelHeight - 4),
        pos(2, heroPanelY + 2),
        color(100, 85, 70),
        fixed(),
        z(98)
    ]);
    
    // Right decorative border
    add([
        rect(6, heroPanelHeight),
        pos(VW - 6, heroPanelY),
        color(60, 50, 40),
        fixed(),
        z(97)
    ]);
    add([
        rect(2, heroPanelHeight - 4),
        pos(VW - 4, heroPanelY + 2),
        color(100, 85, 70),
        fixed(),
        z(98)
    ]);
    
    // Decorative corner elements (sprite-like details)
    const cornerSize = 12;
    // Top-left corner
    add([
        rect(cornerSize, 2),
        pos(6, heroPanelY),
        color(160, 140, 100),
        fixed(),
        z(99)
    ]);
    add([
        rect(2, cornerSize),
        pos(6, heroPanelY),
        color(160, 140, 100),
        fixed(),
        z(99)
    ]);
    // Top-right corner
    add([
        rect(cornerSize, 2),
        pos(VW - cornerSize - 6, heroPanelY),
        color(160, 140, 100),
        fixed(),
        z(99)
    ]);
    add([
        rect(2, cornerSize),
        pos(VW - 8, heroPanelY),
        color(160, 140, 100),
        fixed(),
        z(99)
    ]);
    
    // ==================== CALCULATED POSITIONS (NO OVERLAP) ====================
    // Viewport: 800x600, Hero Panel: height=130, Y=470-600
    // Layout from left to right (with gaps):
    // [MINIMAP: 10-110] [GAP: 10] [PORTRAIT: 120-200] [GAP: 15] [BARS: 215-365] [GAP: 15] [STATS: 380-500] [GAP: 15] [SKILLS: 515-715] [GAP: 85]
    
    // 1. MINIMAP (bottom-left corner)
    const minimapSize = 100; // Reduced from 110
    const minimapX = 10;
    const minimapY = heroPanelY + heroPanelHeight - minimapSize - 10; // 470 + 130 - 100 - 10 = 490
    // Occupies: x: 10-110, y: 490-590
    
    // 2. PORTRAIT (right of minimap)
    const portraitSize = 80;
    const portraitX = minimapX + minimapSize + 10; // 10 + 100 + 10 = 120 (center)
    const portraitY = heroPanelY + heroPanelHeight / 2; // 470 + 65 = 535
    // Occupies: x: 80-160 (with anchor center at 120), y: 495-575
    
    // 3. HP/MANA BARS (right of portrait)
    const barsX = portraitX + portraitSize / 2 + 15; // 120 + 40 + 15 = 175
    const barsY = portraitY - 25; // 535 - 25 = 510
    const barWidth = 150; // Reduced from 180
    const barHeight = 16;
    // Occupies: x: 175-325, y: 510-542 (HP), 520-552 (Mana), 560-568 (Stamina)
    
    // 4. STATS PANEL (right of bars)
    const statsX = barsX + barWidth + 15; // 175 + 150 + 15 = 340
    const statsY = barsY; // 510
    const statsGap = 18;
    const statsPanelWidth = 120; // Reduced from 150
    // Occupies: x: 340-460, y: 505-590
    
    // 5. SKILLS (center-right, after stats)
    const skillsBarY = heroPanelY + heroPanelHeight / 2; // 470 + 65 = 535
    const skillIconSize = 45; // Reduced from 50
    const skillIconGap = 5; // Reduced from 6
    const skillsBarWidth = skillIconSize * 4 + skillIconGap * 3; // 180 + 15 = 195
    const skillsBarHeight = skillIconSize + 20; // 65
    const skillsStartX = statsX + statsPanelWidth + 15; // 340 + 120 + 15 = 475
    // Occupies: x: 475-670, y: 502.5-567.5 (center at 535)
    
    // ==================== MINIMAP (Grid-based architecture) ====================
    // Minimap frame
    add([rect(minimapSize + 6, minimapSize + 6), pos(minimapX - 3, minimapY - 3), color(60, 50, 40), fixed(), z(97)]);
    add([rect(minimapSize + 2, minimapSize + 2), pos(minimapX - 1, minimapY - 1), color(40, 30, 25), fixed(), z(98)]);
    const minimapBg = add([rect(minimapSize, minimapSize), pos(minimapX, minimapY), color(25, 20, 15), fixed(), z(99)]);
    
    // Title
    const minimapTitle = add([
        text("MAP", { size: 9 }), 
        pos(minimapX + minimapSize / 2, minimapY - 10), 
        anchor("center"), color(150, 140, 130), fixed(), z(100)
    ]);
    
    // Store minimap grid elements
    let minimapGrid = [];
    let minimapPlayerDot = null;
    
    // Create grid-based minimap (shows current room architecture)
    function createMinimap() {
        // Clear old elements
        minimapGrid.forEach(e => { if (e && e.exists()) destroy(e); });
        minimapGrid = [];
        
        if (!GS.roomShape || !GS.roomShape.grid) return;
        
        const grid = GS.roomShape.grid;
        const gridW = GS.roomShape.width;
        const gridH = GS.roomShape.height;
        
        // Calculate tile size to fit in minimap
        const tileSize = Math.min(minimapSize / gridW, minimapSize / gridH, 4); // Max 4px per tile
        const mapWidth = tileSize * gridW;
        const mapHeight = tileSize * gridH;
        const offsetX = minimapX + (minimapSize - mapWidth) / 2;
        const offsetY = minimapY + (minimapSize - mapHeight) / 2;
        
        // Draw grid tiles
        for (let gy = 0; gy < gridH; gy++) {
            for (let gx = 0; gx < gridW; gx++) {
                const tileType = grid[gy][gx];
                const tileX = offsetX + gx * tileSize;
                const tileY = offsetY + gy * tileSize;
                
                let tileColor;
                if (tileType === 0) {
                    tileColor = [60, 50, 40]; // Wall - dark brown
                } else if (tileType === 2) {
                    tileColor = [80, 70, 60]; // Pillar - medium brown
                } else {
                    tileColor = [120, 100, 80]; // Floor - light brown
                }
                
                const tile = add([
                    rect(tileSize, tileSize),
                    pos(tileX, tileY),
                    color(...tileColor),
                    fixed(),
                    z(100)
                ]);
                minimapGrid.push(tile);
            }
        }
        
        // Draw doors on minimap edges
        if (GS.dungeon && typeof GS.dungeon.getCurrentRoom === 'function') {
            try {
                const currentRoom = GS.dungeon.getCurrentRoom();
                if (currentRoom && currentRoom.doors && Array.isArray(currentRoom.doors)) {
                    const centerXGrid = Math.floor(gridW / 2);
                    const centerYGrid = Math.floor(gridH / 2);
                    
                    currentRoom.doors.forEach(door => {
                        let doorX, doorY;
                        const side = door.side; // Doors have 'side' property: 'left', 'right', 'up', 'down'
                        
                        if (!side) return; // Skip if no side specified
                        
                        // Position door on edge of minimap based on direction
                        switch (side) {
                            case 'left':
                                doorX = offsetX + 0.5 * tileSize;
                                doorY = offsetY + centerYGrid * tileSize;
                                break;
                            case 'right':
                                doorX = offsetX + (gridW - 0.5) * tileSize;
                                doorY = offsetY + centerYGrid * tileSize;
                                break;
                            case 'up':
                                doorX = offsetX + centerXGrid * tileSize;
                                doorY = offsetY + 0.5 * tileSize;
                                break;
                            case 'down':
                                doorX = offsetX + centerXGrid * tileSize;
                                doorY = offsetY + (gridH - 0.5) * tileSize;
                                break;
                            default:
                                return; // Skip unknown directions
                        }
                        
                        // Draw door indicator (small rectangle, slightly larger than tile)
                        const doorSize = Math.max(tileSize * 1.2, 3); // At least 3px
                        const doorIndicator = add([
                            rect(doorSize, doorSize * 0.6),
                            pos(doorX, doorY),
                            anchor("center"),
                            color(180, 140, 100), // Brown door color
                            fixed(),
                            z(101)
                        ]);
                        minimapGrid.push(doorIndicator);
                        
                        // Door frame (border) - darker outline
                        const doorFrame = add([
                            rect(doorSize + 1, doorSize * 0.6 + 1),
                            pos(doorX, doorY),
                            anchor("center"),
                            color(120, 90, 60), // Darker brown
                            fixed(),
                            z(100)
                        ]);
                        minimapGrid.push(doorFrame);
                    });
                }
            } catch (e) {
                // Silently fail if dungeon data not available
            }
        }
        
        // Player dot (center of room)
        if (minimapPlayerDot) destroy(minimapPlayerDot);
        const centerX = offsetX + (GS.roomShape.centerX / 40) * tileSize;
        const centerY = offsetY + (GS.roomShape.centerY / 40) * tileSize;
        minimapPlayerDot = add([
            circle(3),
            pos(centerX, centerY),
            color(100, 255, 150),
            fixed(),
            z(102),
            outline(1, rgb(255, 255, 255))
        ]);
    }
    
    // Store last room shape to detect changes
    let lastRoomShape = null;
    
    // Update minimap when room changes
    function updateMinimap() {
        if (!GS.roomShape || !GS.roomShape.grid) return;
        
        // Recreate minimap if room shape changed
        if (minimapGrid.length === 0 || lastRoomShape !== GS.roomShape) {
            lastRoomShape = GS.roomShape;
            createMinimap();
        } else {
            // Update player dot position
            if (minimapPlayerDot && GS.player) {
                const gridW = GS.roomShape.width;
                const gridH = GS.roomShape.height;
                const tileSize = Math.min(minimapSize / gridW, minimapSize / gridH, 4);
                const mapWidth = tileSize * gridW;
                const mapHeight = tileSize * gridH;
                const offsetX = minimapX + (minimapSize - mapWidth) / 2;
                const offsetY = minimapY + (minimapSize - mapHeight) / 2;
                
                const gx = Math.floor(GS.player.pos.x / 40);
                const gy = Math.floor(GS.player.pos.y / 40);
                const dotX = offsetX + gx * tileSize + tileSize / 2;
                const dotY = offsetY + gy * tileSize + tileSize / 2;
                
                minimapPlayerDot.pos.x = dotX;
                minimapPlayerDot.pos.y = dotY;
                
                // Pulse effect
                minimapPlayerDot.radius = 3 + Math.sin(time() * 6) * 0.5;
            }
        }
    }
    
    // Store grid for updates
    GS.setRoomGrid = (roomShape) => {
        GS.roomShape = roomShape;
        createMinimap();
    };
    
    // ==================== HERO PORTRAIT ====================
    const hero = HEROES[GS.selectedHero];
    
    if (hero) {
        // Portrait frame (decorative border)
        add([
            rect(portraitSize + 8, portraitSize + 8),
            pos(portraitX, portraitY),
            anchor("center"),
            color(60, 50, 35),
            fixed(),
            z(97)
        ]);
        
        // Portrait background (dark)
        add([
            rect(portraitSize + 4, portraitSize + 4),
            pos(portraitX, portraitY),
            anchor("center"),
            color(25, 20, 15),
            fixed(),
            z(98)
        ]);
        
        // Portrait background (gradient effect)
        add([
            rect(portraitSize, portraitSize),
            pos(portraitX, portraitY),
            anchor("center"),
            color(35, 28, 20),
            fixed(),
            z(99)
        ]);
        
        // Portrait icon
        const heroPortrait = add([
            text(hero.icon, { size: 56 }),
            pos(portraitX, portraitY - 8),
            anchor("center"),
            fixed(),
            z(100)
        ]);
        
        // Hero name with shadow
        add([
            text(hero.name, { size: 12 }),
            pos(portraitX + 1, portraitY + 39),
            anchor("center"),
            color(0, 0, 0),
            opacity(0.5),
            fixed(),
            z(99)
        ]);
        const heroNameTxt = add([
            text(hero.name, { size: 12 }),
            pos(portraitX, portraitY + 38),
            anchor("center"),
            color(...hero.color),
            fixed(),
            z(100)
        ]);
    }
    
    // ==================== HP AND MANA BARS ====================
    // HP bar with decorative frame
    add([
        rect(barWidth + 6, barHeight + 6),
        pos(barsX - 1, barsY - 1),
        anchor("topleft"),
        color(20, 15, 10),
        fixed(),
        z(97)
    ]);
    add([
        rect(barWidth + 4, barHeight + 4),
        pos(barsX, barsY),
        anchor("topleft"),
        color(40, 30, 25),
        fixed(),
        z(98)
    ]);
    const hpBar = add([
        rect(barWidth, barHeight),
        pos(barsX + 2, barsY + 2),
        anchor("topleft"),
        color(200, 40, 40),
        fixed(),
        z(99)
    ]);
    // HP text with shadow
    add([
        text("100/100", { size: 11 }),
        pos(barsX + barWidth / 2 + 1, barsY + barHeight / 2 + 2),
        anchor("center"),
        color(0, 0, 0),
        opacity(0.6),
        fixed(),
        z(100)
    ]);
    const hpTxt = add([
        text("100/100", { size: 11 }),
        pos(barsX + barWidth / 2, barsY + barHeight / 2 + 1),
        anchor("center"),
        color(255, 255, 255),
        fixed(),
        z(101)
    ]);
    
    // Mana bar with decorative frame
    const manaBarY = barsY + barHeight + 10;
    add([
        rect(barWidth + 6, barHeight + 6),
        pos(barsX - 1, manaBarY - 1),
        anchor("topleft"),
        color(20, 15, 10),
        fixed(),
        z(97)
    ]);
    add([
        rect(barWidth + 4, barHeight + 4),
        pos(barsX, manaBarY),
        anchor("topleft"),
        color(40, 30, 25),
        fixed(),
        z(98)
    ]);
    const manaBar = add([
        rect(barWidth, barHeight),
        pos(barsX + 2, manaBarY + 2),
        anchor("topleft"),
        color(80, 120, 255),
        fixed(),
        z(99)
    ]);
    // Mana text with shadow
    add([
        text("100/100", { size: 11 }),
        pos(barsX + barWidth / 2 + 1, manaBarY + barHeight / 2 + 2),
        anchor("center"),
        color(0, 0, 0),
        opacity(0.6),
        fixed(),
        z(100)
    ]);
    const manaTxt = add([
        text("100/100", { size: 11 }),
        pos(barsX + barWidth / 2, manaBarY + barHeight / 2 + 1),
        anchor("center"),
        color(200, 220, 255),
        fixed(),
        z(101)
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
    
    // ==================== STATS PANEL ====================
    // Stats panel background
    add([
        rect(statsPanelWidth, heroPanelHeight - 20),
        pos(statsX - 10, statsY - 5),
        anchor("topleft"),
        color(25, 20, 15),
        opacity(0.7),
        fixed(),
        z(97)
    ]);
    
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
    
    // ==================== HERO SKILLS UI (Center-right, after stats) ====================
    // Skills bar background (inside hero panel)
    const skillsBarCenterX = skillsStartX + skillsBarWidth / 2; // Center X of skills bar
    const skillsBarBg = add([
        rect(skillsBarWidth + 8, skillsBarHeight + 8),
        pos(skillsBarCenterX, skillsBarY),
        anchor("center"),
        color(40, 30, 25),
        opacity(0.9),
        fixed(),
        z(98)
    ]);
    
    const skillsBarFrame = add([
        rect(skillsBarWidth + 4, skillsBarHeight + 4),
        pos(skillsBarCenterX, skillsBarY),
        anchor("center"),
        color(20, 15, 12),
        opacity(0.95),
        fixed(),
        z(99)
    ]);
    
    // Skill icons container (4 slots: Q, R, T, Y) - 1x4 row
    const skillIcons = [];
    const totalWidth = skillIconSize * 4 + skillIconGap * 3;
    const startX = skillsStartX; // Left edge of first skill icon
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
                    if (lvl.damageReduction) stats.push(`Damage Reduction: ${Math.floor(lvl.damageReduction * 100)}%`);
                    if (lvl.rangedCooldownReduction) stats.push(`Ranged CD: -${Math.floor(lvl.rangedCooldownReduction * 100)}%`);
                    if (lvl.freezeDuration) stats.push(`Freeze: ${lvl.freezeDuration}s`);
                    if (lvl.speed) stats.push(`Speed: ${lvl.speed}px/s`);
                    if (lvl.piercing) stats.push(`Piercing: Yes`);
                    if (lvl.maxPierceCount) stats.push(`Pierce: ${lvl.maxPierceCount}`);
                    if (lvl.homingStrengthBonus) stats.push(`Homing: +${Math.floor(lvl.homingStrengthBonus * 100)}%`);
                    if (lvl.arrowCount) stats.push(`Arrows: ${lvl.arrowCount}`);
                    if (lvl.strikes) stats.push(`Strikes: ${lvl.strikes}`);
                    if (lvl.invulnDuration) stats.push(`Invulnerability: ${lvl.invulnDuration}s`);
                    if (lvl.meteorCount) stats.push(`Meteors: ${lvl.meteorCount}`);
                    if (lvl.maxHpBonus) stats.push(`Max HP: +${Math.floor(lvl.maxHpBonus * 100)}%`);
                    if (lvl.moveSpeedBonus) stats.push(`Move Speed: +${Math.floor(lvl.moveSpeedBonus * 100)}%`);
                    if (lvl.spreadAngle) stats.push(`Spread: ${lvl.spreadAngle.toFixed(1)}`);
                    
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
                    if (lvl.damageReduction) stats.push(`Damage Reduction: ${Math.floor(lvl.damageReduction * 100)}%`);
                    if (lvl.rangedCooldownReduction) stats.push(`Ranged CD: -${Math.floor(lvl.rangedCooldownReduction * 100)}%`);
                    if (lvl.freezeDuration) stats.push(`Freeze: ${lvl.freezeDuration}s`);
                    if (lvl.speed) stats.push(`Speed: ${lvl.speed}px/s`);
                    if (lvl.piercing) stats.push(`Piercing: Yes`);
                    if (lvl.maxPierceCount) stats.push(`Pierce: ${lvl.maxPierceCount}`);
                    if (lvl.homingStrengthBonus) stats.push(`Homing: +${Math.floor(lvl.homingStrengthBonus * 100)}%`);
                    if (lvl.arrowCount) stats.push(`Arrows: ${lvl.arrowCount}`);
                    if (lvl.strikes) stats.push(`Strikes: ${lvl.strikes}`);
                    if (lvl.invulnDuration) stats.push(`Invulnerability: ${lvl.invulnDuration}s`);
                    if (lvl.meteorCount) stats.push(`Meteors: ${lvl.meteorCount}`);
                    if (lvl.maxHpBonus) stats.push(`Max HP: +${Math.floor(lvl.maxHpBonus * 100)}%`);
                    if (lvl.moveSpeedBonus) stats.push(`Move Speed: +${Math.floor(lvl.moveSpeedBonus * 100)}%`);
                    if (lvl.spreadAngle) stats.push(`Spread: ${lvl.spreadAngle.toFixed(1)}`);
                    
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

    
    // Regen timer
    let regenTimer = 0;
    
    // Initialize minimap on first load
    if (GS.roomShape) {
        createMinimap();
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
        hpBar.width = barWidth * hpPct;
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
        manaBar.width = barWidth * manaPct;
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
        stamBar.width = barWidth * stamPct;
        
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
        
        // ==================== MINIMAP UPDATE ====================
        // Update grid-based minimap (already throttled by uiUpdateTimer)
        updateMinimap();
        
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
    
        skillIcons.forEach((slot, index) => {
        if (!slot) {
            
            return;
        }
        if (!slot.icon || !slot.keyLabel) {
            
            return;
        }
            const skillKey = slot.skillKey;
            let skill = null;
            let level = 0;
            
            if (skillKey === 'Q') {
                skill = heroSkills.skillQ;
                level = GS.heroSkills.skillQ || 0;
            } else if (skillKey === 'R') {
                skill = heroSkills.skillR;
                level = GS.heroSkills.skillR || 0;
            } else if (skillKey === 'T') {
                skill = heroSkills.skillT;
                level = GS.heroSkills.skillT || 0;
            } else if (skillKey === 'Y') {
                skill = heroSkills.skillY;
                level = GS.heroSkills.skillY || 0;
            }
            
            // Ensure level is a valid number (handle NaN, undefined, null)
            level = Number(level) || 0;
            if (isNaN(level) || level < 0) level = 0;
            if (level > 4) level = 4; // Cap at max level
            
            // Always show skill icon (gray if not learned, colored if learned)
            if (skill) {
                
                
                if (slot.icon && slot.icon.exists && slot.icon.exists()) {
                    slot.icon.text = skill.icon;
                } else {
                    
                }
                
                if (slot.keyLabel && slot.keyLabel.exists && slot.keyLabel.exists()) {
                    slot.keyLabel.text = skill.key || skillKey;
                } else {
                    
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
