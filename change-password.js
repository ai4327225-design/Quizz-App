import { logoutUser, getUserInitials, generateRandomColor, initProfile } from './utality.js';
window.logoutUser = logoutUser;
getUserInitials();
generateRandomColor();
initProfile();

function togglePassword(button) {
    const passwordField = button.previousElementSibling;
    const icon = button.querySelector('i');

    if (passwordField.type === 'password') {
        passwordField.type = 'text';
        icon.className = 'bi bi-eye-slash';
    } else {
        passwordField.type = 'password';
        icon.className = 'bi bi-eye';
    }
}
window.togglePassword = togglePassword;

function handlePasswordChange(e) {
    e.preventDefault();

    const newPassword = document.getElementById('newPassword').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();

    if (!newPassword) {
        Swal.fire('Error', 'Please enter a new password', 'error');
        return;
    }

    if (newPassword !== confirmPassword) {
        Swal.fire('Error', 'New password and Confirm password do not match', 'error');
        return;
    }

    const hashedPassword = CryptoJS.SHA256(newPassword).toString();

    const currentUser = JSON.parse(localStorage.getItem('loggedInUser')) || {};
    const users = JSON.parse(localStorage.getItem('users')) || [];

    const userIndex = users.findIndex(user => user.email === currentUser.email);
    if (userIndex !== -1) {
        users[userIndex].password = hashedPassword;
        localStorage.setItem('users', JSON.stringify(users));
    }

    currentUser.password = hashedPassword;
    localStorage.setItem('loggedInUser', JSON.stringify(currentUser));

    Swal.fire({
        icon: 'success',
        title: 'Password Updated!',
        text: 'Your password has been updated successfully.',
        confirmButtonText: 'OK'
    });

    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
}

function initializePasswordForm() {
    const passwordForm = document.getElementById('changePasswordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', handlePasswordChange);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    initializePasswordForm();
});
