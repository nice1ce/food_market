// dishes.js

// Глобальный массив блюд (пока пустой)
let dishes = [];
window.dishes = dishes;

// Функция загрузки блюд с API
async function loadDishes() {
    try {
        const response = await fetch(
            "https://raw.githubusercontent.com/nice1ce/food_market/main/dishes.json"
        );

        if (!response.ok) {
            throw new Error("Ошибка загрузки блюд: " + response.status);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new Error("Некорректный формат данных блюд");
        }

        // Обновляем глобальную переменную
        dishes = data;
        window.dishes = data;

        // Сообщаем всем остальным скриптам, что блюда готовы
        document.dispatchEvent(
            new CustomEvent("dishesLoaded", { detail: { dishes: data } })
        );
    } catch (error) {
        console.error("Ошибка при загрузке блюд:", error);
    }
}

// Запускаем загрузку после готовности DOM
document.addEventListener("DOMContentLoaded", () => {
    loadDishes();
});
