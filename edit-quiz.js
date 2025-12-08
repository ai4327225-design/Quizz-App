let questionCount = 0;
let currentQuiz = null;
let editingQuizId = null;

function getCurrentUser() {
    return JSON.parse(localStorage.getItem("loggedInUser")) || { name: "Unknown User" };
}

function getQuizzes() {
    return JSON.parse(localStorage.getItem("quizzes")) || [];
}

function saveQuizzes(quizzes) {
    localStorage.setItem("quizzes", JSON.stringify(quizzes));
}

function showMarkdown() {
    document.getElementById('markdownSection').style.display = 'block';
    document.getElementById('questionsSection').style.display = 'none';
}

function hideMarkdown() {
    document.getElementById('markdownSection').style.display = 'none';
    document.getElementById('questionsSection').style.display = 'block';
}

function logoutUser() {
    localStorage.removeItem("loggedInUser");
    window.location.href = "login.html"
}

function renderQuestions() {
    const markdownText = document.getElementById('markdownInput').value;
    const questions = parseMarkdown(markdownText);

    // document.getElementById('questionsContainer').innerHTML = '';
    // questionCount = 0;

    const existingCards = document.querySelectorAll(".question-card");
    questionCount = existingCards.length;


    questions.forEach(q => {
        addQuestionFromMarkdown(q);
    });

    hideMarkdown();
}



function parseMarkdown(text) {
    const questions = [];
    const questionBlocks = text.split(/\n\s*\n/);

    questionBlocks.forEach(block => {
        const lines = block.split('\n').filter(line => line.trim() !== '');
        const question = {
            text: '',
            timeLimit: 60,
            options: [],
            correctAnswer: -1
        };

        lines.forEach(line => {

            if (line.trim().toLowerCase().startsWith('question')) {
                question.text = line.split(':').slice(1).join(':').trim();
                console.log(question.text, "question")
            } else if (line.trim().toLowerCase().startsWith('time limit')) {
                question.timeLimit = parseInt(line.split(':')[1].trim()) || 60;
                console.log(question.timeLimit, "timelimit")
            } else if (line.trim().toLowerCase().startsWith('options')) {
                console.log(line, "options")
            } else if (line.trim().startsWith('-')) {
                const optionText = line.substring(1).trim();
                const isCorrect = optionText.toLowerCase().includes('[correct]');
                const cleanOption = optionText.replace(/\[correct\]/gi, '').replace(/-/g, '').trim();

                console.log(optionText, "optionText")
                console.log(isCorrect, "isCorrect")
                console.log(cleanOption, "cleanOption")

                question.options.push(cleanOption);
                if (isCorrect) {
                    question.correctAnswer = question.options.length - 1;
                }
                console.log(question.options, "question.options")

            }
        });

        if (question.text && question.options.length > 0) {
            questions.push(question);
        }
    });

    return questions;
}


function addQuestionFromMarkdown(questionData) {
    questionCount++;
    const questionId = `q${questionCount}`;

    let optionsHtml = '';
    questionData.options.forEach((option, index) => {
        const isChecked = index === questionData.correctAnswer ? 'checked' : '';
        optionsHtml += `
            <div class="option-item">
                <div class="option-actions">
                    <input type="radio" name="${questionId}" ${isChecked}>
                </div>
                 <input type="text" class="form-control option-input" value="${option.replace(/"/g, '&quot;').replace(/'/g, '&#39;')}" placeholder="Option ${index + 1}">
            </div>
        `;
    });

    const newQuestion = `
        <div class="question-card">
            <div class="question-header">
                <span class="question-number">Question ${questionCount}</span>
                <button class="btn-remove" onclick="deleteQuestion(this)">Remove</button>
            </div>
                            
            <div class="mb-3">
                <label class="form-label">Question Text</label>
                        <input type="text" class="form-control question-text" value="${questionData.text.replace(/"/g, '&quot;').replace(/'/g, '&#39;')}" placeholder="Enter question">
            </div>
                            
            <div class="mb-3">
                <label class="form-label">Time Limit (seconds)</label>
                <input type="number" class="form-control time-limit-input" value="${questionData.timeLimit}" min="5">
            </div>
                            
            <div class="mb-3">
                <label class="form-label">Options</label>
                ${optionsHtml}
            </div>
        </div>
    `;

    document.getElementById("questionsContainer").innerHTML += newQuestion;
}


