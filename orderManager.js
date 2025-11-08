// orderManager.js
let currentOrder = {
    soup: null,
    main_dish: null,
    drink: null
};

function addDishToOrder(dish) {
    currentOrder[dish.category] = dish;
    updateOrderDisplay();
    updateOrderForm();
}

function updateOrderDisplay() {
    updateCategoryDisplay('soup', 'soup_section');
    updateCategoryDisplay('main_dish', 'main_dish');
    updateCategoryDisplay('drink', 'drink');
    updateTotalPrice();
}

function updateCategoryDisplay(category, sectionClass) {
    const sections = document.querySelectorAll(`.${sectionClass}`);
    sections.forEach(section => {
        const dishBlocks = section.querySelectorAll(`.${getCategoryClass(category)}`);
        dishBlocks.forEach(block => {
            const dishKeyword = block.getAttribute('data-dish');
            if (currentOrder[category] && currentOrder[category].keyword === dishKeyword) {
                block.style.border = '2px solid black';
            } else {
                block.style.border = '2px solid white';
            }
        });
    });
}

function highlightSelectedDish(category, dishKeyword) {
    // Снимаем выделение со всех блюд этой категории
    const allDishes = document.querySelectorAll(`.${getCategoryClass(category)}`);
    allDishes.forEach(dish => {
        dish.style.border = '2px solid white';
    });
    
    // Выделяем выбранное блюдо
    const selectedDish = document.querySelector(`[data-dish="${dishKeyword}"]`);
    if (selectedDish) {
        selectedDish.style.border = '2px solid black';
    }
}

function updateOrderForm() {
    const hasSelection = currentOrder.soup || currentOrder.main_dish || currentOrder.drink;
    
    // Обновляем форму заказа
    updateFormSelect('soup_select', currentOrder.soup);
    updateFormSelect('main_dish_select', currentOrder.main_dish);
    updateFormSelect('drink_select', currentOrder.drink);
    
    // Показываем/скрываем блок стоимости
    const totalPriceElement = document.getElementById('total-price');
    if (totalPriceElement) {
        if (hasSelection) {
            totalPriceElement.style.display = 'block';
        } else {
            totalPriceElement.style.display = 'none';
        }
    }
}

function updateFormSelect(selectId, dish) {
    const select = document.getElementById(selectId);
    if (select) {
        if (dish) {
            select.value = dish.name;
        } else {
            select.selectedIndex = 0;
        }
    }
}

function updateTotalPrice() {
    let total = 0;
    if (currentOrder.soup) total += currentOrder.soup.price;
    if (currentOrder.main_dish) total += currentOrder.main_dish.price;
    if (currentOrder.drink) total += currentOrder.drink.price;
    
    let totalElement = document.getElementById('total-price');
    if (!totalElement) {
        totalElement = document.createElement('div');
        totalElement.id = 'total-price';
        totalElement.className = 'total-price';
        totalElement.style.cssText = `
            text-align: center;
            font-size: 1.5em;
            font-weight: bold;
            margin: 20px 0;
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 10px;
            border: 2px solid #dee2e6;
        `;
        
        const form = document.querySelector('.form_menu');
        if (form) {
            form.parentNode.insertBefore(totalElement, form);
        }
    }
    
    if (currentOrder.soup || currentOrder.main_dish || currentOrder.drink) {
        totalElement.innerHTML = `Стоимость заказа: <span style="color: #28a745;">${total}₽</span>`;
        totalElement.style.display = 'block';
    } else {
        totalElement.style.display = 'none';
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    updateTotalPrice();
});