// orderManager.js - ЭТОТ ФАЙЛ БОЛЬШЕ НЕ НУЖЕН ДЛЯ МЕНЮ
// Логика выбора блюд для оформления заказа удалена

const ORDER_STORAGE_KEY = 'orderDishes';

let currentOrder = {
    soup: null,
    main_dish: null,
    drink: null,
    starter: null,
    dessert: null
};

// УДАЛЕНО: Функции для работы с выбором блюд больше не нужны
// window.addDishToOrder = function(dish) {
//     currentOrder[dish.category] = dish;
//     updateOrderDisplay();
//     updateOrderForm();
//     saveOrderToStorage();
// };

// window.updateOrderDisplay = function() {
//     const categories = ['soup', 'main_dish', 'drink', 'starter', 'dessert'];
//     categories.forEach(category => {
//         updateCategoryDisplay(category, `${category}_section`);
//     });
//     updateTotalPrice();
// };

// window.updateCategoryDisplay = function(category, sectionClass) {
//     const sections = document.querySelectorAll(`.${sectionClass}`);
//     sections.forEach(section => {
//         const dishBlocks = section.querySelectorAll(`.${getCategoryClass(category)}`);
//         dishBlocks.forEach(block => {
//             const dishKeyword = block.getAttribute('data-dish');
//             if (currentOrder[category] && currentOrder[category].keyword === dishKeyword) {
//                 block.style.border = '2px solid black';
//             } else {
//                 block.style.border = '2px solid white';
//             }
//         });
//     });
// };

// window.highlightSelectedDish = function(category, dishKeyword) {
//     const allDishes = document.querySelectorAll(`.${getCategoryClass(category)}`);
//     allDishes.forEach(dish => {
//         dish.style.border = '2px solid white';
//     });
    
//     const selectedDish = document.querySelector(`[data-dish="${dishKeyword}"]`);
//     if (selectedDish) {
//         selectedDish.style.border = '2px solid black';
//     }
// };

// function updateOrderForm() {
//     const hasSelection = Object.values(currentOrder).some(dish => dish !== null);
    
//     updateFormSelect('soup_select', currentOrder.soup);
//     updateFormSelect('main_dish_select', currentOrder.main_dish);
//     updateFormSelect('drink_select', currentOrder.drink);
//     updateFormSelect('starter_select', currentOrder.starter);
//     updateFormSelect('dessert_select', currentOrder.dessert);
    
//     const totalPriceElement = document.getElementById('total-price');
//     if (totalPriceElement) {
//         if (hasSelection) {
//             totalPriceElement.style.display = 'block';
//         } else {
//             totalPriceElement.style.display = 'none';
//         }
//     }
// }

// function updateFormSelect(selectId, dish) {
//     const select = document.getElementById(selectId);
//     if (select) {
//         if (dish) {
//             for (let option of select.options) {
//                 if (option.text === dish.name) {
//                     option.selected = true;
//                     break;
//                 }
//             }
//         } else {
//             select.selectedIndex = 0;
//         }
//     }
// }

// function updateTotalPrice() {
//     let total = 0;
//     Object.values(currentOrder).forEach(dish => {
//         if (dish) total += dish.price;
//     });
    
//     let totalElement = document.getElementById('total-price');
//     if (!totalElement) {
//         totalElement = document.createElement('div');
//         totalElement.id = 'total-price';
//         totalElement.className = 'total-price';
//         totalElement.style.cssText = `
//             text-align: center;
//             font-size: 1.5em;
//             font-weight: bold;
//             margin: 20px 0;
//             padding: 15px;
//             background-color: #f8f9fa;
//             border-radius: 10px;
//             border: 2px solid #dee2e6;
//         `;
        
//         const form = document.querySelector('.form_menu');
//         if (form) {
//             form.parentNode.insertBefore(totalElement, form);
//         }
//     }
    
//     const hasSelection = Object.values(currentOrder).some(dish => dish !== null);
//     if (hasSelection) {
//         totalElement.innerHTML = `Стоимость заказа: <span style="color: #28a745;">${total}₽</span>`;
//         totalElement.style.display = 'block';
//     } else {
//         totalElement.style.display = 'none';
//     }
// }

// function getCategoryClass(category) {
//     const classMap = {
//         'soup': 'soup_block',
//         'main_dish': 'main_dish_block',
//         'drink': 'drink_block',
//         'starter': 'starter_block',
//         'dessert': 'dessert_block'
//     };
//     return classMap[category] || '';
// }

// ---------- localStorage ----------

// function saveOrderToStorage() {
//     const data = {};
//     Object.entries(currentOrder).forEach(([category, dish]) => {
//         data[category] = dish ? dish.keyword : null;
//     });
//     try {
//         localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(data));
//     } catch (e) {
//         console.error('Не удалось сохранить заказ в localStorage', e);
//     }
// }

// function loadOrderFromStorage() {
//     try {
//         const raw = localStorage.getItem(ORDER_STORAGE_KEY);
//         if (!raw) return null;
//         return JSON.parse(raw);
//     } catch (e) {
//         console.error('Не удалось прочитать заказ из localStorage', e);
//         return null;
//     }
// }

// function restoreOrderFromStorage() {
//     const stored = loadOrderFromStorage();
//     if (!stored || !Array.isArray(window.dishes)) return;

//     currentOrder = {
//         soup: null,
//         main_dish: null,
//         drink: null,
//         starter: null,
//         dessert: null
//     };

//     Object.entries(stored).forEach(([category, keyword]) => {
//         if (!keyword) return;
//         const dish = window.dishes.find(
//             d => d.category === category && d.keyword === keyword
//         );
//         if (dish) {
//             currentOrder[category] = dish;
//         }
//     });

//     updateOrderDisplay();
//     updateOrderForm();
// }

// При первом открытии страницы — только нарисовать пустую "стоимость"
// document.addEventListener('DOMContentLoaded', function() {
//     updateTotalPrice();
// });

// После загрузки блюд восстановим сохранённый выбор
// document.addEventListener('dishesLoaded', function() {
//     restoreOrderFromStorage();
// });