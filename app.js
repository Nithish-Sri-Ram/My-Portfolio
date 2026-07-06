const boxContainer = document.querySelector(".boxContainer");
const saluteTextContainer = document.querySelector(".saluteTextContainer");
const saluteImgContainer = document.querySelector(".saluteImgContainer");
const authorName = document.querySelector(".name");
const jobTitleContainers = document.querySelectorAll(".jobTitleContainer");

// GITHUB CHART
for (let i = 0; i < 365; i++) {
  const list = [
    0, 1, 2, 3, 41, 42, 43, 44, 82, 83, 123, 124, 125, 126, 164, 165, 166, 167,
    205, 206, 246, 247, 287, 288, 5, 6, 46, 47, 87, 88, 128, 129, 169, 170, 210,
    211, 251, 252, 292, 293, 8, 9, 14, 15, 49, 50, 51, 90, 91, 92, 131, 132,
    133, 134, 172, 173, 213, 214, 254, 255, 295, 296, 175, 176, 217, 177, 218,
    259, 55, 56, 96, 97, 137, 138, 178, 179, 219, 220, 260, 261, 217, 218, 259,
    260, 261, 301, 302, 17, 18, 19, 58, 59, 60, 61, 99, 100, 102, 103, 140, 141,
    144, 181, 182, 185, 222, 223, 225, 226, 263, 264, 265, 266, 304, 305, 306,
    24, 25, 65, 66, 67, 106, 107, 108, 147, 148, 149, 150, 188, 189, 229, 230,
    270, 271, 311, 312, 67, 108, 149, 150, 191, 232, 192, 233, 274, 234, 275,
    316, 194, 235, 276, 154, 195, 236, 73, 114, 155, 33, 34, 74, 75, 115, 116,
    156, 157, 197, 198, 238, 239, 279, 280, 320, 321, 36, 37, 38, 39, 77, 78,
    79, 80, 118, 119, 159, 160, 161, 162, 200, 201, 202, 203, 241, 242, 282,
    283, 284, 285, 323, 324, 325, 326,
  ];

  const el = document.createElement("div");
  el.classList = list.includes(i) ? "box active" : "box";
  boxContainer.appendChild(el);
}

// SCROLL PARALLAX
// Same slide-in flow as before, but each element's resting point is measured
// from the document, so adding/removing sections never breaks the alignment.
// data-slide="right" flies in from the right, "left" from the left, "up" from below.
const slideEls = [];

function measureSlides() {
  slideEls.length = 0;
  document.querySelectorAll("[data-slide]").forEach((el) => {
    const section =
      el.closest(".project") ||
      el.closest(".jobTitleContainer") ||
      el.closest(".projects") ||
      el.closest(".blogs");
    const anchor = section
      ? section.getBoundingClientRect().top + window.scrollY
      : 0;
    slideEls.push({ el, dir: el.dataset.slide, anchor });
  });
}

function applyParallax() {
  const offsetY = window.scrollY;

  saluteTextContainer.style.transform = `translateY(${offsetY * 0.1}px)`;
  saluteImgContainer.style.transform = `translate(${offsetY * 0.4}px, ${offsetY * 0.7}px)`;
  authorName.style.transform = `translateX(${offsetY * 0.1}px)`;

  jobTitleContainers.forEach((c, i) => {
    c.style.backgroundPositionY = `${(i % 2 === 0 ? 1 : -1) * offsetY * 0.5}px`;
  });

  slideEls.forEach(({ el, dir, anchor }) => {
    const d = anchor - offsetY;
    if (dir === "right") el.style.transform = `translateX(${d}px)`;
    else if (dir === "left") el.style.transform = `translateX(${-d}px)`;
    else el.style.transform = `translateY(${Math.max(d, 0)}px)`;
  });
}

let ticking = false;
window.addEventListener(
  "scroll",
  () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        applyParallax();
        ticking = false;
      });
      ticking = true;
    }
  },
  { passive: true }
);

window.addEventListener("resize", () => {
  measureSlides();
  applyParallax();
});

window.addEventListener("load", () => {
  measureSlides();
  applyParallax();
});

measureSlides();
applyParallax();

// BLOG ROWS — fade in as they enter the viewport
const blogRows = document.querySelectorAll(".blogRow");
const blogObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        entry.target.style.transitionDelay = `${(i % 3) * 0.12}s`;
        entry.target.classList.add("in");
        blogObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 }
);
blogRows.forEach((row) => blogObserver.observe(row));

// PROJECT BUTTONS
const videoOverlay = document.getElementById("videoOverlay");
const closeVideo = document.getElementById("closeVideo");
const projectVideo = document.getElementById("projectVideo");

document.querySelectorAll(".projectButton").forEach((btn) => {
  btn.addEventListener("click", () => {
    if (btn.dataset.action === "video") {
      videoOverlay.style.display = "flex";
      projectVideo.play();
    } else if (btn.dataset.href) {
      window.open(btn.dataset.href, "_blank");
    }
  });
});

function hideOverlay() {
  projectVideo.pause();
  projectVideo.currentTime = 0;
  videoOverlay.style.display = "none";
}

closeVideo.addEventListener("click", hideOverlay);

videoOverlay.addEventListener("click", (e) => {
  if (e.target === videoOverlay) hideOverlay();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && videoOverlay.style.display === "flex") hideOverlay();
});

// FOOTER YEAR
document.getElementById("year").textContent = new Date().getFullYear();
