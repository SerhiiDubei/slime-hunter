// ==================== HERO SELECTION SCENE ====================
// Diablo-style hero selection

import { CONFIG, HERO_SPRITE_MAP } from '../config.js';
import { GS } from '../state.js';
import { HEROES } from '../data/heroes.js';
import { playSound } from '../audio.js';
import { Logger } from '../logger.js';

export function createHeroSelectScene() {
    scene("heroSelect", () => {
        Logger.info('🎴 ========== HERO SELECT SCENE START ==========');
        // Reset camera for menu
        camPos(CONFIG.VIEWPORT_WIDTH / 2, CONFIG.VIEWPORT_HEIGHT / 2);
        const W = CONFIG.VIEWPORT_WIDTH;
        const H = CONFIG.VIEWPORT_HEIGHT;
        Logger.debug('🎴 Viewport:', { W, H });
        
        // Dark gradient background
        add([
            rect(W, H),
            color(10, 8, 15),
            z(-2),
        ]);
        
        // Atmospheric particles (ember/dust)
        for (let i = 0; i < 40; i++) {
            const p = add([
                circle(rand(1, 2)),
                pos(rand(0, W), rand(0, H)),
                color(rand(150, 255), rand(80, 150), rand(20, 60)),
                opacity(rand(0.2, 0.5)),
                z(-1),
                { vy: rand(-20, -40), vx: rand(-5, 5), life: rand(3, 8) }
            ]);
            p.onUpdate(() => {
                p.pos.y += p.vy * dt();
                p.pos.x += p.vx * dt();
                p.life -= dt();
                if (p.life <= 0 || p.pos.y < -10) {
                    p.pos.y = H + 10;
                    p.pos.x = rand(0, W);
                    p.life = rand(3, 8);
                }
            });
        }
        
        // Decorative top border
        add([
            rect(W, 3),
            pos(0, 0),
            color(139, 90, 43),
            z(50),
        ]);
        
        // Title with glow effect
        add([
            text("CHOOSE YOUR CHAMPION", { size: 32 }),
            pos(W / 2, 45),
            anchor("center"),
            color(180, 140, 90),
            z(10),
        ]);
        
        // Subtitle
        add([
            text("Select a hero to begin your journey", { size: 12 }),
            pos(W / 2, 72),
            anchor("center"),
            color(120, 100, 80),
            z(10),
        ]);
        
        // Hero cards configuration
        const heroConfigs = [
            {
                id: 'warrior',
                name: 'WARRIOR',
                title: 'The Unstoppable Force',
                desc: 'A mighty fighter who excels in close combat. High durability and devastating melee attacks.',
                ultimate: 'EARTHQUAKE',
                ultDesc: 'Shakes the earth, damaging and stunning all nearby enemies.',
                color: [180, 60, 60],
                icon: '⚔️',
                ultIcon: '🌋',
                stats: { atk: 4, mag: 2, spd: 3, hp: 5, sta: 3 },
            },
            {
                id: 'mage',
                name: 'MAGE',
                title: 'Master of Arcane',
                desc: 'A powerful spellcaster with devastating ranged attacks. Fragile but deadly from afar.',
                ultimate: 'METEOR STORM',
                ultDesc: 'Calls down a barrage of meteors from the sky.',
                color: [100, 80, 180],
                icon: '🔮',
                ultIcon: '☄️',
                stats: { atk: 2, mag: 5, spd: 2, hp: 2, sta: 4 },
            },
            {
                id: 'assassin',
                name: 'ASSASSIN',
                title: 'Shadow Walker',
                desc: 'A swift and deadly killer. Strikes fast and vanishes into shadows.',
                ultimate: 'SHADOW STRIKE',
                ultDesc: 'Teleports between enemies, striking each one.',
                color: [80, 80, 100],
                icon: '🗡️',
                ultIcon: '👤',
                stats: { atk: 3, mag: 3, spd: 5, hp: 2, sta: 5 },
            },
            {
                id: 'ranger',
                name: 'RANGER',
                title: 'Master Archer',
                desc: 'A balanced fighter with homing arrows. Excels at ranged combat with tracking projectiles.',
                ultimate: 'ARROW STORM',
                ultDesc: 'Rains down arrows in a large area.',
                color: [100, 150, 80],
                icon: '🏹',
                ultIcon: '🌪️',
                stats: { atk: 3, mag: 4, spd: 4, hp: 3, sta: 4 },
            },
            {
                id: 'wizard',
                name: 'WIZARD',
                title: 'Ancient Master',
                desc: 'Powerful arcane spellcaster with devastating magic. High mana and explosive spells.',
                ultimate: 'ARCANE STORM',
                ultDesc: 'Casts a devastating arcane storm that follows enemies.',
                color: [120, 80, 200],
                icon: '🧙',
                ultIcon: '⚡',
                stats: { atk: 1, mag: 5, spd: 2, hp: 2, sta: 3 },
            },
        ];
        
        let selectedHero = 'warrior';
        const cardWidth = 150;  // Зменшено для 5 карток
        const cardHeight = 380;
        const cardGap = 10;     // Зменшено для 5 карток
        const totalWidth = cardWidth * 5 + cardGap * 4;
        const startX = (W - totalWidth) / 2;  // Змінено для 5 карток
        const cardY = H / 2 + 20;
        
        Logger.debug('🎴 Hero Select: Creating cards', {
            heroCount: heroConfigs.length,
            viewportWidth: W,
            cardWidth,
            cardGap,
            totalWidth,
            startX,
            heroes: heroConfigs.map(h => h.id)
        });
        
        const cards = [];
        
        heroConfigs.forEach((hero, idx) => {
            const x = startX + idx * (cardWidth + cardGap) + cardWidth / 2;
            const isSelected = hero.id === selectedHero;
            
            Logger.debug(`🎴 Creating card ${idx + 1}/${heroConfigs.length}: ${hero.id}`, {
                x,
                isSelected,
                cardWidth,
                totalWidth,
                startX,
                idx,
                calculatedX: startX + idx * (cardWidth + cardGap) + cardWidth / 2
            });
            
            // ПЕРЕВІРКА: Чи картка виходить за межі екрану?
            if (x < 0 || x > W) {
                Logger.error(`❌ CARD ${hero.id} OUT OF BOUNDS! x=${x}, W=${W}`);
            }
            
            // Card frame (outer glow when selected)
            const cardGlow = add([
                rect(cardWidth + 8, cardHeight + 8, { radius: 8 }),
                pos(x, cardY),
                anchor("center"),
                color(...hero.color),
                opacity(isSelected ? 0.8 : 0),
                z(3),
                { heroId: hero.id },
                "cardGlow",
            ]);
            
            // Card background
            const card = add([
                rect(cardWidth, cardHeight, { radius: 6 }),
                pos(x, cardY),
                anchor("center"),
                color(25, 22, 30),
                area(),
                z(4),
                { heroId: hero.id },
                "heroCard",
            ]);
            
            // Top accent bar
            add([
                rect(cardWidth - 20, 3),
                pos(x, cardY - cardHeight/2 + 15),
                anchor("center"),
                color(...hero.color),
                opacity(0.8),
                z(5),
            ]);
            
            // Hero sprite (animated preview)
            const spriteName = HERO_SPRITE_MAP[hero.id] || 'player';
            Logger.debug(`🎴 Hero ${hero.id} sprite: ${spriteName}`);
            
            let heroSprite;
            try {
                heroSprite = add([
                    sprite(spriteName),
                    pos(x, cardY - 130),
                    anchor("center"),
                    scale(2.5),
                    z(10),
                    { animFrame: 0, animTimer: 0, heroId: hero.id }
                ]);
                Logger.debug(`✅ Hero sprite created for ${hero.id} using ${spriteName}`);
            } catch (spriteError) {
                Logger.error(`❌ FAILED to create sprite for ${hero.id}:`, spriteError);
                Logger.error(`❌ Sprite name was: ${spriteName}`);
                // Fallback sprite
                try {
                    heroSprite = add([
                        sprite('player'),
                        pos(x, cardY - 130),
                        anchor("center"),
                        scale(2.5),
                        z(10),
                        { animFrame: 0, animTimer: 0, heroId: hero.id }
                    ]);
                    Logger.debug(`✅ Using fallback 'player' sprite for ${hero.id}`);
                } catch (fallbackError) {
                    Logger.error(`❌ Even fallback sprite failed for ${hero.id}:`, fallbackError);
                }
            }
            
            // Animate hero preview
            heroSprite.onUpdate(() => {
                heroSprite.animTimer += dt();
                if (heroSprite.animTimer >= 0.15) {
                    heroSprite.animTimer = 0;
                    // Wizard has 8 frames, others have 4
                    const maxFrames = hero.id === 'wizard' ? 8 : 4;
                    heroSprite.animFrame = (heroSprite.animFrame + 1) % maxFrames;
                    try {
                        const spriteName = `${HERO_SPRITE_MAP[hero.id]}_${heroSprite.animFrame}`;
                        heroSprite.use(sprite(spriteName));
                        heroSprite.scale = vec2(2.5);
                    } catch(e) {
                        if (hero.id === 'wizard') {
                            Logger.warn(`⚠️ Hero select: Wizard frame ${heroSprite.animFrame} not found, sprite: ${spriteName}`);
                            // Try base sprite as fallback
                            try {
                                heroSprite.use(sprite(HERO_SPRITE_MAP[hero.id]));
                                heroSprite.scale = vec2(2.5);
                            } catch(e2) {
                                Logger.error(`❌ Hero select: Failed to load base sprite for ${hero.id}:`, e2);
                            }
                        }
                    }
                }
            });
            
            // Hero icon (smaller, next to name)
            add([
                text(hero.icon, { size: 24 }),
                pos(x - 55, cardY - 70),
                anchor("center"),
                z(10),
            ]);
            
            // Hero name
            add([
                text(hero.name, { size: 22 }),
                pos(x, cardY - 70),
                anchor("center"),
                color(...hero.color),
                z(10),
            ]);
            
            // Hero title
            add([
                text(hero.title, { size: 10 }),
                pos(x, cardY - 50),
                anchor("center"),
                color(140, 130, 120),
                z(10),
            ]);
            
            // Separator
            add([
                rect(cardWidth - 40, 1),
                pos(x, cardY - 35),
                anchor("center"),
                color(60, 55, 50),
                z(5),
            ]);
            
            // Description
            add([
                text(hero.desc, { size: 9, width: cardWidth - 30, align: "center" }),
                pos(x, cardY - 5),
                anchor("center"),
                color(150, 145, 140),
                z(10),
            ]);
            
            // Ultimate section header
            add([
                text("ULTIMATE", { size: 8 }),
                pos(x, cardY + 45),
                anchor("center"),
                color(100, 90, 80),
                z(10),
            ]);
            
            // Ultimate name with icon
            add([
                text(`${hero.ultIcon} ${hero.ultimate}`, { size: 14 }),
                pos(x, cardY + 65),
                anchor("center"),
                color(220, 180, 100),
                z(10),
            ]);
            
            // Ultimate description
            add([
                text(hero.ultDesc, { size: 8, width: cardWidth - 30, align: "center" }),
                pos(x, cardY + 90),
                anchor("center"),
                color(130, 120, 100),
                z(10),
            ]);
            
            // Stats section
            const statsY = cardY + 130;
            const statNames = ['ATK', 'MAG', 'SPD', 'HP', 'STA'];
            const statKeys = ['atk', 'mag', 'spd', 'hp', 'sta'];
            const statColors = [
                [220, 100, 100],
                [150, 100, 220],
                [100, 220, 150],
                [220, 100, 150],
                [100, 180, 220],
            ];
            
            statNames.forEach((statName, i) => {
                const statX = x - 80 + i * 40;
                const val = hero.stats[statKeys[i]];
                
                // Stat name
                add([
                    text(statName, { size: 7 }),
                    pos(statX, statsY),
                    anchor("center"),
                    color(100, 95, 90),
                    z(10),
                ]);
                
                // Stat bar background
                add([
                    rect(6, 30),
                    pos(statX, statsY + 28),
                    anchor("center"),
                    color(40, 35, 45),
                    z(5),
                ]);
                
                // Stat bar fill
                const fillHeight = (val / 5) * 28;
                add([
                    rect(4, fillHeight),
                    pos(statX, statsY + 42 - fillHeight/2),
                    anchor("center"),
                    color(...statColors[i]),
                    z(6),
                ]);
            });
            
            cards.push({ card, cardGlow, heroId: hero.id });
            Logger.debug(`✅ Card created for ${hero.id} at index ${idx}`);
        });
        
        Logger.debug('🎴 Hero Select: All cards created', {
            totalCards: cards.length,
            cardIds: cards.map(c => c.heroId),
            expectedCount: heroConfigs.length
        });
        
        // Update selection visuals
        function updateSelection(newHeroId) {
            selectedHero = newHeroId;
            get("cardGlow").forEach(g => {
                g.opacity = g.heroId === selectedHero ? 0.8 : 0;
            });
        }
        
        // Click handler
        onClick("heroCard", (card) => {
            updateSelection(card.heroId);
            playSound('click');
        });
        
        // Hover effects
        onHover("heroCard", (card) => {
            card.color = rgb(35, 32, 42);
        });
        
        onHoverEnd("heroCard", (card) => {
            card.color = rgb(25, 22, 30);
        });
        
        // Start button
        const btnWidth = 200;
        const btnHeight = 50;
        const btnY = H - 55;
        
        // Button glow/shadow
        add([
            rect(btnWidth + 6, btnHeight + 6, { radius: 6 }),
            pos(W / 2, btnY),
            anchor("center"),
            color(139, 90, 43),
            opacity(0.5),
            z(19),
        ]);
        
        const startBtn = add([
            rect(btnWidth, btnHeight, { radius: 4 }),
            pos(W / 2, btnY),
            anchor("center"),
            color(45, 35, 25),
            area(),
            z(20),
            "startBtn",
        ]);
        
        // Button border
        add([
            rect(btnWidth - 4, btnHeight - 4, { radius: 3 }),
            pos(W / 2, btnY),
            anchor("center"),
            color(70, 55, 40),
            opacity(0),
            outline(2, rgb(139, 90, 43)),
            z(21),
        ]);
        
        add([
            text("BEGIN ADVENTURE", { size: 16 }),
            pos(W / 2, btnY),
            anchor("center"),
            color(200, 170, 120),
            z(22),
        ]);
        
        // Start game function
        function beginAdventure() {
            Logger.info('🎮 Starting adventure with hero:', selectedHero);
            playSound('start');
            GS.setHero(selectedHero);
            const hero = HEROES[selectedHero];
            if (!hero) {
                Logger.error('❌ Hero not found:', selectedHero);
                return;
            }
            GS.ultimateMax = hero.ultimate.chargeNeeded;
            Logger.debug('✅ Hero set:', selectedHero, 'Ultimate charge needed:', GS.ultimateMax);
            go("levelIntro");
        }
        
        onClick("startBtn", beginAdventure);
        
        onHover("startBtn", () => {
            startBtn.color = rgb(60, 50, 40);
        });
        
        onHoverEnd("startBtn", () => {
            startBtn.color = rgb(45, 35, 25);
        });
        
        // Touch support for mobile
        onTouchStart((touchPos) => {
            // Check start button
            const btnLeft = W / 2 - btnWidth / 2;
            const btnRight = W / 2 + btnWidth / 2;
            const btnTop = btnY - btnHeight / 2;
            const btnBottom = btnY + btnHeight / 2;
            
            if (touchPos.x >= btnLeft && touchPos.x <= btnRight &&
                touchPos.y >= btnTop && touchPos.y <= btnBottom) {
                beginAdventure();
                return;
            }
            
            // Check hero cards
            heroConfigs.forEach((hero, idx) => {
                const cardX = startX + idx * (cardWidth + cardGap) + cardWidth / 2;
                const cardLeft = cardX - cardWidth / 2;
                const cardRight = cardX + cardWidth / 2;
                const cardTop = cardY - cardHeight / 2;
                const cardBottom = cardY + cardHeight / 2;
                
                if (touchPos.x >= cardLeft && touchPos.x <= cardRight &&
                    touchPos.y >= cardTop && touchPos.y <= cardBottom) {
                    updateSelection(hero.id);
                }
            });
        });
        
        // Bottom decorative border
        add([
            rect(W, 3),
            pos(0, H - 3),
            color(139, 90, 43),
            z(50),
        ]);
        
        // Navigation hint (works for mobile and desktop)
        add([
            text("TAP hero to select • TAP button to start", { size: 11 }),
            pos(W / 2, H - 18),
            anchor("center"),
            color(100, 90, 80),
            z(10),
        ]);
        
        // Keyboard controls
        onKeyPress("enter", () => {
            playSound('start');
            GS.setHero(selectedHero);
            const hero = HEROES[selectedHero];
            GS.ultimateMax = hero.ultimate.chargeNeeded;
            go("levelIntro");
        });
        
        onKeyPress("1", () => updateSelection('warrior'));
        onKeyPress("2", () => updateSelection('mage'));
        onKeyPress("3", () => updateSelection('assassin'));
        onKeyPress("4", () => updateSelection('ranger'));
        onKeyPress("5", () => updateSelection('wizard'));
        
        // Get hero list from HEROES object (single source of truth)
        const heroList = Object.keys(HEROES);
        
        onKeyPress("left", () => {
            const idx = heroList.indexOf(selectedHero);
            updateSelection(heroList[(idx - 1 + heroList.length) % heroList.length]);
        });
        
        onKeyPress("right", () => {
            const idx = heroList.indexOf(selectedHero);
            updateSelection(heroList[(idx + 1) % heroList.length]);
        });
    });
}

export default createHeroSelectScene;
