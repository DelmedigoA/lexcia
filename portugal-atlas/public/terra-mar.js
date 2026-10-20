(() => {
  const script = document.currentScript;
  if (!script) return;

  const targetId = script.dataset.target || "terra-mar-atlas";
  const mount = document.getElementById(targetId);
  if (!mount) {
    console.error(`Terra & Mar embed: add an element with id="${targetId}".`);
    return;
  }

  const iframe = document.createElement("iframe");
  iframe.src = new URL("./", script.src).href;
  iframe.title = "Terra & Mar — a field guide to Portugal";
  iframe.loading = "lazy";
  iframe.referrerPolicy = "strict-origin-when-cross-origin";
  iframe.setAttribute("allowfullscreen", "");
  iframe.style.cssText =
    "display:block;width:100%;height:760px;border:1px solid #d2d2c5;border-radius:3px;background:#f5f2e9";
  mount.replaceChildren(iframe);
})();
