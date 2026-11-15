(() => {
  const config = window.KAINAT_CONFIG || {};
  const menuButton = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".primary-nav");
  if (menuButton && nav) {
    menuButton.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      menuButton.setAttribute("aria-expanded", String(open));
      menuButton.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    });
    nav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      menuButton.setAttribute("aria-expanded", "false");
      menuButton.setAttribute("aria-label", "Open navigation");
    }));
  }

  const year = document.getElementById("current-year");
  if (year) year.textContent = new Date().getFullYear();

  const form = document.getElementById("enquiry-form");
  const status = document.getElementById("form-status");
  if (form) {
    form.addEventListener("submit", event => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const data = new FormData(form);
      const message = [
        "Kainat Tutorials enquiry",
        "Name: " + data.get("name"),
        "Class: " + data.get("class"),
        "Board: " + data.get("board"),
        "Preferred format: " + data.get("format"),
        "Phone: " + data.get("phone"),
        "Additional details: " + (data.get("message") || "Not provided")
      ].join("\n");
      const number = String(config.whatsappNumber || "").replace(/\D/g, "");
      if (!number) {
        if (status) status.textContent = "The enquiry form is ready. The website owner needs to add the official WhatsApp number in site-config.js before enquiries can be sent.";
        return;
      }
      const url = "https://wa.me/" + number + "?text=" + encodeURIComponent(message);
      window.open(url, "_blank", "noopener,noreferrer");
      if (status) status.textContent = "Your enquiry message has been prepared in WhatsApp. Please review and send it there.";
    });
  }
})();