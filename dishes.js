// dishes.js
const dishes = [
    // Супы (6 блюд)
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
        keyword: "salmon_chowder",
        name: "Сливочный суп с лососем",
        price: 380,
        category: "soup",
        count: "350 мл",
        image: "https://img.povar.ru/main/5c/18/18/ae/slivochii_sup_s_lososem_i_shpinatom-776919.JPG",
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
        keyword: "tomato_soup",
        name: "Томатный суп с базиликом",
        price: 270,
        category: "soup",
        count: "350 мл",
        image: "https://img.povar.ru/main/8a/8f/8f/3d/tomatnii_sup_s_bazilikom-776917.JPG",
        kind: "veg"
    },

    // Главные блюда (6 блюд)
    {
        keyword: "fried_potatoes_mushrooms",
        name: "Жаренный картофель с грибами",
        price: 250,
        category: "main_dish",
        count: "300 г",
        image: "https://i.pinimg.com/originals/6a/bb/ef/6abbef040bda27db9d15a423f64eadc5.jpg",
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
        keyword: "fish_cutlets",
        name: "Рыбные котлеты с пюре",
        price: 320,
        category: "main_dish",
        count: "350 г",
        image: "https://img.povar.ru/main/9c/18/18/ae/ribnie_kotleti_s_pureshkoi-776915.JPG",
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

    // Напитки (6 блюд)
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
        keyword: "apple_juice",
        name: "Яблочный сок",
        price: 110,
        category: "drink",
        count: "300 мл",
        image: "https://yandex-images.clstorage.net/MH541oq21/79eb48CK/zKj0qECEsal2_4Vx3QUr8NVBtIMIRfx-v10m9_YlvkDiDMqQ3SPNrK1rsd7umI9OHddOxV76NXB1B9mo-zelfojskPjBBVQ89k_FMIjBOgAEBqbhCref3cifVNQgNF4FR_1IY7kWKCvqnYeZ-M8dTo9WTLYp_dO0MmC-7X1S0YkP-bQNtWAha1TMVkCNkznhNeQ3kjjEzp37H2S3oXaOIvVeatKN5hoJaI-lyui_T81exE7WOI2z1KLxbx_9EqDYnSuHz2dA8puX35ZBXGH5YMVXlLIrhi2-K43X5MA3nSDHjPui_gXaeYscBsu7XD0O7JYsRJjMk0SiI1_M_nGQOc7Jxa7FEoC4J-xnEk2SSlDVdEUCeaWdH8rdtFWRdQ4zFu8osc6VGqkK37d6yr4vXqwkjWS5fbK0UeCPrf2QEFi-6vbNtqEDiwYfRaBsUpujNSTHYovFzJ55DwUm0sVMgAfNidKfBAqbuq1Uq7i_Lcxvhd71qZ0Cl9Ijfu_c0BK7fukmvsRC85h0v8WyLuHr4hY194PJB_09yj2khcBlvmDX7pkgf-Qbihk9R1qZv_0v7TQ_10i-QFZwAjz_zKIzCo6ZNr6GIHPLtN1mAb5jmXPWl3WxWOQef3t_lvfRxe0z918roOwl-lo6jge5-u_s_L6GXMRbbGJEAiCez6wgg2ktyqTvVXFRiPT-Z4O8IRoB9gT1o1h33p-YLLcloeevYSQtmxBsZ5l4Ou6G2xqMrz1vxkzWuu4BRBOy3v0dcmEqLos1XrcykBiWb5fDnnNpAxQ1tXBa527vay725KP3nrOXz3lzPZf76bu-NiuKHNx97sR-djkNQZUBE50fb4HjOL5Kt1xGw8NbBhxnE8-Q2XLk5GYwKeS831ncVlbiNE8R19xZYn8laCgIT4Vp-P5Pzr1Vz9U5T6HXsNDfvO9Q40udWXbtB1ABCne8tdO9UktDh2RkAhiXz746jkZEo6W8w",
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
        keyword: "black_tea",
        name: "Черный чай с лимоном",
        price: 120,
        category: "drink",
        count: "400 мл",
        image: "https://img.povar.ru/main/5c/18/18/ae/chernii_chai_s_limonom-776912.JPG",
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