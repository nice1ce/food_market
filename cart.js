// cart.js - обновленная версия с поддержкой комбо
const CART_KEY = 'cart';

// Глобальные функции для добавления в корзину
window.addDishToCart = function(dish) {
    addToCart({
        type: 'dish',
        keyword: dish.keyword,
        name: dish.name,
        price: dish.price,
        image: dish.image,
        count: dish.count,
        category: dish.category
    });
    showNotification(`${dish.name} добавлен в корзину`);
    return true;
};

window.addComboToCart = function(combo) {
    // Добавляем комбо как одну позицию
    addToCart({
        type: 'combo',
        id: combo.id,
        name: combo.name,
        price: combo.totalPrice,
        discountedPrice: combo.discountedPrice,
        discount: combo.discount,
        description: combo.description,
        dishes: combo.dishes.map(dishRef => {
            const dish = window.dishes.find(d => d.keyword === dishRef.keyword);
            return dish ? {
                name: dish.name,
                image: dish.image,
                count: dish.count,
                price: dish.price
            } : null;
        }).filter(Boolean)
    });
    showNotification(`Комбо "${combo.name}" добавлено в корзину со скидкой ${combo.discount}%`);
    return true;
};

window.addCustomComboToCart = function(customCombo) {
    // Создаем кастомное комбо
    const totalPrice = customCombo.dishes.reduce((sum, dish) => sum + dish.price, 0);
    const discount = customCombo.dishes.length >= 3 ? 25 : 0;
    const discountedPrice = Math.round(totalPrice * (1 - discount / 100));
    
    // Добавляем как комбо
    addToCart({
        type: 'combo',
        id: 'custom_' + Date.now(),
        name: 'Собранный ланч',
        price: totalPrice,
        discountedPrice: discountedPrice,
        discount: discount,
        description: 'Ваш собранный ланч',
        dishes: customCombo.dishes.map(dish => ({
            name: dish.name,
            image: dish.image,
            count: dish.count,
            price: dish.price,
            category: dish.category
        }))
    });
    showNotification(`Собранный ланч добавлен в корзину ${discount > 0 ? `со скидкой ${discount}%` : ''}`);
    return true;
};

// Основная функция добавления в корзину
function addToCart(item) {
    let cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
    
    if (item.type === 'dish') {
        // Проверяем, есть ли уже такой товар
        const existingIndex = cart.findIndex(cartItem => 
            cartItem.type === 'dish' && cartItem.keyword === item.keyword
        );
        
        if (existingIndex !== -1) {
            // Увеличиваем количество
            cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
        } else {
            // Добавляем новый
            item.quantity = 1;
            cart.push(item);
        }
    } else if (item.type === 'combo') {
        // Для комбо тоже можем увеличивать количество, если одинаковое
        const existingIndex = cart.findIndex(cartItem => 
            cartItem.type === 'combo' && cartItem.id === item.id
        );
        
        if (existingIndex !== -1) {
            cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
        } else {
            item.quantity = 1;
            cart.push(item);
        }
    }
    
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartCounter();
    dispatchCartUpdate();
    return true;
}

// Обновление счетчика в шапке
function updateCartCounter() {
    const counter = document.getElementById('cart-counter');
    if (!counter) return;
    
    const cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    
    if (totalItems > 0) {
        counter.textContent = totalItems;
        counter.style.display = 'inline-flex';
    } else {
        counter.style.display = 'none';
    }
}