function addQuestion() {
    questionCount++;

    const questionId = `q${questionCount}`;

    const newQuestion = document.createElement("div");
    newQuestion.classList.add("question-card");
    newQuestion.innerHTML = `
        <div class="question-header">
            <span class="question-number">Question ${questionCount}</span>
            <button class="btn-remove" onclick="deleteQuestion(this)">Remove</button>
        </div>
                
        <div class="mb-3">
            <label class="form-label">Question Text</label>
            <input type="text" class="form-control question-text" placeholder="Enter question">
        </div>
                
        <div class="mb-3">
            <label class="form-label">Time Limit (seconds)</label>
            <input type="number" class="form-control time-limit-input" value="60" min="5">
        </div>
                
        <div class="mb-3">
            <label class="form-label">Options</label>
                    
            <div class="option-item">
                <div class="option-actions">
                    <input type="radio" name="${questionId}" checked>
                </div>
                <input type="text" class="form-control option-input" placeholder="Option 1">
            </div>
                    
            <div class="option-item">
                <div class="option-actions">
                    <input type="radio" name="${questionId}">
                </div>
                <input type="text" class="form-control option-input" placeholder="Option 2">
            </div>
                    
            <div class="option-item">
                <div class="option-actions">
                    <input type="radio" name="${questionId}">
                </div>
                <input type="text" class="form-control option-input" placeholder="Option 3">
            </div>
                    
            <div class="option-item">
                <div class="option-actions">
                    <input type="radio" name="${questionId}">
                </div>
                <input type="text" class="form-control option-input" placeholder="Option 4">
            </div>
        </div>
    `;

    document.getElementById("questionsContainer").appendChild(newQuestion);
}


function deleteQuestion(btn) {
    Swal.fire({
        title: "Are you sure?",
        text: "Do you really want to remove this question?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Yes, remove it!",
        cancelButtonText: "Cancel"
    }).then((result) => {
        if (result.isConfirmed) {
            btn.closest(".question-card").remove();
            renumberQuestions();

            Swal.fire({
                title: "Deleted!",
                text: "The question has been removed successfully.",
                icon: "success",
                showConfirmButton: true,
            });
        }
    });
}


function renumberQuestions() {
    const cards = document.querySelectorAll(".question-card");
    cards.forEach((card, index) => {
        card.querySelector(".question-number").textContent = `Question ${index + 1}`;
    });
}


function loadQuiz() {
    editingQuizId = localStorage.getItem("editingQuizId");
    const quizzes = getQuizzes();
    currentQuiz = quizzes.find(q => q.id === editingQuizId);

    if (!currentQuiz) {
        Swal.fire({
            title: "Quiz Not Found!",
            text: "The quiz you are trying to edit does not exist.",
            icon: "error",
            confirmButtonText: "OK",
            confirmButtonColor: "#d33"
        }).then(() => {
            window.location.href = "my-quizzes.html";
        });
        return;
    }


    document.getElementById("quizTitle").value = currentQuiz.title;
    document.getElementById("quizDescription").value = currentQuiz.description;
    document.getElementById("quizCategory").value = currentQuiz.category;
    loadQuestions();
}

