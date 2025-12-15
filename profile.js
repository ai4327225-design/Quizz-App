import { logoutUser, getUserInitials, generateRandomColor, initProfile} from './utality.js';
window.logoutUser = logoutUser;
getUserInitials();
generateRandomColor();

// Interest categories and options
const interestCategories = [
    {
        name: "Science And Technology",
        interests: ["Physics", "Chemistry", "Biology", "Computer Science", "Artificial Intelligence", "Space Science", "Engineering Basics", "General Science"]
    },
    {
        name: "Mathematics",
        interests: ["Arithmetic", "Algebra", "Geometry", "Calculus", "Statistics", "Probability", "Number Systems", "Trigonometry"]
    },
    {
        name: "Health And Lifestyle",
        interests: ["Nutrition", "Fitness", "Mental Health", "First Aid", "Healthy Habits", "Human Body Basics", "Diseases And Prevention"]
    },
    {
        name: "History And Culture",
        interests: ["World History", "Ancient Civilizations", "Wars And Revolutions", "Historical Figures", "Arts And Culture", "Traditions And Customs", "Geography And Civilizations"]
    },
    {
        name: "Language And Literature",
        interests: ["English Grammar", "Vocabulary", "Reading Comprehension", "Poetry", "Famous Authors", "Linguistics", "Idioms And Phrases"]
    },
    {
        name: "Business And Finance",
        interests: ["Entrepreneurship", "Marketing", "Economics", "Accounting Basics", "Personal Finance", "Startups", "E-commerce"]
    },
    {
        name: "General Knowledge",
        interests: ["Current Affairs", "Countries And Capitals", "World Organizations", "Important Inventions", "Sports", "Famous Personalities", "Environment And Ecology"]
    },
    {
        name: "Entertainment And Media",
        interests: ["Movies", "Music", "TV Shows", "Celebrities", "Pop Culture", "Animation", "Gaming"]
    },
    {
        name: "Exam And Career Prep",
        interests: ["IQ Tests", "Aptitude", "Logical Reasoning", "Verbal Ability", "Interview Preparation", "Professional Skills", "Job Readiness"]
    },
    {
        name: "Arts And Creativity",
        interests: ["Drawing Basics", "Photography", "Film Making", "Graphic Design", "Interior Design", "Crafts And DIY"]
    },
    {
        name: "Nature And Environment",
        interests: ["Wildlife", "Forests", "Climate Change", "Oceans And Rivers", "Environmental Protection", "Plants And Trees"]
    }
];

let selectedInterests = [];

function loadProfile() {
    const user = JSON.parse(localStorage.getItem("loggedInUser")) || { name: "User", interests: [] };

    document.getElementById("userName").value = user.name || "";
    document.getElementById("userEmail").value = user.email || "";
    // document.getElementById("welcomeUser").textContent = `welcome, ${user.name}` || 'User';

    selectedInterests = user.interests || [];
    renderInterests();
    updateSelectedCount();
    updateInterestDisplay();
}

function renderInterests() {
    const container = document.getElementById("interestsContainer");
    const html = interestCategories.map(category => {
        const interestsHtml = category.interests.map(interest => {
            const isSelected = selectedInterests.includes(interest);
            return `<div class="interest-option ${isSelected ? 'selected' : ''}" onclick="toggleInterest('${interest}')">${interest}</div>`;
        }).join('');

        return `
           <div class="interests-category">
              <div class="category-title">${category.name}</div>
              <div class="d-flex flex-wrap">${interestsHtml}</div>
           </div>
        `;
    }).join('');

    container.innerHTML = html;
}

function toggleInterest(interest) {
    const index = selectedInterests.indexOf(interest)
    if (index === -1) {
        selectedInterests.push(interest);
    } else {
        selectedInterests.splice(index, 1);
    }

    updateInterestOption(interest);
    updateSelectedCount();
    updateInterestDisplay();
}
window.toggleInterest = toggleInterest;

function updateInterestOption(interest) {
    document.querySelectorAll('.interest-option').forEach(option => {
        if (option.textContent.trim() === interest) {
            option.classList.toggle('selected', selectedInterests.includes(interest));
        }
    });
}

