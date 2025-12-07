// script.js
// Advanced Dino Runner — vanilla JS + Canvas
// No external assets. Responsive, touch-friendly, with powerups & particles.

// -------------------- Utilities --------------------
const qs = (s) => document.querySelector(s);
const qsa = (s) => Array.from(document.querySelectorAll(s));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* Input mapping */
const Keys = {
  JUMP: ['ArrowUp', 'Space', 'KeyW'],
  DUCK: ['ArrowDown', 'KeyS'],
};

const canvas = qs('#game');
const ctx = canvas.getContext('2d', { alpha: false });

let DPR = Math.max(1, window.devicePixelRatio || 1);

// Resize canvas to element's displayed size * DPR
function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.floor(rect.width * DPR);
  canvas.height = Math.floor(rect.height * DPR);
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}
window.addEventListener('resize', () => {
  DPR = Math.max(1, window.devicePixelRatio || 1);
  resizeCanvas();
});

// Simple audio synth (short beeps)
class Beeper {
  constructor() {
    this.ctx = null;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) { this.ctx = null; }
  }
  beep(freq = 440, time = 0.08, type='sine', vol=0.06) {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = vol;
    o.connect(g); g.connect(ctx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + time);
    o.stop(ctx.currentTime + time + 0.02);
  }
}
const beeper = new Beeper();

// -------------------- Game Constants --------------------
const G = 2200; // gravity px/s^2
const RUN_SPEED = 520; // ground speed px/s
const JUMP_V = -750; // initial jump velocity px/s
const DUCK_H = 28; // ducked height
const WALK_H = 48; // standing height
const DINO_X = 90; // x-position for dino
const SPAWN_INTERVAL_BASE = 1.2; // seconds

// -------------------- Game State --------------------
let lastTs = 0;
let running = false;
let paused = false;
let gameOver = false;

const state = {
  score: 0,
  highscore: Number(localStorage.getItem('sitedino_high') || 0),
  speed: RUN_SPEED,
  difficulty: 1,
  obstacles: [],
  particles: [],
  clouds: [],
  powerups: [],
  groundOffset: 0,
};

// -------------------- Input --------------------
const input = {
  isJump: false,
  isDuck: false,
  mouseDown: false,
};

window.addEventListener('keydown', (e) => {
  if (Keys.JUMP.includes(e.code)) { input.isJump = true; e.preventDefault(); }
  if (Keys.DUCK.includes(e.code)) { input.isDuck = true; e.preventDefault(); }
  if (e.code === 'KeyP') togglePause();
  if (e.code === 'KeyR') restart();
});
window.addEventListener('keyup', (e) => {
  if (Keys.JUMP.includes(e.code)) input.isJump = false;
  if (Keys.DUCK.includes(e.code)) input.isDuck = false;
});

qs('#jumpBtn').addEventListener('touchstart', (e) => { e.preventDefault(); input.isJump = true; });
qs('#jumpBtn').addEventListener('touchend', (e) => { e.preventDefault(); input.isJump = false; });

qs('#duckBtn').addEventListener('touchstart', (e) => { e.preventDefault(); input.isDuck = true; });
qs('#duckBtn').addEventListener('touchend', (e) => { e.preventDefault(); input.isDuck = false; });

qs('#btnPause').addEventListener('click', togglePause);
qs('#btnRestart').addEventListener('click', restart);
qs('#playBtn').addEventListener('click', () => {
  hideMessage();
  start();
});
qs('#shareBtn').addEventListener('click', () => {
  const text = `I scored ${state.score} on SiteDino! Can you beat me?`;
  if (navigator.share) {
    navigator.share({ title: 'SiteDino Score', text }).catch(()=>{});
  } else {
    navigator.clipboard.writeText(text);
    alert('Score copied to clipboard!');
  }
});

