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

if (storedTheme) {
  root.dataset.theme = storedTheme;
} else if (prefersDark) {
  root.dataset.theme = "dark";
}

year.textContent = new Date().getFullYear();

navToggle.addEventListener("click", () => {
  const isOpen = document.body.classList.toggle("nav-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
});

primaryNav.addEventListener("click", (event) => {
  if (event.target.matches("a")) {
    document.body.classList.remove("nav-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open navigation");
  }
});

themeToggle.addEventListener("click", () => {
  const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
  root.dataset.theme = nextTheme;
  localStorage.setItem("portfolio-theme", nextTheme);
  startCanvas();
});

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
        link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  },
  { rootMargin: "-35% 0px -55% 0px", threshold: 0.01 }
);

sections.forEach((section) => observer.observe(section));

const canvas = document.querySelector("#research-canvas");
const context = canvas.getContext("2d");
let animationFrame;
let startTime = performance.now();

function colorValue(name) {
  return getComputedStyle(root).getPropertyValue(name).trim();
}

function resizeCanvas() {
  const rect = canvas.parentElement.getBoundingClientRect();
  const ratio = window.devicePixelRatio || 1;

  canvas.width = Math.max(1, Math.floor(rect.width * ratio));
  canvas.height = Math.max(1, Math.floor(rect.height * ratio));
  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function drawResearchVisual(timestamp) {
  const rect = canvas.getBoundingClientRect();
  const width = rect.width;
  const height = rect.height;
  const elapsed = (timestamp - startTime) / 1000;
  const text = colorValue("--text");
  const muted = colorValue("--muted");
  const line = colorValue("--line");
  const accent = colorValue("--accent");
  const warm = colorValue("--warm");

  context.clearRect(0, 0, width, height);
  context.lineCap = "round";
  context.lineJoin = "round";

  context.strokeStyle = line;
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

  const nodes = [
    { x: width * 0.2, y: height * 0.26, r: 8, c: accent },
    { x: width * 0.46, y: height * 0.2, r: 6, c: warm },
    { x: width * 0.74, y: height * 0.3, r: 9, c: text },
    { x: width * 0.28, y: height * 0.62, r: 7, c: warm },
    { x: width * 0.58, y: height * 0.58, r: 10, c: accent },
    { x: width * 0.82, y: height * 0.72, r: 6, c: muted }
  ];

  context.strokeStyle = muted;
  context.globalAlpha = 0.38;
  context.lineWidth = 1.5;
  [[0, 1], [1, 2], [0, 3], [3, 4], [4, 5], [1, 4], [2, 5]].forEach(([a, b]) => {
    context.beginPath();
    context.moveTo(nodes[a].x, nodes[a].y);
    context.lineTo(nodes[b].x, nodes[b].y);
    context.stroke();
  });
  context.globalAlpha = 1;

  nodes.forEach((node, index) => {
    const pulse = Math.sin(elapsed * 1.3 + index) * 1.6;
    context.beginPath();
    context.fillStyle = node.c;
    context.arc(node.x, node.y, node.r + pulse, 0, Math.PI * 2);
    context.fill();

    context.beginPath();
    context.strokeStyle = node.c;
    context.globalAlpha = 0.22;
    context.lineWidth = 2;
    context.arc(node.x, node.y, node.r + 12 + pulse, 0, Math.PI * 2);
    context.stroke();
    context.globalAlpha = 1;
  });

  const chartLeft = width * 0.12;
  const chartBottom = height * 0.86;
  const chartWidth = width * 0.76;
  const chartHeight = height * 0.24;

  context.strokeStyle = text;
  context.globalAlpha = 0.5;
  context.lineWidth = 1;
  context.beginPath();
  context.moveTo(chartLeft, chartBottom - chartHeight);
  context.lineTo(chartLeft, chartBottom);
  context.lineTo(chartLeft + chartWidth, chartBottom);
  context.stroke();
  context.globalAlpha = 1;

  context.strokeStyle = accent;
  context.lineWidth = 3;
  context.beginPath();
  for (let i = 0; i <= 80; i += 1) {
    const t = i / 80;
    const x = chartLeft + t * chartWidth;
    const y = chartBottom - chartHeight * (0.42 + 0.26 * Math.sin(t * Math.PI * 2 + elapsed * 0.45));
    if (i === 0) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }
  }
  context.stroke();

  context.strokeStyle = warm;
  context.lineWidth = 3;
  context.beginPath();
  for (let i = 0; i <= 80; i += 1) {
    const t = i / 80;
    const x = chartLeft + t * chartWidth;
    const peak = Math.exp(-Math.pow((t - 0.56) * 5, 2));
    const y = chartBottom - chartHeight * (0.18 + peak * 0.74);
    if (i === 0) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }
  }
  context.stroke();

  if (!motionQuery.matches) {
    animationFrame = window.requestAnimationFrame(drawResearchVisual);
  }
}

function startCanvas() {
  window.cancelAnimationFrame(animationFrame);
  resizeCanvas();
  startTime = performance.now();
  animationFrame = window.requestAnimationFrame(drawResearchVisual);
}

const resizeObserver = new ResizeObserver(startCanvas);
resizeObserver.observe(canvas.parentElement);

motionQuery.addEventListener("change", startCanvas);
startCanvas();
