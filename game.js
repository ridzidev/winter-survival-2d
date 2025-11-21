// --- Inisialisasi Canvas ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 600;
canvas.height = 600;

// --- Load Images ---
const images = {};
const imageNames = ['pohon', 'hewan', 'herbal', 'serigala', 'shelter', 'player', 'apiunggun'];
imageNames.forEach(name => {
    images[name] = new Image();
    images[name].src = `${name}.png`;
});

// --- Status Tampilan (HUD) ---
const healthDisplay = document.getElementById('health');
const warmthDisplay = document.getElementById('warmth');
const hungerDisplay = document.getElementById('hunger');
const thirstDisplay = document.getElementById('thirst');
const woodDisplay = document.getElementById('wood');
const snowDisplay = document.getElementById('snow');
const foodDisplay = document.getElementById('food');
const cookedFoodDisplay = document.getElementById('cookedFood');
const waterDisplay = document.getElementById('water');
const hotWaterDisplay = document.getElementById('hotWater');
const herbalDisplay = document.getElementById('herbal');
const teaDisplay = document.getElementById('tea');
const timeDisplay = document.getElementById('time');
const tempDisplay = document.getElementById('temperature');
const daysDisplay = document.getElementById('days');
const messageDisplay = document.getElementById('message');

// --- State Game ---
let gameOver = false;
let daysSurvived = 0;
let keys = {}; // Untuk menampung input keyboard

const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: 40,
    height: 40,
    color: 'red',
    speed: 4,
    health: 100,
    warmth: 100,
    hunger: 100,
    thirst: 100,
    inventory: {
        wood: 5,
        snow: 0,
        food: 0,
        water: 0,
        herbal: 0,
        tea: 0,
        cookedFood: 0,
        hotWater: 0
    }
};

let resources = [];
let campfire = null;
let shelter = null;
let stove = null;

const gameSettings = {
    dayDuration: 30000, // 30 detik
    nightDuration: 20000, // 20 detik
    dayTemp: -5,
    nightTemp: -20,
    maxResources: 20
};

let isDay = true;
let ambientTemp = gameSettings.dayTemp;
let timeCycle = setInterval(toggleDayNight, gameSettings.dayDuration);

// --- Fungsi Game ---

function toggleDayNight() {
    isDay = !isDay;
    clearInterval(timeCycle);
    if (isDay) {
        daysSurvived++;
        ambientTemp = gameSettings.dayTemp;
        timeCycle = setInterval(toggleDayNight, gameSettings.dayDuration);
        canvas.style.backgroundColor = '#f0f8ff'; // AliceBlue
    } else {
        ambientTemp = gameSettings.nightTemp;
        timeCycle = setInterval(toggleDayNight, gameSettings.nightDuration);
        canvas.style.backgroundColor = '#2c3e50'; // MidnightBlue
    }
}

function generateResource() {
    if (resources.length >= gameSettings.maxResources) return;

    const typeRoll = Math.random();
    let type, color, width, height, speed = 0, direction = 0, imageKey = '', hunger = 100;
    if (typeRoll < 0.8) { // 80% Pohon (Kayu) - Increased by 300% more (from 50% to 80%)
        type = 'wood';
        color = '#8B4513'; // SaddleBrown
        width = 100;
        height = 100;
        imageKey = 'pohon';
    } else if (typeRoll < 0.88) { // 8% Tumpukan Salju
        type = 'snow';
        color = '#FFFFFF';
        width = 30;
        height = 30;
    } else if (typeRoll < 0.96) { // 8% Hewan (Daging)
        type = 'food';
        color = '#A52A2A'; // Brown
        width = 40;
        height = 40;
        speed = Math.random() * 1 + 0.5; // 0.5 to 1.5
        direction = Math.random() * 2 * Math.PI;
        imageKey = 'hewan';
        hunger = 100; // Add hunger for food animals
    } else if (typeRoll < 0.98) { // 2% Herbal
        type = 'herbal';
        color = '#228B22'; // ForestGreen
        width = 30;
        height = 30;
        imageKey = 'herbal';
    } else { // 2% Serigala (Predator)
        type = 'predator';
        color = '#808080'; // Gray
        width = 40;
        height = 40;
        speed = Math.random() * 1.5 + 1; // 1 to 2.5
        direction = Math.random() * 2 * Math.PI;
        imageKey = 'serigala';
        hunger = 100; // Add hunger for predators
    }

    resources.push({
        x: Math.random() * (canvas.width - width),
        y: Math.random() * (canvas.height - height),
        width: width,
        height: height,
        type: type,
        color: color,
        speed: speed,
        direction: direction,
        imageKey: imageKey,
        hunger: hunger
    });
}

