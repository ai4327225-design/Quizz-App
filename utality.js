// export function getCurrentUser() {
//     return JSON.parse(localStorage.getItem("loggedInUser")) || { name: "Unknown User" };
// }

// export function getQuizzes() {
//     return JSON.parse(localStorage.getItem("quizzes")) || [];
// }

// export function saveQuizzes(quizzes) {
//     localStorage.setItem("quizzes", JSON.stringify(quizzes));
// }

// export function getQuizAttempts() {
//     return JSON.parse(localStorage.getItem("quizAttempts")) || [];
// }

export function logoutUser() {
    localStorage.removeItem("loggedInUser");
    window.location.href = "login.html"
}

export function getUserInitials(name) {
    if (!name) return "U";
    const parts = name.split(' ');
    let initials = parts[0].charAt(0).toUpperCase();
    if (parts.length > 1) initials += parts[parts.length - 1].charAt(0).toUpperCase();
    return initials;
}

export function generateRandomColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    const bgColor = `rgba(${r}, ${g}, ${b}, 0.3)`;

    const darkR = Math.floor(r * 0.6);
    const darkG = Math.floor(g * 0.6);
    const darkB = Math.floor(b * 0.6);
    const textColor = `rgba(${darkR}, ${darkG}, ${darkB}, 0.9)`;

    return { bgColor, textColor };
}

export function initProfile() {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser")) || { name: "Unknown User" };
    const users = JSON.parse(localStorage.getItem("users")) || [];

    const fullUser = users.find(u => u.email === loggedInUser.email);

    if (!fullUser) return;

    const initials = getUserInitials(fullUser.name);

    const avatar = document.getElementById("userAvatar");
    if (avatar) {
        avatar.textContent = initials;
        avatar.style.backgroundColor = fullUser.avatarColors.bgColor;
        avatar.style.color = fullUser.avatarColors.textColor;
    }

    const dropdownAvatar = document.getElementById("dropdownAvatar");
    if (dropdownAvatar) {
        dropdownAvatar.textContent = initials;
        dropdownAvatar.style.backgroundColor = fullUser.avatarColors.bgColor;
        dropdownAvatar.style.color = fullUser.avatarColors.textColor;
    }

    const dropdownWelcome = document.getElementById("dropdownWelcome");
    if (dropdownWelcome) dropdownWelcome.textContent = `${fullUser.name}`;
}


export function calculateTotalTime(questions) {
    if (!questions || questions.length === 0) {
        return "0 sec";
    }

    let totalSeconds = 0;
    let questionCount = 0;

    questions.forEach((question) => {
        if (question.text && question.text.trim() !== "") {
            const time = parseInt(question.timeLimit);
            totalSeconds += (!isNaN(time) && time > 0) ? time : 60;
            questionCount++;
        }
    });

    if (questionCount === 0) {
        return "0 sec";
    }

    if (totalSeconds < 60) {
        return `${totalSeconds} sec`;
    } else {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        if (seconds === 0) {
            return `${minutes} min`;
        } else {
            return `${minutes} min ${seconds} sec`;
        }
    }
}



export function getScoreClass(percentage) {
    if (percentage >= 80) return 'score-excellent';
    if (percentage >= 60) return 'score-good';
    if (percentage >= 40) return 'score-average';
    return 'score-poor';
}

export function getScoreEmoji(percentage) {
    if (percentage >= 80) return '<i class="fas fa-trophy score-icon excellent"></i>';
    if (percentage >= 60) return '<i class="fas fa-thumbs-up score-icon good"></i>';
    if (percentage >= 40) return '<i class="fas fa-meh score-icon average"></i>';
    return '<i class="fas fa-frown score-icon poor"></i>';
}

export function getPerformanceText(percentage) {
    if (percentage >= 80) return 'Excellent!';
    if (percentage >= 60) return 'Good Job!';
    if (percentage >= 40) return 'Average';
    return 'Needs Improvement';
}

export function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

export function formatTime(seconds) {
    if (seconds < 60) {
        return `${seconds} seconds`;
    } else {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        if (remainingSeconds === 0) {
            return `${minutes} minutes`;
        } else {
            return `${minutes}m ${remainingSeconds}s`;
        }
    }
}

export function highlightCurrentPage() {
    const currentPage = window.location.pathname.split("/").pop();

    document.querySelectorAll(".nav-link-custom").forEach(link => {
        const linkPage = link.getAttribute("href");

        if (linkPage === currentPage) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });
}