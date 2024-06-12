
document.addEventListener("DOMContentLoaded", function (event) {

    const dietForm = document.getElementById('dietForm');
    const calorieResult = document.getElementById('calorieResult');
    const calories = document.getElementById('calories'); 
    const mealPlanResult = document.getElementById('mealPlanResult');
    const mealPlan = document.getElementById('mealPlan'); 
    const resetButton = document.getElementById('reset');
    const exportPDFButton = document.getElementById('exportPDF');
    const recalculateButton = document.getElementById('recalculate');


    dietForm.addEventListener('submit', function (event) {
        event.preventDefault(); 

        const formData = new FormData(this);

        fetch('/calculate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams(formData).toString()
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                const calorieIntake = data.calorieIntake;
                calories.textContent = "Your daily calorie intake: " + calorieIntake + " calories";

                generateAndDisplayMealPlan(calorieIntake);

                calorieResult.style.display = "block";
                mealPlanResult.style.display = "block";
                
            })
            .catch(error => console.error('Error:', error));
    });

    async function fetchFoods() {
        const response = await fetch('http://localhost:3000/foods');
        const foods = await response.json();
        return foods;
    }

    function getRandomItem(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function createMealPlan(foods, calorieIntake) {
        const meals = {
            Breakfast: { Egg: 1, Bread: 1, Dairy: 1 },
            'Morning Snack': { FruitOrNuts: 1 },
            Lunch: { Protein: 1, Salad: 1, Carbs: 1 },
            'Afternoon Snack': { FruitOrNuts: 1 },
            Dinner: { Protein: 1, Salad: 1, Carbs: 1 },
        };

        let plan = {};
        let remainingCalories = calorieIntake;

        const getCategoryFoods = (category) => foods.filter(food => category.includes(food.category));

        for (const [meal, categories] of Object.entries(meals)) {
            plan[meal] = [];
            for (const [category, count] of Object.entries(categories)) {
                for (let i = 0; i < count; i++) {
                    let food;
                    switch (category) {
                        case 'FruitOrNuts':
                            food = getRandomItem(getCategoryFoods(['Fruit', 'Nuts']));
                            break;
                        case 'Protein':
                            food = getRandomItem(getCategoryFoods(['Shellfish', 'Meat', 'Fish']));
                            break;
                        case 'Carbs':
                            food = getRandomItem(getCategoryFoods(['Rice', 'Pasta', 'Baked Potatoes']));
                            break;
                        default:
                            food = getRandomItem(getCategoryFoods([category]));
                    }

                    plan[meal].push(food);
                    remainingCalories -= food.calories;

                    if (remainingCalories < 0) break;
                }
                if (remainingCalories < 0) break;
            }
            if (remainingCalories < 0) break;
        }

        return plan;
    }

    async function generateAndDisplayMealPlan(calorieIntake) {
        const foods = await fetchFoods();
        const dailyPlan = createMealPlan(foods, calorieIntake);
        mealPlan.textContent = '';

        for (const [meal, foodArray] of Object.entries(dailyPlan)) {
            const listItem = document.createElement('li');
            listItem.innerHTML = `<strong>${meal}:</strong> ${foodArray.map(food => `${food.food_name} - ${food.calories} calories`).join(', ')}`;
            mealPlan.appendChild(listItem);
        }
    }

    // recalculate meal plan
    function recalculate(calorieIntake) {
        generateAndDisplayMealPlan(calorieIntake);
    }

    recalculateButton.addEventListener("click", function (event) {
        const calorieIntake = parseInt(calories.textContent.match(/\d+/)[0]);
        recalculate(calorieIntake);
    });

    // export meal plan as pdf
    function exportAsPDF() {
        mealPlan.querySelectorAll("li").forEach(item => {
            item.style.padding = "10px";
            item.style.borderBottom = "1px solid #ddd";
            item.style.backgroundColor = "#f9f9f9";
            item.style.fontFamily = "Arial, sans-serif";
            item.style.fontSize = "14px";
            item.style.color = "#333";
        });

        // Generate PDF
        html2pdf()
            .from(mealPlan)
            .set({
                margin: 20,
                filename: 'meal_plan.pdf',
                html2canvas: { scale: 2 },
                jsPDF: { format: 'a4', orientation: 'portrait' }
            })
            .save();
    }

    exportPDFButton.addEventListener("click", function (event) {
        exportAsPDF();
    });

    // reset form
    resetButton.addEventListener("click", function (event) {
        calorieResult.style.display = "none";
        mealPlanResult.style.display = "none";
    });
});