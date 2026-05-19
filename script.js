const root = document.documentElement;
const navToggle = document.querySelector("#nav-toggle");
const primaryNav = document.querySelector("#primary-nav");
const themeToggle = document.querySelector("#theme-toggle");
const filterButtons = document.querySelectorAll(".filter-button");
const projectCards = document.querySelectorAll(".project-card");
const copyEmailButton = document.querySelector(".copy-email");
const copyStatus = document.querySelector("#copy-status");
const year = document.querySelector("#year");
const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

const storedTheme = localStorage.getItem("portfolio-theme");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

if ("scrollRestoration" in history) {
  history.scrollRestoration = "manual";
}

function removeStoredSectionHash() {
  if (window.location.hash) {
    history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search,
    );
  }
}

function forceTopOnInitialLoad() {
  removeStoredSectionHash();
  window.scrollTo(0, 0);
}

forceTopOnInitialLoad();
window.addEventListener("load", () => {
  requestAnimationFrame(() => window.scrollTo(0, 0));
  window.setTimeout(() => window.scrollTo(0, 0), 80);
});

if (storedTheme) {
  root.dataset.theme = storedTheme;
} else if (prefersDark) {
  root.dataset.theme = "dark";
}

if (year) {
  year.textContent = new Date().getFullYear();
}

function closeNav() {
  document.body.classList.remove("nav-open");

  if (navToggle) {
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open navigation");
  }
}

if (navToggle) {
  navToggle.addEventListener("click", () => {
    const isOpen = document.body.classList.toggle("nav-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute(
      "aria-label",
      isOpen ? "Close navigation" : "Open navigation",
    );
  });
}

if (primaryNav) {
  primaryNav.addEventListener("click", (event) => {
    if (event.target.matches("a")) {
      closeNav();
    }
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeNav();
  }
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 760) {
    closeNav();
  }
});

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", (event) => {
    const href = anchor.getAttribute("href");

    if (!href || href === "#") {
      event.preventDefault();
      return;
    }

    const target = document.querySelector(href);

    if (!target) {
      return;
    }

    event.preventDefault();
    target.scrollIntoView({
      behavior: "auto",
      block: "start",
    });
    history.replaceState(
      null,
      "",
      window.location.pathname + window.location.search,
    );
  });
});

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = nextTheme;
    localStorage.setItem("portfolio-theme", nextTheme);
    startCanvas();
  });
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    filterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");

    projectCards.forEach((card) => {
      const categories = card.dataset.category.split(" ");
      const shouldShow = filter === "all" || categories.includes(filter);
      card.classList.toggle("is-hidden", !shouldShow);
    });
  });
});

if (copyEmailButton && copyStatus) {
  copyEmailButton.addEventListener("click", async () => {
    const email = copyEmailButton.dataset.email;

    try {
      await navigator.clipboard.writeText(email);
      copyStatus.textContent = "Email copied.";
    } catch {
      copyStatus.textContent = email;
    }

    window.setTimeout(() => {
      copyStatus.textContent = "";
    }, 2400);
  });
}

const navLinks = Array.from(document.querySelectorAll(".primary-nav a"));
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      navLinks.forEach((link) => {
        link.classList.toggle(
          "active",
          link.getAttribute("href") === `#${entry.target.id}`,
        );
      });
    });
  },
  { rootMargin: "-35% 0px -55% 0px", threshold: 0.01 },
);

sections.forEach((section) => observer.observe(section));

const canvas = document.querySelector("#research-canvas");
const context = canvas ? canvas.getContext("2d") : null;
const projectVisualCanvases = Array.from(
  document.querySelectorAll(".project-canvas"),
).map((item) => ({
  canvas: item,
  context: item.getContext("2d"),
  kind: item.dataset.projectVisual,
}));
let animationFrame = 0;
let resizeFrame = 0;
let startTime = performance.now();
let orbitalPoints = [];

function colorValue(name) {
  return getComputedStyle(root).getPropertyValue(name).trim();
}

