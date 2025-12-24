# 🔑🚪 KEYS & DOORS SYSTEM - Схема Взаємодій

## 📋 Огляд

Система ключів і дверей тепер **централізована** в `src/systems/keysDoors.js` для кращої організації та дебагу.

---

## 🏗️ Архітектура

### **Модуль:** `src/systems/keysDoors.js`

**Експортовані функції:**
- `spawnKey(position, roomId, keyColor)` - Створює ключ на позиції
- `checkAllKeysCollected(dungeon)` - Перевіряє чи всі ключі зібрані
- `collectKey(keyObj, dungeon, doors, doorTexts)` - Обробляє збір ключа
- `updateBossDoorVisuals(doors, doorTexts, allKeysCollected)` - Оновлює візуалізацію дверей боса
- `canEnterDoor(targetRoom, currentRoom, dungeon)` - Перевіряє доступ до дверей
- `getKeysNeeded(dungeon)` - Повертає кількість потрібних ключів

---

## 🔄 Схема Взаємодій

### **1. СПАВН КЛЮЧА (Spawn Key)**

```
onRoomCleared() [game.js]
    ↓
    ├─> Перевіряє: currentRoom.type !== BOSS && !== START
    ├─> Перевіряє: !GS.collectedKeys.includes(currentRoom.id)
    └─> spawnKey(vec2(player.pos), currentRoom.id)
            ↓
        [keysDoors.js]
            ├─> Валідація position
            ├─> Валідація roomId
            ├─> getKeyColor(roomId) → [r, g, b]
            ├─> Створює sprite("key") з кольором
            ├─> Додає анімацію (onUpdate)
            └─> Додає glow ефект (keyPart)
```

**Статуси:**
- `GS.collectedKeys: []` - Масив ID зібраних ключів
- `currentRoom.keySpawned: boolean` - Чи спавнений ключ в кімнаті

---

### **2. ЗБІР КЛЮЧА (Collect Key)**

```
onCollide("player", "key") [game.js]
    ↓
    collectKey(keyObj, dungeon, doors, doorTexts)
        ↓
    [keysDoors.js]
        ├─> Валідація keyObj.roomId
        ├─> Перевірка: !GS.collectedKeys.includes(roomId)
        ├─> GS.collectedKeys.push(roomId)
        ├─> GS.hasKey = true (legacy)
        ├─> destroy(keyObj)
        ├─> destroyAll("keyPart")
        ├─> checkAllKeysCollected(dungeon)
        └─> Якщо всі зібрані → updateBossDoorVisuals(doors, doorTexts, true)
```

**Статуси після збору:**
- `GS.collectedKeys: [0, 1, 2]` - Додано новий ID
- `GS.hasKey: true` - Legacy флаг

---

### **3. ПЕРЕВІРКА ВСІХ КЛЮЧІВ (Check All Keys)**

```
checkAllKeysCollected(dungeon)
    ↓
    [keysDoors.js]
        ├─> Отримує dungeon.map.rooms
        ├─> Фільтрує: r.type !== BOSS && !== START
        ├─> Перевіряє: requiredRooms.every(room => 
        │       GS.collectedKeys.includes(room.id)
        │   )
        └─> Повертає: boolean
```

**Логіка:**
- Всі кімнати окрім BOSS і START мають ключі
- Кожна кімната має унікальний `room.id`
- `GS.collectedKeys` містить ID зібраних ключів
- Якщо `requiredRooms.length === GS.collectedKeys.length` → всі зібрані

---

### **4. ДОСТУП ДО ДВЕРЕЙ (Door Access)**

```
onCollide("player", "door") [game.js]
    ↓
    canEnterDoor(targetRoom, currentRoom, dungeon)
        ↓
    [keysDoors.js]
        ├─> isBossDoor = targetRoom.type === BOSS
        ├─> allKeysCollected = checkAllKeysCollected(dungeon)
        ├─> canEnter = isBossDoor 
        │       ? allKeysCollected 
        │       : currentRoom.cleared
        └─> Повертає: { canEnter: boolean, reason: string }
```

**Правила доступу:**
- **BOSS двері:** Потрібні ВСІ ключі (`allKeysCollected === true`)
- **Звичайні двері:** Потрібно очистити поточну кімнату (`currentRoom.cleared === true`)

---

### **5. ОНОВЛЕННЯ ВІЗУАЛІЗАЦІЇ ДВЕРЕЙ (Update Door Visuals)**