function getDistance(obj1, obj2) {
    const dx = obj1.x - obj2.x;
    const dy = obj1.y - obj2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

// --- Fungsi Update (Logika Game per Frame) ---

function update() {
    if (gameOver) return;

    // 1. Gerakan Player
    if (keys['w'] || keys['ArrowUp']) player.y -= player.speed;
    if (keys['s'] || keys['ArrowDown']) player.y += player.speed;
    if (keys['a'] || keys['ArrowLeft']) player.x -= player.speed;
    if (keys['d'] || keys['ArrowRight']) player.x += player.speed;

    // Batasi gerakan di dalam canvas
    player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
    player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));
    
    // 2. Update Status Player (Mekanik Survival)
    player.hunger -= 0.01;
    player.thirst -= 0.02;

    // INILAH SIMULASI PERSAMAAN PANAS KITA!
    let heatSourceEffect = 0;
    if (campfire && campfire.isLit) {
        const distance = getDistance(player, campfire);
        if (distance < campfire.heatRadius) {
            // Semakin dekat, semakin hangat. Ini meniru difusi panas.
            heatSourceEffect = campfire.heatValue * (1 - distance / campfire.heatRadius);
        }
    }

    // Suhu tubuh turun karena lingkungan, naik karena sumber panas
    const warmthChange = (ambientTemp / 10) + heatSourceEffect;
    player.warmth += warmthChange * 0.05;

    player.warmth = Math.max(0, Math.min(100, player.warmth));
    player.hunger = Math.max(0, player.hunger);
    player.thirst = Math.max(0, player.thirst);

    // Konsekuensi jika status buruk
    if (player.warmth <= 0) player.health -= 0.05;
    if (player.hunger <= 0) player.health -= 0.03;
    if (player.thirst <= 0) player.health -= 0.04;

    player.health = Math.max(0, player.health);

    if (player.health <= 0) {
        gameOver = true;
        messageDisplay.textContent = "Kamu mati kedinginan. Refresh untuk coba lagi.";
    }

    // 3. Update Api Unggun
    if (campfire && campfire.isLit) {
        campfire.fuel -= 0.02;
        if (campfire.fuel <= 0) {
            campfire.isLit = false;
        }
    }

    // 3.5. Update Kompor
    if (stove && stove.isLit) {
        stove.fuel -= 0.03;
        if (stove.fuel <= 0) {
            stove.isLit = false;
        }
    }

    // 4. Update Gerakan Hewan dan Predator dengan AI
    resources.forEach(res => {
        if ((res.type === 'food' || res.type === 'predator') && res.speed > 0) {
            // Update hunger for animals
            if (res.type === 'food' || res.type === 'predator') {
                res.hunger -= 0.005; // Hunger decreases over time
                res.hunger = Math.max(0, res.hunger);
            }

            // AI for predators: hunt food animals and player
            if (res.type === 'predator') {
                let target = null;
                let minDistance = Infinity;

                // Prioritize player if within close range (150) and hungry
                const playerDist = getDistance(res, player);
                if (playerDist < 150 && res.hunger < 70) { // Closer range and less hungry threshold
                    target = player;
                } else {
                    // Find closest food animal
                    resources.forEach(other => {
                        if (other.type === 'food') {
                            const dist = getDistance(res, other);
                            if (dist < minDistance) {
                                minDistance = dist;
                                target = other;
                            }
                        }
                    });

                    // If no food nearby, target player if hungry
                    if (!target && res.hunger < 50) {
                        if (playerDist < 250) { // Increased detection range
                            target = player;
                        }
                    }
                }

                // Adjust direction towards target
                if (target) {
                    const dx = target.x - res.x;
                    const dy = target.y - res.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist > 0) {
                        // Smooth turning using atan2 for natural movement
                        const targetAngle = Math.atan2(dy, dx);
                        const angleDiff = targetAngle - res.direction;
                        // Normalize angle difference to [-pi, pi]
                        const normalizedDiff = ((angleDiff + Math.PI) % (2 * Math.PI)) - Math.PI;
                        // Turn towards target
                        res.direction += Math.sign(normalizedDiff) * 0.05; // Turning speed
                    }
                    // Increase speed when hunting
                    res.speed = Math.min(3, res.speed + 0.01);
                } else {
                    // Random wandering when not hunting
                    res.direction += (Math.random() - 0.5) * 0.1; // Slight random direction change
                    res.speed = Math.max(1, res.speed - 0.005); // Slow down
                }
            } else if (res.type === 'food') {
                // AI for food animals: flee from predators
                let predatorNearby = false;
                resources.forEach(other => {
                    if (other.type === 'predator') {
                        const dist = getDistance(res, other);
                        if (dist < 100) { // Flee range
                            predatorNearby = true;
                            // Flee in opposite direction
                            const dx = res.x - other.x;
                            const dy = res.y - other.y;
                            const dist = Math.sqrt(dx * dx + dy * dy);
                            if (dist > 0) {
                                const fleeAngle = Math.atan2(dy, dx);
                                res.direction = fleeAngle + (Math.random() - 0.5) * 0.5; // Add some randomness
                            }
                            res.speed = Math.min(2, res.speed + 0.02); // Speed up when fleeing
                        }
                    }
                });

                if (!predatorNearby) {
                    // Random wandering
                    res.direction += (Math.random() - 0.5) * 0.05;
                    res.speed = Math.max(0.5, res.speed - 0.005);
                }
            }

            // Move based on current direction and speed
            res.x += Math.cos(res.direction) * res.speed;
            res.y += Math.sin(res.direction) * res.speed;

            // Bounce off walls
            if (res.x <= 0 || res.x >= canvas.width - res.width) {
                res.direction = Math.PI - res.direction;
            }
            if (res.y <= 0 || res.y >= canvas.height - res.height) {
                res.direction = -res.direction;
            }

            // Clamp position
            res.x = Math.max(0, Math.min(canvas.width - res.width, res.x));
            res.y = Math.max(0, Math.min(canvas.height - res.height, res.y));
        }
    });

    // 5. Predator menyerang player atau hewan jika tidak di shelter
    resources.forEach(res => {
        if (res.type === 'predator') {
            // Check for attacking player
            const playerDistance = getDistance(player, {x: res.x + res.width/2, y: res.y + res.height/2});
            if (playerDistance < 50) {
                // Cek jika player di dalam shelter
                let inShelter = false;
                if (shelter && getDistance(player, shelter) < shelter.protectionRadius) {
                    inShelter = true;
                }
                if (!inShelter) {
                    player.health -= 0.1; // Serangan predator
                    if (player.health <= 0) {
                        gameOver = true;
                        messageDisplay.textContent = "Kamu diserang serigala. Refresh untuk coba lagi.";
                    }
                }
            }

            // Check for attacking food animals
            resources.forEach(other => {
                if (other.type === 'food' && other !== res) {
                    const animalDistance = getDistance(res, other);
                    if (animalDistance < 30) { // Attack range for animals
                        // Remove the food animal
                        const index = resources.indexOf(other);
                        if (index > -1) {
                            resources.splice(index, 1);
                            // Predator gains hunger back
                            res.hunger = Math.min(100, res.hunger + 50);
                            // Generate new resource to replace
                            generateResource();
                        }
                    }
                }
            });
        }
    });

    // 6. Prevent animals from entering shelter area
    resources.forEach(res => {
        if (res.type === 'food' || res.type === 'predator') {
            if (shelter && getDistance(res, shelter) < shelter.protectionRadius) {
                // Push animal away from shelter
                const dx = res.x - shelter.x;
                const dy = res.y - shelter.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > 0) {
                    res.x += (dx / dist) * 2;
                    res.y += (dy / dist) * 2;
                }
                // Clamp position
                res.x = Math.max(0, Math.min(canvas.width - res.width, res.x));
                res.y = Math.max(0, Math.min(canvas.height - res.height, res.y));
            }
        }
    });
}