function resizeCanvas() {
  if (!canvas || !context || !canvas.parentElement) {
    return;
  }

  const width = Math.max(1, Math.floor(canvas.parentElement.clientWidth));
  const height = Math.max(1, Math.floor(canvas.parentElement.clientHeight));
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const nextWidth = Math.floor(width * ratio);
  const nextHeight = Math.floor(height * ratio);

  if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
    canvas.width = nextWidth;
    canvas.height = nextHeight;
  }

  canvas.style.width = "100%";
  canvas.style.height = "100%";
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function seededRandom(seed) {
  let value = seed % 2147483647;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function generateHydrogenicOrbitalPoints() {
  const random = seededRandom(1492);
  const points = [];
  const target = 1750;
  const radialTheta = 1.5;

  // Hydrogenic 3d_z^2 orbital: n = 3, l = 2, m = 0.
  // Angular density uses the real spherical harmonic form:
  // |Y_20|^2 ∝ (3 cos^2(theta) - 1)^2.
  // The radial envelope is sampled from r^4 exp(-2r/3), matching the
  // qualitative 3d radial probability distribution.
  while (points.length < target) {
    let r = 0;
    for (let i = 0; i < 5; i += 1) {
      r += -radialTheta * Math.log(Math.max(random(), 1e-8));
    }

    if (r > 22) {
      continue;
    }

    const u = random() * 2 - 1; // cos(theta), vertical z-axis of the orbital
    const angular = Math.pow(3 * u * u - 1, 2) / 4;

    if (random() > angular) {
      continue;
    }

    const phi = random() * Math.PI * 2;
    const sinTheta = Math.sqrt(Math.max(0, 1 - u * u));

    // Use y as the visual vertical axis, with x/z forming the equatorial plane.
    const x = r * sinTheta * Math.cos(phi);
    const y = r * u;
    const z = r * sinTheta * Math.sin(phi);

    points.push({
      x,
      y,
      z,
      size: 0.9 + random() * 1.55,
      region: Math.abs(u) > 0.58 ? "axial" : "torus",
      phase: random() * Math.PI * 2,
    });
  }

  return points;
}

function drawBackground(width, height, line) {
  context.strokeStyle = line;
  context.globalAlpha = 0.52;
  context.lineWidth = 1;

  for (let x = 32; x < width; x += 42) {
    context.beginPath();
    context.moveTo(x, 24);
    context.lineTo(x, height - 24);
    context.stroke();
  }

  for (let y = 32; y < height; y += 42) {
    context.beginPath();
    context.moveTo(24, y);
    context.lineTo(width - 24, y);
    context.stroke();
  }

  context.globalAlpha = 1;
}

function drawPanelLabel(width, label, sublabel, text, muted) {
  context.textAlign = "left";
  context.textBaseline = "top";
  context.fillStyle = text;
  context.font = "700 15px Inter, system-ui, sans-serif";
  context.fillText(label, 24, 22);
  context.fillStyle = muted;
  context.font = "12px Inter, system-ui, sans-serif";
  context.fillText(sublabel, 24, 44);
}

function drawElectronCloud(width, height, elapsed, text, muted, accent, warm) {
  const centerX = width * 0.52;
  const centerY = height * 0.53;
  const scale = Math.min(width, height) * 0.026;
  const revealDuration = 4.2;
  const reveal = Math.min(1, elapsed / revealDuration);
  const visibleCount = Math.floor(orbitalPoints.length * reveal);
  const rotation = reveal >= 1 ? (elapsed - revealDuration) * 0.34 : 0;

  drawPanelLabel(
    width,
    "Hydrogenic 3d\u2093\u00b2 orbital sampling",
    "dots reveal |R\u2083\u2082(r)Y\u2082\u2070(\u03b8,\u03c6)|\u00b2",
    text,
    muted,
  );

  context.save();
  context.translate(centerX, centerY);

  const nucleusPulse = 1 + 0.08 * Math.sin(elapsed * 3);
  context.beginPath();
  context.fillStyle = warm;
  context.globalAlpha = 0.18;
  context.arc(0, 0, 22 * nucleusPulse, 0, Math.PI * 2);
  context.fill();

  context.beginPath();
  context.fillStyle = warm;
  context.globalAlpha = 0.95;
  context.arc(0, 0, 5.5, 0, Math.PI * 2);
  context.fill();

  const projected = [];
  const cosY = Math.cos(rotation);
  const sinY = Math.sin(rotation);
  const cosX = Math.cos(rotation * 0.34);
  const sinX = Math.sin(rotation * 0.34);

  for (let i = 0; i < visibleCount; i += 1) {
    const point = orbitalPoints[i];

    let x = point.x * cosY + point.z * sinY;
    let z = -point.x * sinY + point.z * cosY;
    let y = point.y * cosX - z * sinX;
    z = point.y * sinX + z * cosX;

    const perspective = 1 / (1 + (z + 12) * 0.022);
    projected.push({
      x: x * scale * perspective,
      y: y * scale * perspective,
      z,
      size: point.size * perspective,
      region: point.region,
    });
  }

  projected.sort((a, b) => a.z - b.z);

  projected.forEach((point) => {
    context.beginPath();
    context.fillStyle = point.region === "axial" ? accent : text;
    context.globalAlpha =
      (point.region === "axial" ? 0.26 : 0.2) + 0.56 * reveal;
    context.arc(point.x, point.y, point.size, 0, Math.PI * 2);
    context.fill();
  });

  context.globalAlpha = 0.16;
  context.strokeStyle = accent;
  context.lineWidth = 1.2;

  // Thin guide contours: two axial lobes and the equatorial torus of 3d_z^2.
  context.beginPath();
  context.ellipse(0, -78, 56, 98, rotation * 0.16, 0, Math.PI * 2);
  context.stroke();

  context.beginPath();
  context.ellipse(0, 78, 56, 98, rotation * 0.16, 0, Math.PI * 2);
  context.stroke();

  context.beginPath();
  context.ellipse(0, 0, 118, 34, rotation * 0.08, 0, Math.PI * 2);
  context.stroke();

  context.globalAlpha = 1;
  context.restore();
}

function drawArrowOnArc(cx, cy, radius, angle, clockwise, color, alpha, width) {
  const span = clockwise ? 0.5 : -0.5;
  context.strokeStyle = color;
  context.fillStyle = color;
  context.globalAlpha = alpha;
  context.lineWidth = width;
  context.beginPath();
  context.arc(cx, cy, radius, angle, angle + span, !clockwise);
  context.stroke();

  const end = angle + span;
  const x = cx + radius * Math.cos(end);
  const y = cy + radius * Math.sin(end);
  const tangent = end + (clockwise ? Math.PI / 2 : -Math.PI / 2);

  context.beginPath();
  context.moveTo(x, y);
  context.lineTo(
    x - 9 * Math.cos(tangent - 0.45),
    y - 9 * Math.sin(tangent - 0.45),
  );
  context.lineTo(
    x - 9 * Math.cos(tangent + 0.45),
    y - 9 * Math.sin(tangent + 0.45),
  );
  context.closePath();
  context.fill();
  context.globalAlpha = 1;
}

function drawRingCurrent(width, height, elapsed, text, muted, accent, warm) {
  drawPanelLabel(
    width,
    "Benzene ring-current response",
    "dominant diatropic flow with weaker paratropic component",
    text,
    muted,
  );

  const cx = width * 0.5;
  const cy = height * 0.52;
  const radius = Math.min(width, height) * 0.19;
  const phase = elapsed * 0.9;
  const vertices = [];

  for (let i = 0; i < 6; i += 1) {
    const angle = -Math.PI / 6 + (i * Math.PI) / 3;
    vertices.push({
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    });
  }

  context.strokeStyle = text;
  context.lineWidth = 3;
  context.beginPath();
  vertices.forEach((point, index) => {
    if (index === 0) {
      context.moveTo(point.x, point.y);
    } else {
      context.lineTo(point.x, point.y);
    }
  });
  context.closePath();
  context.stroke();

  vertices.forEach((point) => {
    context.beginPath();
    context.fillStyle = text;
    context.arc(point.x, point.y, 5, 0, Math.PI * 2);
    context.fill();
  });

  context.strokeStyle = muted;
  context.globalAlpha = 0.35;
  context.lineWidth = 1.5;
  context.beginPath();
  context.arc(cx, cy, radius * 0.58, 0, Math.PI * 2);
  context.stroke();
  context.globalAlpha = 1;

  for (let i = 0; i < 7; i += 1) {
    drawArrowOnArc(
      cx,
      cy,
      radius * 1.45,
      phase + i * 0.92,
      true,
      accent,
      0.82,
      4.5,
    );
  }

  for (let i = 0; i < 4; i += 1) {
    drawArrowOnArc(
      cx,
      cy,
      radius * 0.72,
      -phase * 0.7 + i * 1.45,
      false,
      warm,
      0.38,
      2.3,
    );
  }

  context.textAlign = "center";
  context.textBaseline = "middle";
  context.font = "700 13px Inter, system-ui, sans-serif";
  context.fillStyle = accent;
  context.fillText("diatropic dominant", cx, cy + radius * 1.95);
  context.fillStyle = warm;
  context.globalAlpha = 0.75;
  context.fillText("weaker paratropic", cx, cy - radius * 1.75);
  context.globalAlpha = 1;
}

function drawNeuralQMC(width, height, elapsed, text, muted, accent, warm) {
  drawPanelLabel(
    width,
    "NeuralQMC / VMC prototype",
    "walkers, neural wavefunction, local energy optimization",
    text,
    muted,
  );

  const cx = width * 0.29;
  const cy = height * 0.52;
  const orbit = Math.min(width, height) * 0.13;

  context.beginPath();
  context.fillStyle = warm;
  context.globalAlpha = 0.92;
  context.arc(cx, cy, 8, 0, Math.PI * 2);
  context.fill();

  for (let i = 0; i < 46; i += 1) {
    const angle = i * 1.713 + elapsed * 0.35;
    const wobble = Math.sin(elapsed * 1.2 + i) * 0.24;
    const r = orbit * (0.55 + ((i * 37) % 100) / 100 + wobble);
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle * 1.27) * r * 0.62;
    context.beginPath();
    context.fillStyle = i % 2 === 0 ? accent : text;
    context.globalAlpha = 0.28 + (i % 5) * 0.08;
    context.arc(x, y, 2.5, 0, Math.PI * 2);
    context.fill();
  }
  context.globalAlpha = 1;

  const netX = width * 0.56;
  const netY = height * 0.27;
  const layerGap = Math.min(width, height) * 0.13;
  const nodeGap = 34;
  const layers = [3, 5, 4, 1];
  const nodePositions = [];

  layers.forEach((count, layerIndex) => {
    const x = netX + layerIndex * layerGap;
    const startY = netY + (5 - count) * nodeGap * 0.5;
    const layer = [];
    for (let j = 0; j < count; j += 1) {
      layer.push({ x, y: startY + j * nodeGap });
    }
    nodePositions.push(layer);
  });

  context.strokeStyle = muted;
  context.globalAlpha = 0.22;
  context.lineWidth = 1;
  for (let layer = 0; layer < nodePositions.length - 1; layer += 1) {
    nodePositions[layer].forEach((a) => {
      nodePositions[layer + 1].forEach((b) => {
        context.beginPath();
        context.moveTo(a.x, a.y);
        context.lineTo(b.x, b.y);
        context.stroke();
      });
    });
  }
  context.globalAlpha = 1;

  nodePositions.flat().forEach((node, index) => {
    context.beginPath();
    context.fillStyle = index % 3 === 0 ? accent : text;
    context.globalAlpha = 0.82;
    context.arc(node.x, node.y, 5.5, 0, Math.PI * 2);
    context.fill();
  });
  context.globalAlpha = 1;

  const chartLeft = width * 0.48;
  const chartBottom = height * 0.84;
  const chartWidth = width * 0.4;
  const chartHeight = height * 0.18;

  context.strokeStyle = muted;
  context.globalAlpha = 0.35;
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(chartLeft, chartBottom - chartHeight);
  context.lineTo(chartLeft, chartBottom);
  context.lineTo(chartLeft + chartWidth, chartBottom);
  context.stroke();

  context.strokeStyle = accent;
  context.globalAlpha = 0.95;
  context.lineWidth = 3;
  context.beginPath();
  for (let i = 0; i <= 80; i += 1) {
    const t = i / 80;
    const jitter = 0.035 * Math.sin(i * 0.9 + elapsed * 2);
    const value = 0.86 * Math.exp(-3.4 * t) + 0.16 + jitter;
    const x = chartLeft + t * chartWidth;
    const y = chartBottom - value * chartHeight;
    if (i === 0) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }
  }
  context.stroke();
  context.globalAlpha = 1;

  context.fillStyle = muted;
  context.font = "12px Inter, system-ui, sans-serif";
  context.textAlign = "left";
  context.fillText("energy minimization", chartLeft, chartBottom + 10);
}

