// =====================================================
// BUDGETBASICS - COMPLETE JAVASCRIPT
// =====================================================

"use strict";

// =====================================================
// JSON CONTENT (SRS REQUIREMENT)
// =====================================================
// Static page content lives in data/*.json and is rendered
// here at runtime with plain fetch(). Each loader rebuilds
// the exact same markup/classes as the old hardcoded HTML
// (icons, data-aos, stagger delays included) and shows a
// simple fallback message if the fetch fails — for example
// when the site is opened from file:// without a server.

// Loaded JSON is cached here so other functions can use it
let topicsData = null;
let quizData = null;
let mistakesData = null;
let expenseCategoriesData = null;
let savingTipsData = null;
let chatbotData = null;

// New SRS features: classifier items and ticker tips
let classifyData = null;
let tipsData = null;

// Current topic sort mode for the Search Topics section
let currentTopicSort = "newest";


// Small helper: fetch a JSON file and return the parsed data.
// Throws on a bad response so the caller can show its fallback.
function loadJSON(url) {

    return fetch(url).then(function (response) {

        if (!response.ok) {
            throw new Error("HTTP " + response.status);
        }

        return response.json();
    });
}


// Shows a simple fallback message inside a section container
function showFallback(container, message) {

    if (!container) return;

    container.innerHTML =
        '<p class="load-fallback">' + message + "</p>";
}


// Re-scan AOS after JSON content is rendered so the newly
// added data-aos elements animate instead of staying hidden
function refreshAOS() {

    if (typeof AOS !== "undefined") {
        AOS.refreshHard();
    }
}


// -----------------------------
// SEARCH TOPICS
// -----------------------------

function renderTopics(topics) {

    const container =
        document.getElementById("topicContainer");

    if (!container) return;

    // Sort a copy so the original JSON order is never mutated
    const sorted = topics.slice().sort(function (a, b) {

        if (currentTopicSort === "az") {

            return a.title.localeCompare(b.title);
        }

        if (currentTopicSort === "relevance") {

            return (b.relevance || 0) - (a.relevance || 0);
        }

        // Default "newest": latest dateAdded first
        return new Date(b.dateAdded) - new Date(a.dateAdded);
    });

    container.innerHTML = sorted
        .map(function (topic) {

            return `
                <div class="topic-card" data-aos="zoom-in"${topic.delay ? ` data-aos-delay="${topic.delay}"` : ""}>
                    <h3>${escapeHTML(topic.title)}</h3>
                    <p>${escapeHTML(topic.description)}</p>
                </div>
            `;
        })
        .join("");
}


// Sort control for the Search Topics section. Re-renders the
// cards from topicsData using the chosen sort mode.
function sortTopics(mode, button) {

    currentTopicSort = mode;

    // Move the .active highlight to the clicked button
    document.querySelectorAll(".sort-btn")
        .forEach(function (btn) {
            btn.classList.remove("active");
        });

    if (button) {
        button.classList.add("active");
    }

    if (topicsData) {

        renderTopics(topicsData);

        // Re-apply the active search filter to the fresh cards
        searchTopics();
    }
}


function loadTopics() {

    return loadJSON("data/topics.json")
        .then(function (topics) {

            topicsData = topics;

            renderTopics(topics);
        })
        .catch(function () {

            showFallback(
                document.getElementById("topicContainer"),
                "Content failed to load. Please refresh the page."
            );
        });
}


// -----------------------------
// KNOWLEDGE CHECK QUIZ
// -----------------------------

function renderQuiz(quiz) {

    const heading =
        document.getElementById("quizQuestion");

    const text =
        document.getElementById("quizText");

    const optionsBox =
        document.getElementById("quizOptions");

    if (!heading || !text || !optionsBox) return;

    heading.textContent = quiz.question;

    text.textContent = quiz.text;

    optionsBox.innerHTML = quiz.options
        .map(function (option) {

            return `
                <button onclick="checkAnswer('${option.key}')">
                    <i class="${option.icon}"></i>
                    ${escapeHTML(option.label)}
                </button>
            `;
        })
        .join("");
}


function loadQuiz() {

    return loadJSON("data/quiz.json")
        .then(function (quiz) {

            quizData = quiz;

            renderQuiz(quiz);
        })
        .catch(function () {

            const heading =
                document.getElementById("quizQuestion");

            if (heading) {
                heading.textContent = "Quiz unavailable";
            }

            showFallback(
                document.getElementById("quizOptions"),
                "Content failed to load. Please refresh the page."
            );
        });
}


// -----------------------------
// MONEY MISTAKES
// -----------------------------

function renderMistakes(mistakes) {

    const container =
        document.getElementById("mistakesContainer");

    if (!container) return;

    container.innerHTML = mistakes
        .map(function (mistake) {

            return `
                <div class="mistake-card" data-aos="zoom-in"${mistake.delay ? ` data-aos-delay="${mistake.delay}"` : ""} onclick="toggleMistake(this)">
                    <div class="mistake-icon"><i class="${mistake.icon}"></i></div>
                    <i class="fa-solid fa-chevron-down mistake-chevron"></i>
                    <h3>${escapeHTML(mistake.title)}</h3>
                    <p>
                        ${escapeHTML(mistake.description)}
                    </p>
                    <div class="mistake-tip">
                        <div class="mistake-tip-inner">
                            <strong><i class="fa-solid fa-lightbulb"></i> HOW TO FIX IT</strong>
                            ${escapeHTML(mistake.tip || "")}
                        </div>
                    </div>
                </div>
            `;
        })
        .join("");
}


