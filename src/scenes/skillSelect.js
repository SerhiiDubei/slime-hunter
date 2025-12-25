// ==================== SKILL SELECTION SCENE ====================
// Shown when player levels up - choose 1 of 3 random active skills

import { CONFIG } from '../config.js';
import { GS } from '../state.js';
import { playSound } from '../audio.js';
import { getHeroSkills, getHeroPassive } from '../data/heroSkills.js';
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
        add([
            text(`LEVEL ${GS.playerLevel} UP!`, { size: 32 }),
            pos(W / 2, 80),
            anchor("center"),
            color(255, 220, 100),
            fixed(),
            z(151)
        ]);
        
        add([
            text("Choose a skill:", { size: 18 }),
            pos(W / 2, 130),
            anchor("center"),
            color(200, 180, 140),
            fixed(),
            z(151)
        ]);
        
        // Get hero skills
        const heroSkills = getHeroSkills(GS.selectedHero);
        const availableSkills = heroSkills.active.filter(skill => 
            !GS.heroSkills.active.includes(skill.id)
        );
        
        // Select 3 random skills (or all if less than 3 available)
        const skillsToShow = [];
        const shuffled = [...availableSkills].sort(() => Math.random() - 0.5);
        for (let i = 0; i < Math.min(3, shuffled.length); i++) {
            skillsToShow.push(shuffled[i]);
        }
        
        // If no skills available, show message
        if (skillsToShow.length === 0) {
            add([
                text("All skills learned!", { size: 20 }),
                pos(W / 2, H / 2),
                anchor("center"),
                color(150, 200, 150),
                fixed(),
                z(151)
            ]);
            
            wait(2, () => {
                go("game");
            });
            return;
        }
        
        // Skill cards
        const cardWidth = 200;
        const cardHeight = 180;
        const cardGap = 20;
        const startX = (W - (cardWidth * skillsToShow.length + cardGap * (skillsToShow.length - 1))) / 2;
        const cardY = H / 2;
        
        skillsToShow.forEach((skill, index) => {
            const cardX = startX + index * (cardWidth + cardGap) + cardWidth / 2;
            
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
                { skillId: skill.id, skill: skill }
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
                pos(cardX, cardY - 60),
                anchor("center"),
                fixed(),
                z(152)
            ]);
            
            // Skill name
            add([
                text(skill.name, { size: 16, width: cardWidth - 20 }),
                pos(cardX, cardY - 20),
                anchor("center"),
                color(255, 220, 100),
                fixed(),
                z(152)
            ]);
            
            // Skill description
            add([
                text(skill.description, { size: 12, width: cardWidth - 20 }),
                pos(cardX, cardY + 20),
                anchor("center"),
                color(180, 170, 160),
                fixed(),
                z(152)
            ]);
            
            // Hover effect
            card.onHoverUpdate(() => {
                card.color = rgb(80, 70, 60);
            });
            
            card.onHoverEnd(() => {
                card.color = rgb(60, 50, 40);
            });
        });
        
        // Click handler
        onClick("skillCard", (card) => {
            const skillId = card.skillId;
            
            // Add skill to active skills
            if (!GS.heroSkills.active.includes(skillId)) {
                GS.heroSkills.active.push(skillId);
            }
            
            // Initialize passive skill if not set
            if (!GS.heroSkills.passive) {
                const passive = getHeroPassive(GS.selectedHero);
                GS.heroSkills.passive = passive.id;
            }
            
            playSound('levelup');
            go("game");
        });
        
        // Keyboard selection (1, 2, 3)
        onKeyPress("1", () => {
            if (skillsToShow[0]) {
                const skillId = skillsToShow[0].id;
                if (!GS.heroSkills.active.includes(skillId)) {
                    GS.heroSkills.active.push(skillId);
                }
                if (!GS.heroSkills.passive) {
                    const passive = getHeroPassive(GS.selectedHero);
                    GS.heroSkills.passive = passive.id;
                }
                playSound('levelup');
                go("game");
            }
        });
        
        onKeyPress("2", () => {
            if (skillsToShow[1]) {
                const skillId = skillsToShow[1].id;
                if (!GS.heroSkills.active.includes(skillId)) {
                    GS.heroSkills.active.push(skillId);
                }
                if (!GS.heroSkills.passive) {
                    const passive = getHeroPassive(GS.selectedHero);
                    GS.heroSkills.passive = passive.id;
                }
                playSound('levelup');
                go("game");
            }
        });
        
        onKeyPress("3", () => {
            if (skillsToShow[2]) {
                const skillId = skillsToShow[2].id;
                if (!GS.heroSkills.active.includes(skillId)) {
                    GS.heroSkills.active.push(skillId);
                }
                if (!GS.heroSkills.passive) {
                    const passive = getHeroPassive(GS.selectedHero);
                    GS.heroSkills.passive = passive.id;
                }
                playSound('levelup');
                go("game");
            }
        });
    });
}

export default { createSkillSelectScene };

