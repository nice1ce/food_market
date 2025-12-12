// comboDisplay.js
document.addEventListener('dishesLoaded', function() {
    if (typeof combos !== 'undefined') {
        displayCombos();
    }
});

function displayCombos() {
    const comboGrid = document.getElementById('combo-grid');
    if (!comboGrid) return;
    
    comboGrid.innerHTML = '';
    
    combos.forEach(combo => {
        const comboElement = createComboElement(combo);
        comboGrid.appendChild(comboElement);
    });
}


function createComboElement(combo) {
    const comboDiv = document.createElement('div');
    comboDiv.className = 'combo-block';
    
    let dishesHTML = '';
    combo.dishes.forEach(dishCombo => {
        const dish = dishes.find(d => d.keyword === dishCombo.keyword);
        if (dish) {
            dishesHTML += `
                <div class="combo-dish">
                    <img src="${dish.image}" alt="${dish.name}" class="combo-dish-image">
                    <div class="combo-dish-info">
                        <p class="combo-dish-name">${dish.name}</p>
                        <p class="combo-dish-count">${dish.count}</p>
                    </div>
                </div>
            `;
        }
    });
    
    comboDiv.innerHTML = `
        <div class="combo-header">
            <h3 class="combo-name">${combo.name}</h3>
            <p class="combo-description">${combo.description}</p>
        </div>
        <div class="combo-content">
            <div class="combo-dishes">
                ${dishesHTML}
            </div>
            <div class="combo-price">
                <div>
                    <div class="combo-original-price">${combo.totalPrice}₽</div>
                    <div class="combo-discounted-price">${combo.discountedPrice}₽</div>
                </div>
                <div class="combo-discount-badge">-${combo.discount}%</div>
            </div>
            <button class="combo-select-btn" onclick="addComboToCartFromPage('${combo.id}')">
                Добавить в корзину за ${combo.discountedPrice}₽
            </button>
        </div>
    `;
    
    // Оставляем возможность выбора комбо
    comboDiv.addEventListener('click', function(e) {
        if (!e.target.classList.contains('combo-select-btn')) {
            selectCombo(combo.id);
        }
    });
    
    return comboDiv;
}

// Глобальная функция для добавления комбо
window.addComboToCartFromPage = function(comboId) {
    const combo = window.combos.find(c => c.id === comboId);
    if (combo && typeof window.addComboToCart === 'function') {
        window.addComboToCart(combo);
    }
};

function selectCombo(comboId) {
    const combo = window.combos.find(c => c.id === comboId);
    if (combo && typeof window.addComboToCart === 'function') {
        window.addComboToCart(combo);
    } else {
        // Если функция не доступна, показываем сообщение
        alert(`Комбо "${combo.name}" выбрано! Для добавления в корзину обновите страницу.`);
    }
}