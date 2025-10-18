function showLoader() {
  const overlay = document.getElementById("app-loader");
  if (overlay) {
    overlay.style.display = "flex";
  }
}

function hideLoader() {
  const overlay = document.getElementById("app-loader");
  if (overlay) {
    overlay.style.display = "none";
  }
}