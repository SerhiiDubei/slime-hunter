# 🎮 Slime Hunter

A Diablo-inspired action RPG built with **Kaboom.js**

![Game Preview](https://img.shields.io/badge/Made%20with-Kaboom.js-ff69b4)
![License](https://img.shields.io/badge/License-MIT-blue)

## 🎯 Features

- **3 Unique Heroes** - Warrior, Mage, Assassin with different playstyles
- **Ultimate Abilities** - Charge by killing enemies, unleash devastating attacks
- **7 Challenging Levels** - Each with unique bosses and increasing difficulty
- **4 Enemy Types** - Slimes, Mages, Tanks, and Bombers
- **6 Passive Skills** - Poison, Vampirism, Thorns, Critical, Gold Rush, Regeneration
- **RPG Progression** - Level up, upgrade stats, buy skills in the shop
- **Boss Fights** - 7 unique bosses with special abilities

## 🕹️ Controls

| Key | Action |
|-----|--------|
| WASD / Arrows | Move |
| SHIFT | Sprint |
| SPACE | Melee Attack |
| E | Ranged Attack |
| Q | Ultimate Ability |

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## 🛠️ Tech Stack

- **Kaboom.js** - Game framework
- **Vite** - Build tool
- **Vanilla JS** - No frameworks

## 📁 Project Structure

```
src/
├── data/           # Game configurations
│   ├── bosses.js   # Boss definitions
│   ├── enemies.js  # Enemy types
│   ├── heroes.js   # Hero classes
│   ├── levels.js   # Level configs
│   └── skills.js   # Passive skills
├── entities/       # Game entities
│   ├── enemies.js  # Enemy logic
│   └── player.js   # Player logic
├── scenes/         # Game scenes
│   ├── start.js    # Main menu
│   ├── heroSelect.js # Hero selection
│   ├── game.js     # Main gameplay
│   ├── shop.js     # Upgrade shop
│   ├── gameover.js # Death screen
│   └── victory.js  # Win screen
├── attacks.js      # Combat system
├── audio.js        # Sound effects
├── config.js       # Game constants
├── effects.js      # Visual effects
├── keyboard.js     # Input handling
├── sprites.js      # Procedural sprites
├── state.js        # Game state
├── touch.js        # Mobile controls
├── ui.js           # HUD elements
├── ultimate.js     # Ultimate abilities
└── main.js         # Entry point
```

## 🎨 Screenshots

*Coming soon!*

## 📜 License

MIT License - feel free to use and modify!

---

Made with ❤️ and Kaboom.js

