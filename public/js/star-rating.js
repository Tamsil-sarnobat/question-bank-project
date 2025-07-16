document.addEventListener("DOMContentLoaded", () => {
  const stars = document.querySelectorAll("#star-rating i");
  const ratingInput = document.getElementById("rating-value");

  stars.forEach((star, index) => {
    star.addEventListener("click", () => {
      const rating = star.getAttribute("data-value");
      ratingInput.value = rating;

      stars.forEach((s, i) => {
        s.classList.toggle("bi-star-fill", i < rating);
        s.classList.toggle("bi-star", i >= rating);
      });
    });
  });
});