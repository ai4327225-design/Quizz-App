// import { getCurrentUser, getQuizzes, getQuizAttempts, logoutUser, getUserInitials, generateRandomColor, initProfile, calculateTotalTime, highlightCurrentPage } from './utality.js';
// window.logoutUser = logoutUser;
// getUserInitials();
// generateRandomColor();
// highlightCurrentPage();

import { logoutUser, getUserInitials, generateRandomColor, initProfile, calculateTotalTime, highlightCurrentPage } from './utality.js';
window.logoutUser = logoutUser;
getUserInitials();
generateRandomColor();
highlightCurrentPage();

function getCurrentUser() {
    return JSON.parse(localStorage.getItem("loggedInUser")) || { name: "Unknown User" };
}

function getQuizzes() {
    return JSON.parse(localStorage.getItem("quizzes")) || [];
}

function getQuizAttempts() {
    return JSON.parse(localStorage.getItem("quizAttempts")) || [];
}

function getQuizById(quizId) {
    const quizzes = getQuizzes();
    return quizzes.find(quiz => quiz.id === quizId)
}

const buttons = document.querySelectorAll('.btn-back');
const currentPage = window.location.pathname.split('/').pop();

buttons.forEach(btn => {
    const btnHref = btn.getAttribute('href');
    if (btnHref === currentPage) {
        btn.classList.add('active');
    }
});

function renderLeaderboard() {
    const leaderboardList = document.getElementById("leaderboardList");
    const userOverallAverages = calculateUserQuizAverage();

    if (userOverallAverages.length === 0) {
        leaderboardList.innerHTML = `
            <div class="empty-leaderboard text-center py-4">
                <i class="fas fa-chart-line mb-2 leader-board-icon"></i>
                <p class="text-muted">No attempts yet</p>
            </div>
        `;
        return;
    }

    const usersToShow = userOverallAverages;

    leaderboardList.innerHTML = usersToShow.map((userData, index) => {
        let placementClass = "";
        if (index === 0) placementClass = "first-place";
        else if (index === 1) placementClass = "second-place";
        else if (index === 2) placementClass = "third-place";

        const averageScore = Math.round(userData.averageScore);
        const medals = ['🏆', '🥈', '🥉'];
        const Icon = medals[index] || null;
        // const topPerformers = [0, 1, 2]
        // const isShowIcon = topPerformers.includes(index)

        const displayRank = Icon ? Icon : `${index + 1}.`;
        const scoreClass = getScoreClass(averageScore)

        return `
        <div class="leaderboard-item ${placementClass}">
            <div class="leaderboard-rank ${!Icon ? 'small-rank' : ''}">${displayRank}</div>
            <div class="leaderboard-user-info">
                <div class="leaderboard-user-name">${userData.userName}</div>
                <div class="leaderboard-stats">
                    <div class="attempts-info">
                        <span> <i class="fas fa-chart-bar"></i> ${userData.totalAttempts} Attempt${userData.totalAttempts > 1 ? 's' : ''}</span>
                    </div>
                </div>
            </div>
            <div class="leaderboard-score">
                  <div class="score-circle ${scoreClass}">
                    ${averageScore}%
                </div>
            </div>
            
        </div>
        `;
    }).join("");
}

function getScoreClass(percentage) {
    if (percentage >= 80) return 'score-excellent';
    if (percentage >= 60) return 'score-good';
    if (percentage >= 40) return 'score-average';
    return 'score-poor';
}

function calculateUserQuizAverage() {
    const attempts = getQuizAttempts();
    const userStats = {};
    attempts.forEach(attempt => {
        const userId = attempt.userId;
        if (!userStats[userId]) {
            userStats[userId] = {
                userName: attempt.userName,
                totalScore: 0,
                totalAttempts: 0,
                latestAttempt: attempt.date
            };
        }

        userStats[userId].totalScore += attempt.score.percentage;
        userStats[userId].totalAttempts++;

        if (new Date(attempt.date) > new Date(userStats[userId].latestAttempt)) {
            userStats[userId].latestAttempt = attempt.date;
        }
    });

    const result = [];

    for (const userId in userStats) {
        const user = userStats[userId];
        result.push({
            userId: userId,
            userName: user.userName,
            totalAttempts: user.totalAttempts,
            averageScore: Math.round(user.totalScore / user.totalAttempts),
            latestAttempt: user.latestAttempt
        });
    }

    return result.sort((a, b) => {
        if (b.averageScore !== a.averageScore) {
            return b.averageScore - a.averageScore;
        }

        if (a.totalAttempts !== b.totalAttempts) {
            return a.totalAttempts - b.totalAttempts;
        }

        return new Date(b.latestAttempt) - new Date(a.latestAttempt);
    });


}