// -------------------- Dino (player) --------------------
class Dino {
  constructor() {
    this.x = DINO_X;
    this.y = 0; // top of the dino relative to ground baseline
    this.width = 58;
    this.height = WALK_H;
    this.vy = 0;
    this.onGround = true;
    this.ducking = false;
    this.doubleJumped = false;
    this.shield = 0; // seconds left of shield powerup
    this.scoreMult = 1;
  }

  update(dt) {
    // duck handling
    this.ducking = input.isDuck && this.onGround;
    const targetH = this.ducking ? DUCK_H : WALK_H;
    // smooth height change
    this.height += (targetH - this.height) * clamp(15 * dt, 0, 1);

    // jump handling
    if (input.isJump) {
      if (this.onGround) {
        this.vy = JUMP_V;
        this.onGround = false;
        beeper.beep(540, 0.08);
      } else if (!this.doubleJumped && this.vy > -50) {
        // allow a weak double jump if player taps again while falling slowly
        this.vy = JUMP_V * 0.82;
        this.doubleJumped = true;
        beeper.beep(660, 0.06, 'square', 0.06);
      }
      input.isJump = false; // consume single tap
    }

    // physics
    if (!this.onGround) {
      this.vy += G * dt;
      this.y += this.vy * dt;
      if (this.y >= 0) {
        this.y = 0;
        this.vy = 0;
        this.onGround = true;
        this.doubleJumped = false;
        // landing particles
        spawnParticles(this.x + 8, canvas.height - groundLevel() - this.height/2, 10, 'dust');
        beeper.beep(180, 0.03, 'sine', 0.04);
      }
    }

    // shield timer & score multiplier timer decay (if implemented)
    if (this.shield > 0) this.shield = Math.max(0, this.shield - dt);
    if (this.scoreMult > 1) {
      this.scoreMult = Math.max(1, this.scoreMult - dt * 0.02);
    }
  }

  getBounds() {
    // return bounding box in canvas coordinates
    const ground = groundLevel();
    const h = this.height;
    const yTop = canvas.height - ground - h + this.y;
    return {
      x: this.x,
      y: yTop,
      w: this.width,
      h: h
    };
  }

  draw(ctx) {
    const b = this.getBounds();
    ctx.save();
    ctx.translate(b.x, b.y);

    // body shadow
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    ctx.fillRect(4, b.h - 4, this.width - 6, 6);

    // draw a stylized dino using shapes (no images)
    // body
    ctx.fillStyle = '#164e63';
    roundRect(ctx, 0, 0, this.width, b.h - 6, 8);
    // belly
    ctx.fillStyle = '#1e293b';
    roundRect(ctx, 8, Math.floor(b.h/2), this.width - 18, Math.floor(b.h/2.2)-6, 8);

    // eye
    ctx.fillStyle = '#fff';
    ctx.beginPath(); ctx.arc(this.width-18, b.h/4, 6, 0, Math.PI*2); ctx.fill();
    ctx.fillStyle = '#012a3b';
    ctx.beginPath(); ctx.arc(this.width-17.3, b.h/4, 3.2, 0, Math.PI*2); ctx.fill();

    // spikes
    ctx.fillStyle = '#0ea5a4';
    for (let i=0;i<4;i++){
      ctx.beginPath();
      ctx.moveTo(6 + i*12, 4);
      ctx.lineTo(6 + i*12 + 6, -10);
      ctx.lineTo(6 + i*12 + 12, 4);
      ctx.closePath();
      ctx.fill();
    }

    // shield ring
    if (this.shield > 0) {
      ctx.strokeStyle = `rgba(34,193,195, ${0.5 + 0.5*Math.sin(Date.now()/120)})`;
      ctx.lineWidth = 3;
      ctx.strokeRect(-8, -8, this.width+16, b.h+16);
    }
    ctx.restore();

    // debug bounds (comment out in production)
    // ctx.strokeStyle = 'red'; ctx.strokeRect(b.x, b.y, b.w, b.h);
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fill();
}

// -------------------- Ground and Background --------------------
function groundLevel() {
  // distance from top of canvas to ground baseline (we draw using bottom)
  // choose 110 px from bottom at 1x scale; scale with canvas height
  const base = Math.max(80, canvas.height * 0.16);
  return base;
}

// cloud class for parallax
class Cloud {
  constructor(x,y,speed,scale=1){
    this.x = x; this.y = y; this.speed = speed; this.scale = scale;
    this.w = 120 * scale; this.h = 44 * scale;
  }
  update(dt){ this.x -= this.speed * dt; if (this.x + this.w < -20) this.x = canvas.width + Math.random()*200; }
  draw(ctx){
    ctx.save();
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = '#ffffff';
    // simple pill cloud
    ctx.beginPath();
    ctx.ellipse(this.x+20, this.y+12, 26*this.scale, 18*this.scale, 0,0,Math.PI*2);
    ctx.ellipse(this.x+54, this.y+10, 36*this.scale, 20*this.scale, 0,0,Math.PI*2);
    ctx.ellipse(this.x+88, this.y+14, 26*this.scale, 18*this.scale, 0,0,Math.PI*2);
    ctx.fill();
    ctx.restore();
  }
}

// -------------------- Obstacles --------------------
class Obstacle {
  constructor(type, x) {
    this.type = type; // 'cactus-small','cactus-big','bird'
    this.x = x;
    this.passed = false;
    if (type === 'cactus-small') { this.w = 22; this.h = 36; this.yOffset = 0; }
    else if (type === 'cactus-big') { this.w = 36; this.h = 56; this.yOffset = 0; }
    else if (type === 'bird') { this.w = 40; this.h = 28; this.yOffset = -48; this.flap = 0; }
  }