// Expand/collapse a mistake card. Opening one collapses the
// others so only one corrective tip shows at a time.
function toggleMistake(card) {

    if (!card) return;

    const wasExpanded = card.classList.contains("expanded");

    // Close every card first (accordion behaviour)
    document.querySelectorAll(".mistake-card.expanded")
        .forEach(function (openCard) {
            openCard.classList.remove("expanded");
        });

    // Re-open the clicked card unless it was the open one
    if (!wasExpanded) {
        card.classList.add("expanded");
    }
}


function loadMistakes() {

    return loadJSON("data/mistakes.json")
        .then(function (mistakes) {

            mistakesData = mistakes;

            renderMistakes(mistakes);
        })
        .catch(function () {

            showFallback(
                document.getElementById("mistakesContainer"),
                "Content failed to load. Please refresh the page."
            );
        });
}


// -----------------------------
// EXPENSE CATEGORIES
// -----------------------------

function renderExpenseCategories(categories) {

    const select =
        document.getElementById("expenseCategory");

    if (!select) return;

    // Build each <option> with the DOM API so the hardcoded
    // "Select Category" placeholder stays first
    categories.forEach(function (category) {

        const option =
            document.createElement("option");

        option.value = category.value;

        option.textContent = category.label;

        select.appendChild(option);
    });
}


function loadExpenseCategories() {

    return loadJSON("data/expenseCategories.json")
        .then(function (categories) {

            expenseCategoriesData = categories;

            renderExpenseCategories(categories);
        })
        .catch(function () {

            // A <select> cannot show a message paragraph, so
            // add a disabled option instead
            const select =
                document.getElementById("expenseCategory");

            if (!select) return;

            const option =
                document.createElement("option");

            option.disabled = true;

            option.textContent = "Categories failed to load";

            select.appendChild(option);
        });
}


// -----------------------------
// SAVINGS TIPS
// -----------------------------

function renderSavingTips(tips) {

    const list =
        document.getElementById("savingTipsList");

    if (!list) return;

    list.innerHTML = tips.items
        .map(function (tip) {

            return `
                <li>${escapeHTML(tip)}</li>
            `;
        })
        .join("");
}


function loadSavingTips() {

    return loadJSON("data/savingTips.json")
        .then(function (tips) {

            savingTipsData = tips;

            renderSavingTips(tips);
        })
        .catch(function () {

            showFallback(
                document.getElementById("savingTipsList"),
                "Content failed to load. Please refresh the page."
            );
        });
}


// -----------------------------
// CHATBOT REPLIES
// -----------------------------

function loadChatbot() {

    // The chatbot only needs the data itself — replies are
    // looked up in getBotReply(), nothing to render here.
    return loadJSON("data/chatbot.json")
        .then(function (chatbot) {

            chatbotData = chatbot;
        })
        .catch(function (error) {

            console.error(
                "Could not load chatbot replies:",
                error
            );
        });
}


// -----------------------------
// NEEDS VS WANTS CLASSIFIER
// -----------------------------

let classifyIndex = 0;


function renderClassify() {

    const itemHeading =
        document.getElementById("classifyItem");

    const icon =
        document.getElementById("classifyIcon");

    if (!itemHeading || !icon) return;

    // Start from the first item in data/classify.json
    classifyIndex = 0;

    showClassifyItem();
}


function showClassifyItem() {

    const itemHeading =
        document.getElementById("classifyItem");

    const icon =
        document.getElementById("classifyIcon");

    const feedback =
        document.getElementById("classifyFeedback");

    if (!itemHeading || !icon || !classifyData) return;

    const item = classifyData[classifyIndex];

    itemHeading.textContent = item.item;

    icon.className = item.icon;

    // Reset the previous answer's feedback and colors
    if (feedback) {

        feedback.innerHTML = "";

        feedback.className = "";
    }
}


// Called by the Need / Want buttons. Reveals feedback that
// explains why the item is a need or a want.
function classifyAnswer(answer) {

    const feedback =
        document.getElementById("classifyFeedback");

    if (!feedback || !classifyData) return;

    const item = classifyData[classifyIndex];

    if (answer === item.answer) {

        feedback.innerHTML =
            '<i class="fa-solid fa-circle-check"></i> Correct! ' +
            escapeHTML(item.explanation);

        feedback.className = "classify-correct";

    } else {

        feedback.innerHTML =
            '<i class="fa-solid fa-circle-xmark"></i> Not quite. ' +
            escapeHTML(item.explanation);

        feedback.className = "classify-wrong";
    }
}


// Cycle to the next item (wraps back to the first)
function nextClassifyItem() {

    if (!classifyData || classifyData.length === 0) return;

    classifyIndex = (classifyIndex + 1) % classifyData.length;

    showClassifyItem();
}