// --- Fungsi Draw (Menggambar semua ke Canvas) ---

function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Gambar Api Unggun & Radius Panasnya
    if (campfire) {
        if (campfire.isLit) {
            // Gambar radius panas (efek difusi)
            ctx.fillStyle = 'rgba(255, 165, 0, 0.2)';
            ctx.beginPath();
            ctx.arc(campfire.x, campfire.y, campfire.heatRadius, 0, Math.PI * 2);
            ctx.fill();

            // Gambar api menggunakan image
            if (images['apiunggun'].complete) {
                ctx.drawImage(images['apiunggun'], campfire.x - 20, campfire.y - 20, 40, 40);
            } else {
                ctx.fillStyle = 'orange';
                ctx.fillRect(campfire.x - 20, campfire.y - 20, 40, 40);
            }
        } else {
            // Gambar tumpukan kayu
            ctx.fillStyle = '#654321'; // Dark brown
            ctx.fillRect(campfire.x - 20, campfire.y - 20, 40, 40);
        }
    }

    // Gambar Kompor
    if (stove) {
        if (stove.isLit) {
            // Gambar api kecil untuk kompor
            ctx.fillStyle = 'orange';
            ctx.fillRect(stove.x - 5, stove.y - 5, 10, 10);
        } else {
            // Gambar kompor mati
            ctx.fillStyle = '#808080'; // Gray
            ctx.fillRect(stove.x - 10, stove.y - 10, 20, 20);
        }
    }

    // Gambar Shelter
    if (shelter) {
        if (images['shelter'].complete) {
            ctx.drawImage(images['shelter'], shelter.x - 20, shelter.y - 20, 80, 80);
        } else {
            ctx.fillStyle = '#8B4513'; // Brown
            ctx.fillRect(shelter.x - 20, shelter.y - 20, 80, 80);
        }
        // Gambar radius proteksi (untuk debugging)
        ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(shelter.x, shelter.y, shelter.protectionRadius, 0, Math.PI * 2);
        ctx.stroke();
    }

    // Gambar Sumber Daya
    resources.forEach(res => {
        if (res.imageKey && images[res.imageKey].complete) {
            ctx.drawImage(images[res.imageKey], res.x, res.y, res.width, res.height);
        } else {
            ctx.fillStyle = res.color;
            ctx.fillRect(res.x, res.y, res.width, res.height);
        }
    });

    // Gambar Player
    if (images['player'].complete) {
        ctx.drawImage(images['player'], player.x, player.y, player.width, player.height);
    } else {
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.width, player.height);
    }

    // Update Tampilan HUD
    healthDisplay.textContent = Math.round(player.health);
    warmthDisplay.textContent = Math.round(player.warmth);
    hungerDisplay.textContent = Math.round(player.hunger);
    thirstDisplay.textContent = Math.round(player.thirst);
    woodDisplay.textContent = player.inventory.wood;
    snowDisplay.textContent = player.inventory.snow;
    foodDisplay.textContent = player.inventory.food;
    cookedFoodDisplay.textContent = player.inventory.cookedFood;
    waterDisplay.textContent = player.inventory.water;
    hotWaterDisplay.textContent = player.inventory.hotWater;
    herbalDisplay.textContent = player.inventory.herbal;
    teaDisplay.textContent = player.inventory.tea;
    timeDisplay.textContent = isDay ? "Siang" : "Malam";
    tempDisplay.textContent = `${ambientTemp}°C`;
    daysDisplay.textContent = daysSurvived;
}

