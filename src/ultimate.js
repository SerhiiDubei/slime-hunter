// ==================== ULTIMATE ABILITIES ====================
// Hero-specific ultimate abilities

import { CONFIG } from './config.js';
import { GS } from './state.js';
import { HEROES } from './data/heroes.js';
import { playSound } from './audio.js';
import { killEnemy } from './entities/enemies.js';

let ultCooldown = 0;

export function setupUltimate() {
    ultCooldown = 0;
}

export function tryUseUltimate() {
    if (ultCooldown > 0) return false;
    if (!GS.ultimateReady) return false;
    if (!GS.player || !GS.player.exists()) return false;
    
    // Use ultimate!
    GS.useUltimate();
    ultCooldown = 1; // 1 second cooldown to prevent spam
    
    const hero = HEROES[GS.selectedHero];
    if (!hero) return false;
    
    // Play hero-specific ultimate sound
    switch (GS.selectedHero) {
        case 'warrior':
            playSound('ultimate_earthquake');
            ultimateEarthquake(hero.ultimate);
            break;
        case 'mage':
            playSound('ultimate_meteor');
            ultimateMeteorShower(hero.ultimate);
            break;
        case 'assassin':
            playSound('ultimate_shadow');
            ultimateShadowStrike(hero.ultimate);
            break;
        case 'ranger':
            playSound('ultimate_arrowstorm');
            ultimateArrowStorm(hero.ultimate);
            break;
    }
    
    return true;
}

export function updateUltimate() {
    if (ultCooldown > 0) {
        ultCooldown -= dt();
    }
}

// WARRIOR: Earthquake - damages all nearby enemies
function ultimateEarthquake(config) {
    const p = GS.player;
    
    // Big screen shake
    shake(25);
    
    // Earthquake visual
    const wave = add([
        circle(10), pos(p.pos), color(139, 69, 19), opacity(0.7),
        anchor("center"), z(2), { r: 10 }
    ]);
    wave.onUpdate(() => {
        wave.r += 400 * dt();
        wave.radius = wave.r;
        wave.opacity = 0.7 - wave.r / config.radius * 0.5;
        if (wave.r >= config.radius) destroy(wave);
    });
    
    // Ground cracks
    for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2 + rand(-0.2, 0.2);
        const length = rand(80, config.radius);
        
        const crack = add([
            rect(length, 4), pos(p.pos),
            color(100, 80, 60), opacity(0.8),
            anchor("left"), rotate(angle * 180 / Math.PI),
            z(1), { t: 0 }
        ]);
        crack.onUpdate(() => {
            crack.t += dt();
            crack.opacity = 0.8 - crack.t / 1.5;
            if (crack.t > 1.5) destroy(crack);
        });
    }
    
    // Damage all enemies in radius
    wait(0.3, () => {
        for (const e of get("enemy")) {
            if (!e.exists()) continue;
            const dist = e.pos.dist(p.pos);
            if (dist < config.radius) {
                // Damage based on distance
                const dmgMult = 1 - (dist / config.radius) * 0.5;
                const dmg = Math.floor(config.damage * dmgMult);
                e.hp -= dmg;
                
                // Stun effect (slow)
                if (e.stunTimer === undefined) e.stunTimer = 0;
                e.stunTimer = config.stunDuration;
                
                // Damage number
                const dmgTxt = add([
                    text(`-${dmg}`, { size: 16 }),
                    pos(e.pos.x, e.pos.y - 20),
                    anchor("center"), color(255, 100, 100), z(100), { t: 0 }
                ]);
                dmgTxt.onUpdate(() => {
                    dmgTxt.t += dt();
                    dmgTxt.pos.y -= 30 * dt();
                    dmgTxt.opacity = 1 - dmgTxt.t;
                    if (dmgTxt.t > 1) destroy(dmgTxt);
                });
                
                // Check if enemy died
                if (e.hp <= 0) {
                    killEnemy(e);
                }
            }
        }
    });
    
    // Ultimate text
    showUltimateName("🌋 ЗЕМЛЕТРУС!");
}

