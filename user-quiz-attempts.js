let currentQuiz = null;
let allAttempts = [];
let currentUser = null;
let currentUserAttempt = null;
let quizlist = [];

function getCurrentUser() {
    return JSON.parse(localStorage.getItem("loggedInUser")) || { name: "Guest" };
}

function getQuizAttempts() {
    return JSON.parse(localStorage.getItem("quizAttempts")) || [];
}

function getQuizzes() {
    return JSON.parse(localStorage.getItem("quizzes")) || [];
}

quizlist = getQuizzes();

function logoutUser() {
    localStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
}

function getSelectedQuiz() {
    const quizId = localStorage.getItem("selectedQuizId");
    return quizlist.find(quiz => quiz.id === quizId);
}

function getAllQuizAttempts() {
    const quizId = localStorage.getItem("selectedQuizId");
    const attempts = getQuizAttempts();

    return attempts.filter(attempt => attempt.quizId === quizId);
}

function getLatestAttemptsByUser() {
    const quizAttempts = getAllQuizAttempts();

    const latestAttemptsMap = new Map();

    quizAttempts.forEach(attempt => {
        const userId = attempt.userId;
        const existingAttempt = latestAttemptsMap.get(userId);

        if (!existingAttempt || new Date(attempt.date) > new Date(existingAttempt.date)) {
            latestAttemptsMap.set(userId, attempt);
        }
    });

    return Array.from(latestAttemptsMap.values()).sort((a, b) =>
        new Date(b.date) - new Date(a.date)
    );
}

function getCurrentUserLatestAttempt() {
    const currentUser = getCurrentUser();
    const latestAttempts = getLatestAttemptsByUser();
    return latestAttempts.find(attempt =>
        attempt.userId === (currentUser.email || currentUser.name)
    );
}

function takeQuiz() {
    const quizId = localStorage.getItem("selectedQuizId");
    if (quizId) {
        window.location.href = 'take-quiz.html';
    }
}

function initializePage() {
    currentQuiz = getSelectedQuiz();
    allAttempts = getLatestAttemptsByUser();
    currentUser = getCurrentUser();
    currentUserAttempt = getCurrentUserLatestAttempt();

    document.getElementById("quizTitle").textContent = currentQuiz.title;
    renderCurrentUserQuizButton();
    renderQuestionsAccordion();
    renderLatestAttempts();
}

function renderCurrentUserQuizButton() {
    const buttonContainer = document.getElementById("currentUserQuizButton")
    const quizAttempts = getAllQuizAttempts();
    if (quizAttempts.length > 0) {
        if (currentUserAttempt) {
            buttonContainer.innerHTML = `
            <button class="btn btn-retake-quiz" onclick="takeQuiz()">
                <i class="fas fa-redo-alt"></i> Retake Quiz
            </button>
        `;
        } else {
            buttonContainer.innerHTML = `
            <button class="btn btn-primary" onclick="takeQuiz()">
                <i class="fas fa-play-circle me-2"></i> Take Quiz
            </button>
        `;
        }
    }
}

