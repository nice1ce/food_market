// orderValidator.js
document.addEventListener('DOMContentLoaded', function() {
    const orderForm = document.getElementById('order-form');
    const submitBtn = document.getElementById('submit-order');
    
    if (orderForm && submitBtn) {
        orderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Получаем текущий заказ
            const currentOrder = window.currentOrder || {
                soup: null,
                main_dish: null,
                drink: null,
                starter: null,
                dessert: null
            };
            
            // Проверяем, все ли блюда выбраны
            const missingCategories = checkMissingDishes(currentOrder);
            
            if (missingCategories.length > 0) {
                showNotification(missingCategories);
                return false;
            }
            
            // Проверяем, соответствует ли заказ какому-либо комбо
            const matchedCombo = findMatchingCombo(currentOrder);
            
            if (!matchedCombo) {
                showNotification(["Ваш заказ не соответствует ни одному из доступных комбо-ланчей."], true);
                return false;
            }
            
            // Если все проверки пройдены, отправляем форму
            alert(`Заказ успешно оформлен! Стоимость: ${calculateOrderTotal(currentOrder)}₽`);
            // В реальном приложении здесь будет отправка на сервер
            // orderForm.submit();
        });
    }
});

// Проверка отсутствующих блюд
function checkMissingDishes(order) {
    const missing = [];
    
    if (!order.soup) missing.push("суп");
    if (!order.starter) missing.push("стартер");
    if (!order.main_dish) missing.push("главное блюдо");
    if (!order.drink) missing.push("напиток");
    if (!order.dessert) missing.push("десерт");
    
    return missing;
}

// Поиск подходящего комбо
function findMatchingCombo(order) {
    if (!window.combos || !window.dishes) return null;
    
    const orderKeywords = [
        order.soup?.keyword,
        order.starter?.keyword,
        order.main_dish?.keyword,
        order.drink?.keyword,
        order.dessert?.keyword
    ].filter(Boolean);
    
    return window.combos.find(combo => {
        const comboKeywords = combo.dishes.map(d => d.keyword);
        
        // Проверяем, что все блюда из комбо есть в заказе
        return comboKeywords.every(keyword => orderKeywords.includes(keyword));
    });
}

// Расчет общей стоимости
function calculateOrderTotal(order) {
    let total = 0;
    if (order.soup) total += order.soup.price;
    if (order.starter) total += order.starter.price;
    if (order.main_dish) total += order.main_dish.price;
    if (order.drink) total += order.drink.price;
    if (order.dessert) total += order.dessert.price;
    
    // Применяем скидку если есть подходящее комбо
    const matchedCombo = findMatchingCombo(order);
    if (matchedCombo) {
        total = Math.round(total * (1 - matchedCombo.discount / 100));
    }
    
    return total;
}

// Показ уведомления
function showNotification(missingCategories, isComboError = false) {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notification-text');
    const notificationOk = document.getElementById('notification-ok');
    
    if (!notification || !notificationText || !notificationOk) return;
    
    let message = '';
    
    if (isComboError) {
        message = missingCategories[0];
    } else {
        if (missingCategories.length === 1) {
            message = `Вы не добавили ${missingCategories[0]} в заказ. Пожалуйста, выберите блюдо из категории "${missingCategories[0]}".`;
        } else if (missingCategories.length === 2) {
            message = `Вы не добавили ${missingCategories[0]} и ${missingCategories[1]} в заказ. Пожалуйста, выберите блюда из этих категорий.`;
        } else if (missingCategories.length === 3) {
            message = `Вы не добавили ${missingCategories[0]}, ${missingCategories[1]} и ${missingCategories[2]} в заказ. Пожалуйста, выберите блюда из этих категорий.`;
        } else if (missingCategories.length === 4) {
            message = `Вы не добавили ${missingCategories[0]}, ${missingCategories[1]}, ${missingCategories[2]} и ${missingCategories[3]} в заказ. Пожалуйста, выберите блюда из этих категорий.`;
        } else {
            message = `Вы не добавили ${missingCategories.slice(0, -1).join(', ')} и ${missingCategories[missingCategories.length - 1]} в заказ. Пожалуйста, выберите блюда из этих категорий.`;
        }
    }
    
    notificationText.textContent = message;
    notification.style.display = 'flex';
    
    // Обработчик для кнопки "Окей"
    notificationOk.onclick = function() {
        notification.style.display = 'none';
    };
    
    // Закрытие по клику вне уведомления
    notification.onclick = function(e) {
        if (e.target === notification) {
            notification.style.display = 'none';
        }
    };
}