// --- Game Loop Utama ---

function gameLoop() {
    update();
    draw();
    if (!gameOver) {
        requestAnimationFrame(gameLoop);
    }
}

// --- Event Listeners untuk Kontrol ---

window.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;

    // Aksi sekali tekan
    if (e.key.toLowerCase() === 'e') {
        handleInteraction();
    }
    if (e.key === '1') {
        buildCampfire();
    }
    if (e.key === '2') {
        buildShelter();
    }
    if (e.key === '3') {
        buildStove();
    }
    if (e.key === '4') {
        consumeItem('cookedFood');
    }
    if (e.key === '5') {
        consumeItem('hotWater');
    }
    if (e.key === '6') {
        consumeItem('tea');
    }
    if (e.key === '7') {
        cookFood();
    }
    if (e.key === '8') {
        heatWater();
    }
    if (e.key === '9') {
        makeTea();
    }
});

window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

function handleInteraction() {
    let interactionDone = false;
    messageDisplay.textContent = "";

    // Cek interaksi dengan sumber daya
    for (let i = resources.length - 1; i >= 0; i--) {
        const res = resources[i];
        if (getDistance(player, {x: res.x + res.width/2, y: res.y + res.height/2}) < 30) {
            player.inventory[res.type]++;
            resources.splice(i, 1);
            generateResource();
            interactionDone = true;
            break;
        }
    }

    if (interactionDone) return;

    // Cek interaksi dengan api unggun
    if (campfire && getDistance(player, campfire) < 40) {
        if (!campfire.isLit && player.inventory.wood > 0) {
            campfire.isLit = true;
            campfire.fuel = 50; // Bahan bakar awal
            player.inventory.wood--;
            messageDisplay.textContent = "Api unggun dinyalakan!";
        } else if (campfire.isLit && player.inventory.wood > 0) {
            campfire.fuel += 50; // Menambah bahan bakar
            player.inventory.wood--;
            messageDisplay.textContent = "Kayu ditambahkan ke api.";
        }
    } else if (stove && getDistance(player, stove) < 40) {
        // Interaksi dengan kompor
        if (!stove.isLit && player.inventory.wood > 0) {
            stove.isLit = true;
            stove.fuel = 30; // Bahan bakar kompor
            player.inventory.wood--;
            messageDisplay.textContent = "Kompor dinyalakan!";
        } else if (stove.isLit && player.inventory.wood > 0) {
            stove.fuel += 30;
            player.inventory.wood--;
            messageDisplay.textContent = "Kayu ditambahkan ke kompor.";
        } else if (stove.isLit && player.inventory.food > 0) {
            player.inventory.food--;
            player.inventory.cookedFood++;
            messageDisplay.textContent = "Daging dimasak menjadi daging matang!";
        } else if (stove.isLit && player.inventory.snow > 0) {
            player.inventory.snow--;
            player.inventory.water++;
            messageDisplay.textContent = "Salju dilelehkan menjadi air.";
        }
    } else {
        // Jika tidak ada interaksi, buat api unggun baru
        if (player.inventory.wood >= 2 && !campfire) {
             campfire = {
                x: player.x,
                y: player.y,
                isLit: false,
                fuel: 0,
                heatRadius: 150,
                heatValue: 5 // Seberapa kuat panasnya
            };
            player.inventory.wood -= 2;
            messageDisplay.textContent = "Tempat api unggun dibuat. Tekan E lagi untuk menyalakan.";
        } else if (player.inventory.wood < 2 && !campfire) {
            messageDisplay.textContent = "Butuh 2 kayu untuk membuat api unggun.";
        }
    }
}

