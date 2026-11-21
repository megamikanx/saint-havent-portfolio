/**
 * Browser-side code for click-to-load video embeds.
 * Each facade button carries data-embed (iframe URL) and data-title.
 */
let activated = false;

export function activateFacades(): void {
  if (activated) return; // Several components import this; wire up once.
  activated = true;

  document.addEventListener("click", (e) => {
    const button = (e.target as HTMLElement).closest<HTMLButtonElement>("[data-facade] [data-embed]");
    if (!button) return;
    const container = button.closest<HTMLElement>("[data-facade]")!;

    const iframe = document.createElement("iframe");
    iframe.src = button.dataset.embed!;
    iframe.title = button.dataset.title ?? "";
    iframe.allow = "autoplay; fullscreen; picture-in-picture; encrypted-media";
    iframe.allowFullscreen = true;
    iframe.className = "facade__iframe";

    container.replaceChildren(iframe);
    container.classList.add("is-loaded");
    // Move focus into the player so keyboard users can control it straight away.
    iframe.focus();
  });
}