  update(dt, speed){
    this.x -= speed * dt;
    if (this.type === 'bird') this.flap += dt * 12;
  }

  getBounds(){
    const ground = groundLevel();
    const top = canvas.height - ground - this.h + (this.yOffset || 0);
    return { x: this.x, y: top, w: this.w, h: this.h };
  }

  draw(ctx){
    const b = this.getBounds();
    ctx.save();
    // shadow
    ctx.fillStyle = 'rgba(0,0,0,0.07)';
    ctx.fillRect(b.x+4, canvas.height - groundLevel() + 4, b.w, 6);

    if (this.type.startsWith('cactus')) {
      ctx.fillStyle = '#0b6b4a';
      roundRect(ctx, b.x, b.y, b.w, b.h, 6);
      // arms
      ctx.fillStyle = '#0a5540';
      ctx.fillRect(b.x - 6, b.y + 8, 8, 12);
      ctx.fillRect(b.x + b.w - 2, b.y + 8, 8, 12);
    } else if (this.type === 'bird') {
      ctx.fillStyle = '#102a43';
      const flapY = Math.sin(this.flap) * 6;
      // body
      ctx.beginPath(); ctx.ellipse(b.x + 18, b.y + 12 + flapY, 12, 8, 0, 0, Math.PI*2); ctx.fill();
      // wing
      ctx.beginPath(); ctx.moveTo(b.x+10, b.y+12+flapY); ctx.quadraticCurveTo(b.x+6, b.y+2+flapY, b.x+26, b.y+8+flapY); ctx.fill();
      // beak
      ctx.fillStyle = '#ffd166'; ctx.beginPath(); ctx.moveTo(b.x+30, b.y+12+flapY); ctx.lineTo(b.x+36, b.y+10+flapY); ctx.lineTo(b.x+36, b.y+14+flapY); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }

}

// -------------------- Powerups --------------------
class Powerup {
  constructor(kind, x) {
    this.kind = kind; // 'shield' or 'mult'
    this.x = x;
    this.w = 28; this.h = 28;
    this.yOffset = -24;
    this.collected = false;
    this.spin = 0;
  }
  update(dt, speed) {
    this.x -= speed * dt;
    this.spin += dt * 6;
  }
  getBounds(){
    const ground = groundLevel();
    const top = canvas.height - ground - this.h + this.yOffset;
    return { x: this.x, y: top, w: this.w, h: this.h };
  }
  draw(ctx) {
    const b = this.getBounds();
    ctx.save();
    ctx.translate(b.x + b.w/2, b.y + b.h/2);
    ctx.rotate(this.spin);
    if (this.kind === 'shield') {
      // ring
      ctx.strokeStyle = '#22c1c3';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(0,0,12,0,Math.PI*2); ctx.stroke();
    } else {
      // star-like mult
      ctx.fillStyle = '#ffd166';
      for (let i=0;i<6;i++){
        ctx.rotate(Math.PI/3);
        ctx.beginPath();
        ctx.moveTo(0,0); ctx.lineTo(6,0); ctx.lineTo(10,4); ctx.closePath();
        ctx.fill();
      }
    }
    ctx.restore();
  }
}

// -------------------- Particles --------------------
function spawnParticles(x,y,count,type='spark') {
  for (let i=0;i<count;i++){
    state.particles.push({
      x, y,
      vx: (Math.random()-0.5)*220,
      vy: -Math.random()*260 - 40,
      life: 0.6 + Math.random()*0.8,
      t: 0,
      type
    });
  }
}
function updateParticles(dt) {
  for (let i = state.particles.length-1; i>=0; i--){
    const p = state.particles[i];
    p.t += dt;
    p.vy += 800*dt;
    p.x += p.vx*dt;
    p.y += p.vy*dt;
    if (p.t > p.life) state.particles.splice(i,1);
  }
}
function drawParticles(ctx) {
  for (const p of state.particles) {
    const alpha = 1 - (p.t / p.life);
    if (p.type === 'dust') {
      ctx.fillStyle = `rgba(20,20,20,${0.12*alpha})`;
      ctx.fillRect(p.x, p.y, 6*alpha, 3*alpha);
    } else {
      ctx.fillStyle = `rgba(255,215,120,${alpha})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, 2 + 2*(1-alpha), 0, Math.PI*2); ctx.fill();
    }
  }
}

// -------------------- Spawner & Difficulty --------------------
let spawnTimer = 0;
function maybeSpawn(dt) {
  spawnTimer -= dt;
  if (spawnTimer <= 0) {
    // spawn an obstacle or powerup
    const r = Math.random();
    let gap = 0;
    if (r < 0.12) {
      // powerup
      const kind = Math.random() < 0.6 ? 'shield' : 'mult';
      state.powerups.push(new Powerup(kind, canvas.width + 60));
      gap = 1.6;
    } else {
      // obstacle
      const typeR = Math.random();
      let type = 'cactus-small';
      if (typeR > 0.85) type = 'bird';
      else if (typeR > 0.5) type = 'cactus-big';
      state.obstacles.push(new Obstacle(type, canvas.width + 30));
      // dynamic gap based on difficulty
      gap = SPAWN_INTERVAL_BASE + Math.random()*1.2 - Math.min(0.8, state.difficulty*0.12);
    }
    spawnTimer = gap / (0.9 + state.difficulty * 0.05);
  }
}

// -------------------- Collision --------------------
function aabbOverlap(a,b){
  return !(a.x + a.w < b.x || b.x + b.w < a.x || a.y + a.h < b.y || b.y + b.h < a.y);
}

// -------------------- Main Game Logic --------------------
const player = new Dino();

function init() {
  resizeCanvas();
  // initial clouds
  state.clouds = [];
  for (let i=0;i<6;i++){
    state.clouds.push(new Cloud(Math.random()*canvas.width, 60 + Math.random()*100, 10 + Math.random()*30, 0.6 + Math.random()*1.0));
  }
  state.obstacles = [];
  state.powerups = [];
  state.particles = [];
  state.score = 0;
  state.speed = RUN_SPEED;
  state.difficulty = 1;
  spawnTimer = 0.8;
  player.x = DINO_X; player.y = 0; player.vy = 0; player.onGround = true; player.shield = 0; player.doubleJumped=false; player.height = WALK_H;
  gameOver = false;
  updateScoreUI();
}

function start() {
  if (running) return;
  init();
  running = true;
  paused = false;
  lastTs = performance.now();
  hideMessage();
  requestAnimationFrame(loop);
}

function restart() {
  init();
  if (!running) {
    running = true; lastTs = performance.now(); requestAnimationFrame(loop);
  } else {
    // continue the loop already running
  }
  hideMessage();
  beeper.beep(420, 0.06);
}

function togglePause() {
  if (!running) return;
  paused = !paused;
  qs('#btnPause').textContent = paused ? 'Resume' : 'Pause';
  if (!paused) {
    lastTs = performance.now();
    requestAnimationFrame(loop);
  } else {
    showMessage(paused ? "Paused" : "");
  }
}

// -------------------- UI helpers --------------------
function updateScoreUI(){
  qs('#scoreVal').textContent = Math.floor(state.score);
  qs('#highVal').textContent = state.highscore;
}
function showMessage(text) {
  qs('#messageText').textContent = text;
  qs('#message').classList.remove('hidden');
}
function hideMessage() {
  qs('#message').classList.add('hidden');
}

// -------------------- Game Over --------------------
function doGameOver(){
  gameOver = true;
  running = false;
  // update high score
  if (Math.floor(state.score) > state.highscore) {
    state.highscore = Math.floor(state.score);
    localStorage.setItem('sitedino_high', state.highscore);
  }
  updateScoreUI();
  showMessage(`Game Over — Score: ${Math.floor(state.score)} (High: ${state.highscore})`);
  beeper.beep(180, 0.18, 'sawtooth', 0.08);
}

// -------------------- Main Loop --------------------
function loop(ts) {
  if (!running || paused) return;
  const dt = Math.min(0.032, (ts - lastTs) / 1000); // cap dt for physics stability
  lastTs = ts;

  // update difficulty
  state.difficulty = 1 + Math.min(4, state.score / 400);

  // update speed gradually with difficulty
  state.speed = RUN_SPEED * (1 + (state.difficulty-1) * 0.16);

  // update player
  player.update(dt);

  // spawn obstacles & powerups occasionally
  maybeSpawn(dt);

  // update clouds
  for (const c of state.clouds) c.update(dt);

  // update obstacles
  for (let i = state.obstacles.length-1; i >= 0; i--) {
    const ob = state.obstacles[i];
    ob.update(dt, state.speed);
    if (ob.x + ob.w < -50) state.obstacles.splice(i,1);
    // collision
    const pb = player.getBounds();
    const obb = ob.getBounds();
    if (!ob.passed && ob.x + ob.w < player.x) {
      ob.passed = true;
      // increase score for passing
      state.score += 12 * player.scoreMult;
      spawnParticles(player.x + 8, canvas.height - groundLevel() - player.height/2, 6, 'spark');
      beeper.beep(880, 0.02, 'sine', 0.02);
    }
    if (!player.shield && aabbOverlap(pb, obb)) {
      // hit
      doGameOver();
      return;
    } else if (player.shield && aabbOverlap(pb, obb)) {
      // consume shield
      player.shield = 0;
      spawnParticles(obb.x + obb.w/2, obb.y + obb.h/2, 20, 'spark');
      state.obstacles.splice(i,1);
      beeper.beep(260, 0.05,'square',0.06);
    }
  }

  // update powerups
  for (let i=state.powerups.length-1;i>=0;i--){
    const p = state.powerups[i];
    p.update(dt, state.speed);
    if (p.x + p.w < -20) state.powerups.splice(i,1);
    const pb = player.getBounds();
    const pb2 = p.getBounds();
    if (aabbOverlap(pb, pb2)) {
      // collect
      if (p.kind === 'shield') {
        player.shield = 5; // seconds
      } else {
        player.scoreMult = 2.4;
      }
      spawnParticles(p.x + p.w/2, p.y + p.h/2, 14, 'spark');
      beeper.beep(920, 0.06, 'triangle', 0.06);
      state.powerups.splice(i,1);
      state.score += 25;
    }
  }

  // update particles
  updateParticles(dt);

  // score increases by distance
  state.score += dt * (state.speed * 0.03) * player.scoreMult;

  // occasionally spawn clouds
  if (Math.random() < 0.008) {
    state.clouds.push(new Cloud(canvas.width + 40, 40 + Math.random()*120, 8 + Math.random()*22, 0.6 + Math.random()*0.9));
  }

  // draw
  draw();

  updateScoreUI();

  // schedule next
  if (!gameOver) requestAnimationFrame(loop);
}

// -------------------- Draw --------------------
function draw() {
  // clear
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // sky gradient (over entire canvas element)
  const g = ctx.createLinearGradient(0,0,0,canvas.height);
  g.addColorStop(0, '#cfe9ff');
  g.addColorStop(0.35, '#e9f7ff');
  g.addColorStop(1, '#eaf6ff');
  ctx.fillStyle = g;
  ctx.fillRect(0,0,canvas.width,canvas.height);

  // sun or background mountains
  drawMountains(ctx);

  // clouds
  for (const c of state.clouds) c.draw(ctx);

  // ground (parallax)
  drawGround(ctx);

  // powerups
  for (const p of state.powerups) p.draw(ctx);

  // obstacles
  for (const ob of state.obstacles) ob.draw(ctx);

  // particles
  drawParticles(ctx);

  // player
  player.draw(ctx);

  // hud: shield meter
  if (player.shield > 0) {
    ctx.save();
    ctx.fillStyle = 'rgba(34,193,195,0.12)';
    ctx.fillRect(12, 64, 120, 10);
    ctx.fillStyle = '#22c1c3';
    ctx.fillRect(12, 64, clamp((player.shield/5) * 120, 0, 120), 10);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.strokeRect(12,64,120,10);
    ctx.restore();
  }

  // debug FPS etc (optional)
  // ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(8,8,80,24);
}

// small stylized mountains layer
function drawMountains(ctx) {
  ctx.save();
  const baseY = canvas.height - groundLevel() - 40;
  ctx.fillStyle = '#b6d7ef';
  ctx.beginPath();
  ctx.moveTo(0, baseY+40);
  for (let x=0;x<canvas.width+80;x+=80) {
    const peak = baseY - 20 - (Math.sin((x+Date.now()*0.0002)/100)*30);
    ctx.lineTo(x, peak);
    ctx.lineTo(x+40, baseY+40);
  }
  ctx.lineTo(canvas.width, canvas.height); ctx.lineTo(0, canvas.height); ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// ground tiles
function drawGround(ctx) {
  const ground = groundLevel();
  const y = canvas.height - ground;
  // moving ground pattern
  state.groundOffset = (state.groundOffset + state.speed * 0.0015) % 40;
  // fill ground base
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(0, y, canvas.width, ground);

  // decorative stripes
  ctx.save();
  ctx.translate(-state.groundOffset, 0);
  for (let i=-40;i<canvas.width+80;i+=40){
    ctx.fillStyle = (i%80===0) ? '#e2e8f0' : '#dbeaf6';
    ctx.fillRect(i, y+ground*0.5, 20, 6);
  }
  ctx.restore();
}

// -------------------- Boot --------------------
resizeCanvas();
init();
showMessage('Ready — click Play to start.');

// auto start on desktop if user presses space
window.addEventListener('keydown', (e) => {
  if (!running && (Keys.JUMP.includes(e.code))) {
    hideMessage(); start();
  }
});


// -------------------- Utility: expose restart for dev console --------------------
window.sitedino = { restart, start };

// End of script
