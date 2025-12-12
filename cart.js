// cart.js — адаптирован под cart.html (id="cart-items", id="cart-empty", id="summary-total")
// и под localStorage.cart, который может быть массивом (как в customCombo.js)

document.addEventListener("DOMContentLoaded", () => {
  const CART_KEY = "cart";

  const cartItemsEl = document.getElementById("cart-items");
  const cartEmptyEl = document.getElementById("cart-empty");
  const totalEl = document.getElementById("summary-total");

  if (!cartItemsEl || !cartEmptyEl || !totalEl) return;

  // ---------- storage ----------
  function loadRawCart() {
    try {
      const raw = localStorage.getItem(CART_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);

      // customCombo.js сохраняет МАССИВ
      if (Array.isArray(parsed)) return parsed;

      // если вдруг старый формат-объект {id: item}
      if (parsed && typeof parsed === "object") {
        return Object.values(parsed);
      }

      return [];
    } catch (e) {
      console.error("cart load error", e);
      return [];
    }
  }

  function saveRawCart(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }

  // ---------- normalize -> dish counts ----------
  // собираем все блюда из любых элементов корзины в map keyword -> {dish, qty}
  function buildDishMap(rawItems) {
    const map = new Map();

    function inc(keyword, dishObj, qty = 1) {
      if (!keyword) return;
      const cur = map.get(keyword);
      if (cur) {
        cur.qty += qty;
      } else {
        // dishObj может быть полным объектом блюда (из customCombo.js)
        // или найдём по dishes.js
        const dish = dishObj || (window.dishes || []).find(d => d.keyword === keyword);
        if (!dish) return;
        map.set(keyword, { dish, qty });
      }
    }

    rawItems.forEach(item => {
      // 1) кастомный ланч: item.dishes = [dishObj, dishObj...]
      if (Array.isArray(item?.dishes)) {
        item.dishes.forEach(d => inc(d.keyword, d, 1));
        return;
      }

      // 2) вариант "блюдо в корзине" (если когда-нибудь появится)
      if (item?.type === "dish" && item.keyword) {
        inc(item.keyword, null, item.qty || 1);
        return;
      }

      // 3) если вдруг хранятся dishKeywords
      if (Array.isArray(item?.dishKeywords)) {
        item.dishKeywords.forEach(k => inc(k, null, 1));
        return;
      }
    });

    return map;
  }

  // ---------- render ----------
  function render() {
    const raw = loadRawCart();
    const map = buildDishMap(raw);

    cartItemsEl.innerHTML = "";

    if (map.size === 0) {
      cartEmptyEl.style.display = "block";
      totalEl.textContent = "0₽";
      return;
    }

    cartEmptyEl.style.display = "none";

    let total = 0;

    for (const [keyword, { dish, qty }] of map.entries()) {
      total += dish.price * qty;

      const card = document.createElement("div");
      card.className = "cart-item-card";
      card.innerHTML = `
        <p class="cart-item-category">${categoryTitle(dish.category)}</p>
        <img src="${dish.image}" alt="${dish.name}">
        <p class="cart-item-name">${dish.name}</p>
        <p class="cart-item-price">${dish.price}₽ ${qty > 1 ? `<span style="color:#666">× ${qty}</span>` : ""}</p>
        <p class="cart-item-count">${dish.count}</p>
        <div style="display:flex; gap:10px; justify-content:center; margin-top:10px;">
          <button class="cart-dec" data-key="${keyword}">−</button>
          <button class="cart-inc" data-key="${keyword}">+</button>
          <button class="cart-remove" data-key="${keyword}">Удалить</button>
        </div>
      `;
      cartItemsEl.appendChild(card);
    }

    totalEl.textContent = `${total}₽`;
  }

  function categoryTitle(cat) {
    const map = {
      soup: "Суп",
      starter: "Стартер",
      main_dish: "Главное блюдо",
      drink: "Напиток",
      dessert: "Десерт"
    };
    return map[cat] || "";
  }

  // ---------- cart actions (только внутри корзины) ----------
  // Уменьшаем/увеличиваем количество блюда в localStorage.cart, не трогая меню
  function changeDishQty(keyword, delta) {
    const raw = loadRawCart();

    // Сначала пробуем найти item типа dish (если появится в будущем)
    for (const item of raw) {
      if (item?.type === "dish" && item.keyword === keyword) {
        item.qty = (item.qty || 1) + delta;
        if (item.qty <= 0) {
          const idx = raw.indexOf(item);
          raw.splice(idx, 1);
        }
        saveRawCart(raw);
        return;
      }
    }

    // Иначе работаем с кастомными ланчами (item.dishes)
    if (delta < 0) {
      // убрать 1 шт: удаляем первое вхождение keyword из любого combo.dishes
      for (let i = 0; i < raw.length; i++) {
        const item = raw[i];
        if (!Array.isArray(item?.dishes)) continue;

        const di = item.dishes.findIndex(d => d.keyword === keyword);
        if (di !== -1) {
          item.dishes.splice(di, 1);
          if (item.dishes.length === 0) raw.splice(i, 1);
          saveRawCart(raw);
          return;
        }
      }
    } else {
      // добавить 1 шт: добавим блюдо как отдельный item типа dish (чтобы не ломать комбо)
      raw.push({ type: "dish", keyword, qty: 1 });
      saveRawCart(raw);
      return;
    }
  }

  function removeDishAll(keyword) {
    const raw = loadRawCart();

    // убрать item type dish
    for (let i = raw.length - 1; i >= 0; i--) {
      const item = raw[i];

      if (item?.type === "dish" && item.keyword === keyword) {
        raw.splice(i, 1);
        continue;
      }

      if (Array.isArray(item?.dishes)) {
        item.dishes = item.dishes.filter(d => d.keyword !== keyword);
        if (item.dishes.length === 0) raw.splice(i, 1);
      }

      if (Array.isArray(item?.dishKeywords)) {
        item.dishKeywords = item.dishKeywords.filter(k => k !== keyword);
        if (item.dishKeywords.length === 0) raw.splice(i, 1);
      }
    }

    saveRawCart(raw);
  }

  cartItemsEl.addEventListener("click", (e) => {
    const inc = e.target.closest(".cart-inc");
    const dec = e.target.closest(".cart-dec");
    const rem = e.target.closest(".cart-remove");

    if (inc) {
      changeDishQty(inc.dataset.key, +1);
      render();
    }
    if (dec) {
      changeDishQty(dec.dataset.key, -1);
      render();
    }
    if (rem) {
      removeDishAll(rem.dataset.key);
      render();
    }
  });

  window.addComboToCart = function(combo) {
  // combo.dishes = [{keyword: ...}, ...]
  try {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (!Array.isArray(cart)) cart = [];

    // Добавляем блюда комбо в корзину "по отдельности"
    combo.dishes.forEach(d => {
      cart.push({ type: 'dish', keyword: d.keyword, qty: 1 });
    });

    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`Комбо "${combo.name}" добавлено в корзину`);
  } catch (e) {
    console.error('addComboToCart error', e);
  }
};

// customCombo.js может вызывать addCustomComboToCartFromKeywords(...)
window.addCustomComboToCartFromKeywords = function(dishKeywords, totalPrice) {
  try {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (!Array.isArray(cart)) cart = [];

    dishKeywords.forEach(k => cart.push({ type: 'dish', keyword: k, qty: 1 }));

    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Собранный ланч добавлен в корзину');
  } catch (e) {
    console.error('addCustomComboToCartFromKeywords error', e);
  }
};

// если где-то вызывается addDishToCart(keyword)
window.addDishToCart = function(keyword) {
  try {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (!Array.isArray(cart)) cart = [];

    cart.push({ type: 'dish', keyword, qty: 1 });

    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Блюдо добавлено в корзину');
  } catch (e) {
    console.error('addDishToCart error', e);
  }
};

  render();
});
