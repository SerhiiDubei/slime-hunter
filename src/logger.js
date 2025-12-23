// ==================== ERROR LOGGING SYSTEM ====================
// Catches and logs all errors for debugging

const LOG_LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
};

// Store errors for display
const errorLog = [];
const MAX_LOG_SIZE = 50;

// Current log level
let currentLevel = LOG_LEVELS.DEBUG;

// Format timestamp
function timestamp() {
    const d = new Date();
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}:${d.getSeconds().toString().padStart(2, '0')}.${d.getMilliseconds().toString().padStart(3, '0')}`;
}

// Add to log
function addToLog(level, message, data = null) {
    const entry = {
        time: timestamp(),
        level,
        message,
        data,
    };
    
    errorLog.push(entry);
    if (errorLog.length > MAX_LOG_SIZE) {
        errorLog.shift();
    }
    
    // Also log to console
    const prefix = `[${entry.time}] [${level}]`;
    if (level === 'ERROR') {
        console.error(prefix, message, data || '');
    } else if (level === 'WARN') {
        console.warn(prefix, message, data || '');
    } else {
        console.log(prefix, message, data || '');
    }
}

// Logger API
export const Logger = {
    debug: (msg, data) => addToLog('DEBUG', msg, data),
    info: (msg, data) => addToLog('INFO', msg, data),
    warn: (msg, data) => addToLog('WARN', msg, data),
    error: (msg, data) => addToLog('ERROR', msg, data),
    
    getLog: () => [...errorLog],
    clearLog: () => { errorLog.length = 0; },
};

// Global error handler - catches unhandled errors
window.onerror = function(message, source, lineno, colno, error) {
    Logger.error(`UNHANDLED ERROR: ${message}`, {
        source: source?.split('/').pop(),
        line: lineno,
        col: colno,
        stack: error?.stack,
    });
    
    // Show error overlay if critical
    showErrorOverlay(`${message}\nat line ${lineno}`);
    
    return false; // Don't prevent default handling
};

// Promise rejection handler
window.onunhandledrejection = function(event) {
    Logger.error(`UNHANDLED PROMISE REJECTION: ${event.reason}`, {
        reason: event.reason,
        stack: event.reason?.stack,
    });
    
    showErrorOverlay(`Promise Error: ${event.reason}`);
};

// Error overlay for critical errors
let errorOverlay = null;

function showErrorOverlay(message) {
    // Remove existing overlay
    if (errorOverlay) {
        errorOverlay.remove();
    }
    
    errorOverlay = document.createElement('div');
    errorOverlay.id = 'error-overlay';
    errorOverlay.innerHTML = `
        <div style="
            position: fixed;
            bottom: 10px;
            left: 10px;
            right: 10px;
            background: rgba(180, 50, 50, 0.95);
            color: white;
            padding: 15px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 12px;
            z-index: 9999;
            max-height: 150px;
            overflow-y: auto;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                <strong>⚠️ ERROR DETECTED</strong>
                <button onclick="this.parentElement.parentElement.parentElement.remove()" style="
                    background: rgba(255,255,255,0.2);
                    border: none;
                    color: white;
                    padding: 5px 10px;
                    border-radius: 4px;
                    cursor: pointer;
                ">✕ Close</button>
            </div>
            <div style="word-wrap: break-word;">${message}</div>
            <div style="margin-top: 10px; font-size: 10px; opacity: 0.7;">
                Press F2 to see full error log
            </div>
        </div>
    `;
    
    document.body.appendChild(errorOverlay);
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
        if (errorOverlay) {
            errorOverlay.remove();
            errorOverlay = null;
        }
    }, 10000);
}

// Debug overlay (press F2 to toggle)
let debugOverlay = null;
let debugVisible = false;

export function toggleDebugOverlay() {
    debugVisible = !debugVisible;
    
    if (!debugVisible && debugOverlay) {
        debugOverlay.remove();
        debugOverlay = null;
        return;
    }
    
    if (debugVisible) {
        createDebugOverlay();
    }
}

function createDebugOverlay() {
    if (debugOverlay) {
        debugOverlay.remove();
    }
    
    debugOverlay = document.createElement('div');
    debugOverlay.id = 'debug-overlay';
    debugOverlay.innerHTML = `
        <div style="
            position: fixed;
            top: 10px;
            left: 10px;
            width: 400px;
            max-height: 80vh;
            background: rgba(20, 20, 30, 0.95);
            color: #0f0;
            padding: 15px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 11px;
            z-index: 9999;
            overflow-y: auto;
            box-shadow: 0 4px 20px rgba(0,0,0,0.5);
            border: 1px solid #333;
        ">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #333; padding-bottom: 8px;">
                <strong style="color: #4ecca3;">📋 DEBUG LOG</strong>
                <div>
                    <button onclick="window.clearDebugLog()" style="
                        background: #333;
                        border: none;
                        color: #888;
                        padding: 3px 8px;
                        border-radius: 3px;
                        cursor: pointer;
                        margin-right: 5px;
                    ">Clear</button>
                    <button onclick="this.closest('#debug-overlay').remove(); window.debugVisible = false;" style="
                        background: #333;
                        border: none;
                        color: #888;
                        padding: 3px 8px;
                        border-radius: 3px;
                        cursor: pointer;
                    ">✕</button>
                </div>
            </div>
            <div id="debug-log-content"></div>
        </div>
    `;
    
    document.body.appendChild(debugOverlay);
    updateDebugContent();
}

function updateDebugContent() {
    const content = document.getElementById('debug-log-content');
    if (!content) return;
    
    const log = Logger.getLog();
    
    if (log.length === 0) {
        content.innerHTML = '<div style="color: #666;">No logs yet...</div>';
        return;
    }
    
    content.innerHTML = log.map(entry => {
        let color = '#888';
        if (entry.level === 'ERROR') color = '#f55';
        else if (entry.level === 'WARN') color = '#fa0';
        else if (entry.level === 'INFO') color = '#4ecca3';
        
        return `
            <div style="margin-bottom: 6px; padding: 4px; background: rgba(255,255,255,0.03); border-radius: 3px;">
                <span style="color: #555;">${entry.time}</span>
                <span style="color: ${color}; font-weight: bold;">[${entry.level}]</span>
                <span style="color: #ddd;">${entry.message}</span>
                ${entry.data ? `<div style="color: #666; font-size: 10px; margin-top: 2px;">${JSON.stringify(entry.data).slice(0, 200)}</div>` : ''}
            </div>
        `;
    }).reverse().join('');
}

// Expose for HTML onclick
window.clearDebugLog = () => {
    Logger.clearLog();
    updateDebugContent();
};

window.debugVisible = false;

// Update debug content periodically if visible
setInterval(() => {
    if (debugVisible) {
        updateDebugContent();
    }
}, 1000);

// Safe wrapper for game functions
export function safeCall(fn, context = 'unknown') {
    return function(...args) {
        try {
            return fn.apply(this, args);
        } catch (error) {
            Logger.error(`Error in ${context}`, {
                message: error.message,
                stack: error.stack,
            });
            throw error;
        }
    };
}

// Log game state for debugging
export function logGameState(gs) {
    Logger.debug('Game State', {
        level: gs.currentLevel,
        enemies: gs.enemies?.length,
        killed: gs.enemiesKilled,
        hasKey: gs.hasKey,
        doorOpen: gs.doorOpen,
        bossSpawned: gs.bossSpawned,
        playerHp: gs.player?.hp,
    });
}

export default Logger;

