// displayDishes.js
document.addEventListener('DOMContentLoaded', function() {
    // Сортируем блюда по алфавиту
    const sortedDishes = [...dishes].sort((a, b) => a.name.localeCompare(b.name));
    
    // Группируем блюда по категориям
    const dishesByCategory = {
        soup: sortedDishes.filter(dish => dish.category === 'soup'),
        main_dish: sortedDishes.filter(dish => dish.category === 'main_dish'),
        drink: sortedDishes.filter(dish => dish.category === 'drink')
    };
    
    // Отображаем блюда для каждой категории
    displayCategoryDishes('soup', dishesByCategory.soup, '.soup_section');
    displayCategoryDishes('main_dish', dishesByCategory.main_dish, '.main_dish');
    displayCategoryDishes('drink', dishesByCategory.drink, '.drink');
});

function displayCategoryDishes(category, dishes, selector) {
    const section = document.querySelector(selector);
    if (!section) return;
    
    section.innerHTML = '';
    
    dishes.forEach(dish => {
        const dishElement = createDishElement(dish);
        section.appendChild(dishElement);
    });
}

function createDishElement(dish) {
    const dishDiv = document.createElement('div');
    dishDiv.className = getCategoryClass(dish.category);
    dishDiv.setAttribute('data-dish', dish.keyword);
    
    dishDiv.innerHTML = `
        <img class="images" src="${dish.image}" alt="${dish.name}">
        <p class="price">${dish.price}₽</p>
        <p class="name">${dish.name}</p>
        <p class="weight">${dish.count}</p>
        <button class="add_buttom">Добавить</button>
    `;
    
    // Добавляем обработчик события для кнопки "Добавить"
    const addButton = dishDiv.querySelector('.add_buttom');
    addButton.addEventListener('click', function() {
        addDishToOrder(dish);
        highlightSelectedDish(dish.category, dish.keyword);
    });
    
    return dishDiv;
}

function getCategoryClass(category) {
    switch(category) {
        case 'soup': return 'soup_block';
        case 'main_dish': return 'main_dish_block';
        case 'drink': return 'drink_block';
        default: return '';
    }
}