// orderValidator.js
document.addEventListener('DOMContentLoaded', function() {
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', function(e) {
            e.preventDefault();
            validateOrder();
        });
    }
});

// Определяем возможные комбо ланчей на основе загруженных данных
function getValidCombos() {
    const dishes = getDishes();
    
    // Создаем комбо на основе доступных блюд
    // Это пример - можно адаптировать под реальные данные из API
    return [
        {
            name: "Классический ланч",
            soup: "Солянка",
            main_dish: "Макароны по-флотски",
            drink: "Апельсиновый сок"
        },
        {
            name: "Рыбный ланч",
            soup: "Уха царская",
            main_dish: "Гриль-лосось",
            drink: "Зеленый чай"
        },
        {
            name: "Вегетарианский ланч",
            soup: "Грибной крем-суп",
            main_dish: "Овощное рагу",
            drink: "Ягодный морс"
        }
    ].filter(combo => {
        // Фильтруем только те комбо, где все блюда существуют в загруженных данных
        const soupExists = dishes.some(d => d.name === combo.soup && d.category === 'soup');
        const mainExists = dishes.some(d => d.name === combo.main_dish && d.category === 'main_dish');
        const drinkExists = dishes.some(d => d.name === combo.drink && d.category === 'drink');
        return soupExists && mainExists && drinkExists;
    });
}

function validateOrder() {
    const selectedSoup = currentOrder.soup ? currentOrder.soup.name : null;
    const selectedMainDish = currentOrder.main_dish ? currentOrder.main_dish.name : null;
    const selectedDrink = currentOrder.drink ? currentOrder.drink.name : null;

    const validCombos = getValidCombos();
    
    // Проверяем, соответствует ли заказ одному из валидных комбо
    const isValidCombo = validCombos.some(combo => 
        combo.soup === selectedSoup &&
        combo.main_dish === selectedMainDish &&
        combo.drink === selectedDrink
    );

    if (isValidCombo) {
        // Если заказ валиден, отправляем форму
        showSuccessNotification();
    } else {
        // Если заказ невалиден, показываем уведомление с информацией о недостающих блюдах
        showValidationNotification(selectedSoup, selectedMainDish, selectedDrink);
    }
}

function showValidationNotification(soup, mainDish, drink) {
    let missingItems = [];
    
    if (!soup) missingItems.push("суп");
    if (!mainDish) missingItems.push("основное блюдо");
    if (!drink) missingItems.push("напиток");
    
    // Если все категории выбраны, но комбо невалидно
    if (soup && mainDish && drink) {
        showNotification(
            "Некорректный состав ланча",
            "Выбранные блюда не соответствуют ни одному из доступных вариантов ланча. Пожалуйста, выберите блюда из предложенных комбо.",
            "warning"
        );
        return;
    }
    
    // Определяем тип уведомления в зависимости от количества недостающих блюд
    let title, message;
    
    if (missingItems.length === 3) {
        title = "Ланч не выбран";
        message = "Пожалуйста, выберите суп, основное блюдо и напиток для формирования ланча.";
    } else if (missingItems.length === 2) {
        title = "Выберите еще два блюда";
        message = `Для завершения заказа необходимо выбрать ${missingItems.join(" и ")}.`;
    } else if (missingItems.length === 1) {
        title = "Выберите еще одно блюдо";
        message = `Для завершения заказа необходимо выбрать ${missingItems[0]}.`;
    }
    
    showNotification(title, message, "error");
}

function showSuccessNotification() {
    showNotification(
        "Заказ принят!",
        "Ваш заказ успешно оформлен. Ожидайте доставку в указанное время. Спасибо за выбор нашего сервиса!",
        "success"
    );
}

function showNotification(title, message, type) {
    // Создаем оверлей
    const overlay = document.createElement('div');
    overlay.className = 'notification-overlay';
    
    // Создаем уведомление
    const notification = document.createElement('div');
    notification.className = 'notification';
    
    // Добавляем иконку в зависимости от типа
    let icon = '';
    if (type === 'error') {
        icon = '❌';
    } else if (type === 'warning') {
        icon = '⚠️';
    } else if (type === 'success') {
        icon = '✅';
    }
    
    notification.innerHTML = `
        <div style="font-size: 2em; margin-bottom: 10px;">${icon}</div>
        <h3>${title}</h3>
        <p>${message}</p>
        <button class="notification-button">Окей</button>
    `;
    
    // Добавляем обработчик для кнопки
    const button = notification.querySelector('.notification-button');
    button.addEventListener('click', function() {
        document.body.removeChild(overlay);
        document.body.removeChild(notification);
        
        // Если это успешное уведомление, отправляем форму
        if (type === 'success') {
            document.getElementById('orderForm').submit();
        }
    });
    
    // Добавляем обработчик для оверлея (закрытие при клике вне уведомления)
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) {
            document.body.removeChild(overlay);
            document.body.removeChild(notification);
        }
    });
    
    // Добавляем элементы на страницу
    document.body.appendChild(overlay);
    document.body.appendChild(notification);
    
    // Добавляем анимацию появления
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translate(-50%, -50%) scale(1)';
    }, 10);
    
    // Изначальные стили для анимации
    notification.style.opacity = '0';
    notification.style.transform = 'translate(-50%, -50%) scale(0.7)';
    notification.style.transition = 'all 0.3s ease';
}