function drawSceneDots(width, height, activeScene, accent, muted) {
  const x0 = width - 82;
  const y = 32;

  for (let index = 0; index < 3; index += 1) {
    context.beginPath();
    context.fillStyle = index === activeScene ? accent : muted;
    context.globalAlpha = index === activeScene ? 0.95 : 0.28;
    context.arc(x0 + index * 22, y, 4.5, 0, Math.PI * 2);
    context.fill();
  }

  context.globalAlpha = 1;
}

function resizeCanvasElement(targetCanvas, targetContext) {
  if (!targetCanvas || !targetContext || !targetCanvas.parentElement) {
    return { width: 0, height: 0 };
  }

  const width = Math.max(1, Math.floor(targetCanvas.parentElement.clientWidth));
  const height = Math.max(
    1,
    Math.floor(targetCanvas.parentElement.clientHeight),
  );
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const nextWidth = Math.floor(width * ratio);
  const nextHeight = Math.floor(height * ratio);

  if (targetCanvas.width !== nextWidth || targetCanvas.height !== nextHeight) {
    targetCanvas.width = nextWidth;
    targetCanvas.height = nextHeight;
  }

  targetCanvas.style.width = "100%";
  targetCanvas.style.height = "100%";
  targetContext.setTransform(ratio, 0, 0, ratio, 0, 0);
  return { width, height };
}

