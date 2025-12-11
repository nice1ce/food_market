// combos.js
// Объявляем переменную combos глобально
window.combos = [
    {
        id: "combo1",
        name: "Классический",
        description: "Традиционный русский обед",
        discount: 20,
        totalPrice: 0,
        discountedPrice: 0,
        dishes: [
            { keyword: "borscht" },
            { keyword: "caesar_salad" },
            { keyword: "macaroni_flot" },
            { keyword: "berry_morse" },
            { keyword: "tiramisu" }
        ]
    },
    {
        id: "combo2",
        name: "Рыбный день",
        description: "Для любителей морепродуктов",
        discount: 25,
        totalPrice: 0,
        discountedPrice: 0,
        dishes: [
            { keyword: "fish_soup" },
            { keyword: "shrimp_cocktail" },
            { keyword: "grilled_salmon" },
            { keyword: "green_tea" },
            { keyword: "fruit_salad" }
        ]
    },
    {
        id: "combo3",
        name: "Вегетарианский",
        description: "Без мяса и рыбы",
        discount: 30,
        totalPrice: 0,
        discountedPrice: 0,
        dishes: [
            { keyword: "mushroom_soup" },
            { keyword: "greek_salad" },
            { keyword: "vegetable_stew" },
            { keyword: "apple_juice" },
            { keyword: "ice_cream" }
        ]
    },
    {
        id: "combo4",
        name: "Сытный обед",
        description: "Для самого голодного",
        discount: 15,
        totalPrice: 0,
        discountedPrice: 0,
        dishes: [
            { keyword: "solyanka" },
            { keyword: "caesar_salad" },
            { keyword: "rice_teriyaki" },
            { keyword: "black_tea" },
            { keyword: "chocolate_cake" }
        ]
    },
    {
        id: "combo5",
        name: "Лёгкий перекус",
        description: "Небольшой, но питательный",
        discount: 20,
        totalPrice: 0,
        discountedPrice: 0,
        dishes: [
            { keyword: "tomato_soup" },
            { keyword: "caprese_salad" },
            { keyword: "fried_potatoes_mushrooms" },
            { keyword: "orange_juice" },
            { keyword: "macarons" }
        ]
    },
    {
        id: "combo6",
        name: "Премиум",
        description: "Для особых случаев",
        discount: 15,
        totalPrice: 0,
        discountedPrice: 0,
        dishes: [
            { keyword: "salmon_chowder" },
            { keyword: "shrimp_cocktail" },
            { keyword: "grilled_salmon" },
            { keyword: "coffee_latte" },
            { keyword: "cheesecake" }
        ]
    }
];

// Функция для расчета стоимости комбо
function calculateComboPrices() {
    if (typeof dishes === 'undefined') {
        console.error('dishes is not defined in calculateComboPrices');
        return;
    }
    
    window.combos.forEach(combo => {
        let total = 0;
        combo.dishes.forEach(dishCombo => {
            const dish = dishes.find(d => d.keyword === dishCombo.keyword);
            if (dish) {
                total += dish.price;
            }
        });
        combo.totalPrice = total;
        combo.discountedPrice = Math.round(total * (1 - combo.discount / 100));
    });
}

// Вызываем при загрузке
document.addEventListener('dishesLoaded', function() {
    calculateComboPrices();
});