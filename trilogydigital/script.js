document.addEventListener("DOMContentLoaded", () => {
  const actions = {
    print: () => window.print(),
    pdf: () => window.print(),
    word: () => {
      alert("Export to Word is available in the live proposal editor. Use Print / PDF for a document copy from this static version.");
    },
    edit: () => {
      alert("Edit mode is available in the live proposal template. This static HTML recreation is view-only.");
    },
  };

  document.querySelectorAll("[data-action]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const key = btn.getAttribute("data-action");
      if (actions[key]) actions[key]();
    });
  });
});