// MAGE: Meteor Shower - rains meteors on the map
function ultimateMeteorShower(config) {
    const p = GS.player;
    
    for (let i = 0; i < config.meteorCount; i++) {
        wait(i * 0.3, () => {
            // Random position, biased towards enemies
            let targetX = rand(50, CONFIG.MAP_WIDTH - 50);
            let targetY = rand(50, CONFIG.MAP_HEIGHT - 50);
            
            // Try to target enemies
            const enemies = get("enemy");
            if (enemies.length > 0 && Math.random() < 0.7) {
                const target = enemies[Math.floor(rand(0, enemies.length))];
                if (target.exists()) {
                    targetX = target.pos.x + rand(-30, 30);
                    targetY = target.pos.y + rand(-30, 30);
                }
            }
            
            // Warning circle
            const warning = add([
                circle(config.radius), pos(targetX, targetY),
                color(255, 100, 0), opacity(0.3),
                anchor("center"), z(2), { t: 0 }
            ]);
            warning.onUpdate(() => {
                warning.t += dt();
                warning.opacity = 0.3 + Math.sin(warning.t * 15) * 0.2;
                if (warning.t > 0.6) destroy(warning);
            });
            
            // Meteor impact after delay
            wait(0.6, () => {
                shake(8);
                playSound('hit');
                
                // Explosion
                const explosion = add([
                    circle(20), pos(targetX, targetY),
                    color(255, 150, 50), opacity(0.9),
                    anchor("center"), z(10), { r: 20 }
                ]);
                explosion.onUpdate(() => {
                    explosion.r += 150 * dt();
                    explosion.radius = explosion.r;
                    explosion.opacity -= 2.5 * dt();
                    if (explosion.opacity <= 0) destroy(explosion);
                });
                
                // Damage enemies
                for (const e of get("enemy")) {
                    if (!e.exists()) continue;
                    if (vec2(targetX, targetY).dist(e.pos) < config.radius) {
                        e.hp -= config.damage;
                        
                        // Damage number
                        const dmgTxt = add([
                            text(`-${config.damage}`, { size: 14 }),
                            pos(e.pos.x, e.pos.y - 15),
                            anchor("center"), color(255, 150, 50), z(100), { t: 0 }
                        ]);
                        dmgTxt.onUpdate(() => {
                            dmgTxt.t += dt();
                            dmgTxt.pos.y -= 25 * dt();
                            dmgTxt.opacity = 1 - dmgTxt.t;
                            if (dmgTxt.t > 0.8) destroy(dmgTxt);
                        });
                        
                        // Check if enemy died
                        if (e.hp <= 0) {
                            killEnemy(e);
                        }
                    }
                }
                
                // Fire particles (OPTIMIZED: reduced count, use lifespan)
                for (let j = 0; j < 3; j++) {
                    const angle = (j / 3) * Math.PI * 2;
                    add([
                        circle(rand(5, 8)), pos(targetX, targetY),
                        color(255, rand(100, 200), 50), opacity(0.8),
                        anchor("center"), z(11),
                        move(angle * 180 / Math.PI, rand(60, 100)),
                        lifespan(0.5, { fade: 0.4 })
                    ]);
                }
            });
        });
    }
    
    showUltimateName("☄️ МЕТЕОРИТНИЙ ДОЩ!");
}

// ASSASSIN: Shadow Strike - teleports to enemies and attacks
function ultimateShadowStrike(config) {
    const p = GS.player;
    const enemies = get("enemy").filter(e => e.exists());
    
    if (enemies.length === 0) {
        // Refund if no enemies
        GS.ultimateCharge = GS.ultimateMax;
        GS.ultimateReady = true;
        return;
    }
    
    // Make player invulnerable
    p.invuln = config.invulnDuration;
    
    // Sort enemies by HP (target lowest first)
    enemies.sort((a, b) => a.hp - b.hp);
    
    // Strike targets
    const targets = enemies.slice(0, config.strikes);
    let strikeIndex = 0;
    
    function doStrike() {
        if (strikeIndex >= targets.length) {
            // Return to original position
            wait(0.1, () => {
                // Shadow return effect
                const shadow = add([
                    circle(20), pos(p.pos), color(50, 50, 80), opacity(0.7),
                    anchor("center"), z(3), { t: 0 }
                ]);
                shadow.onUpdate(() => {
                    shadow.t += dt();
                    shadow.radius = 20 + shadow.t * 50;
                    shadow.opacity = 0.7 - shadow.t * 2;
                    if (shadow.t > 0.3) destroy(shadow);
                });
            });
            return;
        }
        
        const target = targets[strikeIndex];
        if (!target.exists()) {
            strikeIndex++;
            doStrike();
            return;
        }
        
        // Teleport to target
        const startPos = vec2(p.pos.x, p.pos.y);
        
        // Shadow at start position
        const shadowStart = add([
            circle(15), pos(startPos), color(50, 50, 80), opacity(0.7),
            anchor("center"), z(3), { t: 0 }
        ]);
        shadowStart.onUpdate(() => {
            shadowStart.t += dt();
            shadowStart.opacity = 0.7 - shadowStart.t * 3;
            if (shadowStart.t > 0.2) destroy(shadowStart);
        });
        
        // Move to target
        p.pos = vec2(target.pos.x, target.pos.y);
        
        // Strike effect
        const strike = add([
            rect(40, 4), pos(p.pos),
            color(200, 200, 255), opacity(0.9),
            anchor("center"), rotate(rand(0, 360)), z(10), { t: 0 }
        ]);
        strike.onUpdate(() => {
            strike.t += dt();
            strike.scale = vec2(1 + strike.t * 3, 1);
            strike.opacity = 0.9 - strike.t * 4;
            if (strike.t > 0.2) destroy(strike);
        });
        
        // Damage target
        target.hp -= config.damage;
        shake(5);
        playSound('attack');
        
        // Damage number
        const dmgTxt = add([
            text(`-${config.damage}`, { size: 16 }),
            pos(target.pos.x, target.pos.y - 25),
            anchor("center"), color(200, 200, 255), z(100), { t: 0 }
        ]);
        dmgTxt.onUpdate(() => {
            dmgTxt.t += dt();
            dmgTxt.pos.y -= 40 * dt();
            dmgTxt.opacity = 1 - dmgTxt.t;
            if (dmgTxt.t > 0.8) destroy(dmgTxt);
        });
        
        // Check if enemy died
        if (target.hp <= 0) {
            killEnemy(target);
        }
        
        strikeIndex++;
        wait(0.15, doStrike);
    }
    
    doStrike();
    showUltimateName("👤 ТІНЬОВИЙ УДАР!");
}