function updateSelectedCount() {
    const count = selectedInterests.length;
    document.getElementById("selectedCount").textContent = `Selected: ${count} interest${count !== 1 ? 's' : ''}`;
    document.getElementById("interestCount").textContent = count;
}

function updateInterestDisplay() {
    const container = document.getElementById("interestTags");
    if (selectedInterests.length > 0) {
        const tagsHtml = selectedInterests.map(interest => {
            return `<span class="interest-tag">${interest}<button class="remove-tag" onclick="removeInterest('${interest}')"><i class="fa fa-times cross-icon"></i></button></span>`
        }).join('');
        container.innerHTML = tagsHtml
    } else {
        container.innerHTML = '<span class="no-interest">No interests selected</span>';
    }
}

function removeInterest(interestRemove) {
    const index = selectedInterests.indexOf(interestRemove);
    if (index !== -1) {
        selectedInterests.splice(index, 1);
        updateInterestOption(interestRemove);
        updateSelectedCount();
        updateInterestDisplay();
    }
}
window.removeInterest= removeInterest;
function setupForm() {
    document.getElementById("profileForm").addEventListener("submit", function (e) {
        e.preventDefault();
        const name = document.getElementById("userName").value.trim();
        if (selectedInterests.length === 0) {
            Swal.fire('Error', 'Please select at least one interest', 'error');
            return;
        }

        updateProfile(name, selectedInterests)
    })
}

function updateProfile(name, interests) {
    const currentUser = JSON.parse(localStorage.getItem('loggedInUser')) || {};
    
    const updatedCurrentUser = {
        ...currentUser,
        name: name,
        interests: interests
    };
    
    localStorage.setItem('loggedInUser', JSON.stringify(updatedCurrentUser));

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const updatedUsers = users.map(u => {
        if (u.email === currentUser.email) {
            return {
                ...u,
                name: name,
                interests: interests
            }
        }
        return u;
    });
    
    localStorage.setItem('users', JSON.stringify(updatedUsers));

    // const avatar = document.getElementById("userAvatar");
    // if (avatar) {
    //     avatar.textContent = getUserInitials(name);
    // }

    Swal.fire({
        icon: 'success',
        title: 'Profile Updated!',
        text: 'Your profile has been updated successfully.',
        confirmButtonText: 'OK'
    }).then(() => {
        loadProfile();
        initProfile();
    });
}

// function generateRandomColor() {
//     const r = Math.floor(Math.random() * 256);
//     const g = Math.floor(Math.random() * 256);
//     const b = Math.floor(Math.random() * 256);
//     const bgColor = `rgba(${r}, ${g}, ${b}, 0.3)`;

//     const darkR = Math.floor(r * 0.6);
//     const darkG = Math.floor(g * 0.6);
//     const darkB = Math.floor(b * 0.6);
//     const textColor = `rgba(${darkR}, ${darkG}, ${darkB}, 0.9)`;

//     return { bgColor, textColor };
// }


// function initProfile() {
//     const user = JSON.parse(localStorage.getItem("loggedInUser")) || { name: "Unknown User" };
//     console.log("Logged in user:", user);

//     if (!user.avatarColors) {
//         user.avatarColors = generateRandomColor();
//         localStorage.setItem("loggedInUser", JSON.stringify(user));
//     }

//     const avatar = document.getElementById("userAvatar");
//     if (avatar) {
//         avatar.textContent = getUserInitials(user.name);
//         avatar.style.backgroundColor = user.avatarColors.bgColor;
//         avatar.style.color = user.avatarColors.textColor;
//     }

//     const welcomeEl = document.getElementById("welcomeUser");
//     if (welcomeEl) welcomeEl.textContent = `Welcome, ${user.name}`;
// }

// function getUserInitials(name) {
//     if (!name) return "U";
//     const parts = name.split(' ');
//     let initials = parts[0].charAt(0).toUpperCase();
//     if (parts.length > 1) initials += parts[parts.length - 1].charAt(0).toUpperCase();
//     return initials;
// }



document.addEventListener('DOMContentLoaded', function () {
    initProfile();
    loadProfile();
    setupForm();
});