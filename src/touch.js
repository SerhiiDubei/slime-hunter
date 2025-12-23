// ==================== TOUCH CONTROLS ====================
// Mobile touch input handling

import { GS } from './state.js';
import { initAudio } from './audio.js';

export function setupTouch(meleeAttackFn, rangedAttackFn) {
    const base = document.getElementById("joystick-base");
    const stick = document.getElementById("joystick-stick");
    const atkBtn = document.getElementById("attack-btn");
    const rangedBtn = document.getElementById("ranged-btn");
    const sprintBtn = document.getElementById("sprint-btn");
    const controls = document.getElementById("touch-controls");
    
    if (!base) return;
    
    let active = false;
    const radius = 35;
    
    base.addEventListener("touchstart", e => {
        e.preventDefault();
        active = true;
        handleMove(e);
    });
    
    base.addEventListener("touchmove", e => {
        e.preventDefault();
        if (active) handleMove(e);
    });
    
    base.addEventListener("touchend", e => {
        e.preventDefault();
        active = false;
        GS.joystickInput = { x: 0, y: 0 };
        stick.style.transform = "translate(0px, 0px)";
    });
    
    function handleMove(e) {
        const touch = e.touches[0];
        const rect = base.getBoundingClientRect();
        let dx = touch.clientX - (rect.left + rect.width / 2);
        let dy = touch.clientY - (rect.top + rect.height / 2);
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > radius) {
            dx = dx / dist * radius;
            dy = dy / dist * radius;
        }
        stick.style.transform = `translate(${dx}px, ${dy}px)`;
        GS.joystickInput = { x: dx / radius, y: dy / radius };
    }
    
    if (atkBtn) {
        atkBtn.addEventListener("touchstart", e => {
            e.preventDefault();
            initAudio();
            if (meleeAttackFn) meleeAttackFn();
        });
    }
    
    if (rangedBtn) {
        rangedBtn.addEventListener("touchstart", e => {
            e.preventDefault();
            initAudio();
            if (rangedAttackFn) rangedAttackFn();
        });
    }
    
    if (sprintBtn) {
        sprintBtn.addEventListener("touchstart", e => {
            e.preventDefault();
            window.mobileSprintActive = true;
        });
        sprintBtn.addEventListener("touchend", e => {
            e.preventDefault();
            window.mobileSprintActive = false;
        });
    }
    
    document.body.addEventListener("touchmove", e => {
        if (e.target.closest("#touch-controls") || e.target.closest("#game-container")) {
            e.preventDefault();
        }
    }, { passive: false });
    
    // Show controls on touch devices
    if (('ontouchstart' in window) || navigator.maxTouchPoints > 0 || window.innerWidth <= 1024) {
        if (controls) controls.style.display = "block";
    }
}

export default { setupTouch };