function loadClassify() {

    return loadJSON("data/classify.json")
        .then(function (items) {

            classifyData = items;

            renderClassify();
        })
        .catch(function () {

            showFallback(
                document.getElementById("classifyFeedback"),
                "Content failed to load. Please refresh the page."
            );
        });
}


// -----------------------------
// FINANCIAL TIPS TICKER
// -----------------------------

function renderTicker() {

    const track =
        document.getElementById("tickerTrack");

    if (!track || !tipsData) return;

    // The CSS marquee animates to -50%, so the tips are
    // duplicated once for a seamless infinite loop.
    const tipsHTML = tipsData.tips
        .map(function (tip) {

            return `<span>${escapeHTML(tip)}</span>`;
        })
        .join("");

    track.innerHTML = tipsHTML + tipsHTML;
}


function loadTips() {

    return loadJSON("data/tips.json")
        .then(function (data) {

            tipsData = data;

            renderTicker();
        })
        .catch(function () {

            // The ticker is decorative — fail quietly
            console.error("Could not load ticker tips.");
        });
}


// -----------------------------
// SITEMAP
// -----------------------------

function renderSitemap(groups) {

    const container =
        document.getElementById("sitemapContainer");

    if (!container) return;

    container.innerHTML = groups
        .map(function (group) {

            const links = group.links
                .map(function (link) {

                    return `
                        <a href="${link.href}">${escapeHTML(link.label)}</a>
                    `;
                })
                .join("");

            return `
                <div class="sitemap-card" data-aos="zoom-in"${group.delay ? ` data-aos-delay="${group.delay}"` : ""}>

                    <h3><i class="${group.icon}"></i> ${escapeHTML(group.title)}</h3>

                    ${links}

                </div>
            `;
        })
        .join("");
}


function loadSitemap() {

    return loadJSON("data/sitemap.json")
        .then(function (groups) {

            renderSitemap(groups);
        })
        .catch(function () {

            showFallback(
                document.getElementById("sitemapContainer"),
                "Content failed to load. Please refresh the page."
            );
        });
}


// -----------------------------
// LOAD EVERYTHING
// -----------------------------
// Called once on DOMContentLoaded; fires every loader and
// re-scans AOS after all files have loaded or failed.

function loadPageContent() {

    Promise.all([
        loadTopics(),
        loadQuiz(),
        loadMistakes(),
        loadExpenseCategories(),
        loadSavingTips(),
        loadChatbot(),
        loadSitemap(),
        loadClassify(),
        loadTips()
    ]).then(refreshAOS);
}

// =====================================================
// MOBILE MENU
// =====================================================

function toggleMenu() {
    const menu = document.querySelector(".nav-links");

    if (menu) {
        menu.classList.toggle("active");
    }
}

document.addEventListener("DOMContentLoaded", function () {

    const navLinks = document.querySelectorAll(".nav-links a");

    navLinks.forEach(function (link) {
        link.addEventListener("click", function () {

            const menu = document.querySelector(".nav-links");

            if (menu) {
                menu.classList.remove("active");
            }

        });
    });

});


// =====================================================
// DARK / LIGHT THEME
// =====================================================

function toggleTheme() {

    const isDark =
        document.body.classList.toggle("dark-theme");

    try {

        localStorage.setItem(
            "budgetBasicsTheme",
            isDark ? "dark" : "light"
        );

    } catch (error) {

        console.error(
            "Error saving theme:",
            error
        );
    }

    updateThemeToggle();
}


function updateThemeToggle() {

    const toggle =
        document.getElementById("themeToggle");

    if (!toggle) return;

    toggle.innerHTML =
        document.body.classList.contains("dark-theme")
            ? '<i class="fa-solid fa-sun"></i>'
            : '<i class="fa-solid fa-moon"></i>';
}


function applySavedTheme() {

    let savedTheme = "light";

    try {

        savedTheme =
            localStorage.getItem("budgetBasicsTheme") ||
            "light";

    } catch (error) {

        savedTheme = "light";
    }

    if (savedTheme === "dark") {
        document.body.classList.add("dark-theme");
    }

    updateThemeToggle();
}


// =====================================================
// KNOWLEDGE CHECK
// =====================================================

function checkAnswer(answer) {

    const result = document.getElementById("quiz-result");

    if (!result) return;

    // The correct key + messages come from data/quiz.json
    const correctKey = quizData ? quizData.correct : "saving";

    if (answer === correctKey) {

        result.innerHTML =
            '<i class="fa-solid fa-circle-check"></i> ' +
            (quizData ? quizData.correctMessage : "Correct!");

        result.className = "quiz-correct";

    } else {

        result.innerHTML =
            '<i class="fa-solid fa-circle-xmark"></i> ' +
            (quizData ? quizData.wrongMessage : "Not quite.");

        result.className = "quiz-wrong";
    }
}


// =====================================================
// 50-30-20 BUDGET CALCULATOR
// =====================================================