const miniOrbitalPoints = generateHydrogenicOrbitalPoints().slice(0, 520);

function drawProjectGrid(ctx, width, height, line) {
  ctx.strokeStyle = line;
  ctx.globalAlpha = 0.28;
  ctx.lineWidth = 1;
  for (let x = 22; x < width; x += 38) {
    ctx.beginPath();
    ctx.moveTo(x, 16);
    ctx.lineTo(x, height - 16);
    ctx.stroke();
  }
  for (let y = 24; y < height; y += 34) {
    ctx.beginPath();
    ctx.moveTo(16, y);
    ctx.lineTo(width - 16, y);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawProjectArrow(ctx, x1, y1, x2, y2, color, alpha = 1, width = 2) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.globalAlpha = alpha;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - 8 * Math.cos(angle - 0.55), y2 - 8 * Math.sin(angle - 0.55));
  ctx.lineTo(x2 - 8 * Math.cos(angle + 0.55), y2 - 8 * Math.sin(angle + 0.55));
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawProjectArrowOnArc(
  ctx,
  cx,
  cy,
  radius,
  angle,
  clockwise,
  color,
  alpha = 1,
  width = 2,
) {
  const span = clockwise ? 0.62 : -0.62;
  const start = angle;
  const end = angle + span;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = alpha;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(cx, cy, radius, start, end, !clockwise);
  ctx.stroke();

  const tx = cx + Math.cos(end) * radius;
  const ty = cy + Math.sin(end) * radius;
  const tangent = end + (clockwise ? Math.PI / 2 : -Math.PI / 2);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(tx, ty);
  ctx.lineTo(
    tx - 7 * Math.cos(tangent - 0.55),
    ty - 7 * Math.sin(tangent - 0.55),
  );
  ctx.lineTo(
    tx - 7 * Math.cos(tangent + 0.55),
    ty - 7 * Math.sin(tangent + 0.55),
  );
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawMiniBenzene(ctx, cx, cy, radius, color, nodeColor) {
  const vertices = [];
  for (let i = 0; i < 6; i += 1) {
    const angle = -Math.PI / 6 + (i * Math.PI) / 3;
    vertices.push({
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    });
  }

  ctx.strokeStyle = color;
  ctx.lineWidth = 2.3;
  ctx.beginPath();
  vertices.forEach((point, index) => {
    if (index === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
  ctx.closePath();
  ctx.stroke();

  vertices.forEach((point) => {
    ctx.beginPath();
    ctx.fillStyle = nodeColor;
    ctx.arc(point.x, point.y, 3.3, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawProjectQMC(
  ctx,
  width,
  height,
  elapsed,
  text,
  muted,
  line,
  accent,
  warm,
) {
  drawProjectGrid(ctx, width, height, line);

  const cx = width * 0.32;
  const cy = height * 0.48;
  const orbit = Math.min(width, height) * 0.24;

  // Faint neural-network pattern in the background.
  const layers = [3, 4, 3, 1];
  const nodes = [];
  layers.forEach((count, layer) => {
    const x = width * (0.55 + layer * 0.095);
    const startY = height * 0.24 - (count - 1) * 15;
    const current = [];
    for (let j = 0; j < count; j += 1) current.push({ x, y: startY + j * 30 });
    nodes.push(current);
  });

  ctx.globalAlpha = 0.18;
  ctx.strokeStyle = muted;
  ctx.lineWidth = 1;
  for (let i = 0; i < nodes.length - 1; i += 1) {
    nodes[i].forEach((a) =>
      nodes[i + 1].forEach((b) => {
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }),
    );
  }
  nodes.flat().forEach((node, index) => {
    ctx.beginPath();
    ctx.fillStyle = index % 2 ? accent : text;
    ctx.arc(node.x, node.y, 3.8, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  // Nucleus.
  ctx.beginPath();
  ctx.fillStyle = warm;
  ctx.globalAlpha = 0.95;
  ctx.arc(cx, cy, 7, 0, Math.PI * 2);
  ctx.fill();

  // Two electron walkers with trails.
  for (let e = 0; e < 2; e += 1) {
    const phase = elapsed * (0.92 + e * 0.18) + e * Math.PI;
    ctx.strokeStyle = e === 0 ? accent : text;
    ctx.globalAlpha = 0.34;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let k = 0; k < 36; k += 1) {
      const t = phase - k * 0.12;
      const r = orbit * (0.72 + 0.16 * Math.sin(t * 2.1 + e));
      const x = cx + Math.cos(t) * r;
      const y = cy + Math.sin(t * 1.37) * r * 0.56;
      if (k === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    const r = orbit * (0.72 + 0.16 * Math.sin(phase * 2.1 + e));
    const x = cx + Math.cos(phase) * r;
    const y = cy + Math.sin(phase * 1.37) * r * 0.56;
    ctx.beginPath();
    ctx.fillStyle = e === 0 ? accent : text;
    ctx.globalAlpha = 0.9;
    ctx.arc(x, y, 5.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // Energy convergence curve.
  const left = width * 0.52;
  const bottom = height * 0.84;
  const w = width * 0.36;
  const h = height * 0.22;
  ctx.strokeStyle = muted;
  ctx.globalAlpha = 0.35;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(left, bottom - h);
  ctx.lineTo(left, bottom);
  ctx.lineTo(left + w, bottom);
  ctx.stroke();

  ctx.strokeStyle = accent;
  ctx.globalAlpha = 0.95;
  ctx.lineWidth = 2.2;
  ctx.beginPath();
  for (let i = 0; i <= 70; i += 1) {
    const t = i / 70;
    const value =
      0.82 * Math.exp(-3.5 * t) +
      0.12 +
      0.035 * Math.sin(i * 0.7 + elapsed * 2.4);
    const x = left + t * w;
    const y = bottom - value * h;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function drawProjectOrbital(
  ctx,
  width,
  height,
  elapsed,
  text,
  muted,
  line,
  accent,
  warm,
) {
  drawProjectGrid(ctx, width, height, line);

  const cx = width * 0.5;
  const cy = height * 0.52;
  const scale = Math.min(width, height) * 0.033;
  const rotation = elapsed * 0.55;

  ctx.beginPath();
  ctx.fillStyle = warm;
  ctx.globalAlpha = 0.9;
  ctx.arc(cx, cy, 5, 0, Math.PI * 2);
  ctx.fill();

  const cosY = Math.cos(rotation);
  const sinY = Math.sin(rotation);
  const cosX = Math.cos(rotation * 0.37);
  const sinX = Math.sin(rotation * 0.37);
  const points = [];

  miniOrbitalPoints.forEach((point) => {
    let x = point.x * cosY + point.z * sinY;
    let z = -point.x * sinY + point.z * cosY;
    let y = point.y * cosX - z * sinX;
    z = point.y * sinX + z * cosX;
    const perspective = 1 / (1 + (z + 12) * 0.025);
    points.push({
      x: cx + x * scale * perspective,
      y: cy + y * scale * perspective,
      z,
      size: Math.max(0.75, point.size * 0.75 * perspective),
      region: point.region,
    });
  });

  points.sort((a, b) => a.z - b.z);
  points.forEach((point) => {
    ctx.beginPath();
    ctx.fillStyle = point.region === "axial" ? accent : text;
    ctx.globalAlpha = point.region === "axial" ? 0.78 : 0.48;
    ctx.arc(point.x, point.y, point.size, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.globalAlpha = 1;

  ctx.strokeStyle = accent;
  ctx.globalAlpha = 0.22;
  ctx.lineWidth = 1.1;
  ctx.beginPath();
  ctx.ellipse(cx, cy - 38, 34, 54, rotation * 0.1, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(cx, cy + 38, 34, 54, rotation * 0.1, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(cx, cy, 72, 20, rotation * 0.04, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function drawProjectRingCurrent(
  ctx,
  width,
  height,
  elapsed,
  text,
  muted,
  line,
  accent,
  warm,
) {
  drawProjectGrid(ctx, width, height, line);

  const cx = width * 0.5;
  const cy = height * 0.52;
  const radius = Math.min(width, height) * 0.25;
  const phase = elapsed * 0.95;

  drawMiniBenzene(ctx, cx, cy, radius, text, text);

  for (let i = 0; i < 6; i += 1) {
    drawProjectArrowOnArc(
      ctx,
      cx,
      cy,
      radius * 1.45,
      phase + i * 1.03,
      true,
      accent,
      0.85,
      3.2,
    );
  }

  for (let i = 0; i < 3; i += 1) {
    drawProjectArrowOnArc(
      ctx,
      cx,
      cy,
      radius * 0.62,
      -phase * 0.6 + i * 2.02,
      false,
      warm,
      0.46,
      2.1,
    );
  }

  // Magnetic field direction arrow.
  const bx = width * 0.18;
  const by = height * 0.78;
  drawProjectArrow(ctx, bx, by + 28, bx, by - 28, muted, 0.75, 1.8);
  ctx.fillStyle = muted;
  ctx.globalAlpha = 0.75;
  ctx.font = "700 11px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("B", bx, by - 38);
  ctx.globalAlpha = 1;
}

function drawProjectPES(
  ctx,
  width,
  height,
  elapsed,
  text,
  muted,
  line,
  accent,
  warm,
) {
  drawProjectGrid(ctx, width, height, line);

  const left = width * 0.14;
  const right = width * 0.86;
  const midY = height * 0.52;
  const amp = height * 0.26;
  const gap = 16;
  const phase = 0.02 * Math.sin(elapsed);

  ctx.lineWidth = 2.5;
  ctx.strokeStyle = accent;
  ctx.beginPath();
  for (let i = 0; i <= 120; i += 1) {
    const t = i / 120;
    const x = left + t * (right - left);
    const yRaw = midY + amp * (t - 0.5 + phase);
    const repel = gap * Math.exp(-Math.pow((t - 0.5) * 10, 2));
    const y = yRaw - repel;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  ctx.strokeStyle = warm;
  ctx.beginPath();
  for (let i = 0; i <= 120; i += 1) {
    const t = i / 120;
    const x = left + t * (right - left);
    const yRaw = midY - amp * (t - 0.5 + phase);
    const repel = gap * Math.exp(-Math.pow((t - 0.5) * 10, 2));
    const y = yRaw + repel;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  const crossX = width * 0.5;
  ctx.strokeStyle = muted;
  ctx.globalAlpha = 0.45;
  ctx.setLineDash([4, 6]);
  ctx.beginPath();
  ctx.moveTo(crossX, height * 0.22);
  ctx.lineTo(crossX, height * 0.8);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;

  drawProjectArrow(
    ctx,
    crossX - 22,
    midY + 30,
    crossX + 22,
    midY - 30,
    text,
    0.75,
    1.7,
  );
  drawProjectArrow(
    ctx,
    crossX + 22,
    midY - 30,
    crossX - 22,
    midY + 30,
    text,
    0.45,
    1.5,
  );

  ctx.fillStyle = muted;
  ctx.font = "700 11px Inter, system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.globalAlpha = 0.86;
  ctx.fillText("avoided crossing", crossX, height * 0.84);
  ctx.globalAlpha = 1;
}

function drawProjectSynthesis(
  ctx,
  width,
  height,
  elapsed,
  text,
  muted,
  line,
  accent,
  warm,
) {
  drawProjectGrid(ctx, width, height, line);

  const leftX = width * 0.25;
  const rightX = width * 0.74;
  const cy = height * 0.52;
  const r = Math.min(width, height) * 0.17;

  drawMiniBenzene(ctx, leftX, cy, r, text, accent);
  drawProjectArrow(
    ctx,
    leftX + r * 1.35,
    cy,
    rightX - r * 1.45,
    cy,
    accent,
    0.9,
    2.6,
  );

  drawMiniBenzene(ctx, rightX, cy, r, text, warm);

  // Product substituent.
  ctx.strokeStyle = warm;
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  ctx.moveTo(rightX + r * 0.86, cy - r * 0.5);
  ctx.lineTo(rightX + r * 1.45, cy - r * 0.85);
  ctx.stroke();
  ctx.beginPath();
  ctx.fillStyle = warm;
  ctx.arc(rightX + r * 1.55, cy - r * 0.9, 3.5, 0, Math.PI * 2);
  ctx.fill();

  // Tiny flask mark under the arrow.
  ctx.strokeStyle = muted;
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = 1.5;
  const fx = width * 0.5;
  const fy = height * 0.72;
  ctx.beginPath();
  ctx.moveTo(fx - 8, fy - 18);
  ctx.lineTo(fx - 8, fy - 2);
  ctx.lineTo(fx - 18, fy + 14);
  ctx.lineTo(fx + 18, fy + 14);
  ctx.lineTo(fx + 8, fy - 2);
  ctx.lineTo(fx + 8, fy - 18);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function drawProjectVisuals(timestamp) {
  if (!projectVisualCanvases.length) {
    return;
  }

  const elapsed = (timestamp - startTime) / 1000;
  const text = colorValue("--text");
  const muted = colorValue("--muted");
  const line = colorValue("--line");
  const accent = colorValue("--accent");
  const warm = colorValue("--warm");

  projectVisualCanvases.forEach(
    ({ canvas: projectCanvas, context: projectContext, kind }) => {
      if (!projectCanvas || !projectContext) {
        return;
      }

      const { width, height } = resizeCanvasElement(
        projectCanvas,
        projectContext,
      );
      if (!width || !height) {
        return;
      }

      projectContext.clearRect(0, 0, width, height);
      projectContext.lineCap = "round";
      projectContext.lineJoin = "round";

      if (kind === "qmc") {
        drawProjectQMC(
          projectContext,
          width,
          height,
          elapsed,
          text,
          muted,
          line,
          accent,
          warm,
        );
      } else if (kind === "orbital") {
        drawProjectOrbital(
          projectContext,
          width,
          height,
          elapsed,
          text,
          muted,
          line,
          accent,
          warm,
        );
      } else if (kind === "ring") {
        drawProjectRingCurrent(
          projectContext,
          width,
          height,
          elapsed,
          text,
          muted,
          line,
          accent,
          warm,
        );
      } else if (kind === "pes") {
        drawProjectPES(
          projectContext,
          width,
          height,
          elapsed,
          text,
          muted,
          line,
          accent,
          warm,
        );
      } else if (kind === "synthesis") {
        drawProjectSynthesis(
          projectContext,
          width,
          height,
          elapsed,
          text,
          muted,
          line,
          accent,
          warm,
        );
      }
    },
  );
}

function drawResearchVisual(timestamp) {
  if (!canvas || !context) {
    return;
  }

  const rect = canvas.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;
  const elapsed = (timestamp - startTime) / 1000;
  const text = colorValue("--text");
  const muted = colorValue("--muted");
  const line = colorValue("--line");
  const accent = colorValue("--accent");
  const warm = colorValue("--warm");

  drawProjectVisuals(timestamp);

  context.clearRect(0, 0, width, height);
  context.lineCap = "round";
  context.lineJoin = "round";

  drawBackground(width, height, line);

  const sceneLength = 8;
  const totalScenes = 3;
  const sceneIndex = Math.floor(elapsed / sceneLength) % totalScenes;
  const sceneElapsed = elapsed % sceneLength;

  if (sceneIndex === 0) {
    drawElectronCloud(width, height, sceneElapsed, text, muted, accent, warm);
  } else if (sceneIndex === 1) {
    drawRingCurrent(width, height, sceneElapsed, text, muted, accent, warm);
  } else {
    drawNeuralQMC(width, height, sceneElapsed, text, muted, accent, warm);
  }

  drawSceneDots(width, height, sceneIndex, accent, muted);

  if (!motionQuery.matches) {
    animationFrame = window.requestAnimationFrame(drawResearchVisual);
  }
}

function startCanvas() {
  if (!canvas || !context) {
    return;
  }

  window.cancelAnimationFrame(animationFrame);
  resizeCanvas();
  startTime = performance.now();
  if (!orbitalPoints.length) {
    orbitalPoints = generateHydrogenicOrbitalPoints();
  }
  drawProjectVisuals(startTime);
  animationFrame = window.requestAnimationFrame(drawResearchVisual);
}

if (canvas && canvas.parentElement) {
  const resizeObserver = new ResizeObserver(() => {
    window.cancelAnimationFrame(resizeFrame);
    resizeFrame = window.requestAnimationFrame(resizeCanvas);
  });
  resizeObserver.observe(canvas.parentElement);
}

motionQuery.addEventListener("change", startCanvas);
startCanvas();
