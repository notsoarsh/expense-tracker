document.getElementById("signupForm").addEventListener("submit", (e) => {
  e.preventDefault();
  showLoader();

  setTimeout(() => {
    let email = document.getElementById("email").value.trim().toLowerCase();
    let password = document.getElementById("pswd").value;
    let confirmPassword = document.getElementById("cpswd").value;

    //validation logic
    if (!email || !password || !confirmPassword) {
      hideLoader();
      toast.warning("Please fill in all fields!");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      hideLoader();
      toast.error("Please enter a valid email address!");
      return;
    }
    if (password.length < 6) {
      hideLoader();
      toast.error("Password must be atleast 6 characters or long!");
      return;
    }

    if (password !== confirmPassword) {
      hideLoader();
      toast.error("Password do not match!");
      return;
    }

    //if user already exists
    let users = JSON.parse(localStorage.getItem("users")) || [];
    let existingUser = users.find((user) => user.email.toLowerCase() === email);

    if (existingUser) {
      hideLoader();
      toast.error("Email already registred! Please login.");
      return;
    }
    //Store the new user in the users object
    users.push({ email, password });
    localStorage.setItem("users", JSON.stringify(users)); //uploaded to localstorage

    hideLoader();
    toast.success("Signup successful! Redirecting to login...");
    setTimeout(() => {
      window.location.href = "index.html";
    }, 1500);
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
