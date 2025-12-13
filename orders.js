// orders.js - ПОЛНОСТЬЮ ПЕРЕПИСАН для нового формата MockAPI
const API_URL = 'https://693bf873b762a4f15c3ef7b6.mockapi.io/api/orders/food_market';

let currentOrders = [];
let currentOrderId = null;
let currentFilter = 'all';
let currentOrderType = 'api'; // 'api' или 'local'

document.addEventListener('DOMContentLoaded', function() {
    loadOrders();
    setupEventListeners();
});

// Настройка обработчиков событий
function setupEventListeners() {
    // Фильтры
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.status;
            filterOrders(currentFilter);
        });
    });
    
    // Кнопка обновления
    document.getElementById('refresh-orders').addEventListener('click', loadOrders);
    
    // Подтверждение удаления
    document.getElementById('confirm-delete').addEventListener('click', deleteOrder);
    
    // Форма редактирования
    const editForm = document.getElementById('edit-order-form');
    if (editForm) {
        editForm.addEventListener('submit', saveOrder);
    }
}

// Загрузка заказов (сначала с API, потом локальные)
async function loadOrders() {
    showLoading(true);
    showEmptyState(false);
    
    try {
        let apiOrders = [];
        let localOrders = [];
        
        // Пробуем загрузить с API
        try {
            console.log('🌐 Загрузка заказов с API...');
            const response = await fetch(API_URL);
            if (response.ok) {
                const data = await response.json();
                apiOrders = Array.isArray(data) ? data : [];
                console.log('✅ Загружено с API:', apiOrders.length, 'заказов');
                
                // Преобразуем API заказы для единого формата
                apiOrders = apiOrders.map(order => ({
                    ...order,
                    delivery_type: order.delivery_type === 'now' ? 'now' : 'by_time',
                    delivery_time: order.delivery_time || 0,
                    created_at: order.created_at || 0,
                    isLocal: false
                }));
            }
        } catch (apiError) {
            console.warn('⚠️ Ошибка загрузки с API:', apiError);
        }
        
        // Загружаем локальные заказы
        try {
            console.log('💾 Загрузка локальных заказов...');
            const localData = localStorage.getItem('localOrders');
            if (localData) {
                localOrders = JSON.parse(localData);
                if (!Array.isArray(localOrders)) {
                    localOrders = [];
                }
                // Помечаем локальные заказы
                localOrders = localOrders.map(order => ({
                    ...order,
                    isLocal: true
                }));
                console.log('✅ Загружено локально:', localOrders.length, 'заказов');
            }
        } catch (localError) {
            console.warn('⚠️ Ошибка загрузки локальных заказов:', localError);
        }
        
        // Объединяем заказы
        const allOrders = [...apiOrders, ...localOrders];
        
        // Сортируем по дате (новые сверху)
        allOrders.sort((a, b) => {
            const dateA = new Date((a.created_at || 0) * 1000);
            const dateB = new Date((b.created_at || 0) * 1000);
            return dateB - dateA;
        });
        
        currentOrders = allOrders;
        displayOrders(allOrders);
        filterOrders(currentFilter);
        
    } catch (error) {
        console.error('💥 Ошибка загрузки заказов:', error);
        showNotification('Не удалось загрузить заказы. Проверьте подключение к интернету.');
    } finally {
        showLoading(false);
    }
}

