// customCombo.js
document.addEventListener('dishesLoaded', function() {
    initializeCustomCombo();
});

let selectedDishes = {
    soup: null,
    starter: null,
    main_dish: null,
    drink: null,
    dessert: null
};

function initializeCustomCombo() {
    // Отображаем блюда для всех категорий
    displayCategoryDishes('soup', 'soup-grid');
    displayCategoryDishes('starter', 'starter-grid');
    displayCategoryDishes('main_dish', 'main-grid');
    displayCategoryDishes('drink', 'drink-grid');
    displayCategoryDishes('dessert', 'dessert-grid');
    
    // Инициализируем фильтры
    initializeFilters();
    
    // Инициализируем кнопку добавления в корзину
    const addToCartBtn = document.getElementById('add-to-cart');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', addComboToCart);
    }
    
    // Обновляем сводку заказа
    updateSummary();
}

function displayCategoryDishes(category, gridId) {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    
    const categoryDishes = dishes.filter(dish => dish.category === category);
    
    grid.innerHTML = '';
    
    categoryDishes.forEach(dish => {
        const dishElement = createDishCard(dish);
        grid.appendChild(dishElement);
    });
}

function createDishCard(dish) {
    const card = document.createElement('div');
    card.className = 'combo-dish-card';
    card.dataset.dishId = dish.keyword;
    card.dataset.category = dish.category;
    
    if (selectedDishes[dish.category] && selectedDishes[dish.category].keyword === dish.keyword) {
        card.classList.add('selected');
    }
    
    card.innerHTML = `
        <img src="${dish.image}" alt="${dish.name}" class="combo-dish-image">
        <p class="combo-dish-name">${dish.name}</p>
        <p class="combo-dish-price">${dish.price}₽</p>
        <p class="combo-dish-count">${dish.count}</p>
    `;
    
    card.addEventListener('click', function() {
        selectDish(dish);
    });
    
    return card;
}

function selectDish(dish) {
    // Убираем выделение с предыдущего блюда в этой категории
    const category = dish.category;
    const previouslySelected = document.querySelector(`.combo-dish-card.selected[data-category="${category}"]`);
    if (previouslySelected) {
        previouslySelected.classList.remove('selected');
    }
    
    // Добавляем выделение на новое блюдо
    const newSelected = document.querySelector(`.combo-dish-card[data-dish-id="${dish.keyword}"]`);
    if (newSelected) {
        newSelected.classList.add('selected');
    }
    
    // Обновляем выбранное блюдо
    selectedDishes[category] = dish;
    
    // Обновляем сводку
    updateSummary();
}

function initializeFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.dataset.category;
            const kind = this.dataset.kind;
            
            // Убираем активный класс со всех кнопок этой категории
            const categoryButtons = document.querySelectorAll(`.filter-btn[data-category="${category}"]`);
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            
            // Добавляем активный класс на нажатую кнопку
            this.classList.add('active');
            
            // Фильтруем блюда
            filterDishes(category, kind);
        });
    });
}

function filterDishes(category, kind) {
    const gridId = `${category}-grid`;
    const grid = document.getElementById(gridId);
    if (!grid) return;
    
    let filteredDishes;
    
    if (kind === 'all') {
        filteredDishes = dishes.filter(dish => dish.category === category);
    } else {
        filteredDishes = dishes.filter(dish => dish.category === category && dish.kind === kind);
    }
    
    grid.innerHTML = '';
    
    filteredDishes.forEach(dish => {
        const dishElement = createDishCard(dish);
        grid.appendChild(dishElement);
    });
}

function updateSummary() {
    const summaryList = document.getElementById('summary-list');
    const subtotalPrice = document.getElementById('subtotal-price');
    const discountAmount = document.getElementById('discount-amount');
    const totalPrice = document.getElementById('total-price');
    const addToCartBtn = document.getElementById('add-to-cart');
    
    if (!summaryList || !subtotalPrice || !discountAmount || !totalPrice || !addToCartBtn) return;
    
    // Считаем выбранные блюда
    const selectedCount = Object.values(selectedDishes).filter(dish => dish !== null).length;
    
    if (selectedCount === 0) {
        summaryList.innerHTML = '<p class="empty-message">Выберите блюда из категорий слева</p>';
        subtotalPrice.textContent = '0₽';
        discountAmount.textContent = '-0₽';
        totalPrice.textContent = '0₽';
        addToCartBtn.disabled = true;
        return;
    }
    
    // Обновляем список выбранных блюд
    let summaryHTML = '';
    let subtotal = 0;
    let dishesArray = [];
    
    Object.entries(selectedDishes).forEach(([category, dish]) => {
        if (dish) {
            summaryHTML += `
                <div class="summary-item">
                    <span class="summary-item-name">${dish.name}</span>
                    <span class="summary-item-price">${dish.price}₽</span>
                </div>
            `;
            subtotal += dish.price;
            dishesArray.push(dish);
        }
    });
    
    summaryList.innerHTML = summaryHTML;
    
    // Рассчитываем скидку 25% (если выбрано 3 и более блюда)
    const discount = selectedCount >= 3 ? Math.round(subtotal * 0.25) : 0;
    const total = subtotal - discount;
    
    // Обновляем цены
    subtotalPrice.textContent = `${subtotal}₽`;
    discountAmount.textContent = `-${discount}₽`;
    totalPrice.textContent = `${total}₽`;
    
    // Включаем/выключаем кнопку
    addToCartBtn.disabled = selectedCount < 2;
    
    // Сохраняем выбранные блюда для добавления в корзину
    window.currentCustomCombo = {
        dishes: dishesArray,
        subtotal: subtotal,
        discount: discount,
        total: total
    };
}

function addComboToCart() {
    const selectedCount = Object.values(selectedDishes).filter(dish => dish !== null).length;
    
    if (selectedCount < 2) {
        showNotification('Выберите хотя бы 2 блюда для создания ланча');
        return;
    }
    
    const selectedDishesArray = Object.values(selectedDishes).filter(dish => dish !== null);
    
    // Используем глобальную функцию
    if (typeof window.addCustomComboToCart === 'function') {
        window.addCustomComboToCart({
            dishes: selectedDishesArray
        });
        
        // Очищаем выбор
        selectedDishes = {
            soup: null,
            starter: null,
            main_dish: null,
            drink: null,
            dessert: null
        };
        
        // Сбрасываем выделение
        document.querySelectorAll('.combo-dish-card.selected').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Обновляем сводку
        updateSummary();
        
        // Показываем уведомление
        showNotification('Собранный ланч добавлен в корзину!');
    }
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notification-text');
    const notificationOk = document.getElementById('notification-ok');
    
    if (!notification || !notificationText || !notificationOk) return;
    
    notificationText.textContent = message;
    notification.style.display = 'flex';
    
    notificationOk.onclick = function() {
        notification.style.display = 'none';
    };
    
    notification.onclick = function(e) {
        if (e.target === notification) {
            notification.style.display = 'none';
        }
    };
}