function calculateBudget() {

    const incomeInput = document.getElementById("income");
    const result = document.getElementById("budgetResult");

    if (!incomeInput || !result) return;

    const income = Number(incomeInput.value);

    if (!income || income <= 0) {

        result.innerHTML = `
            <h4><i class="fa-solid fa-sack-dollar"></i> Your Monthly Budget</h4>

            <div class="budget-result-row">
                <span><i class="fa-solid fa-house"></i> Needs (50%)</span>
                <strong>Rs. 0</strong>
            </div>

            <div class="budget-result-row">
                <span><i class="fa-solid fa-basket-shopping"></i> Wants (30%)</span>
                <strong>Rs. 0</strong>
            </div>

            <div class="budget-result-row">
                <span><i class="fa-solid fa-bullseye"></i> Savings (20%)</span>
                <strong>Rs. 0</strong>
            </div>

        `;

        return;
    }

    const needs = income * 0.50;
    const wants = income * 0.30;
    const savings = income * 0.20;

    result.innerHTML = `
        <h4><i class="fa-solid fa-sack-dollar"></i> Your Monthly Budget</h4>

        <div class="budget-result-row">
            <span><i class="fa-solid fa-house"></i> Needs (50%)</span>
            <strong>Rs. ${needs.toLocaleString()}</strong>
        </div>

        <div class="budget-result-row">
            <span><i class="fa-solid fa-basket-shopping"></i> Wants (30%)</span>
            <strong>Rs. ${wants.toLocaleString()}</strong>
        </div>

        <div class="budget-result-row">
            <span><i class="fa-solid fa-bullseye"></i> Savings (20%)</span>
            <strong>Rs. ${savings.toLocaleString()}</strong>
        </div>

        <div class="budget-total">
            Total: Rs. ${income.toLocaleString()}
        </div>
    `;
}


// =====================================================
// SAVINGS GOAL CALCULATOR
// =====================================================

function calculateSaving() {

    const goalNameInput = document.getElementById("goalName");
    const targetInput = document.getElementById("targetAmount");
    const currentInput = document.getElementById("currentSaving");
    const monthlyInput = document.getElementById("monthlySaving");
    const result = document.getElementById("savingResult");

    if (
        !goalNameInput ||
        !targetInput ||
        !currentInput ||
        !monthlyInput ||
        !result
    ) {
        return;
    }

    const goalName = goalNameInput.value.trim();
    const target = Number(targetInput.value);
    const current = Number(currentInput.value);
    const monthly = Number(monthlyInput.value);

    if (
        goalName === "" ||
        !Number.isFinite(target) ||
        target <= 0 ||
        !Number.isFinite(current) ||
        current < 0 ||
        !Number.isFinite(monthly) ||
        monthly <= 0
    ) {

        result.innerHTML =
            '<i class="fa-solid fa-circle-xmark"></i> Please enter all information correctly.';

        result.style.color = "#e74c3c";

        return;
    }

    const remaining = target - current;

    if (remaining <= 0) {

        result.innerHTML =
            `<i class="fa-solid fa-party-horn"></i> Congratulations! You have already reached your ${escapeHTML(goalName)} goal.`;

        result.style.color = "#32b879";

        return;
    }

    const months = Math.ceil(remaining / monthly);

    result.innerHTML = `
        <strong><i class="fa-solid fa-bullseye"></i> Goal:</strong> ${escapeHTML(goalName)}<br>
        <strong><i class="fa-solid fa-sack-dollar"></i> Remaining Amount:</strong> Rs. ${formatNumber(remaining)}<br>
        <strong><i class="fa-solid fa-calendar-days"></i> Estimated Time:</strong> ${months} month(s)
    `;

    result.style.color = "#117568";
}


// =====================================================
// EXPENSE PLANNER
// =====================================================

let expenses = [];


// =====================================================
// LOAD EXPENSES FROM LOCAL STORAGE
// =====================================================

function loadExpenses() {

    try {

        const savedExpenses =
            localStorage.getItem("budgetBasicsExpenses");

        if (savedExpenses) {

            const parsedExpenses =
                JSON.parse(savedExpenses);

            if (Array.isArray(parsedExpenses)) {
                expenses = parsedExpenses;
            }

        }

    } catch (error) {

        console.error(
            "Error loading expenses:",
            error
        );

        expenses = [];
    }
}


// =====================================================
// SAVE EXPENSES
// =====================================================

function saveExpenses() {

    try {

        localStorage.setItem(
            "budgetBasicsExpenses",
            JSON.stringify(expenses)
        );

    } catch (error) {

        console.error(
            "Error saving expenses:",
            error
        );
    }
}


// =====================================================
// ADD EXPENSE
// =====================================================