function loadQuestions() {
    let container = document.getElementById("questionsContainer");
    container.innerHTML = "";
    questionCount = 0;

    currentQuiz.questions.forEach((q) => {
        questionCount++;

        let optionsHtml = "";
        q.options.forEach((option, i) => {
            const checked = i === q.correctAnswer ? "checked" : "";
            optionsHtml += `
                <div class="option-item">
                    <div class="option-actions">
                        <input type="radio" name="q${questionCount}" ${checked}>
                    </div>
                    <input type="text" class="form-control option-input" value="${option.replace(/"/g, '&quot;').replace(/'/g, '&#39;')}">
                </div>`;
        });

        container.innerHTML += `
            <div class="question-card">
                <div class="question-header">
                    <span class="question-number">Question ${questionCount}</span>
                    <button class="btn-remove" onclick="deleteQuestion(this)">Remove</button>
                </div>

                <div class="mb-3">
                    <label class="form-label">Question Text</label>
                         <input type="text" class="form-control question-text" value="${q.text.replace(/"/g, '&quot;').replace(/'/g, '&#39;')}" placeholder="Enter question">
                </div>

                <div class="mb-3">
                    <label class="form-label">Time Limit (seconds)</label>
                    <input type="number" class="form-control time-limit-input" value="${q.timeLimit || 60}">
                </div>

                <div class="mb-3">
                    <label class="form-label">Options</label>
                    ${optionsHtml}
                </div>
            </div>`;
    });
}


function updateQuiz() {
    let title = document.getElementById("quizTitle").value.trim();
    let description = document.getElementById("quizDescription").value.trim();
    let category = document.getElementById("quizCategory").value.trim();

    const questionCards = document.querySelectorAll(".question-card");
    if (questionCards.length === 0) {
        Swal.fire({
            title: "No Questions Found!",
            text: "Quiz must have at least 1 question before updating.",
            icon: "warning",
            confirmButtonText: "OK",
            confirmButtonColor: "#7066E0"
        });
        return;
    }

    const questions = [];

    questionCards.forEach((card, index) => {
        const text = card.querySelector(".question-text").value.trim();
        const timeLimit = parseInt(card.querySelector(".time-limit-input").value);
        const optionInputs = card.querySelectorAll(".option-input");
        const radios = card.querySelectorAll("input[type='radio']");

        if (text === "") {
            Swal.fire({
                title: `Question ${index + 1} is empty!`,
                text: "Please enter the question text.",
                icon: "warning",
                confirmButtonText: "OK",
                confirmButtonColor: "#7066E0"
            });
            throw "stop";
        }

        const options = [];
        let correctAnswerIndex = -1;

        optionInputs.forEach((option, i) => {
            if (option.value.trim() === "") {
                Swal.fire({
                    title: `Option ${i + 1} of Question ${index + 1} is empty!`,
                    text: "Please fill in this option before updating the quiz.",
                    icon: "warning",
                    confirmButtonText: "OK",
                    confirmButtonColor: "#7066E0"
                });
                throw "stop";

            }
            options.push(option.value);
            if (radios[i].checked) correctAnswerIndex = i;
        });

        questions.push({
            text,
            timeLimit: timeLimit || 60,
            options,
            correctAnswer: correctAnswerIndex
        });
    });

    const quizzes = getQuizzes();
    const quizIndex = quizzes.findIndex(q => q.id === editingQuizId);

    quizzes[quizIndex].title = title;
    quizzes[quizIndex].description = description;
    quizzes[quizIndex].category = category;
    quizzes[quizIndex].questions = questions;
    quizzes[quizIndex].updatedAt = new Date().toISOString();

    saveQuizzes(quizzes);

    Swal.fire({
        title: "Updated!",
        text: "Quiz has been successfully updated.",
        icon: "success",
        showConfirmButton: true,
    }).then(() => {
        window.location.href = "my-quizzes.html";
    });

}


document.addEventListener("DOMContentLoaded", () => {
    const user = getCurrentUser();
    document.getElementById("welcomeUser").textContent = `Welcome, ${user.name}`;
    loadQuiz();
});