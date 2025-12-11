// dishes.js
let dishes = [];

async function loadDishes() {
    try {
        console.log('Loading dishes from API...');
        const response = await fetch('https://raw.githubusercontent.com/nice1ce/food_market/main/dishes.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        dishes = data;
        window.dishes = dishes;
        
        console.log(`Successfully loaded ${dishes.length} dishes`);
        return dishes;
        
    } catch (error) {
        console.error('Error loading dishes:', error);
        
        // Используем статические данные как запасной вариант
        const fallbackDishes = [
            {
                keyword: "borscht",
                name: "Мясной борщ",
                price: 300,
                category: "soup",
                count: "350 мл",
                image: "https://everydfood.com/wp-content/uploads/2024/01/Authentic-borscht-soup-recipe.jpg",
                kind: "meat"
            },
            {
                keyword: "solyanka",
                name: "Солянка",
                price: 330,
                category: "soup",
                count: "350 мл",
                image: "https://images2.novochag.ru/upload/img_cache/d33/d33d9d61f4d59fddc7721b587a7bcff0_ce_2370x1248x0x166_cropped_1200x628.jpg",
                kind: "meat"
            },
            {
                keyword: "fish_soup",
                name: "Уха царская",
                price: 350,
                category: "soup",
                count: "350 мл",
                image: "https://avatars.mds.yandex.net/i?id=0efb33722f59bbbb0602fd35060c1691_l-5235063-images-thumbs&n=13",
                kind: "fish"
            }
        ];
        
        dishes = fallbackDishes;
        window.dishes = dishes;
        console.log('Using fallback dishes:', dishes.length);
        return dishes;
    }
}

// Делаем функцию доступной глобально
if (typeof window !== 'undefined') {
    window.loadDishes = loadDishes;
}

// Для использования в Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { loadDishes, dishes };
}