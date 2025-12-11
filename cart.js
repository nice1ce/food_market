// cart.js

document.addEventListener('dishesLoaded', function () {
    initCartPage();
});

function getStoredOrder() {
    try {
        const raw = localStorage.getItem('orderDishes');
        if (!raw) return null;
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

function setStoredOrder(orderObj) {
    try {
        localStorage.setItem('orderDishes', JSON.stringify(orderObj));
    } catch (e) {
        console.error('Не удалось сохранить заказ', e);
    }
}

function initCartPage() {
    const order = getStoredOrder() || {
        soup: null,
        starter: null,
        main_dish: null,
        drink: null,
        dessert: null
    };

    renderCartItems(order);
    updateTotal(order);
    initForm(order);
}

// ---------- РЕНДЕР КАРТОЧЕК "Состав заказа" ----------

function renderCartItems(order) {
    const container = document.getElementById('cart-items');
    const empty = document.getElementById('cart-empty');
    if (!container || !empty) return;

    container.innerHTML = '';

    const categories = ['soup', 'starter', 'main_dish', 'drink', 'dessert'];
    const categoriesNames = {
        soup: 'Суп',
        starter: 'Стартер',
        main_dish: 'Главное блюдо',
        drink: 'Напиток',
        dessert: 'Десерт'
    };

    let hasAny = false;

    categories.forEach(cat => {
        const keyword = order[cat];
        if (!keyword) return;

        const dish = (window.dishes || []).find(d => d.keyword === keyword);
        if (!dish) return;

        hasAny = true;

        const card = document.createElement('div');
        card.className = 'cart-item-card';
        card.innerHTML = `
            <p class="cart-item-category">${categoriesNames[cat]}</p>
            <img src="${dish.image}" alt="${dish.name}">
            <p class="cart-item-name">${dish.name}</p>
            <p class="cart-item-price">${dish.price}₽</p>
            <p class="cart-item-count">${dish.count}</p>
            <button class="cart-item-remove" data-category="${cat}">Удалить</button>
        `;
        container.appendChild(card);
    });

    if (!hasAny) {
        empty.style.display = 'block';
    } else {
        empty.style.display = 'none';
    }

    // обработчик удаления (делегирование)
    container.onclick = function (e) {
        const btn = e.target.closest('.cart-item-remove');
        if (!btn) return;
        const cat = btn.dataset.category;
        const current = getStoredOrder() || {};
        current[cat] = null;
        setStoredOrder(current);
        renderCartItems(current);
        updateTotal(current);
    };
}

// ---------- Подсчёт общей стоимости ----------

function updateTotal(order) {
    if (!window.dishes) return;

    let total = 0;

    Object.values(order).forEach(keyword => {
        if (!keyword) return;
        const dish = window.dishes.find(d => d.keyword === keyword);
        if (dish) total += dish.price;
    });

    const totalSpan = document.getElementById('summary-total');
    if (totalSpan) {
        totalSpan.textContent = `${total}₽`;
    }
}

// ---------- ИНИЦИАЛИЗАЦИЯ ФОРМЫ И ОТПРАВКА ----------

function buildCurrentOrderObject(orderStorage) {
    // превращаем keywords в объекты блюд
    const result = {
        soup: null,
        starter: null,
        main_dish: null,
        drink: null,
        dessert: null
    };

    if (!window.dishes) return result;

    Object.keys(result).forEach(cat => {
        const keyword = orderStorage[cat];
        if (!keyword) return;
        const dish = window.dishes.find(d => d.keyword === keyword);
        if (dish) result[cat] = dish;
    });

    return result;
}

function initForm(orderStorage) {
    const form = document.getElementById('order-form');
    if (!form) return;

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const currentOrder = buildCurrentOrderObject(orderStorage);

        // проверки на пустые категории (как в ЛР6)
        const missing = checkMissingDishes(currentOrder); // из orderValidator.js
        if (missing.length > 0) {
            showNotification(missing);
            return;
        }

        const matchedCombo = findMatchingCombo(currentOrder); // из orderValidator.js
        if (!matchedCombo) {
            showNotification(
                ["Ваш заказ не соответствует ни одному из доступных комбо-ланчей."],
                true
            );
            return;
        }

        // Все ок — собираем данные для отправки
        const name = document.getElementById('name_text').value.trim();
        const email = document.getElementById('email_but').value.trim();
        const subscribe = document.getElementById('subscribe').checked ? 1 : 0;
        const phone = document.getElementById('phone_but').value.trim();
        const address = document.getElementById('address').value.trim();
        const comment = document.getElementById('order_comment').value.trim();

        const timeChoice = form.querySelector('input[name="time_choice"]:checked')?.value || 'now';
        const timeInput = document.getElementById('deliv_time').value;

        const delivery_type = timeChoice; // "now" или "by_time"
        const delivery_time = timeChoice === 'by_time' ? timeInput : null;

        const soupDish = currentOrder.soup;
        const starterDish = currentOrder.starter;
        const mainDish = currentOrder.main_dish;
        const drinkDish = currentOrder.drink;
        const dessertDish = currentOrder.dessert;

        const orderData = {
            full_name: name,
            email: email,
            subscribe: subscribe,
            phone: phone,
            delivery_address: address,
            delivery_type: delivery_type,
            delivery_time: delivery_time,
            comment: comment,
            soup_id: soupDish ? (soupDish.id || null) : null,
            main_course_id: mainDish ? (mainDish.id || null) : null,
            salad_id: starterDish ? (starterDish.id || null) : null,
            drink_id: drinkDish ? (drinkDish.id || null) : null,
            dessert_id: dessertDish ? (dessertDish.id || null) : null
        };

        try {
            const API_BASE = 'https://edu.std-900.ist.mospolytech.ru'; // или http://lab8-api.std-900...
            const API_KEY = 'ВСТАВЬ_СВОЙ_API_KEY';

            const response = await fetch(
                `${API_BASE}/labs/api/orders?api_key=${API_KEY}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(orderData)
                }
            );

            if (!response.ok) {
                throw new Error('Ошибка ответа сервера');
            }

            const data = await response.json();
            console.log('Ответ сервера:', data);

            alert('Заказ успешно оформлен!');

            // очистить localStorage и UI
            localStorage.removeItem('orderDishes');

            const emptyOrder = {
                soup: null,
                starter: null,
                main_dish: null,
                drink: null,
                dessert: null
            };

            renderCartItems(emptyOrder);
            updateTotal(emptyOrder);
            form.reset();
        } catch (err) {
            console.error(err);
            alert('Не удалось отправить заказ. Попробуйте позже.');
        }
    });
}
