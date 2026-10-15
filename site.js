(() => {
  const discord = window.NEXORA_SITE_CONFIG;
  for (const link of document.querySelectorAll("[data-discord-link]")) {
    if (discord?.discordInviteConfirmed && discord.discordInviteUrl) {
      link.href = discord.discordInviteUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = "Join Discord ↗";
    } else {
      link.href = "#community";
      link.removeAttribute("target");
      link.removeAttribute("rel");
    }
  }

  const checksum = document.getElementById("iso-checksum");
  const copyButton = document.getElementById("copy-checksum");
  const copyStatus = document.getElementById("copy-status");
  if (checksum && copyButton && copyStatus) {
    copyButton.addEventListener("click", async () => {
      const value = checksum.textContent.trim();
      try {
        if (!navigator.clipboard?.writeText) throw new Error("Clipboard API unavailable");
        await navigator.clipboard.writeText(value);
        copyStatus.textContent = "Checksum copied.";
      } catch (_error) {
        const range = document.createRange();
        range.selectNodeContents(checksum);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
        copyStatus.textContent = "Clipboard is blocked. The checksum is selected; press Ctrl+C to copy it.";
      }
    });
  }

  const download = document.getElementById("iso-download");
  const status = document.getElementById("download-state");
  if (!download || !status) return;

  const siteConfig = window.NEXORA_SITE_CONFIG || {};
  if (siteConfig.isoDownloadUrl) download.href = siteConfig.isoDownloadUrl;

  const bundledPortal = location.protocol === "file:" &&
    decodeURIComponent(location.pathname).includes("/usr/share/nexora-portal/");
  if (bundledPortal) {
    download.removeAttribute("href");
    download.setAttribute("aria-disabled", "true");
    download.removeAttribute("download");
    status.textContent = "The live desktop includes this guide, but the ISO is distributed separately and is not embedded inside the booted image.";
    return;
  }

  const target = new URL(download.href, location.href);
  if (target.origin !== location.origin) {
    download.removeAttribute("download");
    download.removeAttribute("aria-disabled");
    status.textContent = "An external release host is configured. Verify the downloaded file against the SHA-256 checksum before booting.";
    return;
  }

  if (location.protocol !== "file:") {
    fetch(target.href, { method: "HEAD", cache: "no-store" })
      .then((response) => {
        if (!response.ok) throw new Error("ISO unavailable");
        status.textContent = "ISO file is available from this release site.";
        download.removeAttribute("aria-disabled");
      })
      .catch(() => {
        status.textContent = "The ISO is not reachable from this server. Download hosting may not be configured.";
        download.removeAttribute("href");
        download.setAttribute("aria-disabled", "true");
      });
  }
})();
