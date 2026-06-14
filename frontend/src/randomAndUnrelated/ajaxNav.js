(function () {
  mw.loader.using(["mediawiki.api"]).then(() => {
    const body = document.querySelector("#mw-content-text");

    const originalContent = body.innerHTML;

    const state = new Map([
      ["home", originalContent],
      ["enbi", "<div>hi</div>"],
    ]);

    function render(page, push = true, url = location.href) {
      const content = state.get(page);
      const api = new mw.Api();

      if (!content) {
        console.log("No content.");
        return;
      }

      body.innerHTML = content;

      if (push) {
        history.pushState({ page }, "", url);
      }
      window.scrollTo(0, 0);
      const title = decodeURIComponent(
        url.replace(
          /https:\/\/[a-z]+\.[a-z]+\.org\/(index\.php\?title=|wiki\/)/,
          "",
        ),
      ).replace(/_/g, " ");
      const header = document.querySelector(
        "#firstHeading .mw-page-title-main",
      );
      header.textContent = title;
    }

    function init() {
      history.replaceState({ page: "home" }, "", location.href);

      document.addEventListener("click", (e) => {
        const link = e.target.closest("a");
        if (!link) return;
        e.preventDefault();
        const title = decodeURIComponent(
          link.href.replace(
            /https:\/\/[a-z]+\.[a-z]+\.org\/(index\.php\?title=|wiki\/)/,
            "",
          ),
        ).replace(/_/g, " ");

        render(title, true, link.href);
      });

      document.addEventListener("mouseover", async (e) => {
        const link = e.target.closest("a");
        if (!link) return;
        const title = decodeURIComponent(
          link.href.replace(
            /https:\/\/[a-z]+\.[a-z]+\.org\/(index\.php\?title=|wiki\/)/,
            "",
          ),
        ).replace(/_/g, " ");
        try {
          const data = await api.get({
            action: "parse",
            page: title,
            format: "json",
            formatversion: 2,
          });
          let text = data?.parse?.text;
          if (!text) {
            text =
              '<div style="font-size:2em;font-weight:bold;">Error loading page.</div>';
            console.error(data);
          }
          state.set(title, text);
          link.style.color = "rgb(52, 208, 255)";
        } catch (err) {
          state.set(
            title,
            '<div style="font-size:2em;font-weight:bold;">Error loading page.</div>',
          );
          console.error(err);
        }
        console.log("Hover finished");
      });

      window.addEventListener("popstate", (e) => {
        const page = e.state?.page || "home";

        // Don't push another history entry while restoring
        render(page, false);
      });
    }

    init();
  });
})();
