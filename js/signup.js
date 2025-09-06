// Constructor Function for Users
function User(email, password) { 
  this.email = email;
  this.password = password;
}

document.querySelector(".signup-btn").addEventListener("click", function () {
  let email = document.getElementById("email").value;
  let password = document.getElementById("pswd").value;
  let confirmPassword = document.getElementById("confirm-pswd").value;

  //validation logic
  if (!email || !password || !confirmPassword) {
    alert("Please fill all fields.");
    return;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  //if user already exists
  let users = JSON.parse(localStorage.getItem("users")) || [];
  let existingUser = users.find(user => user.email === email);

  if (existingUser) {
    alert("User already exists please try again.");
    return;
  }

  //Save the new user
  let newUser = new User(email, password);
  users.push(newUser);
  localStorage.setItem("users", JSON.stringify(users)); //uploaded to localstorage

  alert("Signup successful! Redirecting to login...");
  window.location.href = "index.html";
})