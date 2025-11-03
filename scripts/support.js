document.addEventListener("DOMContentLoaded", () => {
  const boxes = document.querySelectorAll(".question-box");

  boxes.forEach((box, i) => {
    box.style.opacity = "0";
    box.style.transform = "translateY(40px)";
    setTimeout(() => {
      box.style.transition = "opacity 0.6s ease, transform 0.6s ease";
      box.style.opacity = "1";
      box.style.transform = "translateY(0)";
    }, i * 300);
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, { threshold: 0.3 });

  boxes.forEach(box => observer.observe(box));
});
