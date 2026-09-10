/**
 * AstroSphere - Observatorio & Simulador Espacial Interactivo
 * Desarrollado con JavaScript moderno y Tailwind CSS
 */

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar Lucide Icons
    if (window.lucide) {
        window.lucide.createIcons();
    }

    // Inicializar módulos
    initStarfieldBackground();
    initAmbientAudio();
    initPhysicsSimulator();
    initCosmicCalculator();
    initMissionsExplorer();
    initAstronautBadge();
    initUIControls();
});

/* ==========================================================================
   1. LIENZO DE FONDO INTERACTIVO (STARFIELD & WARP DRIVE)
   ========================================================================== */
function initStarfieldBackground() {
    const canvas = document.getElementById('starfieldCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const starCount = 350;
    const stars = [];
    let isWarping = false;
    let baseSpeed = 0.6;
    let currentSpeed = baseSpeed;

    // Mouse parallax
    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;

    window.addEventListener('mousemove', (e) => {
        targetMouseX = e.clientX;
        targetMouseY = e.clientY;
    });

    // Generar estrellas iniciales
    for (let i = 0; i < starCount; i++) {
        stars.push({
            x: (Math.random() - 0.5) * width * 2,
            y: (Math.random() - 0.5) * height * 2,
            z: Math.random() * width,
            size: Math.random() * 1.6 + 0.4,
            color: Math.random() > 0.85 ? '#00F5D4' : (Math.random() > 0.7 ? '#F72585' : '#FFFFFF')
        });
    }

    // Toggle Hyperspace Warp
    const warpBtn = document.getElementById('hyperspaceBtn');
    const mobileWarpBtn = document.getElementById('mobileWarpBtn');

    function toggleWarp() {
        isWarping = !isWarping;
        const btnText = isWarping ? 'Warp ACTIVO' : 'Warp Drive';
        if (warpBtn) {
            warpBtn.querySelector('span').textContent = btnText;
            warpBtn.classList.toggle('bg-nebula-pink/20', isWarping);
            warpBtn.classList.toggle('border-nebula-pink', isWarping);
        }
        if (mobileWarpBtn) {
            mobileWarpBtn.classList.toggle('bg-nebula-pink/30', isWarping);
        }
    }

    if (warpBtn) warpBtn.addEventListener('click', toggleWarp);
    if (mobileWarpBtn) mobileWarpBtn.addEventListener('click', toggleWarp);

    // FPS Meter
    let lastTime = performance.now();
    let frameCount = 0;
    const fpsElem = document.getElementById('telemetryFps');

    function animate(time) {
        // Cálculo FPS
        frameCount++;
        if (time - lastTime >= 1000) {
            if (fpsElem) fpsElem.textContent = `${frameCount} FPS`;
            frameCount = 0;
            lastTime = time;
        }

        // Suavizado de mouse
        mouseX += (targetMouseX - mouseX) * 0.05;
        mouseY += (targetMouseY - mouseY) * 0.05;

        // Transición de velocidad Warp
        const targetSpeed = isWarping ? 25 : baseSpeed;
        currentSpeed += (targetSpeed - currentSpeed) * 0.1;

        // Fondo con desvanecimiento para estela de luz en warp
        ctx.fillStyle = isWarping ? 'rgba(3, 7, 18, 0.35)' : 'rgba(3, 7, 18, 0.85)';
        ctx.fillRect(0, 0, width, height);

        const cx = width / 2 + (mouseX - width / 2) * 0.08;
        const cy = height / 2 + (mouseY - height / 2) * 0.08;

        for (let i = 0; i < starCount; i++) {
            const star = stars[i];
            const prevZ = star.z;
            star.z -= currentSpeed;

            if (star.z <= 0) {
                star.z = width;
                star.x = (Math.random() - 0.5) * width * 2;
                star.y = (Math.random() - 0.5) * height * 2;
                continue;
            }

            const k = 250 / star.z;
            const px = star.x * k + cx;
            const py = star.y * k + cy;

            if (px >= 0 && px <= width && py >= 0 && py <= height) {
                const alpha = Math.min(1, (1 - star.z / width) * 1.5);
                ctx.fillStyle = star.color;
                ctx.globalAlpha = alpha;

                if (isWarping && currentSpeed > 4) {
                    const prevK = 250 / prevZ;
                    const oldPx = star.x * prevK + cx;
                    const oldPy = star.y * prevK + cy;

                    ctx.strokeStyle = star.color;
                    ctx.lineWidth = star.size * (1 - star.z / width) * 2;
                    ctx.beginPath();
                    ctx.moveTo(oldPx, oldPy);
                    ctx.lineTo(px, py);
                    ctx.stroke();
                } else {
                    const s = star.size * (1 - star.z / width) * 1.8;
                    ctx.beginPath();
                    ctx.arc(px, py, Math.max(0.5, s), 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
        ctx.globalAlpha = 1;

        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
}

/* ==========================================================================
   2. AUDIO AMBIENTAL PROCEDURAL (WEB AUDIO API)
   ========================================================================== */
function initAmbientAudio() {
    let audioCtx = null;
    let isPlaying = false;
    let masterGain = null;
    let osc1, osc2, subOsc, filter;

    const toggleBtn = document.getElementById('audioToggleBtn');
    const mobileBtn = document.getElementById('mobileAudioBtn');
    const statusText = document.getElementById('audioStatusText');
    const audioWave = document.getElementById('audioWave');

    function toggleSound() {
        if (!audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioCtx = new AudioContext();

            // Cadena de audio: osciladores -> filtro pasa bajos resonante -> ganancia general
            masterGain = audioCtx.createGain();
            masterGain.gain.setValueAtTime(0.01, audioCtx.currentTime);

            filter = audioCtx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(240, audioCtx.currentTime);
            filter.Q.setValueAtTime(4, audioCtx.currentTime);

            // Drone fundamental (55 Hz - Nota La/A1)
            osc1 = audioCtx.createOscillator();
            osc1.type = 'sawtooth';
            osc1.frequency.setValueAtTime(55, audioCtx.currentTime);

            // Armónico cálido desafinado (110.5 Hz)
            osc2 = audioCtx.createOscillator();
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(110.5, audioCtx.currentTime);

            // Subgrave profundo (27.5 Hz)
            subOsc = audioCtx.createOscillator();
            subOsc.type = 'triangle';
            subOsc.frequency.setValueAtTime(27.5, audioCtx.currentTime);

            // Conexiones
            osc1.connect(filter);
            osc2.connect(filter);
            subOsc.connect(filter);
            filter.connect(masterGain);
            masterGain.connect(audioCtx.destination);

            osc1.start();
            osc2.start();
            subOsc.start();
        }

        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        isPlaying = !isPlaying;

        if (isPlaying) {
            masterGain.gain.linearRampToValueAtTime(0.08, audioCtx.currentTime + 1.5);
            if (statusText) statusText.textContent = 'Audio ON';
            if (audioWave) audioWave.classList.remove('opacity-40');
            if (toggleBtn) {
                toggleBtn.classList.add('border-nebula-cyan', 'text-nebula-cyan');
            }
        } else {
            masterGain.gain.linearRampToValueAtTime(0.0001, audioCtx.currentTime + 0.8);
            if (statusText) statusText.textContent = 'Audio OFF';
            if (audioWave) audioWave.classList.add('opacity-40');
            if (toggleBtn) {
                toggleBtn.classList.remove('border-nebula-cyan', 'text-nebula-cyan');
            }
        }
    }

    if (toggleBtn) toggleBtn.addEventListener('click', toggleSound);
    if (mobileBtn) mobileBtn.addEventListener('click', toggleSound);
}

/* ==========================================================================
   3. SIMULADOR GRAVITATORIO EN TIEMPO REAL (CANVAS INTERACTIVO)
   ========================================================================== */
function initPhysicsSimulator() {
    const canvas = document.getElementById('physicsCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = (canvas.width = canvas.parentElement.clientWidth);
    let height = (canvas.height = canvas.parentElement.clientHeight || 500);

    window.addEventListener('resize', () => {
        if (!canvas.parentElement) return;
        width = canvas.width = canvas.parentElement.clientWidth;
        height = canvas.height = canvas.parentElement.clientHeight || 500;
        centerMass.x = width / 2;
        centerMass.y = height / 2;
    });

    const orbitBadge = document.getElementById('orbitCountBadge');
    let centerType = 'sun'; // 'sun' | 'blackhole'

    const centerMass = {
        x: width / 2,
        y: height / 2,
        mass: 3500,
        radius: 24
    };

    let bodies = [];
    const G = 0.8; // Constante gravitacional del simulador

    // Interacción de arrastre para lanzar satélites
    let isDragging = false;
    let dragStart = { x: 0, y: 0 };
    let dragCurrent = { x: 0, y: 0 };

    canvas.addEventListener('mousedown', (e) => {
        const rect = canvas.getBoundingClientRect();
        dragStart.x = e.clientX - rect.left;
        dragStart.y = e.clientY - rect.top;
        dragCurrent.x = dragStart.x;
        dragCurrent.y = dragStart.y;
        isDragging = true;
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const rect = canvas.getBoundingClientRect();
        dragCurrent.x = e.clientX - rect.left;
        dragCurrent.y = e.clientY - rect.top;
    });

    canvas.addEventListener('mouseup', () => {
        if (!isDragging) return;
        isDragging = false;

        const vx = (dragStart.x - dragCurrent.x) * 0.05;
        const vy = (dragStart.y - dragCurrent.y) * 0.05;

        // Lanzar nuevo satélite
        spawnBody(dragStart.x, dragStart.y, vx, vy);
    });

    // Touch support for mobile devices
    canvas.addEventListener('touchstart', (e) => {
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        dragStart.x = touch.clientX - rect.left;
        dragStart.y = touch.clientY - rect.top;
        dragCurrent.x = dragStart.x;
        dragCurrent.y = dragStart.y;
        isDragging = true;
        e.preventDefault();
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        dragCurrent.x = touch.clientX - rect.left;
        dragCurrent.y = touch.clientY - rect.top;
        e.preventDefault();
    }, { passive: false });

    canvas.addEventListener('touchend', () => {
        if (!isDragging) return;
        isDragging = false;
        const vx = (dragStart.x - dragCurrent.x) * 0.05;
        const vy = (dragStart.y - dragCurrent.y) * 0.05;
        spawnBody(dragStart.x, dragStart.y, vx, vy);
    });

    function spawnBody(x, y, vx, vy, color, radius) {
        const palette = ['#00F5D4', '#4CC9F0', '#F72585', '#7209B7', '#FFD166'];
        const chosenColor = color || palette[Math.floor(Math.random() * palette.length)];

        bodies.push({
            x: x,
            y: y,
            vx: vx,
            vy: vy,
            mass: 2,
            radius: radius || Math.random() * 2.5 + 3,
            color: chosenColor,
            trail: []
        });

        updateOrbitCount();
    }

    function updateOrbitCount() {
        if (orbitBadge) orbitBadge.textContent = bodies.length;
    }

    // Botones de control del simulador
    const sunBtn = document.getElementById('modeSunBtn');
    const blackHoleBtn = document.getElementById('modeBlackHoleBtn');
    const clearBtn = document.getElementById('clearParticlesBtn');
    const presetBtn = document.getElementById('presetSystemBtn');

    if (sunBtn && blackHoleBtn) {
        sunBtn.addEventListener('click', () => {
            centerType = 'sun';
            centerMass.mass = 3500;
            centerMass.radius = 24;
            sunBtn.className = 'px-3 py-1.5 rounded-lg bg-nebula-gold text-space-950 font-bold transition-all';
            blackHoleBtn.className = 'px-3 py-1.5 rounded-lg text-slate-300 hover:text-white transition-all';
        });

        blackHoleBtn.addEventListener('click', () => {
            centerType = 'blackhole';
            centerMass.mass = 6000;
            centerMass.radius = 16;
            blackHoleBtn.className = 'px-3 py-1.5 rounded-lg bg-nebula-purple text-white font-bold transition-all';
            sunBtn.className = 'px-3 py-1.5 rounded-lg text-slate-300 hover:text-white transition-all';
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            bodies = [];
            updateOrbitCount();
        });
    }

    function generatePreset() {
        bodies = [];
        const orbitalRadii = [80, 140, 210, 300];
        const colors = ['#00F5D4', '#4CC9F0', '#FFD166', '#F72585'];

        orbitalRadii.forEach((r, idx) => {
            // Velocidad circular v = sqrt(G*M / r)
            const speed = Math.sqrt((G * centerMass.mass) / r);
            const x = centerMass.x + r;
            const y = centerMass.y;
            spawnBody(x, y, 0, -speed, colors[idx % colors.length], 4);
        });
    }

    if (presetBtn) {
        presetBtn.addEventListener('click', generatePreset);
    }

    // Generar sistema inicial por defecto
    generatePreset();

    // Bucle de renderizado y física
    function updatePhysics() {
        ctx.fillStyle = 'rgba(3, 7, 18, 0.28)';
        ctx.fillRect(0, 0, width, height);

        // 1. Dibujar cuerpo masivo central
        if (centerType === 'sun') {
            // Corona solar radiante
            const gradient = ctx.createRadialGradient(
                centerMass.x, centerMass.y, 4,
                centerMass.x, centerMass.y, centerMass.radius * 2.5
            );
            gradient.addColorStop(0, '#FFFFFF');
            gradient.addColorStop(0.3, '#FFD166');
            gradient.addColorStop(0.7, '#F77F00');
            gradient.addColorStop(1, 'rgba(214, 40, 40, 0)');

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(centerMass.x, centerMass.y, centerMass.radius * 2.5, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#FFE49E';
            ctx.beginPath();
            ctx.arc(centerMass.x, centerMass.y, centerMass.radius, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Agujero Negro con Disco de Acreción
            const diskGradient = ctx.createRadialGradient(
                centerMass.x, centerMass.y, centerMass.radius,
                centerMass.x, centerMass.y, centerMass.radius * 3.5
            );
            diskGradient.addColorStop(0, 'rgba(0, 245, 212, 0.9)');
            diskGradient.addColorStop(0.4, 'rgba(123, 44, 191, 0.6)');
            diskGradient.addColorStop(0.8, 'rgba(247, 37, 133, 0.3)');
            diskGradient.addColorStop(1, 'rgba(0,0,0,0)');

            ctx.fillStyle = diskGradient;
            ctx.beginPath();
            ctx.arc(centerMass.x, centerMass.y, centerMass.radius * 3.5, 0, Math.PI * 2);
            ctx.fill();

            // Singularity (Horizonte de sucesos)
            ctx.fillStyle = '#000000';
            ctx.beginPath();
            ctx.arc(centerMass.x, centerMass.y, centerMass.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // 2. Línea guía de lanzamiento si el usuario arrastra
        if (isDragging) {
            ctx.strokeStyle = '#00F5D4';
            ctx.setLineDash([4, 4]);
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(dragStart.x, dragStart.y);
            ctx.lineTo(dragCurrent.x, dragCurrent.y);
            ctx.stroke();
            ctx.setLineDash([]);

            // Marcador de punto de origen
            ctx.fillStyle = '#00F5D4';
            ctx.beginPath();
            ctx.arc(dragStart.x, dragStart.y, 5, 0, Math.PI * 2);
            ctx.fill();
        }

        // 3. Actualizar y dibujar satélites
        for (let i = bodies.length - 1; i >= 0; i--) {
            const b = bodies[i];

            // Distancia al centro
            const dx = centerMass.x - b.x;
            const dy = centerMass.y - b.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Detección de colisión / absorción por el centro
            if (dist < centerMass.radius + 2) {
                bodies.splice(i, 1);
                updateOrbitCount();
                continue;
            }

            // Aceleración gravitacional (F = G * M / r^2)
            const force = (G * centerMass.mass) / (dist * dist);
            const ax = force * (dx / dist);
            const ay = force * (dy / dist);

            b.vx += ax;
            b.vy += ay;
            b.x += b.vx;
            b.y += b.vy;

            // Historial de estela
            b.trail.push({ x: b.x, y: b.y });
            if (b.trail.length > 25) b.trail.shift();

            // Dibujar estela orbital
            if (b.trail.length > 1) {
                ctx.strokeStyle = b.color;
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                for (let t = 0; t < b.trail.length; t++) {
                    const pt = b.trail[t];
                    ctx.globalAlpha = (t / b.trail.length) * 0.7;
                    if (t === 0) ctx.moveTo(pt.x, pt.y);
                    else ctx.lineTo(pt.x, pt.y);
                }
                ctx.stroke();
                ctx.globalAlpha = 1;
            }

            // Dibujar cuerpo
            ctx.fillStyle = b.color;
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
            ctx.fill();
        }

        requestAnimationFrame(updatePhysics);
    }

    requestAnimationFrame(updatePhysics);
}

/* ==========================================================================
   4. CALCULADORA DE PESO Y EDAD CÓSMICA
   ========================================================================== */
function initCosmicCalculator() {
    const earthWeightInput = document.getElementById('earthWeight');
    const earthAgeInput = document.getElementById('earthAge');
    const resultsContainer = document.getElementById('planetResultsGrid');
    const presets = document.querySelectorAll('.preset-val');

    if (!earthWeightInput || !earthAgeInput || !resultsContainer) return;

    const planetsData = [
        {
            name: 'Mercurio',
            type: 'Planeta Rocoso',
            gravityFactor: 0.38,
            yearFactor: 0.24,
            accentColor: 'text-amber-400',
            bgGradient: 'from-amber-950/30 to-space-950',
            borderColor: 'border-amber-500/20',
            icon: 'circle-dot',
            description: 'Un año dura tan solo 88 días terrestres.'
        },
        {
            name: 'Venus',
            type: 'Atmósfera Extrema',
            gravityFactor: 0.91,
            yearFactor: 0.615,
            accentColor: 'text-orange-400',
            bgGradient: 'from-orange-950/30 to-space-950',
            borderColor: 'border-orange-500/20',
            icon: 'flame',
            description: 'Efecto invernadero desbocado a 465°C.'
        },
        {
            name: 'La Luna',
            type: 'Satélite Natural',
            gravityFactor: 0.166,
            yearFactor: 1.0,
            accentColor: 'text-slate-300',
            bgGradient: 'from-slate-800/30 to-space-950',
            borderColor: 'border-slate-500/20',
            icon: 'moon',
            description: 'Podrías dar saltos de casi 3 metros de altura.'
        },
        {
            name: 'Marte',
            type: 'Planeta Rojo',
            gravityFactor: 0.38,
            yearFactor: 1.88,
            accentColor: 'text-rose-400',
            bgGradient: 'from-rose-950/30 to-space-950',
            borderColor: 'border-rose-500/20',
            icon: 'globe',
            description: 'Futuro hogar de las primeras colonias humanas.'
        },
        {
            name: 'Júpiter',
            type: 'Gigante Gaseoso',
            gravityFactor: 2.34,
            yearFactor: 11.86,
            accentColor: 'text-amber-500',
            bgGradient: 'from-yellow-950/30 to-space-950',
            borderColor: 'border-yellow-500/20',
            icon: 'disc',
            description: 'Masa 318 veces superior a la Tierra.'
        },
        {
            name: 'Saturno',
            type: 'Señor de los Anillos',
            gravityFactor: 1.06,
            yearFactor: 29.45,
            accentColor: 'text-yellow-300',
            bgGradient: 'from-amber-900/30 to-space-950',
            borderColor: 'border-yellow-500/20',
            icon: 'circle',
            description: 'Flotaría en agua debido a su baja densidad.'
        },
        {
            name: 'Titán',
            type: 'Luna de Saturno',
            gravityFactor: 0.14,
            yearFactor: 29.45,
            accentColor: 'text-teal-400',
            bgGradient: 'from-teal-950/30 to-space-950',
            borderColor: 'border-teal-500/20',
            icon: 'droplets',
            description: 'Posee lagos y nubes de hidrocarburos líquidos.'
        },
        {
            name: 'Neptuno',
            type: 'Gigante de Hielo',
            gravityFactor: 1.14,
            yearFactor: 164.8,
            accentColor: 'text-blue-400',
            bgGradient: 'from-blue-950/30 to-space-950',
            borderColor: 'border-blue-500/20',
            icon: 'wind',
            description: 'Los vientos más violentos del sistema (>2,000 km/h).'
        }
    ];

    function calculateAndRender() {
        const weight = parseFloat(earthWeightInput.value) || 0;
        const age = parseFloat(earthAgeInput.value) || 0;

        resultsContainer.innerHTML = '';

        planetsData.forEach((planet) => {
            const planetWeight = (weight * planet.gravityFactor).toFixed(1);
            const planetAge = planet.yearFactor > 0 ? (age / planet.yearFactor).toFixed(1) : 0;

            const card = document.createElement('div');
            card.className = `p-5 rounded-3xl bg-gradient-to-b ${planet.bgGradient} border ${planet.borderColor} backdrop-blur-xl shadow-lg hover:border-white/30 transition-all hover:scale-[1.02] flex flex-col justify-between`;

            card.innerHTML = `
                <div>
                    <div class="flex items-center justify-between mb-3">
                        <div class="flex items-center gap-2">
                            <span class="w-2.5 h-2.5 rounded-full bg-current ${planet.accentColor}"></span>
                            <h4 class="font-display font-bold text-white text-base">${planet.name}</h4>
                        </div>
                        <span class="text-[10px] font-mono text-slate-400 uppercase">${planet.type}</span>
                    </div>
                    <p class="text-xs text-slate-300 leading-relaxed mb-4">${planet.description}</p>
                </div>

                <div class="grid grid-cols-2 gap-2 pt-3 border-t border-white/10 text-xs font-mono">
                    <div class="bg-space-950/60 p-2.5 rounded-xl border border-white/5">
                        <span class="text-[10px] text-slate-400 block">Tu Peso</span>
                        <span class="font-display font-bold text-sm ${planet.accentColor}">${planetWeight} kg</span>
                    </div>
                    <div class="bg-space-950/60 p-2.5 rounded-xl border border-white/5">
                        <span class="text-[10px] text-slate-400 block">Tu Edad</span>
                        <span class="font-display font-bold text-sm text-white">${planetAge} años</span>
                    </div>
                </div>
            `;

            resultsContainer.appendChild(card);
        });

        if (window.lucide) window.lucide.createIcons();
    }

    earthWeightInput.addEventListener('input', calculateAndRender);
    earthAgeInput.addEventListener('input', calculateAndRender);

    presets.forEach(btn => {
        btn.addEventListener('click', () => {
            earthWeightInput.value = btn.getAttribute('data-weight');
            earthAgeInput.value = btn.getAttribute('data-age');
            calculateAndRender();
        });
    });

    calculateAndRender();
}

/* ==========================================================================
   5. ARCHIVO DE MISIONES Y MODAL DE ESPECIFICACIONES
   ========================================================================== */
function initMissionsExplorer() {
    const missionsGrid = document.getElementById('missionsGrid');
    const searchInput = document.getElementById('missionSearchInput');
    const filterButtons = document.querySelectorAll('#missionFilterGroup .filter-btn');

    if (!missionsGrid) return;

    const missionsList = [
        {
            id: 'jwst',
            title: 'James Webb Space Telescope',
            category: 'telescopio',
            categoryName: 'Telescopio Espacial',
            year: '2021',
            agency: 'NASA / ESA / CSA',
            status: 'Operativo 100%',
            statusColor: 'emerald',
            target: 'Universo Primitivo',
            distance: '1.5M km (L2)',
            payload: 'Espejo Hexagonal Oro 6.5m',
            description: 'El observatorio astronómico en el infrarrojo más potente de la historia. Capaz de observar las primeras estrellas nacidas tras el Big Bang.',
            icon: 'telescope'
        },
        {
            id: 'voyager1',
            title: 'Voyager 1 Interstellar',
            category: 'sonda',
            categoryName: 'Sonda Interestelar',
            year: '1977',
            agency: 'NASA JPL',
            status: 'En Espacio Interestelar',
            statusColor: 'nebula-cyan',
            target: 'Heliopausa & Más Allá',
            distance: '>24,000M km',
            payload: 'Disco de Oro Interestelar',
            description: 'El objeto fabricado por la especie humana que más lejos ha viajado. Continúa enviando datos científicos a través del vacío cósmico.',
            icon: 'compass'
        },
        {
            id: 'perseverance',
            title: 'Perseverance & Ingenuity',
            category: 'sonda',
            categoryName: 'Rover & Dron Marciano',
            year: '2020',
            agency: 'NASA',
            status: 'Explorando Cráter Jezero',
            statusColor: 'emerald',
            target: 'Marte',
            distance: '225M km',
            payload: 'MOXIE, SHERLOC & Helicóptero',
            description: 'Búsqueda de biofirmas del pasado marciano y recolección de testigos geológicos para su futuro retorno a la Tierra.',
            icon: 'cpu'
        },
        {
            id: 'artemis',
            title: 'Misión Artemisa II & III',
            category: 'tripulada',
            categoryName: 'Misión Tripulada Lunar',
            year: '2025-2026',
            agency: 'NASA / Socios Globales',
            status: 'En Preparación',
            statusColor: 'nebula-gold',
            target: 'Polo Sur Lunar',
            distance: '384,400 km',
            payload: 'Nave Orion & SLS',
            description: 'El regreso de la humanidad a la superficie de la Luna para establecer una base permanente de investigación previa a Marte.',
            icon: 'rocket'
        },
        {
            id: 'hubble',
            title: 'Telescopio Espacial Hubble',
            category: 'telescopio',
            categoryName: 'Observatorio Óptico',
            year: '1990',
            agency: 'NASA / ESA',
            status: '34+ Años en Servicio',
            statusColor: 'emerald',
            target: 'Órbita Terrestre Baja',
            distance: '540 km',
            payload: 'Espejo de 2.4 metros',
            description: 'Ha revolucionado nuestra comprensión cósmica, determinando la tasa de expansión cósmica y fotografiando galaxias a miles de millones de años luz.',
            icon: 'eye'
        },
        {
            id: 'europa-clipper',
            title: 'Europa Clipper Mission',
            category: 'sonda',
            categoryName: 'Exploración Oceánica',
            year: '2024',
            agency: 'NASA',
            status: 'En Tránsito a Júpiter',
            statusColor: 'nebula-pink',
            target: 'Luna Europa (Júpiter)',
            distance: '628M km',
            payload: 'Radar Penetrador de Hielo',
            description: 'Investigación del colosal océano de agua líquida bajo la corteza de hielo de Europa, uno de los candidatos con mayor potencial de albergar vida.',
            icon: 'droplets'
        }
    ];

    let currentCategory = 'all';
    let currentQuery = '';

    function renderMissions() {
        missionsGrid.innerHTML = '';

        const filtered = missionsList.filter(m => {
            const matchesCat = currentCategory === 'all' || m.category === currentCategory;
            const matchesText = m.title.toLowerCase().includes(currentQuery) ||
                                m.description.toLowerCase().includes(currentQuery) ||
                                m.target.toLowerCase().includes(currentQuery);
            return matchesCat && matchesText;
        });

        if (filtered.length === 0) {
            missionsGrid.innerHTML = `
                <div class="col-span-full py-12 text-center text-slate-400">
                    <i data-lucide="search-x" class="w-10 h-10 mx-auto mb-3 text-slate-500"></i>
                    <p class="font-mono text-sm">No se encontraron misiones que coincidan con la búsqueda.</p>
                </div>
            `;
            if (window.lucide) window.lucide.createIcons();
            return;
        }

        filtered.forEach(mission => {
            const card = document.createElement('div');
            card.className = 'group p-6 rounded-3xl bg-space-950/70 border border-white/10 hover:border-nebula-cyan/50 backdrop-blur-xl shadow-xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between';

            card.innerHTML = `
                <div>
                    <div class="flex items-center justify-between mb-4">
                        <div class="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-nebula-cyan group-hover:scale-110 transition-transform">
                            <i data-lucide="${mission.icon}" class="w-5 h-5"></i>
                        </div>
                        <span class="text-[11px] font-mono px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
                            ${mission.year}
                        </span>
                    </div>

                    <span class="text-[10px] font-mono text-nebula-cyan uppercase tracking-wider block mb-1">
                        ${mission.categoryName}
                    </span>
                    <h3 class="font-display font-bold text-lg text-white mb-2 group-hover:text-nebula-cyan transition-colors">
                        ${mission.title}
                    </h3>
                    <p class="text-xs text-slate-300 leading-relaxed line-clamp-3 mb-6">
                        ${mission.description}
                    </p>
                </div>

                <div class="pt-4 border-t border-white/10 space-y-3">
                    <div class="flex items-center justify-between text-xs font-mono">
                        <span class="text-slate-400">Objetivo:</span>
                        <span class="text-white font-medium">${mission.target}</span>
                    </div>
                    <button class="view-detail-btn w-full py-2.5 rounded-xl bg-white/5 hover:bg-nebula-cyan hover:text-space-950 text-slate-200 text-xs font-mono font-semibold transition-all border border-white/10 hover:border-transparent flex items-center justify-center gap-2" data-id="${mission.id}">
                        <i data-lucide="file-text" class="w-3.5 h-3.5"></i>
                        Ver Ficha Técnica
                    </button>
                </div>
            `;

            missionsGrid.appendChild(card);
        });

        if (window.lucide) window.lucide.createIcons();

        // Enlazar clics de Ficha Técnica
        document.querySelectorAll('.view-detail-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const missionId = btn.getAttribute('data-id');
                const mission = missionsList.find(m => m.id === missionId);
                if (mission) openModal(mission);
            });
        });
    }

    // Filtros de categoría
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentCategory = btn.getAttribute('data-filter');
            renderMissions();
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentQuery = e.target.value.toLowerCase().trim();
            renderMissions();
        });
    }

    renderMissions();

    // Lógica del Modal de Ficha Técnica
    const modal = document.getElementById('missionModal');
    const modalCard = document.getElementById('modalCard');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const modalActionClose = document.getElementById('modalActionClose');

    function openModal(mission) {
        document.getElementById('modalTitle').textContent = mission.title;
        document.getElementById('modalDescription').textContent = mission.description;
        document.getElementById('modalTypeBadge').textContent = mission.categoryName;
        document.getElementById('modalSpecLaunch').textContent = mission.year;
        document.getElementById('modalSpecDistance').textContent = mission.distance;
        document.getElementById('modalSpecStatus').textContent = mission.status;
        document.getElementById('modalSpecPayload').textContent = mission.payload;
        document.getElementById('modalSpecAgency').textContent = mission.agency;
        document.getElementById('modalSpecTarget').textContent = mission.target;

        const iconContainer = document.getElementById('modalIconContainer');
        iconContainer.innerHTML = `<i data-lucide="${mission.icon}" class="w-6 h-6"></i>`;
        if (window.lucide) window.lucide.createIcons();

        modal.classList.remove('opacity-0', 'pointer-events-none');
        modalCard.classList.remove('scale-95');
        modalCard.classList.add('scale-100');
    }

    function closeModal() {
        modal.classList.add('opacity-0', 'pointer-events-none');
        modalCard.classList.remove('scale-100');
        modalCard.classList.add('scale-95');
    }

    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (modalActionClose) modalActionClose.addEventListener('click', closeModal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });
}

/* ==========================================================================
   6. GENERADOR DE CREDENCIAL / PASAPORTE DE ASTRONAUTA
   ========================================================================== */
function initAstronautBadge() {
    const nameInput = document.getElementById('badgeNameInput');
    const roleSelect = document.getElementById('badgeRoleSelect');
    const colonySelect = document.getElementById('badgeColonySelect');
    const iconButtons = document.querySelectorAll('#badgeIconPicker .icon-pick-btn');
    const randomBtn = document.getElementById('randomBadgeBtn');
    const printBtn = document.getElementById('printBadgeBtn');

    // Elementos de la tarjeta
    const cardName = document.getElementById('cardNameDisplay');
    const cardRole = document.getElementById('cardRoleDisplay');
    const cardColony = document.getElementById('cardColonyDisplay');
    const cardId = document.getElementById('cardIdDisplay');
    const badgeAvatarIcon = document.getElementById('badgeAvatarIcon');

    if (!nameInput || !cardName) return;

    function updateBadge() {
        cardName.textContent = nameInput.value.trim() || 'Cadete Anónimo';
        cardRole.textContent = roleSelect.value;
        cardColony.textContent = colonySelect.value.split('(')[0].trim();
    }

    nameInput.addEventListener('input', updateBadge);
    roleSelect.addEventListener('change', updateBadge);
    colonySelect.addEventListener('change', updateBadge);

    // Selección de icono
    iconButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            iconButtons.forEach(b => {
                b.classList.remove('active', 'border-nebula-cyan', 'text-nebula-cyan');
                b.classList.add('border-white/10', 'text-slate-400');
            });
            btn.classList.add('active', 'border-nebula-cyan', 'text-nebula-cyan');
            btn.classList.remove('border-white/10', 'text-slate-400');

            const iconName = btn.getAttribute('data-icon');
            badgeAvatarIcon.innerHTML = `<i data-lucide="${iconName}" class="w-9 h-9"></i>`;
            if (window.lucide) window.lucide.createIcons();
        });
    });

    // Generador aleatorio
    const randomNames = [
        'Dra. Alexia Vance',
        'Capitán Leo Stryker',
        'Ing. Elena Rostova',
        'Científico Marcus Chen',
        'Dra. Naomi Tanaka',
        'Piloto Mateo Sterling'
    ];

    function generateRandomBadge() {
        const randomName = randomNames[Math.floor(Math.random() * randomNames.length)];
        nameInput.value = randomName;

        roleSelect.selectedIndex = Math.floor(Math.random() * roleSelect.options.length);
        colonySelect.selectedIndex = Math.floor(Math.random() * colonySelect.options.length);

        const randomCode = Math.floor(1000 + Math.random() * 9000);
        const randomChar = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        cardId.textContent = `ASTRO-${randomCode}-${randomChar}`;

        const randomIconIndex = Math.floor(Math.random() * iconButtons.length);
        iconButtons[randomIconIndex].click();

        updateBadge();
    }

    if (randomBtn) randomBtn.addEventListener('click', generateRandomBadge);

    if (printBtn) {
        printBtn.addEventListener('click', () => {
            window.print();
        });
    }

    updateBadge();
}

/* ==========================================================================
   7. CONTROLES DE INTERFAZ GENERAL Y SCROLL SUAVE
   ========================================================================== */
function initUIControls() {
    // Menú móvil
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });

        // Cerrar menú al hacer clic en un enlace
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
            });
        });
    }

    // Botón volver arriba
    const backToTopBtn = document.getElementById('backToTopBtn');
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Efecto interactivo en la esfera del planeta Hero
    const heroPlanet = document.getElementById('heroPlanetSphere');
    if (heroPlanet) {
        heroPlanet.addEventListener('click', () => {
            // Pulso cósmico visual
            heroPlanet.classList.add('scale-125', 'rotate-45');
            setTimeout(() => {
                heroPlanet.classList.remove('scale-125', 'rotate-45');
            }, 600);
        });
    }
}