// Отображение заказов
function displayOrders(orders) {
    const ordersList = document.getElementById('orders-list');
    const noOrdersEl = document.getElementById('no-orders');
    
    if (!orders || orders.length === 0) {
        ordersList.innerHTML = '';
        showEmptyState(true);
        return;
    }
    
    showEmptyState(false);
    
    let html = `
        <table class="orders-table">
            <thead>
                <tr>
                    <th>Номер заказа</th>
                    <th>Дата</th>
                    <th>Состав</th>
                    <th>Доставка</th>
                    <th>Статус</th>
                    <th>Сумма</th>
                    <th>Действия</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    orders.forEach(order => {
        const isLocal = order.isLocal || false;
        const orderId = order.id || order.orderId || 'N/A';
        const orderDate = formatDate(order.created_at || order.createdAt);
        const totalPrice = order.total_price || order.totalPrice || order.total || 0;
        const status = order.status || 'pending';
        
        // Формируем список товаров
        let itemsText = 'Нет данных';
        if (order.items && Array.isArray(order.items)) {
            itemsText = order.items.map(item => 
                `${item.quantity || 1}× ${item.name || 'Товар'}`
            ).join('<br>');
        } else if (order.products) {
            itemsText = order.products;
        }
        
        // Адрес доставки
        const deliveryAddress = order.delivery_address || order.address || 'Не указан';
        const deliveryTime = order.delivery_time ? formatDate(order.delivery_time) : 'Не указано';
        const deliveryInfo = `${deliveryAddress}<br><small>${deliveryTime}</small>`;
        
        // Статус с учетом локальных заказов
        const statusText = getStatusText(status);
        const statusClass = getStatusClass(status);
        const localBadge = isLocal ? ' <span class="local-badge">(локально)</span>' : '';
        
        html += `
            <tr data-order-id="${orderId}" data-status="${status}" data-is-local="${isLocal}">
                <td class="order-number">#${orderId}${localBadge}</td>
                <td class="order-date">${orderDate}</td>
                <td class="order-items">${itemsText}</td>
                <td class="order-delivery">${deliveryInfo}</td>
                <td>
                    ${statusText}
                    <span class="status-badge ${statusClass}">${getStatusBadge(status)}</span>
                </td>
                <td class="order-price">${totalPrice}₽</td>
                <td class="order-actions">
                    <button class="action-btn view-btn" onclick="viewOrder('${orderId}', ${isLocal})" title="Просмотр">
                        <i class="bi bi-eye"></i>
                    </button>
                    <button class="action-btn edit-btn" onclick="editOrder('${orderId}', ${isLocal})" title="Редактировать">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="action-btn delete-btn" onclick="confirmDelete('${orderId}', ${isLocal})" title="Удалить">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    });
    
    html += `
            </tbody>
        </table>
    `;
    
    ordersList.innerHTML = html;
}

