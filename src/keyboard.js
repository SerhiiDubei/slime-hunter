// ==================== KEYBOARD INPUT ====================
// Native keyboard state management (works with any layout)

export const KEYS = {
    w: false, a: false, s: false, d: false,
    up: false, down: false, left: false, right: false,
    shift: false, space: false, e: false, q: false
};

export function initKeyboard() {
    document.addEventListener("keydown", (e) => {
        const key = e.key.toLowerCase();
        if (key === "w" || key === "ц") KEYS.w = true;
        if (key === "a" || key === "ф") KEYS.a = true;
        if (key === "s" || key === "і" || key === "ы") KEYS.s = true;
        if (key === "d" || key === "в") KEYS.d = true;
        if (key === "arrowup") KEYS.up = true;
        if (key === "arrowdown") KEYS.down = true;
        if (key === "arrowleft") KEYS.left = true;
        if (key === "arrowright") KEYS.right = true;
        if (key === "shift") KEYS.shift = true;
        if (key === " ") KEYS.space = true;
        if (key === "e" || key === "у") KEYS.e = true;
        if (key === "q" || key === "й") KEYS.q = true;
    });

    document.addEventListener("keyup", (e) => {
        const key = e.key.toLowerCase();
        if (key === "w" || key === "ц") KEYS.w = false;
        if (key === "a" || key === "ф") KEYS.a = false;
        if (key === "s" || key === "і" || key === "ы") KEYS.s = false;
        if (key === "d" || key === "в") KEYS.d = false;
        if (key === "arrowup") KEYS.up = false;
        if (key === "arrowdown") KEYS.down = false;
        if (key === "arrowleft") KEYS.left = false;
        if (key === "arrowright") KEYS.right = false;
        if (key === "shift") KEYS.shift = false;
        if (key === " ") KEYS.space = false;
        if (key === "e" || key === "у") KEYS.e = false;
        if (key === "q" || key === "й") KEYS.q = false;
    });
}

export default { KEYS, initKeyboard };