function addExpense() {

    const nameInput =
        document.getElementById("expenseName");

    const categoryInput =
        document.getElementById("expenseCategory");

    const amountInput =
        document.getElementById("expenseAmount");

    const dateInput =
        document.getElementById("expenseDate");

    if (
        !nameInput ||
        !categoryInput ||
        !amountInput
    ) {

        console.error(
            "Expense form elements not found."
        );

        return;
    }

    const name =
        nameInput.value.trim();

    const category =
        categoryInput.value;

    const amount =
        parseFloat(amountInput.value);

    const date =
        dateInput
            ? dateInput.value
            : getTodayDate();


    // -----------------------------
    // VALIDATION
    // -----------------------------

    if (name === "") {

        alert(
            "Please enter an expense name."
        );

        nameInput.focus();

        return;
    }


    if (category === "") {

        alert(
            "Please select a category."
        );

        categoryInput.focus();

        return;
    }


    if (
        isNaN(amount) ||
        amount <= 0
    ) {

        alert(
            "Please enter a valid amount."
        );

        amountInput.focus();

        return;
    }


    // -----------------------------
    // CREATE EXPENSE
    // -----------------------------

    const expense = {

        id: Date.now(),

        name: name,

        category: category,

        amount: amount,

        date:
            date ||
            getTodayDate()
    };


    // -----------------------------
    // ADD TO ARRAY
    // -----------------------------

    expenses.push(expense);


    // -----------------------------
    // SAVE
    // -----------------------------

    saveExpenses();


    // -----------------------------
    // UPDATE PAGE
    // -----------------------------

    displayExpenses();

    updateExpenseSummary();

    updateExpenseBudget();


    // -----------------------------
    // CLEAR FORM
    // -----------------------------

    nameInput.value = "";

    categoryInput.value = "";

    amountInput.value = "";

    if (dateInput) {
        dateInput.value = getTodayDate();
    }


    // -----------------------------
    // SUCCESS MESSAGE
    // -----------------------------

    const message =
        document.getElementById("expenseMessage");

    if (message) {

        message.innerText =
            '<i class="fa-solid fa-circle-check"></i> Expense added successfully!';

        message.style.color =
            "#32b879";
    }

}


// =====================================================
// DISPLAY EXPENSES
// =====================================================

function displayExpenses() {

    const expenseItems =
        document.getElementById("expenseItems");

    if (!expenseItems) {

        console.error(
            "expenseItems element not found."
        );

        return;
    }


    // -----------------------------
    // EMPTY STATE
    // -----------------------------

    if (expenses.length === 0) {

        expenseItems.innerHTML = `

            <div class="empty-expense">

                <div><i class="fa-solid fa-receipt"></i></div>

                <h3>
                    No expenses added yet
                </h3>

                <p>
                    Add your first expense above
                    to start tracking your spending.
                </p>

            </div>

        `;

        return;
    }


    // -----------------------------
    // EXPENSE LIST
    // -----------------------------

    expenseItems.innerHTML = expenses
        .map(function (expense) {

            return `

                <div class="expense-table-row">

                    <span class="expense-name">

                        <strong>
                            ${escapeHTML(expense.name)}
                        </strong>

                    </span>


                    <span>

                        <span class="category-badge">

                            ${getCategoryIcon(expense.category)}

                            ${escapeHTML(expense.category)}

                        </span>

                    </span>


                    <span>

                        ${formatDate(expense.date)}

                    </span>


                    <span class="expense-price">

                        Rs. ${formatNumber(expense.amount)}

                    </span>


                    <span>

                        <button
                            type="button"
                            class="delete-expense"
                            onclick="deleteExpense(${expense.id})"
                            title="Delete expense"
                        >
                            <i class="fa-solid fa-trash-can"></i>
                        </button>

                    </span>

                </div>

            `;

        })
        .join("");

}


// =====================================================
// DELETE EXPENSE
// =====================================================

function deleteExpense(id) {

    expenses = expenses.filter(function (expense) {

        return String(expense.id) !== String(id);

    });


    saveExpenses();

    displayExpenses();

    updateExpenseSummary();

    updateExpenseBudget();

}


// =====================================================
// CLEAR ALL EXPENSES
// =====================================================

function clearExpenses() {

    if (expenses.length === 0) {

        return;
    }


    const confirmClear =
        confirm(
            "Are you sure you want to delete all expenses?"
        );


    if (!confirmClear) {

        return;
    }


    expenses = [];


    saveExpenses();

    displayExpenses();

    updateExpenseSummary();

    updateExpenseBudget();


    const message =
        document.getElementById("expenseMessage");

    if (message) {

        message.innerText =
            "All expenses cleared.";

        message.style.color =
            "#117568";
    }

}


// =====================================================
// EXPENSE SUMMARY
// =====================================================

function updateExpenseSummary() {

    const totalElement =
        document.getElementById("totalExpense");

    const countElement =
        document.getElementById("expenseCount");

    const averageElement =
        document.getElementById("averageExpense");


    const total =
        expenses.reduce(
            function (sum, expense) {

                return (
                    sum +
                    Number(expense.amount || 0)
                );

            },
            0
        );


    const count =
        expenses.length;


    const average =
        count > 0
            ? total / count
            : 0;


    if (totalElement) {

        totalElement.textContent =
            formatNumber(total);
    }


    if (countElement) {

        countElement.textContent =
            count;
    }


    if (averageElement) {

        averageElement.textContent =
            formatNumber(average);
    }

}


// =====================================================
// BUDGET PROGRESS
// =====================================================