function buildCampfire() {
    if (player.inventory.wood >= 2 && !campfire) {
        campfire = {
            x: player.x,
            y: player.y,
            isLit: false,
            fuel: 0,
            heatRadius: 150,
            heatValue: 5
        };
        player.inventory.wood -= 2;
        messageDisplay.textContent = "Api unggun dibuat. Tekan E untuk menyalakan.";
    } else if (campfire) {
        messageDisplay.textContent = "Api unggun sudah ada.";
    } else {
        messageDisplay.textContent = "Butuh 2 kayu untuk membuat api unggun.";
    }
}

function buildShelter() {
    if (player.inventory.wood >= 5 && !shelter) {
        shelter = {
            x: player.x + player.width / 2,
            y: player.y + player.height / 2,
            protectionRadius: 150
        };
        player.inventory.wood -= 5;
        messageDisplay.textContent = "Shelter dibuat. Kamu aman dari serigala di dalamnya.";
    } else if (shelter) {
        messageDisplay.textContent = "Shelter sudah ada.";
    } else {
        messageDisplay.textContent = "Butuh 5 kayu untuk membuat shelter.";
    }
}

function buildStove() {
    if (player.inventory.wood >= 3 && !stove) {
        stove = {
            x: player.x,
            y: player.y,
            isLit: false,
            fuel: 0
        };
        player.inventory.wood -= 3;
        messageDisplay.textContent = "Kompor dibuat. Tekan E untuk menyalakan dan memasak.";
    } else if (stove) {
        messageDisplay.textContent = "Kompor sudah ada.";
    } else {
        messageDisplay.textContent = "Butuh 3 kayu untuk membuat kompor.";
    }
}