function renderPublishedQuizzes() {
    const container = document.querySelector('.render-publish-quizzes');
    const quizzesList = document.getElementById("quizzesList");
    const emptyState = document.getElementById("emptyState");
    const quizzes = getQuizzes();
    const currentUser = getCurrentUser();
    const attempts = getQuizAttempts();

    const viewerInterests = currentUser.interests || [];

    const visibleQuizzes = quizzes.filter(quiz => {

        if (quiz.creatorId === currentUser.id) {
            return true;
        }

        if (!quiz.published) {
            return false;
        }

        if (viewerInterests.length === 0) {
            return true;
        }

        const quizCategory = (quiz.category || "").toLowerCase();
        const matchesViewerInterest = viewerInterests.some(interest => {
            const viewerInterestShow = interest.toLowerCase();
            return quizCategory.includes(viewerInterestShow) ||
                viewerInterestShow.includes(quizCategory);
        });

        return matchesViewerInterest;

    })

    if (visibleQuizzes.length === 0) {
        quizzesList.innerHTML = "";
        emptyState.style.display = "block";
        container.classList.remove("has-quizzes");
        container.classList.add("empty");
        return;
    }

    emptyState.style.display = "none";
    container.classList.remove("empty");
    container.classList.add("has-quizzes");

    quizzesList.innerHTML = visibleQuizzes.map((quiz) => {
        const userAttempts = attempts.filter(attempt =>
            attempt.quizId === quiz.id &&
            (attempt.userId === currentUser.id || attempt.userName === currentUser.name)
        );

        const hasAttempted = userAttempts.length > 0;

        return `
        <div class="col-md-6 mb-2">
            <div class="quiz-card" style="border-left: 4px solid ${quiz.color || '#4361ee'};">
                <div class="quiz-header">
                    <div>
                        <h3 class="quiz-title">${quiz.title}</h3>
                        <p class="quiz-description">
                            ${quiz.description && quiz.description.trim().length > 0
                ? (quiz.description.length > 36 ? quiz.description.substring(0, 36) + "..." : quiz.description)
                : "No description"}
                        </p>
                        <div class="quiz-category">
                            <i class="fas fa-tag"></i>
                            <span>${quiz.category || "General"}</span>
                        </div>  
                        <p class="creator-info">Created by: ${getUserNameById(quiz.creatorId)}</p>
                    </div>
                </div>
                
                <div class="quiz-meta">
                    <div class="meta-item">
                        <i class="fas fa-question-circle"></i>
                        <span>${countValidQuestions(quiz.questions)} Questions</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-clock"></i>
                        <span>${calculateTotalTime(quiz.questions)}</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-chart-bar"></i>
                        <span>${quiz.attempts || 0} Attempts</span>
                    </div>
                </div>
                
                <div class="quiz-actions">
                    <button class="btn-take-quiz ${hasAttempted ? 'btn-retake-quiz' : ''}" 
                            onclick="takeQuiz('${quiz.id}')">
                        <i class="fas ${hasAttempted ? 'fa-redo' : 'fa-play-circle'}"></i> 
                        ${hasAttempted ? 'Retake Quiz' : 'Take Quiz'}
                    </button>
                    <button class="btn-action btn-view-attempts" onclick="viewQuizAttempts('${quiz.id}')">
                        <i class="fas fa-eye"></i> View Attempts
                    </button>
                </div>
            </div>
        </div>`;
    }).join("");
}

function getUserNameById(userId) {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(u => u.id === userId)
    return user ? user.name : "Unknown User";
}


function countValidQuestions(questions) {
    return questions.filter(q =>
        q.text.trim() !== "" &&
        q.options.some(opt => opt.trim() !== "")
    ).length;
}

// Take quiz function
function takeQuiz(quizId) {
    localStorage.setItem("selectedQuizId", quizId);
    window.location.href = "take-quiz.html";
}
window.takeQuiz = takeQuiz;

// View quiz and attempts
function viewQuizAttempts(quizId) {
    localStorage.setItem("selectedQuizId", quizId);
    window.location.href = "user-quiz-attempts.html";
}
window.viewQuizAttempts = viewQuizAttempts;

document.addEventListener("DOMContentLoaded", function () {
    initProfile();
    renderPublishedQuizzes();
    renderLeaderboard();
});