// Уведомление
function showNotification(message) {
    // Создаем простое уведомление
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        font-family: "Work Sans", sans-serif;
        animation: slideIn 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Добавляем стили для анимации
if (!document.querySelector('#cart-notification-styles')) {
    const style = document.createElement('style');
    style.id = 'cart-notification-styles';
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        #cart-counter {
            display: none;
            background: #ff6b6b;
            color: white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            font-size: 12px;
            align-items: center;
            justify-content: center;
            margin-left: 5px;
            vertical-align: top;
        }
        
        .cart-combo-item {
            border: 2px solid #e3f2fd;
            background-color: #f8fdff;
        }
        
        .combo-dishes-list {
            margin-top: 10px;
            padding: 10px;
            background: #f5f5f5;
            border-radius: 8px;
            font-size: 0.9em;
        }
        
        .combo-dish-item {
            display: flex;
            align-items: center;
            margin-bottom: 5px;
            padding: 5px;
            background: white;
            border-radius: 4px;
        }
        
        .combo-dish-item img {
            width: 40px;
            height: 40px;
            border-radius: 4px;
            margin-right: 10px;
        }
        
        .combo-discount-badge {
            display: inline-block;
            background: #ff6b6b;
            color: white;
            padding: 2px 8px;
            border-radius: 10px;
            font-size: 0.8em;
            margin-left: 10px;
        }
        
        .original-price {
            text-decoration: line-through;
            color: #999;
            margin-right: 10px;
            font-size: 0.9em;
        }
        
        .discounted-price {
            color: #28a745;
            font-weight: bold;
            font-size: 1.1em;
        }
    `;
    document.head.appendChild(style);
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    updateCartCounter();
    
    // Загружаем корзину на странице cart.html
    if (window.location.pathname.includes('cart.html')) {
        loadCartPage();
    }
});

// Загрузка страницы корзины
function loadCartPage() {
    const cartItemsEl = document.getElementById('cart-items');
    const cartEmptyEl = document.getElementById('cart-empty');
    const totalEl = document.getElementById('summary-total');
    
    if (!cartItemsEl || !cartEmptyEl || !totalEl) return;
    
    const cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
    
    if (cart.length === 0) {
        cartItemsEl.innerHTML = '';
        cartEmptyEl.style.display = 'block';
        totalEl.textContent = '0₽';
        return;
    }
    
    cartEmptyEl.style.display = 'none';
    
    let itemsHTML = '';
    let total = 0;
    
    cart.forEach(item => {
        let itemTotal, itemPriceDisplay;
        
        if (item.type === 'combo') {
            // Для комбо используем цену со скидкой
            itemTotal = (item.discountedPrice || item.price) * (item.quantity || 1);
            itemPriceDisplay = `
                <span class="original-price">${item.price}₽</span>
                <span class="discounted-price">${item.discountedPrice || item.price}₽</span>
                <span class="combo-discount-badge">-${item.discount || 0}%</span>
            `;
            
            itemsHTML += `
                <div class="cart-item-card cart-combo-item">
                    <p class="cart-item-category">КОМБО</p>
                    <div style="font-weight: 600; color: #2a2f37; margin: 5px 0;">${item.name}</div>
                    <p class="cart-item-price">${itemPriceDisplay}</p>
                    <div class="combo-dishes-list">
                        <strong>Состав:</strong>
                        ${item.dishes ? item.dishes.map(dish => `
                            <div class="combo-dish-item">
                                ${dish.image ? `<img src="${dish.image}" alt="${dish.name}">` : ''}
                                <span>${dish.name} - ${dish.count}</span>
                            </div>
                        `).join('') : ''}
                    </div>
                    <p class="cart-item-count">Количество: ${item.quantity || 1}</p>
                    <p class="cart-item-total">Итого: ${itemTotal}₽</p>
                    <button class="cart-item-remove" data-id="${item.id}" data-type="combo">Удалить</button>
                </div>
            `;
        } else {
            // Для обычных блюд
            itemTotal = item.price * (item.quantity || 1);
            total += itemTotal;
            
            itemsHTML += `
                <div class="cart-item-card">
                    <p class="cart-item-category">${getCategoryName(item.category)}</p>
                    <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/150?text=Нет+изображения'">
                    <p class="cart-item-name">${item.name}</p>
                    <p class="cart-item-price">${item.price}₽</p>
                    <p class="cart-item-count">${item.count}</p>
                    <div class="cart-item-quantity">
                        <button class="cart-qty-btn dec" data-keyword="${item.keyword}">−</button>
                        <span class="cart-qty-display">${item.quantity || 1}</span>
                        <button class="cart-qty-btn inc" data-keyword="${item.keyword}">+</button>
                    </div>
                    <p class="cart-item-total">Итого: ${itemTotal}₽</p>
                    <button class="cart-item-remove" data-keyword="${item.keyword}" data-type="dish">Удалить</button>
                </div>
            `;
        }
        
        total += itemTotal;
    });
    
    cartItemsEl.innerHTML = itemsHTML;
    totalEl.textContent = `${total}₽`;
    
    // Добавляем обработчики событий
    addCartEventListeners();
}

function getCategoryName(category) {
    const names = {
        'soup': 'Суп',
        'starter': 'Стартер', 
        'main_dish': 'Основное блюдо',
        'drink': 'Напиток',
        'dessert': 'Десерт'
    };
    return names[category] || 'Блюдо';
}

function addCartEventListeners() {
    // Увеличение количества для блюд
    document.querySelectorAll('.cart-qty-btn.inc').forEach(btn => {
        btn.addEventListener('click', function() {
            const keyword = this.dataset.keyword;
            updateCartItemQuantity(keyword, 1, 'dish');
        });
    });
    
    // Уменьшение количества для блюд
    document.querySelectorAll('.cart-qty-btn.dec').forEach(btn => {
        btn.addEventListener('click', function() {
            const keyword = this.dataset.keyword;
            updateCartItemQuantity(keyword, -1, 'dish');
        });
    });
    
    // Удаление
    document.querySelectorAll('.cart-item-remove').forEach(btn => {
        btn.addEventListener('click', function() {
            const type = this.dataset.type;
            if (type === 'combo') {
                const id = this.dataset.id;
                removeFromCart(id, 'combo');
            } else {
                const keyword = this.dataset.keyword;
                removeFromCart(keyword, 'dish');
            }
        });
    });
}

function updateCartItemQuantity(identifier, change, type) {
    let cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
    let index;
    
    if (type === 'dish') {
        index = cart.findIndex(item => item.type === 'dish' && item.keyword === identifier);
    } else if (type === 'combo') {
        index = cart.findIndex(item => item.type === 'combo' && item.id === identifier);
    }
    
    if (index !== -1) {
        cart[index].quantity = (cart[index].quantity || 1) + change;
        
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
        
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        updateCartCounter();
        loadCartPage(); // Перезагружаем отображение
        dispatchCartUpdate();
    }
}

function removeFromCart(identifier, type) {
    let cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
    
    if (type === 'dish') {
        cart = cart.filter(item => !(item.type === 'dish' && item.keyword === identifier));
    } else if (type === 'combo') {
        cart = cart.filter(item => !(item.type === 'combo' && item.id === identifier));
    }
    
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartCounter();
    loadCartPage();
    dispatchCartUpdate();
}

// Отправка события об обновлении корзины
function dispatchCartUpdate() {
    window.dispatchEvent(new CustomEvent('cartUpdated'));
    window.dispatchEvent(new Event('storage'));
}

// Экспортируем для других скриптов
window.getCartTotal = function() {
    const cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
    return cart.reduce((total, item) => {
        if (item.type === 'combo') {
            return total + (item.discountedPrice || item.price) * (item.quantity || 1);
        } else {
            return total + item.price * (item.quantity || 1);
        }
    }, 0);
};

window.getCartItemsCount = function() {
    const cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
    return cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
};