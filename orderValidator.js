// orderValidator.js - ПОЛНОСТЬЮ ПЕРЕПИСАН для нового формата MockAPI
document.addEventListener('DOMContentLoaded', function() {
    const orderForm = document.getElementById('order-form');
    const submitBtn = document.getElementById('submit-order');
    
    if (orderForm && submitBtn) {
        orderForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            console.log('🚀 Начало обработки заказа...');
            
            // 1. Получаем корзину из localStorage
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            console.log('📦 Корзина:', cart);
            
            // 2. Проверяем, пуста ли корзина
            if (cart.length === 0) {
                showNotification('Корзина пуста. Добавьте блюда перед оформлением заказа.', true);
                return false;
            }
            
            // 3. Если нет комбо, проверяем все категории
            const hasCombo = cart.some(item => item.type === 'combo');
            
            if (!hasCombo) {
                const missingCategories = checkMissingCategories(cart);
                console.log('❌ Отсутствующие категории:', missingCategories);
                
                if (missingCategories.length > 0) {
                    showNotification(missingCategories);
                    return false;
                }
            }
            
            // 4. Если все проверки пройдены, оформляем заказ
            const success = await submitOrder(cart);
            
            return success;
        });
    }
});

// Проверка отсутствующих категорий в корзине
function checkMissingCategories(cart) {
    const requiredCategories = ['soup', 'starter', 'main_dish', 'drink', 'dessert'];
    
    // Собираем все категории из корзины
    const foundCategories = new Set();
    
    cart.forEach(item => {
        // Для обычных блюд
        if (item.category) {
            foundCategories.add(item.category);
        }
        // Для комбо-блюд внутри комбо
        if (item.dishes) {
            item.dishes.forEach(dish => {
                if (dish.category) {
                    foundCategories.add(dish.category);
                }
            });
        }
    });
    
    // Проверяем, каких категорий не хватает
    const missing = requiredCategories.filter(cat => !foundCategories.has(cat));
    
    // Преобразуем в русские названия для уведомления
    const russianNames = {
        'soup': 'суп',
        'starter': 'стартер', 
        'main_dish': 'главное блюдо',
        'drink': 'напиток',
        'dessert': 'десерт'
    };
    
    return missing.map(cat => russianNames[cat]);
}

// Отправка заказа на сервер
async function submitOrder(cart) {
    try {
        console.log('📝 Формирование данных заказа...');
        
        // Получаем данные формы
        const name = document.getElementById('name_text')?.value.trim() || '';
        const email = document.getElementById('email_but')?.value.trim() || '';
        const phone = document.getElementById('phone_but')?.value.trim() || '';
        const address = document.getElementById('address')?.value.trim() || '';
        const comment = document.getElementById('order_comment')?.value.trim() || '';
        
        // Получаем время доставки
        const deliveryType = document.querySelector('input[name="time_choice"]:checked')?.value || 'now';
        let deliveryTimeText = '';
        
        if (deliveryType === 'now') {
            deliveryTimeText = 'Как можно скорее';
        } else {
            const timeInput = document.getElementById('deliv_time')?.value;
            deliveryTimeText = timeInput || 'Не указано';
        }
        
        // Проверяем обязательные поля
        if (!name || !email || !phone || !address) {
            showNotification('Пожалуйста, заполните все обязательные поля: Имя, Email, Телефон и Адрес', true);
            return false;
        }
        
        // Проверяем email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showNotification('Пожалуйста, введите корректный email адрес', true);
            return false;
        }
        
        // Формируем данные заказа для MockAPI (НОВЫЙ ФОРМАТ)
        const nowTimestamp = Math.floor(Date.now() / 1000); // Unix timestamp
        
        const orderData = {
            name: name,
            full_name: name,
            email: email,
            phone: phone,
            delivery_address: address,
            delivery_type: deliveryType === 'now' ? 'now' : 'by_time',  // Строка (новый формат)
            delivery_time: nowTimestamp,  // Unix timestamp (новый формат)
            comment: comment || 'Нет комментария',
            items: formatCartItems(cart),
            total_price: window.getCartTotal ? window.getCartTotal() : calculateCartTotal(cart),
            total: window.getCartTotal ? window.getCartTotal() : calculateCartTotal(cart),
            status: 'pending',
            created_at: nowTimestamp,
            updated_at: nowTimestamp
        };
        
        console.log('📤 Данные для отправки на MockAPI:', orderData);
        
        const API_URL = 'https://693bf873b762a4f15c3ef7b6.mockapi.io/api/orders/food_market';
        
        console.log('🌐 Отправка POST запроса на:', API_URL);
        
        // ВНУТРЕННИЙ try-catch только для API запроса
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData)
            });
            
            console.log('✅ Статус ответа:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Текст ошибки:', errorText);
                throw new Error(`Ошибка API ${response.status}: ${errorText}`);
            }
            
            const result = await response.json();
            console.log('🎉 Успешный ответ от MockAPI:', result);
            
            // УСПЕШНАЯ ОТПРАВКА В API - НЕ СОХРАНЯЕМ ЛОКАЛЬНО
            // Очищаем корзину
            localStorage.removeItem('cart');
            if (window.updateCartCounter) {
                window.updateCartCounter();
            }
            
            showSuccessNotification(`🎊 Заказ №${result.id || '#'} успешно оформлен! Стоимость: ${orderData.total_price}₽`);
            return true;
            
        } catch (apiError) {
            // ЕСЛИ API НЕ ДОСТУПНО - СОХРАНЯЕМ ЛОКАЛЬНО
            console.warn('⚠️ Ошибка API, сохраняем локально:', apiError);
            const orderId = Date.now();
            saveOrderLocally(orderData, orderId, deliveryTimeText);
            
            // Очищаем корзину
            localStorage.removeItem('cart');
            if (window.updateCartCounter) {
                window.updateCartCounter();
            }
            
            showSuccessNotification(`📱 Заказ №${orderId} успешно оформлен! Стоимость: ${orderData.total_price}₽ (сохранено локально)`);
            return true;
        }
        
    } catch (error) {
        // ОБЩАЯ ОШИБКА (не связанная с API)
        console.error('💥 Критическая ошибка оформления заказа:', error);
        showNotification('Не удалось оформить заказ. Пожалуйста, попробуйте позже.', true);
        return false;
    }
}

