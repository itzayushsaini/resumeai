// Runs before first paint so the page never flashes the wrong theme.
// The app is white by default; dark is opt-in from Settings.
(function () {
  try {
    var stored = localStorage.getItem("theme");
    var dark = stored === "dark" || (stored === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
    if (dark) document.documentElement.classList.add("dark");
  } catch (e) {}
})();