function updateExpenseBudget() {

    const budgetInput =
        document.getElementById("expenseBudget");

    const progress =
        document.getElementById("expenseProgress");

    const status =
        document.getElementById("budgetStatus");


    if (
        !budgetInput ||
        !progress ||
        !status
    ) {

        return;
    }


    const budget =
        parseFloat(budgetInput.value);


    const total =
        expenses.reduce(
            function (sum, expense) {

                return (
                    sum +
                    Number(expense.amount || 0)
                );

            },
            0
        );


    if (
        isNaN(budget) ||
        budget <= 0
    ) {

        progress.style.width = "0%";

        status.textContent =
            "Set a budget to track your spending.";

        return;
    }


    const percentage =
        (total / budget) * 100;


    progress.style.width =
        Math.min(percentage, 100) + "%";


    if (total > budget) {

        status.textContent =
            "You have exceeded your budget by Rs. " +
            formatNumber(total - budget);

    }

    else if (total === budget) {

        status.textContent =
            "You have reached your budget limit.";

    }

    else {

        status.textContent =
            "You have Rs. " +
            formatNumber(budget - total) +
            " remaining.";

    }

}


// =====================================================
// CLEAR EXPENSE INPUTS
// =====================================================

function clearExpenseInputs() {

    const name =
        document.getElementById("expenseName");

    const category =
        document.getElementById("expenseCategory");

    const amount =
        document.getElementById("expenseAmount");

    const date =
        document.getElementById("expenseDate");


    if (name) {
        name.value = "";
    }

    if (category) {
        category.value = "";
    }

    if (amount) {
        amount.value = "";
    }

    if (date) {
        date.value = getTodayDate();
    }

}


// =====================================================
// FORMAT NUMBER
// =====================================================

function formatNumber(number) {

    return Number(number || 0)
        .toLocaleString(
            "en-PK",
            {
                maximumFractionDigits: 2
            }
        );
}


// =====================================================
// FORMAT DATE
// =====================================================

function formatDate(date) {

    if (!date) {

        return "-";
    }


    const dateObject =
        new Date(
            date + "T00:00:00"
        );


    if (isNaN(dateObject.getTime())) {

        return date;
    }


    return dateObject.toLocaleDateString(
        "en-PK",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );

}


// =====================================================
// CATEGORY ICONS
// =====================================================

function getCategoryIcon(category) {

    // Icons come from data/expenseCategories.json once loaded;
    // the object below is the fallback if that fetch failed.
    if (expenseCategoriesData) {

        const match = expenseCategoriesData.find(
            function (categoryItem) {
                return categoryItem.value === category;
            }
        );

        if (match) {
            return '<i class="' + match.icon + '"></i>';
        }
    }

    const icons = {

        "Needs": '<i class="fa-solid fa-house"></i>',

        "Food": '<i class="fa-solid fa-burger"></i>',

        "Transport": '<i class="fa-solid fa-bus"></i>',

        "Education": '<i class="fa-solid fa-book"></i>',

        "Shopping": '<i class="fa-solid fa-basket-shopping"></i>',

        "Entertainment": '<i class="fa-solid fa-gamepad"></i>',

        "Bills": '<i class="fa-solid fa-lightbulb"></i>',

        "Other": '<i class="fa-solid fa-box"></i>'

    };


    return (
        icons[category] ||
        '<i class="fa-solid fa-box"></i>'
    );

}


// =====================================================
// AI CHATBOT
// =====================================================

function sendMessage() {

    const input =
        document.getElementById("chatInput");

    const chatMessages =
        document.getElementById("chatMessages");


    if (
        !input ||
        !chatMessages
    ) {

        return;
    }


    const message =
        input.value.trim();


    if (message === "") {

        return;
    }


    // User message

    const userMessage =
        document.createElement("div");

    userMessage.className =
        "user-message";

    userMessage.innerText =
        message;

    chatMessages.appendChild(
        userMessage
    );


    // Bot message

    const botMessage =
        document.createElement("div");

    botMessage.className =
        "bot-message";

    botMessage.innerText =
        getBotReply(
            message.toLowerCase()
        );

    chatMessages.appendChild(
        botMessage
    );


    input.value = "";


    chatMessages.scrollTop =
        chatMessages.scrollHeight;

}


// =====================================================
// BOT REPLY
// =====================================================

function getBotReply(message) {

    // Replies come from data/chatbot.json once loaded;
    // the checks below are the fallback if that fetch failed.
    if (chatbotData && Array.isArray(chatbotData.responses)) {

        for (let i = 0; i < chatbotData.responses.length; i++) {

            const pair = chatbotData.responses[i];

            const keywords = pair.keywords || [];

            // A pair with no keywords is the catch-all reply
            if (keywords.length === 0) {
                return pair.response;
            }

            const matched = keywords.some(function (keyword) {
                return message.includes(keyword);
            });

            if (matched) {
                return pair.response;
            }
        }

        return "I can help you with budgeting, savings, needs, wants and expenses.";
    }

    if (
        message.includes("budget")
    ) {

        return "A budget is a plan for how you will use your income.";
    }


    if (
        message.includes("saving") ||
        message.includes("save")
    ) {

        return "Saving means keeping some money for your future goals.";
    }


    if (
        message.includes("need")
    ) {

        return "Needs are important things like food, education and transport.";
    }


    if (
        message.includes("want")
    ) {

        return "Wants are things you enjoy but can usually live without.";
    }


    if (
        message.includes("expense") ||
        message.includes("spending")
    ) {

        return "Tracking expenses helps you understand where your money is going.";
    }


    if (
        message.includes("50")
    ) {

        return "The 50-30-20 rule suggests 50% for needs, 30% for wants and 20% for savings.";
    }


    if (
        message.includes("goal")
    ) {

        return "A savings goal gives you a clear amount and target to work toward.";
    }


    return "I can help you with budgeting, savings, needs, wants and expenses.";

}


