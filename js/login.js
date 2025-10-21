document.getElementById("loginForm").addEventListener("submit", (e) => {
  e.preventDefault();
  showLoader();

  setTimeout(() => {
    let email = document.getElementById("email").value.trim().toLowerCase();
    let password = document.getElementById("pswd").value;
    let rememberMe = document.getElementById("remember-me").checked;

    if (!email || !password) {
      hideLoader();
      toast.warning("Please fill all fields!");
      return;
    }

    //get the users list from localstorage
    let users = JSON.parse(localStorage.getItem("users")) || [];
    let user = users.find(
      (user) => user.email.toLowerCase() === email && user.password === password
    );
    let isAuthenticated = user !== undefined;

    //reguide the user to dashboard
    if (isAuthenticated) {
      //if remember me is checked set cookie to 30 days
      const cookieDuration = rememberMe ? 30 : 1;
      setCookie("loggedInUser", email, cookieDuration);
      toast.success("Login successful! Redirecting to dashboard...");
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 1000);
    } else {
      hideLoader();
      toast.error("Invalid email or password!");
    }
  }, 500);
});

document.querySelectorAll(".toggle").forEach((toggle) => {
  toggle.addEventListener("click", function () {
    const inputPassword = this.previousElementSibling;
    //just toggle the attribute from password to text
    if (inputPassword.type === "password") {
      inputPassword.type = "text";
      this.textContent = "🙈";
    } else {
      inputPassword.type = "password";
      this.textContent = "👁️";
    }
  });
});
