import {logoutUser, getUserInitials, generateRandomColor, initProfile, calculateTotalTime, highlightCurrentPage } from './utality.js';
window.logoutUser = logoutUser;
getUserInitials();
generateRandomColor();
initProfile();
highlightCurrentPage();

function getCurrentUser() {
    return JSON.parse(localStorage.getItem("loggedInUser")) || { name: "Unknown User" };
}

function getQuizzes() {
    return JSON.parse(localStorage.getItem("quizzes")) || [];
}

function saveQuizzes(quizzes) {
    localStorage.setItem("quizzes", JSON.stringify(quizzes));
}

// Render quizzes 
function renderQuizzes() {
    const container = document.querySelector('.quizzes-container');
    const quizzesList = document.getElementById("quizzesList");
    const emptyState = document.getElementById("emptyState");
    const quizzes = getQuizzes();
    const currentUser = getCurrentUser();

    const myQuizzes = quizzes.filter(quiz => quiz.creatorId === currentUser.id);

    if (myQuizzes.length === 0) {
        quizzesList.innerHTML = "";
        emptyState.style.display = "block";

        container.classList.remove("has-quizzes");
        container.classList.add("empty");
        return;
    }

    emptyState.style.display = "none";
    container.classList.remove("empty");
    container.classList.add("has-quizzes");

    quizzesList.innerHTML = myQuizzes.map((quiz, index) => {
        const allQuizzes = getQuizzes();
        const actualIndex = allQuizzes.findIndex(q => q.id === quiz.id);
        console.log("actualIndex", actualIndex);


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
                           <span>${quiz.category || "General"}
                        </div>   
                    </div>
                    <span class="status-badge ${quiz.published ? "status-published" : "status-draft"}">
                        ${quiz.published ? "Published" : "Draft"}
                    </span>
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
                    <button class="btn-action btn-view-attempts" onclick="viewQuizAttempts('${quiz.id}')">
                        <i class="fas fa-eye"></i> View Attempts
                    </button>
                    <button class="btn-action ${quiz.published ? 'btn-unpublish' : 'btn-publish'}" onclick="togglePublish('${quiz.id}')">
                        <i class="fas ${quiz.published ? "fa-circle-xmark" : "fa-circle-check"}"></i> 
                        ${quiz.published ? "Unpublish" : "Publish"}
                    </button>
                    <button class="btn-action btn-delete" onclick="deleteQuiz('${quiz.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>

                    <button class="btn-action btn-edit" onclick="editQuiz('${quiz.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                </div>
            </div>
        </div>    
        `;
    }).join("");
}

function countValidQuestions(questions) {
    return questions.filter(q =>
        q.text.trim() !== "" &&
        q.options.some(opt => opt.trim() !== "")
    ).length;
}


// View quiz and attempts
function viewQuizAttempts(quizId) {
    localStorage.setItem("selectedQuizId", quizId);
    window.location.href = "user-quiz-attempts.html";
}
window.viewQuizAttempts = viewQuizAttempts;

function togglePublish(quizId) {
    const quizzes = getQuizzes();
    const quizIndex = quizzes.findIndex(quiz => quiz.id === quizId);

    if (quizIndex !== -1) {
        const quiz = quizzes[quizIndex];

        if (countValidQuestions(quiz.questions) === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Cannot Publish',
                text: 'Add at least one valid question before publishing.'
            });
            return;
        }

        if (quiz.questions.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Cannot Publish',
                text: 'This quiz has no questions. Please add questions before publishing.',
                confirmButtonText: 'OK'
            });
            return;
        }

        if (quiz.published) {
            Swal.fire({
                title: 'Are you sure?',
                text: "You are about to unpublish this quiz!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, unpublish it!',
                cancelButtonText: 'Cancel'
            }).then((result) => {
                if (result.isConfirmed) {
                    quiz.published = false;
                    saveQuizzes(quizzes);
                    renderQuizzes();
                    Swal.fire(
                        'Unpublished!',
                        'The quiz is no longer available to users.',
                        'success'
                    );
                }
            });
        } else {
            quiz.published = true;
            saveQuizzes(quizzes);
            renderQuizzes();
            Swal.fire(
                'Published!',
                'The quiz is now available to all users.',
                'success'
            );
        }
    }
}
window.togglePublish = togglePublish;


function deleteQuiz(quizId) {
    Swal.fire({
        title: 'Are you sure?',
        text: "All quiz attempts will also be deleted!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',

    }).then((result) => {
        if (result.isConfirmed) {
            const quizzes = getQuizzes();
            const quizIndex = quizzes.findIndex(quiz => quiz.id === quizId);

            if (quizIndex !== -1) {
                deleteQuizAttempts(quizId);
                quizzes.splice(quizIndex, 1);
                saveQuizzes(quizzes);
                localStorage.removeItem("selectedQuizId");
                renderQuizzes();

                // Success message
                Swal.fire({
                    title: 'Deleted!',
                    text: 'Quiz and all its attempts have been deleted successfully!',
                    icon: 'success',
                    showConfirmButton: true,
                });
            }
        }
    });
}
window.deleteQuiz = deleteQuiz;

// Delete all attempts
function deleteQuizAttempts(quizId) {
    let attempts = JSON.parse(localStorage.getItem("quizAttempts")) || [];
    attempts = attempts.filter(attempt => attempt.quizId !== quizId);
    localStorage.setItem("quizAttempts", JSON.stringify(attempts));
}

function editQuiz(id) {
    const quizzes = getQuizzes();
    const quiz = quizzes.find(q => q.id === id);
    const currentUser = getCurrentUser();

  if (quiz.creatorId === currentUser.id) {
        localStorage.setItem("editingQuizId", id);
        window.location.href = "edit-quiz.html";
    } else {
        Swal.fire({
            icon: "error",
            title: "Access Denied",
            text: "You can only edit quizzes created by you!"
        });
    }
}
window.editQuiz = editQuiz;

document.addEventListener("DOMContentLoaded", function () {
    renderQuizzes();
});