// =====================================================
// CHAT ENTER KEY
// =====================================================

function handleChat(event) {

    if (
        event.key === "Enter"
    ) {

        sendMessage();
    }

}


// =====================================================
// FEEDBACK
// =====================================================

function submitFeedback() {

    const nameInput =
        document.getElementById("feedbackName");

    const ratingInput =
        document.getElementById("feedbackRating");

    const messageInput =
        document.getElementById("feedbackMessage");

    const result =
        document.getElementById("feedbackResult");


    if (
        !nameInput ||
        !ratingInput ||
        !messageInput ||
        !result
    ) {

        return;
    }


    const name =
        nameInput.value.trim();

    const rating =
        ratingInput.value;

    const message =
        messageInput.value.trim();


    if (
        name === "" ||
        rating === "" ||
        message === ""
    ) {

        result.innerText =
            "Please fill all required fields.";

        result.style.color =
            "#e74c3c";

        return;
    }


    result.innerText =
        "Thank you, " +
        name +
        "! Your feedback has been submitted.";

    result.style.color =
        "#32b879";


    nameInput.value = "";

    ratingInput.value = "";

    messageInput.value = "";

}


// =====================================================
// SEARCH BUDGET TOPICS
// =====================================================

function searchTopics() {

    const input =
        document.getElementById("searchBox");

    const container =
        document.getElementById("topicContainer");

    if (!input || !container) return;

    const query =
        input.value.trim().toLowerCase();


    container.querySelectorAll(".topic-card")
        .forEach(function (card) {

            const text =
                card.innerText.toLowerCase();

            card.style.display =
                text.includes(query)
                    ? ""
                    : "none";

        });

}


// =====================================================
// HTML ESCAPE
// =====================================================

function escapeHTML(text) {

    const div =
        document.createElement("div");

    div.textContent =
        text;

    return div.innerHTML;
}


// =====================================================
// VISITOR COUNTER + LIVE CLOCK (SRS)
// =====================================================
// Session-based counter: localStorage stores the total visits
// and the id of the last session. A new session only counts
// once per browser tab session, no backend involved.

function initVisitorCounter() {

    const counterElement =
        document.getElementById("visitorCount");

    if (!counterElement) return;

    try {

        let visits =
            Number(localStorage.getItem("budgetBasicsVisits")) || 0;

        const lastSession =
            sessionStorage.getItem("budgetBasicsCounted");

        // Count this browser session only once
        if (!lastSession) {

            visits = visits + 1;

            localStorage.setItem(
                "budgetBasicsVisits",
                String(visits)
            );

            sessionStorage.setItem(
                "budgetBasicsCounted",
                "yes"
            );
        }

        counterElement.textContent =
            visits.toLocaleString();

    } catch (error) {

        // Storage can be blocked — show a simple fallback
        counterElement.textContent = "1";
    }
}


// Live clock: updates "Mon, 27 Sep 2026 14:32" every second
function initLiveClock() {

    const clockElement =
        document.getElementById("liveClock");

    if (!clockElement) return;

    function updateClock() {

        const now = new Date();

        clockElement.textContent =
            now.toLocaleString(
                "en-GB",
                {
                    weekday: "short",
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false
                }
            );
    }

    updateClock();

    // Tick every second so the clock always shows the current time
    setInterval(updateClock, 1000);
}


// =====================================================
// CONTACT US (SRS — client-side only)
// =====================================================
// Same validation style as submitFeedback(). Nothing is
// transmitted anywhere — a confirmation message is shown.

function submitContact() {

    const nameInput =
        document.getElementById("contactName");

    const emailInput =
        document.getElementById("contactEmail");

    const subjectInput =
        document.getElementById("contactSubject");

    const messageInput =
        document.getElementById("contactMessage");

    const result =
        document.getElementById("contactResult");

    if (
        !nameInput ||
        !emailInput ||
        !subjectInput ||
        !messageInput ||
        !result
    ) {
        return;
    }

    const name =
        nameInput.value.trim();

    const email =
        emailInput.value.trim();

    const subject =
        subjectInput.value.trim();

    const message =
        messageInput.value.trim();

    // A simple email shape check (client-side only)
    const emailOk =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (
        name === "" ||
        email === "" ||
        subject === "" ||
        message === ""
    ) {

        result.innerText =
            "Please fill all required fields.";

        result.style.color =
            "#e74c3c";

        return;
    }

    if (!emailOk) {

        result.innerText =
            "Please enter a valid email address.";

        result.style.color =
            "#e74c3c";

        return;
    }

    result.innerText =
        "Thank you, " +
        name +
        "! Your message has been sent.";

    result.style.color =
        "#32b879";

    nameInput.value = "";

    emailInput.value = "";

    subjectInput.value = "";

    messageInput.value = "";
}


// =====================================================
// INFOGRAPHIC GALLERY FILTER (SRS)
// =====================================================

