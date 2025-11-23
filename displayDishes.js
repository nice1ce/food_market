// displayDishes.js
document.addEventListener('DOMContentLoaded', async function() {
    // Показываем индикатор загрузки
    showLoadingIndicator();
    
    try {
        // Загружаем блюда из API
        await loadDishes();
        
        // Инициализируем фильтры и отображаем блюда
        initializeFilters();
        displayAllDishes();
        
        // Скрываем индикатор загрузки
        hideLoadingIndicator();
        
    } catch (error) {
        console.error('Ошибка при инициализации:', error);
        hideLoadingIndicator();
        showErrorNotification('Не удалось загрузить меню. Пожалуйста, обновите страницу.');
    }
});

function showLoadingIndicator() {
    const loadingIndicator = document.createElement('div');
    loadingIndicator.id = 'loading-indicator';
    loadingIndicator.innerHTML = `
        <div style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 1000;
            text-align: center;
        ">
            <div style="font-size: 1.2em; margin-bottom: 10px;">Загрузка меню...</div>
            <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #2a2f37; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
        </div>
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        </style>
    `;
    document.body.appendChild(loadingIndicator);
}

function hideLoadingIndicator() {
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
        document.body.removeChild(loadingIndicator);
    }
}

function showErrorNotification(message) {
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #f8d7da;
        color: #721c24;
        padding: 15px;
        border-radius: 5px;
        border: 1px solid #f5c6cb;
        z-index: 1000;
        max-width: 300px;
    `;
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        if (document.body.contains(errorDiv)) {
            document.body.removeChild(errorDiv);
        }
    }, 5000);
}

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

    // Создаем фильтры для каждой категории
    Object.keys(filterConfig).forEach(category => {
        const section = document.querySelector(`.${category}_section`);
        if (!section) return;

        const filterContainer = document.createElement('div');
        filterContainer.className = 'filter-container';
        filterContainer.style.cssText = `
            display: flex;
            justify-content: center;
            gap: 10px;
            margin: 20px 0;
            flex-wrap: wrap;
        `;

        // Кнопка "Все"
        const allButton = createFilterButton("Все", "all", category);
        allButton.classList.add('active');
        filterContainer.appendChild(allButton);

        // Остальные кнопки фильтров
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
    
    // Снимаем активный класс со всех кнопок
    allButtons.forEach(btn => btn.classList.remove('active'));
    
    // Добавляем активный класс на нажатую кнопку
    button.classList.add('active');
    
    // Фильтруем блюда
    if (kind === 'all') {
        showAllDishesInCategory(category);
    } else {
        filterDishesByKind(category, kind);
    }
    
    // Обновляем выделение выбранных блюд
    updateCategoryDisplay(category, `${category}_section`);
}

function showAllDishesInCategory(category) {
    const dishesInCategory = getDishes().filter(dish => dish.category === category)
                                   .sort((a, b) => a.name.localeCompare(b.name));
    displayCategoryDishes(category, dishesInCategory, `.${category}_section`);
}

function filterDishesByKind(category, kind) {
    const filteredDishes = getDishes().filter(dish => dish.category === category && dish.kind === kind)
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
    
    // Добавляем обработку ошибок загрузки изображения
    const imageHtml = `
        <img class="images" src="${dish.image}" alt="${dish.name}" 
             onerror="this.src='https://via.placeholder.com/417x285/ffffff/666666?text=No+Image'">
    `;
    
    dishDiv.innerHTML = `
        ${imageHtml}
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