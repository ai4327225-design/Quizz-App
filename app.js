import { generateRandomColor} from './utality.js';

// Login User
function loginUser() {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    let users = JSON.parse(localStorage.getItem("users")) || [];

    const hashedPassword = CryptoJS.SHA256(password).toString();

    const user = users.find(u => u.email === email && u.password === hashedPassword);

    if (!user) {
        document.getElementById("loginError").innerText = "Invalid email or password.";
        return;
    }

    localStorage.setItem("loggedInUser", JSON.stringify(user));
    window.location.href = "dashboard.html";
}
window.loginUser = loginUser;

function registerUser() {
    const name = document.getElementById("regName").value;
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;

    if (!name || !email || !password) {
        document.getElementById("registerError").innerText = "All fields are required.";
        return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];

    if (users.find(u => u.email === email)) {
        document.getElementById("registerError").innerText = "Email already exists.";
        return;
    }

    const hashedPassword = CryptoJS.SHA256(password).toString();
     const avatarColors = generateRandomColor();

    const newUser = { name, email, password: hashedPassword,avatarColors, id: Date.now().toString(), };
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    localStorage.setItem("loggedInUser", JSON.stringify(newUser));
    window.location.href = "dashboard.html";
}


if (window.location.pathname.includes("dashboard.html")) {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

    if (!loggedInUser) {
        window.location.href = "login.html";
    } else {
        document.getElementById("welcomeUser").innerText = `Welcome, ${loggedInUser.name}`;
    }
}
window.registerUser = registerUser;