// Фильтрация заказов
function filterOrders(filter) {
    const rows = document.querySelectorAll('.orders-table tbody tr');
    
    rows.forEach(row => {
        const status = row.dataset.status;
        
        if (filter === 'all' || filter === status) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
    
    // Показываем сообщение, если нет заказов после фильтрации
    const visibleRows = Array.from(rows).filter(row => row.style.display !== 'none');
    if (visibleRows.length === 0 && rows.length > 0) {
        document.getElementById('orders-list').innerHTML = 
            '<div class="no-orders"><p>Нет заказов с выбранным статусом</p></div>';
    }
}

// Просмотр заказа
async function viewOrder(orderId, isLocal = false) {
    try {
        let order;
        
        if (isLocal) {
            // Ищем в локальных заказах
            const localOrders = JSON.parse(localStorage.getItem('localOrders')) || [];
            order = localOrders.find(o => o.id == orderId);
            if (!order) {
                throw new Error('Локальный заказ не найден');
            }
        } else {
            // Загружаем с API
            const response = await fetch(`${API_URL}/${orderId}`);
            if (!response.ok) throw new Error('Ошибка загрузки данных заказа');
            order = await response.json();
        }
        
        showViewModal(order, isLocal);
    } catch (error) {
        console.error('❌ Ошибка просмотра заказа:', error);
        showNotification('Не удалось загрузить детали заказа.');
    }
}

// Показать модальное окно просмотра
function showViewModal(order, isLocal = false) {
    const modalBody = document.getElementById('view-modal-body');
    
    // Форматируем данные
    const orderDate = formatDate(order.created_at || order.createdAt);
    const deliveryTime = order.delivery_time ? formatDate(order.delivery_time) : 'Не указано';
    const totalPrice = order.total_price || order.totalPrice || order.total || 0;
    const statusText = getStatusText(order.status || 'pending');
    const sourceText = isLocal ? ' (сохранено локально)' : '';
    
    // Формируем список товаров
    let itemsHtml = '<p>Нет данных о товарах</p>';
    if (order.items && Array.isArray(order.items)) {
        const itemsTotal = order.items.reduce((sum, item) => {
            return sum + (item.price || 0) * (item.quantity || 1);
        }, 0);
        
        itemsHtml = `
            <div class="order-items-list">
                <div class="items-header">
                    <span>Название</span>
                    <span>Кол-во</span>
                    <span>Цена</span>
                    <span>Сумма</span>
                </div>
                ${order.items.map(item => `
                    <div class="order-item">
                        <span>${item.name || 'Товар'}</span>
                        <span>${item.quantity || 1}</span>
                        <span>${item.price || 0}₽</span>
                        <span>${(item.price || 0) * (item.quantity || 1)}₽</span>
                    </div>
                `).join('')}
                <div class="items-total">
                    <span colspan="3">Итого по товарам:</span>
                    <span>${itemsTotal}₽</span>
                </div>
            </div>
        `;
    }
    
    modalBody.innerHTML = `
        <div class="order-details">
            <div class="detail-row">
                <div class="detail-label">Номер заказа:</div>
                <div class="detail-value">#${order.id || 'N/A'}${sourceText}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Дата создания:</div>
                <div class="detail-value">${orderDate}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Имя клиента:</div>
                <div class="detail-value">${order.full_name || order.customerName || 'Не указано'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Email:</div>
                <div class="detail-value">${order.email || 'Не указан'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Телефон:</div>
                <div class="detail-value">${order.phone || 'Не указан'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Адрес доставки:</div>
                <div class="detail-value">${order.delivery_address || order.address || 'Не указан'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Время доставки:</div>
                <div class="detail-value">${deliveryTime}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Тип доставки:</div>
                <div class="detail-value">${order.delivery_type === 'now' ? 'Как можно скорее' : 'К указанному времени'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Комментарий:</div>
                <div class="detail-value">${order.comment || 'Нет комментария'}</div>
            </div>
            <div class="detail-row">
                <div class="detail-label">Статус:</div>
                <div class="detail-value">${statusText}</div>
            </div>
            
            <div class="detail-row full-width">
                <div class="detail-label">Состав заказа:</div>
                <div class="detail-value">${itemsHtml}</div>
            </div>
            
            <div class="order-total">
                Итого к оплате: ${totalPrice}₽
            </div>
        </div>
    `;
    
    openModal('view-modal');
}

// Редактирование заказа
async function editOrder(orderId, isLocal = false) {
    currentOrderId = orderId;
    currentOrderType = isLocal ? 'local' : 'api';
    
    try {
        let order;
        
        if (isLocal) {
            // Ищем в локальных заказах
            const localOrders = JSON.parse(localStorage.getItem('localOrders')) || [];
            order = localOrders.find(o => o.id == orderId);
            if (!order) {
                throw new Error('Локальный заказ не найден');
            }
        } else {
            // Загружаем с API
            const response = await fetch(`${API_URL}/${orderId}`);
            if (!response.ok) throw new Error('Ошибка загрузки данных заказа');
            order = await response.json();
        }
        
        showEditModal(order, isLocal);
    } catch (error) {
        console.error('❌ Ошибка редактирования заказа:', error);
        showNotification('Не удалось загрузить данные для редактирования.');
    }
}

// Показать модальное окно редактирования
function showEditModal(order, isLocal = false) {
    const modalBody = document.querySelector('#edit-order-form');
    const sourceInfo = isLocal ? '<p class="text-muted"><small>Этот заказ сохранен локально</small></p>' : '';
    
    // Определяем значение delivery_type
    const deliveryTypeValue = order.delivery_type === 'now' ? 'now' : 'by_time';
    
    modalBody.innerHTML = `
        ${sourceInfo}
        <div class="form-group">
            <label for="edit-full_name">Имя клиента *</label>
            <input type="text" id="edit-full_name" name="full_name" 
                   value="${order.full_name || order.customerName || ''}" required>
        </div>
        
        <div class="form-group">
            <label for="edit-email">Email *</label>
            <input type="email" id="edit-email" name="email" 
                   value="${order.email || ''}" required>
        </div>
        
        <div class="form-group">
            <label for="edit-phone">Телефон *</label>
            <input type="tel" id="edit-phone" name="phone" 
                   value="${order.phone || ''}" required>
        </div>
        
        <div class="form-group">
            <label for="edit-delivery_address">Адрес доставки *</label>
            <input type="text" id="edit-delivery_address" name="delivery_address" 
                   value="${order.delivery_address || order.address || ''}" required>
        </div>
        
        <div class="form-group">
            <label for="edit-delivery_type">Тип доставки</label>
            <select id="edit-delivery_type" name="delivery_type">
                <option value="now" ${deliveryTypeValue === 'now' ? 'selected' : ''}>Как можно скорее</option>
                <option value="by_time" ${deliveryTypeValue === 'by_time' ? 'selected' : ''}>К указанному времени</option>
            </select>
        </div>
        
        <div class="form-group">
            <label for="edit-delivery_time">Время доставки</label>
            <input type="text" id="edit-delivery_time" name="delivery_time" 
                   value="${order.delivery_time ? formatDate(order.delivery_time) : ''}">
        </div>
        
        <div class="form-group">
            <label for="edit-comment">Комментарий</label>
            <textarea id="edit-comment" name="comment" rows="3">${order.comment || ''}</textarea>
        </div>
        
        <div class="form-group">
            <label for="edit-status">Статус заказа</label>
            <select id="edit-status" name="status">
                <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>В обработке</option>
                <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Доставлен</option>
                <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Отменён</option>
            </select>
        </div>
    `;
    
    openModal('edit-modal');
}

// Сохранение изменений
async function saveOrder(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const nowTimestamp = Math.floor(Date.now() / 1000);
    
    const data = {
        full_name: formData.get('full_name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        delivery_address: formData.get('delivery_address'),
        delivery_type: formData.get('delivery_type'),  // Строка 'now' или 'by_time'
        delivery_time: nowTimestamp,  // Unix timestamp
        comment: formData.get('comment'),
        status: formData.get('status'),
        updated_at: nowTimestamp
    };
    
    try {
        if (currentOrderType === 'api') {
            // Обновляем в API
            const response = await fetch(`${API_URL}/${currentOrderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) throw new Error('Ошибка сохранения изменений в API');
        } else {
            // Обновляем локально
            const localOrders = JSON.parse(localStorage.getItem('localOrders')) || [];
            const orderIndex = localOrders.findIndex(o => o.id == currentOrderId);
            
            if (orderIndex !== -1) {
                // Сохраняем исходные данные
                const originalOrder = localOrders[orderIndex];
                localOrders[orderIndex] = {
                    ...originalOrder,
                    ...data,
                    updated_at: nowTimestamp
                };
                
                localStorage.setItem('localOrders', JSON.stringify(localOrders));
            } else {
                throw new Error('Локальный заказ не найден');
            }
        }
        
        closeModal('edit-modal');
        showNotification('Заказ успешно изменён!');
        loadOrders();
    } catch (error) {
        console.error('❌ Ошибка сохранения:', error);
        showNotification('Не удалось сохранить изменения. Попробуйте ещё раз.');
    }
}

// Подтверждение удаления
function confirmDelete(orderId, isLocal = false) {
    currentOrderId = orderId;
    currentOrderType = isLocal ? 'local' : 'api';
    
    const orderText = isLocal ? ' (локальный заказ)' : '';
    document.getElementById('delete-modal').querySelector('p').textContent = 
        `Вы уверены, что хотите удалить заказ №${orderId}${orderText}?`;
    
    openModal('delete-modal');
}

// Удаление заказа
async function deleteOrder() {
    try {
        if (currentOrderType === 'api') {
            // Удаляем из API
            const response = await fetch(`${API_URL}/${currentOrderId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) throw new Error('Ошибка удаления заказа из API');
        } else {
            // Удаляем локально
            const localOrders = JSON.parse(localStorage.getItem('localOrders')) || [];
            const filteredOrders = localOrders.filter(o => o.id != currentOrderId);
            
            localStorage.setItem('localOrders', JSON.stringify(filteredOrders));
        }
        
        closeModal('delete-modal');
        showNotification('Заказ успешно удалён!');
        loadOrders();
    } catch (error) {
        console.error('❌ Ошибка удаления:', error);
        showNotification('Не удалось удалить заказ. Попробуйте ещё раз.');
    }
}

// Вспомогательные функции
function formatDate(dateValue) {
    if (!dateValue) return 'Не указана';
    
    try {
        let date;
        
        // Если это Unix timestamp (число)
        if (typeof dateValue === 'number' || (typeof dateValue === 'string' && /^\d+$/.test(dateValue))) {
            date = new Date(Number(dateValue) * 1000);
        } else {
            date = new Date(dateValue);
        }
        
        // Проверяем, что дата валидна
        if (isNaN(date.getTime())) {
            return 'Некорректная дата';
        }
        
        return date.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        console.warn('⚠️ Ошибка форматирования даты:', dateValue, e);
        return 'Некорректная дата';
    }
}

function getStatusText(status) {
    const statusMap = {
        'pending': 'В обработке',
        'delivered': 'Доставлен',
        'cancelled': 'Отменён'
    };
    return statusMap[status] || status;
}

function getStatusClass(status) {
    const classMap = {
        'pending': 'status-pending',
        'delivered': 'status-delivered',
        'cancelled': 'status-cancelled'
    };
    return classMap[status] || 'status-pending';
}

function getStatusBadge(status) {
    const badgeMap = {
        'pending': '⏳',
        'delivered': '✅',
        'cancelled': '❌'
    };
    return badgeMap[status] || '❓';
}

function showLoading(show) {
    const loadingEl = document.getElementById('loading');
    if (loadingEl) {
        loadingEl.style.display = show ? 'block' : 'none';
    }
}

function showEmptyState(show) {
    const noOrdersEl = document.getElementById('no-orders');
    const ordersList = document.getElementById('orders-list');
    
    if (noOrdersEl) {
        noOrdersEl.style.display = show ? 'block' : 'none';
    }
    if (ordersList) {
        ordersList.style.display = show ? 'none' : 'block';
    }
}

// Работа с модальными окнами
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Уведомления
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
}

// Добавляем CSS для локальных заказов
if (!document.querySelector('#orders-local-styles')) {
    const style = document.createElement('style');
    style.id = 'orders-local-styles';
    style.textContent = `
        .local-badge {
            display: inline-block;
            background-color: #6c757d;
            color: white;
            padding: 2px 6px;
            border-radius: 10px;
            font-size: 0.7em;
            margin-left: 5px;
            vertical-align: middle;
        }
        
        .order-items-list .items-header {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1fr;
            gap: 10px;
            padding: 10px;
            background-color: #f8f9fa;
            border-radius: 5px;
            margin-bottom: 5px;
            font-weight: 600;
        }
        
        .order-items-list .order-item {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1fr;
            gap: 10px;
            padding: 8px 10px;
            border-bottom: 1px solid #eee;
        }
        
        .order-items-list .order-item:last-child {
            border-bottom: none;
        }
        
        .order-items-list .items-total {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr 1fr;
            gap: 10px;
            padding: 10px;
            background-color: #f8f9fa;
            border-radius: 5px;
            margin-top: 10px;
            font-weight: 600;
        }
        
        .full-width .detail-value {
            width: 100%;
        }
    `;
    document.head.appendChild(style);
}

// Добавляем глобальные функции для кнопок в таблице
window.viewOrder = viewOrder;
window.editOrder = editOrder;
window.confirmDelete = confirmDelete;
window.closeModal = closeModal;