// Вспомогательная функция для расчета суммы корзины
function calculateCartTotal(cart) {
    return cart.reduce((total, item) => {
        if (item.type === 'combo') {
            return total + (item.discountedPrice || item.price) * (item.quantity || 1);
        } else {
            return total + item.price * (item.quantity || 1);
        }
    }, 0);
}

// Сохранение заказа локально (если API недоступно)
function saveOrderLocally(orderData, orderId, deliveryTimeText) {
    try {
        const savedOrders = JSON.parse(localStorage.getItem('localOrders')) || [];
        
        // Преобразуем формат для локального хранения
        const localOrder = {
            id: orderId.toString(),
            name: orderData.name,
            full_name: orderData.full_name,
            email: orderData.email,
            phone: orderData.phone,
            delivery_address: orderData.delivery_address,
            delivery_type: orderData.delivery_type,
            delivery_time: deliveryTimeText,  // Сохраняем текст для локального хранения
            comment: orderData.comment,
            items: orderData.items,
            total_price: orderData.total_price,
            total: orderData.total,
            status: orderData.status,
            created_at: orderData.created_at,
            createdAt: new Date(orderData.created_at * 1000).toISOString(),
            updated_at: orderData.updated_at,
            isLocal: true
        };
        
        savedOrders.push(localOrder);
        localStorage.setItem('localOrders', JSON.stringify(savedOrders));
        console.log('💾 Заказ сохранен локально с ID:', orderId);
    } catch (error) {
        console.error('❌ Ошибка локального сохранения:', error);
    }
}

// Форматирование товаров для отправки
function formatCartItems(cart) {
    const items = [];
    
    cart.forEach(item => {
        if (item.type === 'dish') {
            items.push({
                name: item.name,
                price: item.price,
                quantity: item.quantity || 1,
                category: item.category,
                count: item.count
            });
        } else if (item.type === 'combo') {
            // Добавляем комбо как отдельную позицию
            const comboItem = {
                name: item.name + ' (комбо)',
                price: item.discountedPrice || item.price,
                quantity: item.quantity || 1,
                category: 'combo',
                discount: item.discount || 0
            };
            
            // Добавляем состав комбо, если есть
            if (item.dishes && item.dishes.length > 0) {
                comboItem.dishes = item.dishes.map(dish => ({
                    name: dish.name,
                    price: dish.price,
                    count: dish.count,
                    category: dish.category
                }));
            }
            
            items.push(comboItem);
        }
    });
    
    console.log('🛍️ Форматированные товары:', items);
    return items;
}

// Показ уведомления об ошибке
function showNotification(message, isError = false) {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notification-text');
    const notificationOk = document.getElementById('notification-ok');
    
    if (!notification || !notificationText || !notificationOk) {
        console.error('❌ Элементы уведомления не найдены');
        // Создаем простое уведомление
        alert(typeof message === 'string' ? message : message.join(', '));
        return;
    }
    
    let finalMessage = '';
    
    if (Array.isArray(message)) {
        if (message.length === 1) {
            finalMessage = `Вы не добавили ${message[0]} в заказ. Пожалуйста, выберите блюдо из категории "${message[0]}".`;
        } else if (message.length === 2) {
            finalMessage = `Вы не добавили ${message[0]} и ${message[1]} в заказ. Пожалуйста, выберите блюда из этих категорий.`;
        } else if (message.length === 3) {
            finalMessage = `Вы не добавили ${message[0]}, ${message[1]} и ${message[2]} в заказ. Пожалуйста, выберите блюда из этих категорий.`;
        } else if (message.length === 4) {
            finalMessage = `Вы не добавили ${message[0]}, ${message[1]}, ${message[2]} и ${message[3]} в заказ. Пожалуйста, выберите блюда из этих категорий.`;
        } else if (message.length === 5) {
            finalMessage = `Вы не добавили суп, стартер, главное блюдо, напиток и десерт в заказ. Пожалуйста, выберите блюда из этих категорий.`;
        }
    } else {
        finalMessage = message;
    }
    
    notificationText.textContent = finalMessage;
    notificationText.style.color = isError ? '#dc3545' : '#856404';
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

// Показ уведомления об успехе
function showSuccessNotification(message) {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notification-text');
    const notificationOk = document.getElementById('notification-ok');
    
    if (!notification || !notificationText || !notificationOk) {
        console.error('❌ Элементы уведомления не найдены');
        alert(message);
        return;
    }
    
    notificationText.textContent = message;
    notificationText.style.color = '#28a745';
    notification.style.display = 'flex';
    
    // Обработчик для кнопки "Окей" - перенаправляем на страницу заказов
    notificationOk.onclick = function() {
        notification.style.display = 'none';
        // Даем время на анимацию перед перенаправлением
        setTimeout(() => {
            window.location.href = 'orders.html';
        }, 300);
    };
    
    // Автоматическое закрытие через 5 секунд
    setTimeout(() => {
        if (notification.style.display === 'flex') {
            notification.style.display = 'none';
            window.location.href = 'orders.html';
        }
    }, 5000);
}

// Экспортируем для других скриптов
window.checkMissingDishes = checkMissingCategories;