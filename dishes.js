// dishes.js
let dishes = []; // Теперь dishes - пустой массив, который будет заполняться из API

// Функция для загрузки блюд из API
async function loadDishes() {
    try {
        // URL API в зависимости от хостинга
        const apiUrl = window.location.hostname.includes('github.io') || window.location.hostname.includes('netlify.app') 
            ? 'https://edu.std-900.ist.mospolytech.ru/labs/api/dishes'
            : 'http://lab7-api.std-900.ist.mospolytech.ru/api/dishes';

        console.log('Загрузка блюд из API:', apiUrl);
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Получены данные с API:', data);
        
        // Преобразуем данные если нужно (например, добавляем полные URL для изображений)
        dishes = data.map(dish => {
            // Если URL изображения относительный, добавляем базовый URL
            if (dish.image && !dish.image.startsWith('http')) {
                dish.image = `http://lab7-api.std-900.ist.mospolytech.ru${dish.image}`;
            }
            return dish;
        });
        
        console.log('Обработанные блюда:', dishes);
        return dishes;
        
    } catch (error) {
        console.error('Ошибка при загрузке блюд:', error);
        
        // Fallback: используем локальные данные если API недоступно
        dishes = getFallbackDishes();
        console.log('Используются локальные данные:', dishes);
        return dishes;
    }
}

// Функция с резервными данными на случай недоступности API
function getFallbackDishes() {
    return [
        {
            keyword: "borscht",
            name: "Мясной борщ",
            price: 300,
            category: "soup",
            count: "350 мл",
            image: "https://avatars.dzeninfra.ru/get-zen_doc/4080538/pub_63b6dc541c8b7a2c47dc897b_63b6ee31e774c36888fade7a/scale_1200",
            kind: "meat"
        },
        {
            keyword: "solyanka",
            name: "Солянка",
            price: 330,
            category: "soup",
            count: "350 мл",
            image: "https://img.povar.ru/main-micro/ae/ed/50/46/solyanka_po-belorusski-692499.JPG",
            kind: "meat"
        },
        {
            keyword: "fish_soup",
            name: "Уха царская",
            price: 350,
            category: "soup",
            count: "350 мл",
            image: "https://img.povar.ru/main/e4/3a/3b/0c/uba_carskaya-678089.JPG",
            kind: "fish"
        },
        {
            keyword: "mushroom_soup",
            name: "Грибной крем-суп",
            price: 280,
            category: "soup",
            count: "350 мл",
            image: "https://img.povar.ru/main/5b/0a/6c/ae/gribnoi_krem-sup-776918.JPG",
            kind: "veg"
        },
        {
            keyword: "macaroni_flot",
            name: "Макароны по-флотски",
            price: 300,
            category: "main_dish",
            count: "300 г",
            image: "https://i.pinimg.com/originals/e7/a9/a7/e7a9a756e59fd61240f9e5d1a02f70ca.jpg",
            kind: "meat"
        },
        {
            keyword: "rice_teriyaki",
            name: "Рис с курицей терияки",
            price: 280,
            category: "main_dish",
            count: "300 г",
            image: "https://avatars.mds.yandex.net/i?id=7f21be0ab8e7d18061d93159b46bd26d_l-4732791-images-thumbs&n=13",
            kind: "meat"
        },
        {
            keyword: "grilled_salmon",
            name: "Гриль-лосось с овощами",
            price: 420,
            category: "main_dish",
            count: "350 г",
            image: "https://img.povar.ru/main/3d/3a/3a/0c/grill-losos_s_ovoshami-776916.JPG",
            kind: "fish"
        },
        {
            keyword: "vegetable_stew",
            name: "Овощное рагу",
            price: 240,
            category: "main_dish",
            count: "300 г",
            image: "https://img.povar.ru/main/2b/0a/6c/ae/ovosnoe_ragu-776914.JPG",
            kind: "veg"
        },
        {
            keyword: "berry_morse",
            name: "Ягодный морс",
            price: 150,
            category: "drink",
            count: "300 мл",
            image: "https://menu2go.ru/images/food/56/56_20210330155239_3942.jpg",
            kind: "cold"
        },
        {
            keyword: "orange_juice",
            name: "Апельсиновый сок",
            price: 130,
            category: "drink",
            count: "300 мл",
            image: "https://i.pinimg.com/originals/68/9a/ee/689aee3fa882288f2fb4ced2ef7c33b5.jpg",
            kind: "cold"
        },
        {
            keyword: "green_tea",
            name: "Зеленый чай",
            price: 120,
            category: "drink",
            count: "400 мл",
            image: "https://img.povar.ru/main/7d/3a/3a/0c/zelenii_chai-776913.JPG",
            kind: "hot"
        },
        {
            keyword: "coffee_latte",
            name: "Кофе латте",
            price: 180,
            category: "drink",
            count: "350 мл",
            image: "https://img.povar.ru/main/9b/0a/6c/ae/kofe_latte-776911.JPG",
            kind: "hot"
        }
    ];
}

// Функция для получения блюд (для обратной совместимости)
function getDishes() {
    return dishes;
}