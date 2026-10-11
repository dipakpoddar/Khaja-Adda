const liveUpdates = [
  "⚡ Live: Baneshwor area ma 12 mins delivery running",
  "🔥 Trending: Momo combo 2-for-1 around Thamel till 9 PM",
  "🛵 Rider Flash: Patan pickup queue super fast right now"
];

const dailyDrops = [
  "Daily Drop: Newari Bara + Lassi Blast",
  "Daily Drop: Jhol Momo + Wai Wai Crunch",
  "Daily Drop: Sekuwa Wrap + Masala Chiya"
];

let tick = 0;
const liveLine = document.getElementById("liveLine");
const dailyDrop = document.getElementById("dailyDrop");

setInterval(() => {
  tick = (tick + 1) % liveUpdates.length;
  liveLine.textContent = liveUpdates[tick];
  dailyDrop.textContent = dailyDrops[tick];
}, 3200);

const links = document.querySelectorAll("nav a");
const sections = [...document.querySelectorAll("main section")];

window.addEventListener("scroll", () => {
  const active = sections.find((section) => {
    const top = section.getBoundingClientRect().top;
    return top >= 0 && top < window.innerHeight * 0.45;
  });

  links.forEach((link) => link.classList.remove("active"));
  if (active) {
    const activeLink = document.querySelector(`nav a[href="#${active.id}"]`);
    if (activeLink) {
      activeLink.classList.add("active");
    }
  }
});
