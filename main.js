// Shuffle an array randomly
function shuffle(array) {
    let currentIndex = array.length;
    while (currentIndex != 0) {
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
}

// Get full recipe details by name
async function get_recipe(rescipe_name) {
    const key = `https://www.themealdb.com/api/json/v1/1/search.php?s=${rescipe_name}`;
    try {
        const response = await fetch(key);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        if (!data) throw new Error('Network response was not ok');
        return data.meals[0]; // Return first matching recipe
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
}

// Get one random recipe
async function get_random_recipe() {
    const key = 'https://www.themealdb.com/api/json/v1/1/random.php';
    try {
        const response = await fetch(key);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        if (!data) throw new Error('Network response was not ok');
        return data.meals[0];
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
}

// Get all recipes in a given category
async function get_recipe_by_category(category) {
    const key = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`;
    try {
        const response = await fetch(key);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        if (!data) throw new Error('Network response was not ok');
        return data.meals;
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
}

// Get all recipes in a given area (cuisine)
async function get_recipe_by_area(area) {
    const key = `https://www.themealdb.com/api/json/v1/1/filter.php?a=${area}`;
    try {
        const response = await fetch(key);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        if (!data) throw new Error('Network response was not ok');
        return data.meals;
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
    }
}

// Fills cards depending on selected category/area filters
async function card_content_filter(cards, category, area) {
    let list;

    if (category != 'Category' && area == 'Area') {
        list = await get_recipe_by_category(category);
    } else if (category == 'Category' && area != 'Area') {
        list = await get_recipe_by_area(area);
    } else if (category != 'Category' && area != 'Area') {
        let list1 = await get_recipe_by_category(category);
        let list2 = await get_recipe_by_area(area);
        const list2Ids = list2.map(meal => meal.idMeal);
        list = list1.filter(meal => list2Ids.includes(meal.idMeal)); // intersection of both
    } else {
        // no filters selected, fallback to random
        card_content_random(cards);
        return;
    }

    // limit to 9 items
    if (list.length > 9) {
        shuffle(list);
        list = list.slice(0, 9);
    }

    let j = 0;
    (async () => {
        for (const card of cards) {
            try {
                let new_recipe = await get_recipe(list[j].strMeal);
                image = card.children[0];
                image.src = new_recipe.strMealThumb;
                const new_element = card.children[1].children[0];
                new_element.children[0].textContent = new_recipe.strMeal;
                new_element.children[2].textContent = (new_recipe.strCategory) ? new_recipe.strCategory : category;
                new_element.children[4].textContent = (new_recipe.strArea) ? new_recipe.strArea : area;
                j++;
            } catch (error) {
                console.error("error happened", error);
            }
        }
    })();
}

// Fill cards with random recipes (no filters)
async function card_content_random(cards) {
    let showed_recipe = [];

    (async () => {
        for (const card of cards) {
            try {
                let new_recipe;
                let id;
                do {
                    new_recipe = await get_random_recipe();
                    id = new_recipe.idMeal;
                } while (showed_recipe.includes(id));

                showed_recipe.push(id);
                image = card.children[0];
                image.src = new_recipe.strMealThumb;
                const new_element = card.children[1].children[0];
                new_element.children[0].textContent = new_recipe.strMeal;
                new_element.children[2].textContent = new_recipe.strCategory;
                new_element.children[4].textContent = new_recipe.strArea;
            } catch (error) {
                console.error("error happened", error);
            }
        }
    })();
}

// Shows full recipe details in a special card
function display_full_details(card, recipe) {
    card.style.display = 'flex';
    const img = document.querySelector("#recipe_img");
    const nameElement = document.querySelector("#name");
    const categoryElement = document.querySelector("#Category");
    const areaElement = document.querySelector("#Area1");
    const ingredientsList = document.querySelector("#ingredients");
    const steps = document.querySelector("#steps");
    const videoLink = document.querySelector("#source1");
    const author_source = document.querySelector("#source2");

    img.src = recipe.strMealThumb;
    nameElement.textContent = recipe.strMeal;
    categoryElement.textContent = recipe.strCategory;
    areaElement.textContent = recipe.strArea;

    // collect and display ingredients
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
        const ingredient = recipe[`strIngredient${i}`];
        const measure = recipe[`strMeasure${i}`];
        if (ingredient && ingredient.trim()) {
            ingredients.push(`${measure ? measure.trim() : ''} ${ingredient.trim()}`.trim());
        }
    }

    // clear previous ingredients
    if (ingredientsList.children.length > 0) {
        let previous_list = ingredientsList.children;
        Array.from(previous_list).forEach(element => {
            element.remove();
        });
    }

    // add current ingredients
    for (let ingredient of ingredients) {
        const li = document.createElement("li");
        li.textContent = ingredient;
        ingredientsList.appendChild(li);
    }

    // fill in instructions and links
    steps.textContent = recipe.strInstructions;
    videoLink.href = recipe.strYoutube; // fixed typo: strYoutub → strYoutube
    author_source.href = recipe.strSource;
}

// Fills one card with a recipe
function fill_card(card, recipe) {
    card.style.display = "block";
    image = card.children[0];
    image.src = recipe.strMealThumb;
    const new_element = card.children[1].children[0];
    new_element.children[0].textContent = recipe.strMeal;
    new_element.children[2].textContent = recipe.strCategory;
    new_element.children[4].textContent = recipe.strArea;
}

// Main DOM manipulation and event listeners
const cards_other_use = document.querySelectorAll(".card");
card_content_random(cards_other_use);

const reset = document.querySelector("#reset");
const category = document.querySelector('#category');
const area = document.querySelector("#area");

const more_details_links = document.querySelectorAll(".text-info");
const full_details_card = document.querySelector("#full-details");

// Reset filter button
reset.addEventListener("click", (event) => {
    event.preventDefault();
    card_content_random(cards_other_use);
    category.value = 'Category';
    area.value = 'Area';
});

// Category change filter
category.addEventListener("change", (event) => {
    event.preventDefault();
    card_content_filter(cards_other_use, category.value, area.value);
});

// Area change filter
area.addEventListener("change", (event) => {
    event.preventDefault();
    card_content_filter(cards_other_use, category.value, area.value);
});

// Open full recipe view
more_details_links.forEach(more_details_link => {
    more_details_link.addEventListener('click', async (event) => {
        event.preventDefault();
        const recipeName = more_details_link.parentNode.children[0].textContent;
        try {
            const recipe = await get_recipe(recipeName);
            display_full_details(full_details_card, recipe);
        } catch (error) {
            console.error('Error fetching recipe:', error);
        }
    });
});

// Back button on full details card
const back = document.querySelector("#back");
back.addEventListener("click", (event) => {
    event.preventDefault();
    full_details_card.style.display = 'none';
});

// Search by name functionality
const search_part = document.querySelector("#part3");
const input_search = document.querySelector("#input-bar");
const search = document.querySelector("#search");
const found = search_part.children[0];
const not_found = search_part.children[1];

search.addEventListener("click", async (event) => {
    event.preventDefault();
    found.style.display = "none";
    not_found.style.display = "none";
    const recipe = await get_recipe(input_search.value);
    if (recipe) {
        fill_card(found, recipe);
    } else {
        not_found.style.display = "block";
    }
});
