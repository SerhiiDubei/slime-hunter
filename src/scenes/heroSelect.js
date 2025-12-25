// ==================== HERO SELECTION SCENE ====================
// Diablo-style hero selection

import { CONFIG } from '../config.js';
import { GS } from '../state.js';
import { HEROES } from '../data/heroes.js';
import { playSound } from '../audio.js';

export function createHeroSelectScene() {
    scene("heroSelect", () => {
        // Reset camera for menu
        camPos(CONFIG.VIEWPORT_WIDTH / 2, CONFIG.VIEWPORT_HEIGHT / 2);
        const W = CONFIG.VIEWPORT_WIDTH;
        const H = CONFIG.VIEWPORT_HEIGHT;
        
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
        ];
        
        let selectedHero = 'warrior';
        const cardWidth = 180;  // Зменшено з 220 до 180 для 4 карток
        const cardHeight = 380;
        const cardGap = 15;     // Зменшено з 25 до 15
        const startX = (W - (cardWidth * 4 + cardGap * 3)) / 2;  // Змінено для 4 карток
        const cardY = H / 2 + 20;
        
        const cards = [];
        
        heroConfigs.forEach((hero, idx) => {
            const x = startX + idx * (cardWidth + cardGap) + cardWidth / 2;
            const isSelected = hero.id === selectedHero;
            
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
            const heroSpriteMap = {
                'warrior': 'heroWarrior',
                'mage': 'heroMage',
                'assassin': 'heroAssassin',
                'ranger': 'heroRanger'
            };
            const heroSprite = add([
                sprite(heroSpriteMap[hero.id] || 'player'),
                pos(x, cardY - 130),
                anchor("center"),
                scale(2.5),
                z(10),
                { animFrame: 0, animTimer: 0, heroId: hero.id }
            ]);
            
            // Animate hero preview
            heroSprite.onUpdate(() => {
                heroSprite.animTimer += dt();
                if (heroSprite.animTimer >= 0.15) {
                    heroSprite.animTimer = 0;
                    heroSprite.animFrame = (heroSprite.animFrame + 1) % 4;
                    try {
                        heroSprite.use(sprite(`${heroSpriteMap[hero.id]}_${heroSprite.animFrame}`));
                        heroSprite.scale = vec2(2.5);
                    } catch(e) {}
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
            playSound('start');
            GS.setHero(selectedHero);
            const hero = HEROES[selectedHero];
            GS.ultimateMax = hero.ultimate.chargeNeeded;
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
        
        onKeyPress("left", () => {
            const heroes = ['warrior', 'mage', 'assassin', 'ranger'];
            const idx = heroes.indexOf(selectedHero);
            updateSelection(heroes[(idx - 1 + 4) % 4]);
        });
        
        onKeyPress("right", () => {
            const heroes = ['warrior', 'mage', 'assassin', 'ranger'];
            const idx = heroes.indexOf(selectedHero);
            updateSelection(heroes[(idx + 1) % 4]);
        });
    });
}

export default createHeroSelectScene;
