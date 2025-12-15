import {logoutUser, getUserInitials, generateRandomColor, initProfile, getScoreClass, getScoreEmoji, getPerformanceText, formatDate, formatTime, highlightCurrentPage } from './utality.js';

window.logoutUser = logoutUser;
getUserInitials();
generateRandomColor();
initProfile();
highlightCurrentPage();

function getCurrentUser() {
    return JSON.parse(localStorage.getItem("loggedInUser")) || { name: "Guest" };
}

function getQuizAttempts() {
    return JSON.parse(localStorage.getItem("quizAttempts")) || [];
}

function getQuizzes() {
    return JSON.parse(localStorage.getItem("quizzes")) || [];
}


function renderQuizAttempts() {
    const container = document.querySelector('.attempts-container');
    const attemptsList = document.getElementById("attemptsList");
    const emptyState = document.getElementById("emptyState");
    const currentUser = getCurrentUser();
    const allAttempts = getQuizAttempts();
    const allQuizzes = getQuizzes();

    const userAttempts = allAttempts.filter(attempt => {
        const isUserAttempt = attempt.userId === (currentUser.email || currentUser.name);
        const quizExists = allQuizzes.some(quiz => quiz.id === attempt.quizId);
        return isUserAttempt && quizExists;
    });

    if (userAttempts.length === 0) {
        attemptsList.innerHTML = '';
        emptyState.style.display = 'block';

        container.classList.remove("has-quizzes");
        container.classList.add("empty");
        return;
    }

    emptyState.style.display = 'none';
    container.classList.remove("empty");
    container.classList.add("has-quizzes");

    userAttempts.sort((a, b) => new Date(b.date) - new Date(a.date));
    const stats = calculateStatistics(userAttempts);

    // Render statistics
    attemptsList.innerHTML = `
    <div class="stats-summary container">
        <div class="row">
            <div class="col-md-4 mb-3">
                <div class="stat-card">
                    <div class="stat-number">${stats.totalAttempts}</div>
                    <div class="stat-label">Total Attempts</div>
                </div>
            </div>

            <div class="col-md-4 mb-3">
                <div class="stat-card">
                    <div class="stat-number">${stats.averageScore}%</div>
                    <div class="stat-label">Average Score</div>
                </div>
            </div>

            <div class="col-md-4 mb-3">
                <div class="stat-card">
                    <div class="stat-number">${stats.bestScore}%</div>
                    <div class="stat-label">Best Score</div>
                </div>
            </div>
        </div>
    </div>
`;


    // Render attempt
    userAttempts.forEach(attempt => {
        const quiz = allQuizzes.find(q => q.id === attempt.quizId);
        if (!quiz) return;

        const attemptElement = document.createElement('div');
        attemptElement.className = 'col-md-6 mb-2';
        attemptElement.innerHTML = `
         <div class="attempt-card" style="border-left: 4px solid ${quiz.color || '#4361ee'};">
            <div class="attempt-header">
                <div class="attempt-info">
                    <h3 class="attempt-title">${attempt.quizTitle}</h3>
                    <div class="attempt-date">${formatDate(attempt.date)}</div>
                </div>
                <div class="attempt-score">
                    <div class="score-circle ${getScoreClass(attempt.score.percentage)}">
                        ${attempt.score.percentage}%
                    </div>
                </div>
            </div>
            
            <div class="attempt-details">
                <div class="detail-item">
                    <span class="detail-label">Correct Answers</span>
                    <span class="detail-value">${attempt.score.correct} out of ${attempt.score.total}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Time Spent</span>
                    <span class="detail-value">${formatTime(attempt.totalTime)}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Performance</span>
                    <span class="detail-value">${getScoreEmoji(attempt.score.percentage)} ${getPerformanceText(attempt.score.percentage)}</span>
                </div>
            </div>
       
            <div class="attempt-actions">
                <button class="btn-retake-quiz" onclick="retakeQuiz('${attempt.quizId}')">
                    <i class="fas fa-redo"></i> Retake Quiz
                </button>
                <button class="btn-action btn-view-attempts" onclick="viewQuizAttempts('${attempt.quizId}')">
                    <i class="fas fa-eye"></i> View Attempts
                </button>
            </div>
        </div>    
        `;

        attemptsList.appendChild(attemptElement);
    });
}

// Calculate statistics
function calculateStatistics(attempts) {
    const totalAttempts = attempts.length;
    const averageScore = attempts.length > 0
        ? Math.round(attempts.reduce((sum, attempt) => sum + attempt.score.percentage, 0) / attempts.length)
        : 0;
    const bestScore = attempts.length > 0
        ? Math.max(...attempts.map(attempt => attempt.score.percentage))
        : 0;

    return {
        totalAttempts,
        averageScore,
        bestScore
    };
}

function retakeQuiz(quizId) {
    Swal.fire({
        title: "Retake Quiz?",
        text: "Are you sure you want to retake this quiz?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, Retake",
        cancelButtonText: "Cancel",
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#6c757d"
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.setItem('selectedQuizId', quizId);
            window.location.href = 'take-quiz.html';
        }
    });
}
window.retakeQuiz = retakeQuiz;

// View quiz and attempts
function viewQuizAttempts(quizId) {
    localStorage.setItem("selectedQuizId", quizId);
    window.location.href = "user-quiz-attempts.html";
}
window.viewQuizAttempts = viewQuizAttempts;

document.addEventListener("DOMContentLoaded", function () {
    renderQuizAttempts();
});