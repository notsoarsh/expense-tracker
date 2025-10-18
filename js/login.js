document.getElementById("loginBtn").addEventListener("click", function () {
  showLoader();

  setTimeout(() => {
    let email = document.getElementById("email").value;
    let password = document.getElementById("pswd").value;
    let rememberMe = document.getElementById("remember-me");
    //get the users list from localstorage
    let users = JSON.parse(localStorage.getItem("users")) || [];

    //keep a flag for authentication
    let isAuthenticated = false;

    //loop through users
    for (let user of users) {
      if (user.email === email && user.password === password) {
        isAuthenticated = true;
        break; //stop looping
      }
    }

    //reguide the user to dashboard
    if (isAuthenticated) {
      alert("Login Successful! Redirecting to dashboard....");
      //if remember me is checked set cookie to 30 days
      const cookieDuration = rememberMe ? 30 : 1;
      setCookie("loggedInUser", email, cookieDuration);
      window.location.href = "dashboard.html";
    } else {
      alert("Invalid email or password. Please try again or SignUp first.");
    }
    hideLoader();
  }, 1000);
});

    document.querySelectorAll(".toggle").forEach((toggle) => {
      toggle.addEventListener("click", function () {
        console.log("Toggle clicked")
        //find the previous sibling for this
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