function renderQuestionsAccordion() {
    const accordion = document.getElementById("questionsAccordion");
    accordion.innerHTML = '';

    currentQuiz.questions.forEach((question, questionIndex) => {
        let userSelectedIndex = -1;
        let attemptAnswer = null;

        if (currentUserAttempt && currentUserAttempt.answers && currentUserAttempt.answers[questionIndex]) {
            attemptAnswer = currentUserAttempt.answers[questionIndex];
            userSelectedIndex = currentQuiz.questions[questionIndex].options.findIndex(
                option => option === attemptAnswer.answer
            );
        }

        const isCorrect = userSelectedIndex === question.correctAnswer;

        const accordionItem = document.createElement("div");
        accordionItem.className = "accordion-item";
        accordionItem.innerHTML = `
            <h2 class="accordion-header" id="heading${questionIndex}">
                <button class="accordion-button collapsed" 
                        type="button" 
                        data-bs-toggle="collapse" 
                        data-bs-target="#collapse${questionIndex}" 
                        aria-expanded="false" 
                        aria-controls="collapse${questionIndex}">
                    <span class="me-3">Q${questionIndex + 1}</span>
                    ${question.text.substring(0, 50)}${question.text.length > 50 ? '...' : ''}
                </button>
            </h2>
            <div id="collapse${questionIndex}" 
                class="accordion-collapse collapse" 
                aria-labelledby="heading${questionIndex}" 
                data-bs-parent="#questionsAccordion">
                <div class="accordion-body">
                    <div class="mb-3">
                        <strong>Question:</strong> ${question.text}
                    </div>
                    
                    <div class="options-container">
                        ${question.options.map((option, optionIndex) => {
            const isUserSelected = optionIndex === userSelectedIndex;
            const isCorrectOption = optionIndex === question.correctAnswer;

            let optionClass = "option-item";

            if (currentUserAttempt && isUserSelected) {
                if (isCorrectOption) {
                    optionClass += " selected correct";
                } else {
                    optionClass += " selected incorrect";
                }
            } else {
                optionClass += " normal";
            }

            return `
                        <div class="${optionClass}">
                            ${option}
                            ${currentUserAttempt && isUserSelected && isCorrectOption ? ' <i class="fas fa-check float-end"></i>' : ''}
                            ${currentUserAttempt && isUserSelected && !isCorrectOption ? ' <i class="fas fa-times float-end"></i>' : ''}
                        </div>
                        `;
        }).join('')}
                    </div>
                </div>
            </div>
            `;
        accordion.appendChild(accordionItem);
    });
}

function renderLatestAttempts() {
    const userAttemptsList = document.getElementById("userAttemptsList");

    if (allAttempts.length === 0) {
        userAttemptsList.innerHTML = `
            <div class="no-attempt-message">
                <div class="no-attempt-icon">
                    <i class="fas fa-chart-bar"></i>
                </div>
                <h4>No Attempts Yet</h4>
                <p class="mb-3">No one has attempted this quiz yet.</p>
                <button class="btn btn-primary" onclick="takeQuiz()">
                   <i class="fas fa-play-circle me-2"></i> Take Quiz
                </button>
            </div>
        `;
        return;
    }

    userAttemptsList.innerHTML = allAttempts.map((attempt) => {

        const scoreClass = getScoreClass(attempt.score.percentage);
        const performanceText = getPerformanceText(attempt.score.percentage);
        const scoreEmoji = getScoreEmoji(attempt.score.percentage);
        const borderColor = getQuizColor(attempt.quizId)
        return `
        <div class="attempt-card-right" style="border-left: 4px solid ${borderColor};">
            <div class="attempt-header">
                <div class="attempt-info">
                    <h3 class="attempt-title">${attempt.userName}</h3>
                    <div class="attempt-date">${formatDate(attempt.date)}</div>
                </div>
                <div class="attempt-score">
                    <div class="score-circle  ${scoreClass}">
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
                    <span class="detail-value">${scoreEmoji} ${performanceText}</span>
                </div>
            </div>
        </div>
        `;
    }).join('');
}

function getScoreClass(percentage) {
    if (percentage >= 80) return 'score-excellent';
    if (percentage >= 60) return 'score-good';
    if (percentage >= 40) return 'score-average';
    return 'score-poor';
}

function getQuizColor(quizId) {
    const quizColor = quizlist.find((qz) => qz.id === quizId).color || "#4361ee"
    return quizColor;
}

function getScoreEmoji(percentage) {
    if (percentage >= 80) return '<i class="fas fa-trophy score-icon excellent"></i>';
    if (percentage >= 60) return '<i class="fas fa-thumbs-up score-icon good"></i>';
    if (percentage >= 40) return '<i class="fas fa-meh score-icon average"></i>';
    return '<i class="fas fa-frown score-icon poor"></i>';
}

function getPerformanceText(percentage) {
    if (percentage >= 80) return 'Excellent!';
    if (percentage >= 60) return 'Good Job!';
    if (percentage >= 40) return 'Average';
    return 'Needs Improvement';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatTime(seconds) {
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

// document.addEventListener("DOMContentLoaded", initializePage);
document.addEventListener("DOMContentLoaded", function () {
    const currentUser = getCurrentUser();
    document.getElementById("welcomeUser").textContent = `Welcome, ${currentUser.name}`;
    initializePage();
})