/**
 * IMPRENTA GIPE - INTERACTIVE CMYK CANVAS
 * Interactive particle simulation representing offset ink droplets (Cyan, Magenta, Yellow, Black)
 * responding elastically to mouse movement and ambient currents.
 */

(function () {
  const canvas = document.getElementById('cmyk-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  // CMYK Color Palette with translucent alphas for optical color mixing
  const CMYK_COLORS = [
    { r: 0, g: 229, b: 255, name: 'Cyan' },      // Cyan #00E5FF
    { r: 255, g: 0, b: 127, name: 'Magenta' },   // Magenta #FF007F
    { r: 255, g: 215, b: 0, name: 'Yellow' },    // Yellow #FFD700
    { r: 220, g: 225, b: 235, name: 'SilverKey' } // Highlight Key tint
  ];

  // Mouse interaction state
  const mouse = {
    x: width / 2,
    y: height / 2,
    targetX: width / 2,
    targetY: height / 2,
    radius: 140,
    isActive: false
  };

  // Particle count based on screen width
  const PARTICLE_COUNT = window.innerWidth < 768 ? 40 : 85;
  const particles = [];

  class CMYKParticle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = initial ? Math.random() * width : (Math.random() > 0.5 ? -20 : width + 20);
      this.y = Math.random() * height;
      this.size = Math.random() * 3.5 + 1.8; // Radius
      this.baseSize = this.size;
      
      // Floating velocity
      this.vx = (Math.random() - 0.5) * 0.7;
      this.vy = (Math.random() - 0.5) * 0.7;

      // Color selection
      this.color = CMYK_COLORS[Math.floor(Math.random() * CMYK_COLORS.length)];
      this.alpha = Math.random() * 0.45 + 0.25;
      
      // Oscillating pulse phase
      this.pulsePhase = Math.random() * Math.PI * 2;
      this.pulseSpeed = 0.02 + Math.random() * 0.02;
    }

    update() {
      // Ambient floating
      this.x += this.vx;
      this.y += this.vy;

      // Pulse size slightly
      this.pulsePhase += this.pulseSpeed;
      this.size = this.baseSize + Math.sin(this.pulsePhase) * 0.8;

      // Mouse interaction
      if (mouse.isActive) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius && dist > 0) {
          const force = (1 - dist / mouse.radius) * 3.5;
          const angle = Math.atan2(dy, dx);
          this.x += Math.cos(angle) * force;
          this.y += Math.sin(angle) * force;
        }
      }

      // Screen wrapping
      if (this.x < -30) this.x = width + 20;
      if (this.x > width + 30) this.x = -20;
      if (this.y < -30) this.y = height + 20;
      if (this.y > height + 30) this.y = -20;
    }

    draw() {
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x, this.y, Math.max(0.5, this.size), 0, Math.PI * 2);

      // Glow effect
      const gradient = ctx.createRadialGradient(
        this.x, this.y, 0,
        this.x, this.y, this.size * 2.8
      );
      gradient.addColorStop(0, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.alpha})`);
      gradient.addColorStop(0.5, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, ${this.alpha * 0.4})`);
      gradient.addColorStop(1, `rgba(${this.color.r}, ${this.color.g}, ${this.color.b}, 0)`);

      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.restore();
    }
  }

  // Initialize particle set
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push(new CMYKParticle());
  }

  // Draw delicate connecting filaments between close droplets (optical halftone effect)
  function drawHalftoneConnections() {
    const maxDist = 110;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDist) {
          const alpha = (1 - dist / maxDist) * 0.12;
          ctx.strokeStyle = `rgba(0, 229, 255, ${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  // Main animation loop
  let animationFrameId;
  let isRunning = true;

  function render() {
    if (!isRunning) return;

    // Smooth mouse lerping
    mouse.x += (mouse.targetX - mouse.x) * 0.1;
    mouse.y += (mouse.targetY - mouse.y) * 0.1;

    ctx.clearRect(0, 0, width, height);

    drawHalftoneConnections();

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }

    animationFrameId = requestAnimationFrame(render);
  }

  // Event Listeners
  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  window.addEventListener('mousemove', (e) => {
    mouse.targetX = e.clientX;
    mouse.targetY = e.clientY;
    mouse.isActive = true;
  });

  window.addEventListener('mouseleave', () => {
    mouse.isActive = false;
  });

  window.addEventListener('touchstart', (e) => {
    if (e.touches.length > 0) {
      mouse.targetX = e.touches[0].clientX;
      mouse.targetY = e.touches[0].clientY;
      mouse.isActive = true;
    }
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      mouse.targetX = e.touches[0].clientX;
      mouse.targetY = e.touches[0].clientY;
    }
  }, { passive: true });

  window.addEventListener('touchend', () => {
    mouse.isActive = false;
  });

  // Power optimization on background tabs
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      isRunning = false;
      cancelAnimationFrame(animationFrameId);
    } else {
      isRunning = true;
      render();
    }
  });

  // Start animation
  render();
})();