```
updateBossDoorVisuals(doors, doorTexts, allKeysCollected)
    ↓
    [keysDoors.js]
        ├─> doors.forEach(door)
        │   └─> Якщо door.targetRoomType === BOSS
        │       └─> Якщо allKeysCollected
        │           └─> door.use(sprite("doorOpen"))
        └─> doorTexts.forEach(text)
            └─> Якщо text.targetRoomType === BOSS
                └─> text.text = allKeysCollected ? "🚪" : "🔒"
```

**Візуальні стани:**
- `doorClosed` + `🔒` - Двері закриті (ключі не зібрані)
- `doorOpen` + `🚪` - Двері відкриті (всі ключі зібрані)

---

## 📊 Статуси та Стани

### **Global State (GS)**
```javascript
GS.collectedKeys: []        // Масив ID зібраних ключів: [0, 1, 2]
GS.hasKey: boolean          // Legacy флаг (для сумісності)
GS.doorOpen: boolean        // Чи відкриті двері (залежить від типу)
GS.roomCleared: boolean     // Чи очищена поточна кімната
```

### **Room State**
```javascript
room.id: number            // Унікальний ID кімнати
room.type: ROOM_TYPES      // Тип: START, COMBAT, ELITE, TREASURE, BOSS
room.cleared: boolean      // Чи очищена кімната
room.visited: boolean      // Чи відвідана кімната
room.keySpawned: boolean   // Чи спавнений ключ (опціонально)
```

### **Door State**
```javascript
door.targetRoomId: number      // ID цільової кімнати
door.targetRoomType: ROOM_TYPES // Тип цільової кімнати
door.isBossDoor: boolean        // Чи це двері боса
```

---

## 🔗 Залежності

### **Імпорти в `keysDoors.js`:**
- `GS` (state.js) - Глобальний стан
- `ROOM_TYPES` (rooms.js) - Типи кімнат
- `Logger` (logger.js) - Логування
- `playSound` (audio.js) - Звуки

### **Використання в `game.js`:**
- `spawnKey()` - Після очищення кімнати
- `collectKey()` - При колізії з ключем
- `checkAllKeysCollected()` - Перевірка доступу до дверей
- `canEnterDoor()` - Перевірка доступу
- `updateBossDoorVisuals()` - Оновлення візуалізації
- `getKeysNeeded()` - Показ кількості потрібних ключів

---

## 🐛 Відомі Проблеми та Виправлення

### **Проблема 1: `spawnKeyFn(e.pos)` в `killEnemy`**
**Було:** Виклик `spawnKeyFn(e.pos)` для босів без `roomId`
**Виправлено:** Видалено виклик - ключі спавняться в `onRoomCleared`

### **Проблема 2: `keyColorArray[0]` undefined**
**Було:** `roomId` може бути `undefined` → `keyColors[undefined % 7]` = `undefined`
**Виправлено:** Додана валідація `roomId` та fallback кольори

### **Проблема 3: Розкидана логіка**
**Було:** Логіка ключів/дверей розкидана по `game.js`
**Виправлено:** Винесено в окремий модуль `src/systems/keysDoors.js`

---

## 📝 Логування

Всі критичні операції логуються з детальним контекстом:
- `spawnKey:ENTRY` - Вхід в функцію
- `spawnKey:COLOR` - Визначення кольору
- `spawnKey:SUCCESS` - Успішне створення
- `spawnKey:ERROR` - Помилки валідації
- `collectKey:ENTRY` - Початок збору
- `collectKey:ADDED` - Ключ додано
- `checkAllKeysCollected:ROOMS` - Розрахунок потрібних кімнат
- `canEnterDoor:RESULT` - Результат перевірки доступу

---

## 🎯 Послідовність Подій

1. **Гравець очищає кімнату** → `onRoomCleared()`
2. **Якщо кімната не BOSS/START** → `spawnKey(position, roomId)`
3. **Гравець підбирає ключ** → `collectKey(keyObj, ...)`
4. **Ключ додається** → `GS.collectedKeys.push(roomId)`
5. **Перевірка всіх ключів** → `checkAllKeysCollected(dungeon)`
6. **Якщо всі зібрані** → `updateBossDoorVisuals(..., true)`
7. **Гравець підходить до дверей** → `canEnterDoor(...)`
8. **Якщо доступ дозволено** → Перехід в нову кімнату

---

## ✅ Перевірка Стану

Для дебагу використовуй:
```javascript
console.log('Collected Keys:', GS.collectedKeys);
console.log('All Keys Collected:', checkAllKeysCollected(GS.dungeon));
console.log('Keys Needed:', getKeysNeeded(GS.dungeon));
```

---

**Останнє оновлення:** Після рефакторингу в окремий модуль з детальним логуванням

