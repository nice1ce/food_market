// displayDishes.js
document.addEventListener('dishesLoaded', function() {
    initializeFilters();
    displayAllDishes();
});

function initializeFilters() {
    const filterConfig = {
        soup: [
            { name: "рыбный", kind: "fish" },
            { name: "мясной", kind: "meat" },
            { name: "вегетарианский", kind: "veg" }
        ],
        main_dish: [
            { name: "рыбное", kind: "fish" },
            { name: "мясное", kind: "meat" },
            { name: "вегетарианское", kind: "veg" }
        ],
        drink: [
            { name: "холодный", kind: "cold" },
            { name: "горячий", kind: "hot" }
        ],
        starter: [
            { name: "рыбный", kind: "fish" },
            { name: "мясной", kind: "meat" },
            { name: "вегетарианский", kind: "veg" }
        ],
        dessert: [
            { name: "маленькая порция", kind: "small" },
            { name: "средняя порция", kind: "medium" },
            { name: "большая порция", kind: "large" }
        ]
    };

    Object.keys(filterConfig).forEach(category => {
        const section = document.querySelector(`.${category}_section`);
        if (!section) return;

        const filterContainer = document.createElement('div');
        filterContainer.className = 'filter-container';

        const allButton = createFilterButton("Все", "all", category);
        allButton.classList.add('active');
        filterContainer.appendChild(allButton);

        filterConfig[category].forEach(filter => {
            const button = createFilterButton(filter.name, filter.kind, category);
            filterContainer.appendChild(button);
        });

        section.parentNode.insertBefore(filterContainer, section);
    });
}

function createFilterButton(text, kind, category) {
    const button = document.createElement('button');
    button.textContent = text;
    button.setAttribute('data-kind', kind);
    button.setAttribute('data-category', category);
    button.className = 'filter-button';
    button.style.cssText = `
        padding: 8px 16px;
        border: 2px solid #2a2f37;
        background-color: white;
        color: #2a2f37;
        border-radius: 20px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-family: "Work Sans", sans-serif;
    `;

    button.addEventListener('click', function() {
        handleFilterClick(this, category, kind);
    });

    return button;
}

function handleFilterClick(button, category, kind) {
    const section = document.querySelector(`.${category}_section`);
    const allButtons = section.parentNode.querySelectorAll('.filter-button');

    allButtons.forEach(btn => btn.classList.remove('active'));

    button.classList.add('active');

    if (kind === 'all') {
        showAllDishesInCategory(category);
    } else {
        filterDishesByKind(category, kind);
    }
}

function showAllDishesInCategory(category) {
    const dishesInCategory = dishes.filter(dish => dish.category === category)
                                   .sort((a, b) => a.name.localeCompare(b.name));
    displayCategoryDishes(category, dishesInCategory, `.${category}_section`);
}

function filterDishesByKind(category, kind) {
    const filteredDishes = dishes.filter(dish => dish.category === category && dish.kind === kind)
                                .sort((a, b) => a.name.localeCompare(b.name));
    displayCategoryDishes(category, filteredDishes, `.${category}_section`);
}

function displayAllDishes() {
    const categories = ['soup', 'main_dish', 'drink', 'starter', 'dessert'];
    categories.forEach(category => {
        showAllDishesInCategory(category);
    });
}

function displayCategoryDishes(category, dishesToDisplay, selector) {
    const section = document.querySelector(selector);
    if (!section) return;
    
    section.innerHTML = '';
    
    if (dishesToDisplay.length === 0) {
        const noDishesMessage = document.createElement('p');
        noDishesMessage.textContent = 'Блюда не найдены';
        noDishesMessage.style.cssText = `
            text-align: center;
            color: #666;
            font-style: italic;
            grid-column: 1 / -1;
        `;
        section.appendChild(noDishesMessage);
        return;
    }
    
    dishesToDisplay.forEach(dish => {
        const dishElement = createDishElement(dish);
        section.appendChild(dishElement);
    });
}

function createDishElement(dish) {
    const dishDiv = document.createElement('div');
    dishDiv.className = getCategoryClass(dish.category);
    dishDiv.setAttribute('data-dish', dish.keyword);
    
    dishDiv.innerHTML = `
        <img class="images" src="${dish.image}" alt="${dish.name}" onerror="this.src='https://via.placeholder.com/417x285?text=No+Image'">
        <p class="price">${dish.price}₽</p>
        <p class="name">${dish.name}</p>
        <p class="weight">${dish.count}</p>
        <button class="add_buttom">Добавить</button>
    `;
    
    const addButton = dishDiv.querySelector('.add_buttom');
    addButton.addEventListener('click', function() {
        addDishToOrder(dish);
        highlightSelectedDish(dish.category, dish.keyword);
    });
    
    return dishDiv;
}

function getCategoryClass(category) {
    const classMap = {
        'soup': 'soup_block',
        'main_dish': 'main_dish_block',
        'drink': 'drink_block',
        'starter': 'starter_block',
        'dessert': 'dessert_block'
    };
    return classMap[category] || '';
}

function addDishToOrder(dish) {
    if (typeof window.addDishToOrder === 'function') {
        window.addDishToOrder(dish);
    }
}

function highlightSelectedDish(category, dishKeyword) {
    if (typeof window.highlightSelectedDish === 'function') {
        window.highlightSelectedDish(category, dishKeyword);
    }
}

function updateCategoryDisplay(category, sectionClass) {
    if (typeof window.updateCategoryDisplay === 'function') {
        window.updateCategoryDisplay(category, sectionClass);
    }
}