function consumeItem(itemType) {
    if (player.inventory[itemType] > 0) {
        player.inventory[itemType]--;
        if (itemType === 'food') {
            player.hunger = Math.min(100, player.hunger + 40);
            messageDisplay.textContent = "Kamu makan daging.";
        } else if (itemType === 'cookedFood') {
            player.hunger = Math.min(100, player.hunger + 60);
            player.health = Math.min(100, player.health + 5);
            messageDisplay.textContent = "Kamu makan daging matang. Lebih enak dan sehat!";
        } else if (itemType === 'water') {
            player.thirst = Math.min(100, player.thirst + 30);
            messageDisplay.textContent = "Kamu minum air.";
        } else if (itemType === 'hotWater') {
            player.thirst = Math.min(100, player.thirst + 50);
            player.warmth = Math.min(100, player.warmth + 10);
            messageDisplay.textContent = "Kamu minum air panas. Hangat dan menyegarkan!";
        } else if (itemType === 'tea') {
            player.warmth = Math.min(100, player.warmth + 20);
            player.health = Math.min(100, player.health + 10);
            messageDisplay.textContent = "Kamu minum teh. Hangat dan sehat!";
        }
    }
}

function cookFood() {
    if (stove && stove.isLit && player.inventory.food > 0) {
        player.inventory.food--;
        player.inventory.cookedFood++;
        messageDisplay.textContent = "Daging dimasak menjadi daging matang!";
    } else if (!stove) {
        messageDisplay.textContent = "Butuh kompor untuk memasak.";
    } else if (!stove.isLit) {
        messageDisplay.textContent = "Kompor harus dinyalakan.";
    } else {
        messageDisplay.textContent = "Butuh daging untuk dimasak.";
    }
}

function heatWater() {
    if (stove && stove.isLit && player.inventory.snow > 0) {
        player.inventory.snow--;
        player.inventory.hotWater++;
        messageDisplay.textContent = "Salju dipanaskan menjadi air panas!";
    } else if (!stove) {
        messageDisplay.textContent = "Butuh kompor untuk memanaskan salju.";
    } else if (!stove.isLit) {
        messageDisplay.textContent = "Kompor harus dinyalakan.";
    } else {
        messageDisplay.textContent = "Butuh salju untuk dipanaskan.";
    }
}

function makeTea() {
    if (stove && stove.isLit && player.inventory.herbal > 0 && player.inventory.hotWater > 0) {
        player.inventory.herbal--;
        player.inventory.hotWater--;
        player.inventory.tea++;
        messageDisplay.textContent = "Teh dibuat dari herbal dan air panas!";
    } else if (!stove) {
        messageDisplay.textContent = "Butuh kompor untuk membuat teh.";
    } else if (!stove.isLit) {
        messageDisplay.textContent = "Kompor harus dinyalakan.";
    } else if (player.inventory.herbal <= 0) {
        messageDisplay.textContent = "Butuh herbal untuk membuat teh.";
    } else {
        messageDisplay.textContent = "Butuh air panas untuk membuat teh.";
    }
}


// --- Event Listeners untuk Help Modal ---
document.getElementById('helpBtn').addEventListener('click', () => {
    document.getElementById('helpModal').classList.add('show');
});

document.getElementById('closeHelp').addEventListener('click', () => {
    document.getElementById('helpModal').classList.remove('show');
});

// Close modal when clicking outside
document.getElementById('helpModal').addEventListener('click', (e) => {
    if (e.target.id === 'helpModal') {
        document.getElementById('helpModal').classList.remove('show');
    }
});

// --- Mulai Game ---
for(let i=0; i<10; i++) generateResource(); // Generate sumber daya awal
setInterval(generateResource, 5000); // Generate sumber daya baru setiap 5 detik
gameLoop();
