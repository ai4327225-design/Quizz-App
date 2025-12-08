let currentQuiz = null;
let currentQuestionIndex = 0;
let userAnswers = [];
let quizStartTime = null;
let timerInterval = null;
let totalTimeSpent = 0;
let questionStartTime = null;
let currentQuestionTimeLeft = 0;
let isTimeUp = false;

function getCurrentUser() {
    return JSON.parse(localStorage.getItem("loggedInUser")) || { name: "Unknown User" };
}

function getSelectedQuiz() {
    const quizId = localStorage.getItem("selectedQuizId");
    const quizzes = JSON.parse(localStorage.getItem("quizzes")) || [];
    return quizzes.find(quiz => quiz.id === quizId);
}


function logoutUser() {
    localStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
}

function addExactTime() {
    if (!questionStartTime) return;
    const allowed = parseInt(currentQuiz.questions[currentQuestionIndex].timeLimit);
    const spent = Math.floor((new Date() - questionStartTime) / 1000);
    totalTimeSpent += Math.min(spent, allowed);
}

// Save attempt
function saveQuizAttempt(score) {
    const currentUser = getCurrentUser();
    const attempts = JSON.parse(localStorage.getItem("quizAttempts")) || [];

    const detailedAnswers = currentQuiz.questions.map((question, index) => {
        const selectedIndex = userAnswers[index];
        const selectedText = selectedIndex !== null ? question.options[selectedIndex] : null;
        const allowedTime = parseInt(question.timeLimit) || 60;
        const spentTime = Math.min(totalTimeSpent, allowedTime);
        const wasLate = currentQuestionTimeLeft <= 0 && selectedIndex !== null;

        return {
            question: question.text,
            answer: selectedText,
            isCorrect: selectedIndex === question.correctAnswer,
            questionTime: allowedTime,
            userTime: spentTime,
            late: wasLate
        };
    })

    attempts.push({
        id: Date.now().toString(),
        userId: currentUser.email || currentUser.name,
        userName: currentUser.name,
        quizId: currentQuiz.id,
        quizTitle: currentQuiz.title,
        score: score,
        totalTime: totalTimeSpent,
        date: new Date().toISOString(),
        answers: detailedAnswers
    });

    localStorage.setItem("quizAttempts", JSON.stringify(attempts));
    updateQuizAttemptsCount();
}

// attempts count
function updateQuizAttemptsCount() {
    const quizzes = JSON.parse(localStorage.getItem("quizzes")) || [];
    const quizIndex = quizzes.findIndex(quiz => quiz.id === currentQuiz.id);

    if (quizIndex !== -1) {
        quizzes[quizIndex].attempts = (quizzes[quizIndex].attempts || 0) + 1;
        localStorage.setItem("quizzes", JSON.stringify(quizzes));
    }
}

// Initialize quiz
function initializeQuiz() {
    const currentUser = getCurrentUser();
    document.getElementById("welcomeUser").textContent = `Welcome, ${currentUser.name}`;
    currentQuiz = getSelectedQuiz();
    if (!currentQuiz) {
        alert("Quiz not found!");
        goToDashboard();
        return;
    }

    userAnswers = new Array(currentQuiz.questions.length).fill(null);
    totalTimeSpent = 0;
    isTimeUp = false;

    document.getElementById("quizTitle").textContent = currentQuiz.title;
    document.getElementById("questionCount").textContent = `${currentQuiz.questions.length} Questions`;
    document.getElementById("totalQuestions").textContent = `of ${currentQuiz.questions.length}`;

    quizStartTime = new Date();
    loadQuestion(0);
}

// Start question timer
function startQuestionTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
    }

    const currentQuestion = currentQuiz.questions[currentQuestionIndex];
    currentQuestionTimeLeft = parseInt(currentQuestion.timeLimit) || 60;
    isTimeUp = false;

    // timer display
    document.getElementById("timerDisplay").textContent = `Time Left: ${currentQuestionTimeLeft}s`;
    document.getElementById("timerDisplay").className = "timer-active";

    timerInterval = setInterval(() => {
        currentQuestionTimeLeft--;

        if (currentQuestionTimeLeft <= 0) {
            clearInterval(timerInterval);

            document.getElementById("timerDisplay").textContent = `Time's Up!`;
            document.getElementById("timerDisplay").className = "timer-expired";
            isTimeUp = true;

            addExactTime();
            questionStartTime = null;
            updateUI();
            return;
        }

        document.getElementById("timerDisplay").textContent = `Time Left: ${currentQuestionTimeLeft}s`;
    }, 1000);
}

// Load question
function loadQuestion(index) {
    if (index < 0 || index >= currentQuiz.questions.length) return;
    if (questionStartTime !== null && currentQuestionIndex !== index) {
        addExactTime();
    }

    currentQuestionIndex = index;
    const question = currentQuiz.questions[index];

    document.getElementById("questionText").textContent = question.text;
    document.getElementById("currentQuestion").textContent = `Question ${index + 1}`;
    document.getElementById("progressFill").style.width = `${((index + 1) / currentQuiz.questions.length) * 100}%`;

    loadOptions(question.options, userAnswers[index]);

    questionStartTime = new Date();
    startQuestionTimer();
    updateUI();
}

// Load options
function loadOptions(options, selectedOption) {
    const optionsContainer = document.getElementById("optionsContainer");
    optionsContainer.innerHTML = options.map((option, optionIndex) =>
        `<button class="option-item ${selectedOption === optionIndex ? 'selected' : ''}" 
                onclick="selectOption(${optionIndex})">${option}</button>`
    ).join('');
}


// Select option
function selectOption(optionIndex) {
    userAnswers[currentQuestionIndex] = optionIndex;
    document.querySelectorAll('.option-item').forEach((option, index) => {
        option.classList.toggle('selected', index === optionIndex);
    });
    updateUI();
}

function updateUI() {
    updateNavigationButtons();
}

// navigation
function updateNavigationButtons() {
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const submitBtn = document.getElementById("submitBtn");

    prevBtn.disabled = currentQuestionIndex === 0;

    if (currentQuestionIndex === currentQuiz.questions.length - 1) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'flex';
    } else {
        nextBtn.style.display = 'flex';
        submitBtn.style.display = 'none';
    }

    submitBtn.disabled = !userAnswers.every(answer => answer !== null);

    if (isTimeUp) {
        nextBtn.disabled = false;
    }

}


// previous
function previousQuestion() {
    loadQuestion(currentQuestionIndex - 1);
}

// next
function nextQuestion() {
    loadQuestion(currentQuestionIndex + 1);
}


// submit
function submitQuiz() {
    addExactTime();
    clearInterval(timerInterval);

    const score = calculateScore();
    saveQuizAttempt(score);

    window.location.href = "quiz-attempts.html";
}

// Calculate score
function calculateScore() {
    const correct = currentQuiz.questions.reduce((count, question, index) =>
        count + (userAnswers[index] === question.correctAnswer ? 1 : 0), 0);

    return {
        correct: correct,
        total: currentQuiz.questions.length,
        percentage: Math.round((correct / currentQuiz.questions.length) * 100)
    };
}

function goToDashboard() {
    if (timerInterval) clearInterval(timerInterval);
    window.location.href = "dashboard.html";
}

document.addEventListener("DOMContentLoaded", initializeQuiz);

