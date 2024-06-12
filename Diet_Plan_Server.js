const express = require('express');
const connection = require('./Diet_plan_db_connection'); 
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;


app.use(express.static(path.join(__dirname)));

app.use(express.json());


app.get('/foods', (req, res) => {
    connection.query('SELECT * FROM food_nutrients', (err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            res.status(500).send('Error fetching data');
            return;
        }
        res.json(results);
    });
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Sign_in.html'));
});

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/customDietPlan', (req, res) => {
    res.sendFile(path.join(__dirname, 'Diet_Plan.html'));
});

app.post('/calculate', (req, res) => {
    const { age, height, weight, gender, goal, activity } = req.body;

    let bmr;
    if (gender === 'male') {
        bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
        bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }

    let activityMultiplier;
    switch (activity) {
        case 'sedentary':
            activityMultiplier = 1.2;
            break;
        case 'lightlyActive':
            activityMultiplier = 1.375;
            break;
        case 'moderatelyActive':
            activityMultiplier = 1.55;
            break;
        case 'veryActive':
            activityMultiplier = 1.725;
            break;
        case 'extraActive':
            activityMultiplier = 1.9;
            break;
    }

    let calorieIntake = Math.round(bmr * activityMultiplier);

    switch (goal) {
        case 'lose':
            calorieIntake -= 500;
            break;
        case 'gain':
            calorieIntake += 500;
            break;
    }

    res.json({ calorieIntake });

});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});