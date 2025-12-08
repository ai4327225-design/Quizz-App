let questionCount = 1;

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

    document.getElementById('questionsContainer').innerHTML = '';
    questionCount = 0;

    // const existingCards = document.querySelectorAll(".question-card");
    // questionCount = existingCards.length;

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

    const borderColor = getRandomColor() || "#4361ee";
    newQuestion.style.borderLeft = `4px solid ${borderColor}`;

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
    btn.parentElement.parentElement.remove();
    renumberQuestions();
}

function renumberQuestions() {
    const cards = document.querySelectorAll(".question-card");
    cards.forEach((card, index) => {
        card.querySelector(".question-number").textContent = `Question ${index + 1}`;
        questionCount = cards.length;
    });
}

function getRandomColor() {
    let color = "#" + Math.floor(Math.random() * 16777215).toString(16);
    return color || "#4361ee";
}



// Save quiz
function saveQuiz() {
    let title = document.getElementById("quizTitle").value;
    let description = document.getElementById("quizDescription").value;
    let category = document.getElementById("quizCategory").value
    if (title === "") {
        Swal.fire({
            icon: "error",
            title: "Oops",
            text: "Please enter quiz title"
        });
        return;
    }

    if (category === "") {
        Swal.fire({
            icon: "error",
            title: "Oops",
            text: "Please select a category"
        });
        return;
    }

    const questionCards = document.querySelectorAll(".question-card");
    const questions = [];

    questionCards.forEach((card, index) => {
        const questionText = card.querySelector(".question-text").value;
        const timeLimit = card.querySelector(".time-limit-input").value;
        const optionInputs = card.querySelectorAll(".option-input");
        const radioButtons = card.querySelectorAll("input[type='radio']");

        const options = [];
        let correctAnswerIndex = -1;

        optionInputs.forEach((input, i) => {
            options.push(input.value);
            if (radioButtons[i].checked) {
                correctAnswerIndex = i;
            }
        });

        questions.push({
            text: questionText,
            timeLimit: parseInt(timeLimit) || 60,
            options: options,
            correctAnswer: correctAnswerIndex
        });
    });

    const currentUser = JSON.parse(localStorage.getItem("loggedInUser")) || { name: "Unknown User" };

    const quiz = {
        id: Date.now().toString(),
        title: title,
        description: description,
        category: category,
        questions: questions,
        published: false,
        attempts: 0,
        createdAt: new Date().toISOString(),
        creator: currentUser.name,
        color: getRandomColor()
    };

    // Save to localStorage
    const quizzes = getQuizzes();
    quizzes.push(quiz);
    saveQuizzes(quizzes);

    Swal.fire({
        title: "Quiz Created",
        text: 'Your quiz has been successfully saved.',
        icon: 'success',
        showConfirmButton: true,
    }).then(() => {
        window.location.href = "my-quizzes.html";
    })
}

document.addEventListener("DOMContentLoaded", function () {
    const currentUser = getCurrentUser();
    document.getElementById("welcomeUser").textContent = `Welcome, ${currentUser.name}`;
});