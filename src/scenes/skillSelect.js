// ==================== SKILL SELECTION SCENE ====================
// Shown when player has skill points - choose which skill to upgrade
// Also shown at level 1 to choose first skill

import { CONFIG } from '../config.js';
import { GS } from '../state.js';
import { playSound } from '../audio.js';
import { getHeroSkills, getHeroPassive, getHeroSkillByKey } from '../data/heroSkills.js';
import { getHero } from '../data/heroes.js';

export function createSkillSelectScene() {
    scene("skillSelect", () => {
        const W = CONFIG.VIEWPORT_WIDTH;
        const H = CONFIG.VIEWPORT_HEIGHT;
        
        // Dark overlay
        add([
            rect(W, H),
            pos(0, 0),
            color(0, 0, 0),
            opacity(0.7),
            fixed(),
            z(150)
        ]);
        
        // Title
        const titleText = GS.playerLevel === 1 ? "CHOOSE YOUR FIRST SKILL" : `LEVEL ${GS.playerLevel} UP!`;
        add([
            text(titleText, { size: 32 }),
            pos(W / 2, 80),
            anchor("center"),
            color(255, 220, 100),
            fixed(),
            z(151)
        ]);
        
        add([
            text(`Skill Points: ${GS.skillPoints}`, { size: 18 }),
            pos(W / 2, 130),
            anchor("center"),
            color(200, 180, 140),
            fixed(),
            z(151)
        ]);
        
        // Get hero skills
        const heroSkills = getHeroSkills(GS.selectedHero);
        
        // All available skills (Q, R, T, Y)
        const allSkills = [
            { key: 'Q', skill: heroSkills.skillQ },
            { key: 'R', skill: heroSkills.skillR },
            { key: 'T', skill: heroSkills.skillT },
            { key: 'Y', skill: heroSkills.skillY },
        ];
        
        // Filter skills that can be upgraded (not max level)
        // Y (ultimate) can only be learned at level 5+
        const upgradableSkills = allSkills.filter((item) => {
            const key = item.key;
            const skill = item.skill;
            const currentLevel = GS.getSkillLevel(key);
            
            // Ultimate (Y) can only be learned at level 5+
            if (key === 'Y' && skill.isUltimate) {
                if (GS.playerLevel < 5) {
                    return false; // Not available until level 5
                }
            }
            
            return currentLevel < 4; // Max level is 4
        });
        
        // If no skills can be upgraded, show message
        if (upgradableSkills.length === 0) {
            add([
                text("All skills maxed!", { size: 20 }),
                pos(W / 2, H / 2),
                anchor("center"),
                color(150, 200, 150),
                fixed(),
                z(151)
            ]);
            
            wait(2, () => {
                GS.gameFrozen = false;
                go("game");
            });
            return;
        }
        
        // Skill cards
        const cardWidth = 180;
        const cardHeight = 220;
        const cardGap = 15;
        const startX = (W - (cardWidth * upgradableSkills.length + cardGap * (upgradableSkills.length - 1))) / 2;
        const cardY = H / 2 + 20;
        
        upgradableSkills.forEach(({ key, skill }, index) => {
            const cardX = startX + index * (cardWidth + cardGap) + cardWidth / 2;
            const currentLevel = GS.getSkillLevel(key);
            const nextLevel = currentLevel + 1;
            const isMaxLevel = currentLevel >= 4;
            
            // Card background
            const card = add([
                rect(cardWidth, cardHeight, { radius: 8 }),
                pos(cardX, cardY),
                anchor("center"),
                color(60, 50, 40),
                area(),
                fixed(),
                z(151),
                "skillCard",
                { skillKey: key, skill: skill, skillObj: skill }
            ]);
            
            // Card border
            add([
                rect(cardWidth + 4, cardHeight + 4, { radius: 10 }),
                pos(cardX, cardY),
                anchor("center"),
                color(100, 80, 60),
                fixed(),
                z(150)
            ]);
            
            // Skill icon
            add([
                text(skill.icon, { size: 48 }),
                pos(cardX, cardY - 80),
                anchor("center"),
                fixed(),
                z(152)
            ]);
            
            // Key label
            add([
                text(`[${skill.key || 'PASSIVE'}]`, { size: 14 }),
                pos(cardX, cardY - 50),
                anchor("center"),
                color(200, 200, 200),
                fixed(),
                z(152)
            ]);
            
            // Skill name
            add([
                text(skill.name, { size: 16, width: cardWidth - 20 }),
                pos(cardX, cardY - 30),
                anchor("center"),
                color(255, 220, 100),
                fixed(),
                z(152)
            ]);
            
            // Current level
            add([
                text(`Level ${currentLevel}/4`, { size: 12 }),
                pos(cardX, cardY - 10),
                anchor("center"),
                color(180, 180, 180),
                fixed(),
                z(152)
            ]);
            
            // Skill description (with level-specific info)
            const description = skill.getDescription ? skill.getDescription(nextLevel) : skill.description;
            add([
                text(description, { size: 11, width: cardWidth - 20 }),
                pos(cardX, cardY + 20),
                anchor("center"),
                color(180, 170, 160),
                fixed(),
                z(152)
            ]);
            
            // Upgrade button text
            if (!isMaxLevel) {
                add([
                    text("Click to upgrade", { size: 12 }),
                    pos(cardX, cardY + 80),
                    anchor("center"),
                    color(150, 255, 150),
                    fixed(),
                    z(152)
                ]);
            }
            
            // Hover effect
            card.onHoverUpdate(() => {
                if (!isMaxLevel) {
                    card.color = rgb(80, 70, 60);
                }
            });
            
            card.onHoverEnd(() => {
                card.color = rgb(60, 50, 40);
            });
        });
        
        // Click handler
        onClick("skillCard", (card) => {
            const skillKey = card.skillKey;
            
            // Upgrade skill
            if (GS.upgradeSkill(skillKey)) {
                playSound('levelup');
                
                // If no more skill points, return to game
                if (GS.skillPoints <= 0) {
                    GS.gameFrozen = false;
                    go("game");
                } else {
                    // Still have skill points, refresh scene
                    go("skillSelect");
                }
            } else {
                playSound('hit');
            }
        });
        
        // Keyboard selection (1, 2, 3, 4)
        for (let i = 0; i < 4; i++) {
            const key = String(i + 1);
            onKeyPress(key, () => {
                if (upgradableSkills[i]) {
                    const skillKey = upgradableSkills[i].key;
                    if (GS.upgradeSkill(skillKey)) {
                        playSound('levelup');
                        if (GS.skillPoints <= 0) {
                            GS.gameFrozen = false;
                            go("game");
                        } else {
                            go("skillSelect");
                        }
                    } else {
                        playSound('hit');
                    }
                }
            });
        }
        
        // ESC to skip (if not level 1)
        if (GS.playerLevel > 1) {
            onKeyPress("escape", () => {
                GS.gameFrozen = false;
                go("game");
            });
        }
    });
}

export default { createSkillSelectScene };