function filterInfographics(category, button) {

    // Move the .active highlight to the clicked button
    document.querySelectorAll(".filter-btn")
        .forEach(function (btn) {
            btn.classList.remove("active");
        });

    if (button) {
        button.classList.add("active");
    }

    // Show/hide each card by its data-category attribute
    document.querySelectorAll(".info-card[data-category]")
        .forEach(function (card) {

            const show =
                category === "all" ||
                card.dataset.category === category;

            card.classList.toggle("filter-hidden", !show);
        });
}


// =====================================================
// BACK TO TOP (SRS)
// =====================================================

function scrollToTop() {

    window.scrollTo({

        top: 0,

        behavior: "smooth"
    });
}


// Show the button only after scrolling past the hero section
function initBackToTop() {

    const button =
        document.getElementById("backToTop");

    if (!button) return;

    const hero =
        document.getElementById("home");

    function updateBackToTop() {

        const threshold = hero
            ? hero.offsetHeight
            : window.innerHeight;

        button.classList.toggle(
            "visible",
            window.scrollY > threshold
        );
    }

    window.addEventListener(
        "scroll",
        updateBackToTop,
        { passive: true }
    );

    updateBackToTop();
}


// =====================================================
// GET TODAY DATE
// =====================================================

function getTodayDate() {

    const today =
        new Date();

    const year =
        today.getFullYear();

    const month =
        String(
            today.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            today.getDate()
        ).padStart(2, "0");


    return (
        year +
        "-" +
        month +
        "-" +
        day
    );
}


// =====================================================
// PAGE INITIALIZATION
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        // Load all JSON-driven page content
        loadPageContent();


        // Load saved expenses
        loadExpenses();


        // Show expenses
        displayExpenses();


        // Update summary
        updateExpenseSummary();


        // Update budget
        updateExpenseBudget();


        // Apply saved theme
        applySavedTheme();


        // SRS: visitor counter + live clock
        initVisitorCounter();

        initLiveClock();


        // SRS: back-to-top button visibility
        initBackToTop();


        // Set date
        const dateInput =
            document.getElementById(
                "expenseDate"
            );

        if (
            dateInput &&
            !dateInput.value
        ) {

            dateInput.value =
                getTodayDate();
        }


        // Budget input live update
        const budgetInput =
            document.getElementById(
                "expenseBudget"
            );

        if (budgetInput) {

            budgetInput.addEventListener(
                "input",
                updateExpenseBudget
            );
        }

    }
);
const incomeInput = document.getElementById("income");

if (incomeInput) {

    incomeInput.addEventListener("input", function () {
        calculateBudget();
    });

}


// =====================================================
// SPLASH SCREEN
// =====================================================
// Shows the logo while the page loads, then fades away.

window.addEventListener("load", function () {

    const splash =
        document.getElementById("splashScreen");

    // Nothing to do if the splash screen is missing
    if (!splash) return;

    // Step 1: let the logo be seen for a short moment,
    // then add the class that starts the CSS fade-out.
    setTimeout(function () {

        splash.classList.add("splash-hidden");

        // Step 2: once the fade finishes (0.5s in CSS),
        // remove the splash completely from the page.
        setTimeout(function () {
            splash.remove();
        }, 500);

    }, 500);

});


// =====================================================
// AOS — ANIMATE ON SCROLL
// =====================================================

if (typeof AOS !== "undefined") {

    AOS.init({
        duration: 700,
        offset: 90,
        once: true
    });

}


// =====================================================
// HERO MONEY CARD — LIVE 50/30/20 SPLIT
// =====================================================
// Reads the income typed into the hero card and updates
// the three amount labels and their progress bars.

function updateHeroBudget() {

    const incomeInput =
        document.getElementById("heroIncome");

    // Leave quietly if the card is not on the page
    if (!incomeInput) return;

    // Treat empty or invalid input as zero
    const income = Number(incomeInput.value) || 0;

    // The classic 50/30/20 split
    const needs = income * 0.50;
    const wants = income * 0.30;
    const savings = income * 0.20;

    const needsBar =
        document.getElementById("heroNeedsBar");

    const wantsBar =
        document.getElementById("heroWantsBar");

    const savingsBar =
        document.getElementById("heroSavingsBar");

    if (!needsBar || !wantsBar || !savingsBar) return;

    // Numbers: show the split amounts with thousand separators
    document.getElementById("heroIncomeDisplay").textContent =
        formatNumber(income);

    document.getElementById("heroNeeds").textContent =
        formatNumber(needs);

    document.getElementById("heroWants").textContent =
        formatNumber(wants);

    document.getElementById("heroSavings").textContent =
        formatNumber(savings);

    // Bars: each keeps its fixed share of the income (50/30/20),
    // but empty out completely when there is no income.
    const hasIncome = income > 0;

    needsBar.style.width = hasIncome ? "50%" : "0%";

    wantsBar.style.width = hasIncome ? "30%" : "0%";

    savingsBar.style.width = hasIncome ? "20%" : "0%";

}


// Recalculate on every keystroke, and once on load so the
// card always matches the input value.

const heroIncomeInput =
    document.getElementById("heroIncome");

if (heroIncomeInput) {

    heroIncomeInput.addEventListener(
        "input",
        updateHeroBudget
    );

    updateHeroBudget();

}