// RANGER: Arrow Storm - rains arrows in large area
function ultimateArrowStorm(config) {
    const p = GS.player;
    
    // Center on player
    const centerX = p.pos.x;
    const centerY = p.pos.y;
    
    // Rain arrows in area
    for (let i = 0; i < config.arrowCount; i++) {
        wait(i * 0.1, () => {
            // Random position in radius
            const angle = rand(0, Math.PI * 2);
            const dist = rand(0, config.radius);
            const targetX = centerX + Math.cos(angle) * dist;
            const targetY = centerY + Math.sin(angle) * dist;
            
            // Arrow from sky
            const arrow = add([
                rect(4, 20), pos(targetX, targetY - 100),
                color(150, 200, 100), opacity(0.9),
                anchor("center"), rotate(90), z(10),
                move(90, 500), { t: 0 }
            ]);
            
            arrow.onUpdate(() => {
                arrow.t += dt();
                if (arrow.pos.y > targetY) {
                    // Impact
                    shake(3);
                    playSound('hit');
                    
                    // Impact effect
                    const impact = add([
                        circle(15), pos(targetX, targetY),
                        color(150, 200, 100), opacity(0.8),
                        anchor("center"), z(11), { r: 15 }
                    ]);
                    impact.onUpdate(() => {
                        impact.r += 80 * dt();
                        impact.radius = impact.r;
                        impact.opacity -= 3 * dt();
                        if (impact.opacity <= 0) destroy(impact);
                    });
                    
                    // Damage enemies
                    for (const e of get("enemy")) {
                        if (!e.exists()) continue;
                        if (vec2(targetX, targetY).dist(e.pos) < 40) {
                            e.hp -= config.damage;
                            
                            // Damage number
                            const dmgTxt = add([
                                text(`-${config.damage}`, { size: 12 }),
                                pos(e.pos.x, e.pos.y - 15),
                                anchor("center"), color(150, 200, 100), z(100), { t: 0 }
                            ]);
                            dmgTxt.onUpdate(() => {
                                dmgTxt.t += dt();
                                dmgTxt.pos.y -= 25 * dt();
                                dmgTxt.opacity = 1 - dmgTxt.t;
                                if (dmgTxt.t > 0.8) destroy(dmgTxt);
                            });
                            
                            // Check if enemy died
                            if (e.hp <= 0) {
                                killEnemy(e);
                            }
                        }
                    }
                    
                    destroy(arrow);
                }
            });
        });
    }
    
    showUltimateName("🌪️ СТРІЛЯНИЙ ШТОРМ!");
}

// Show ultimate name
function showUltimateName(name) {
    const txt = add([
        text(name, { size: 36 }),
        pos(CONFIG.MAP_WIDTH / 2, CONFIG.MAP_HEIGHT / 2 - 80),
        anchor("center"), color(255, 220, 100), z(200),
        { t: 0 }
    ]);
    txt.onUpdate(() => {
        txt.t += dt();
        txt.pos.y -= 20 * dt();
        txt.scale = vec2(1 + txt.t * 0.3);
        txt.opacity = 1 - txt.t / 1.5;
        if (txt.t > 1.5) destroy(txt);
    });
}

export default { setupUltimate, tryUseUltimate, updateUltimate };

