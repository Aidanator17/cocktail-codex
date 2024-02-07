const express = require('express');
const flash = require('express-flash')
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser')
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const prisma_functions = require("./controllers/prismaController")
const pantry_prisma_functions = prisma_functions.pantry
const recipe_prisma_functions = prisma_functions.recipe
const user_prisma_functions = prisma_functions.user

const authRoutes = require('./routes/authRoute');
const indexRoutes = require('./routes/indexRoute');
const addRoutes = require('./routes/addRoute');

const app = express();
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
const PORT = process.env.PORT || 3000;

// EJS setup
// app.use(expressLayouts);
app.set('view engine', 'ejs');

// Express session middleware
app.use(session({
    secret: 'your-secret-key',
    resave: true,
    saveUninitialized: true
}));
app.use(flash());

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'))


passport.use('local', new LocalStrategy({
    usernameField: 'email', // assuming email is used for login
    passwordField: 'password' // assuming password is used for login
},
    async (email, password, done) => {
        const user = await user_prisma_functions.get_user_by_email(email)
        if (!user) {
            return done(null, false, { message: 'Incorrect email.' });
        }
        if (!user_prisma_functions.validPassword(user, password)) { // Assuming you have a method in your User model to check passwords
            return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, user);
    }));

passport.serializeUser((user, done) => {
    done(null, user.user_id);
});

passport.deserializeUser(async(id, done) => {
    const user = await user_prisma_functions.get_user_by_id(id)
    done(null, user);
});

async function get_ingr(reqbody) {
    let all_ing = await pantry_prisma_functions.get_pantry()
    let loopcount = 0
    ingr_list = []
    ingr_num = 1
    let length = 0
    let garn_length = 0
    for (thing in reqbody) {
        loopcount++
        if (reqbody[thing] != "yes") {
            garn_length++
        }
    }
    let garnish_num = 1
    while (garnish_num <= garn_length / 3) {
        loopcount++
        if (reqbody["garnish_" + garnish_num]) {
            null
        }
        else {
            reqbody["garnish_" + garnish_num] = "no"
        }
        garnish_num++
    }

    for (thing in reqbody) {
        loopcount++
        length++
    }
    length = length - 2
    // console.log(req.body)
    while (ingr_num <= length / 4) {
        let ingr_id
        loopcount++
        for (item in all_ing) {
            loopcount++
            if (reqbody["item_name_" + ingr_num] == all_ing[item].name) {
                ingr_id = all_ing[item].pantry_item_id
                break
            }
        }
        if (reqbody["garnish_" + ingr_num] == "yes") {
            ingr_list.push({
                id: ingr_id,
                name: reqbody["item_name_" + ingr_num],
                quan: reqbody["quan_num_" + ingr_num],
                unit: reqbody["unit_name_" + ingr_num],
                garnish: true
            })
        }
        else {
            ingr_list.push({
                id: ingr_id,
                name: reqbody["item_name_" + ingr_num],
                quan: reqbody["quan_num_" + ingr_num],
                unit: reqbody["unit_name_" + ingr_num],
                garnish: false
            })
        }
        ingr_num++
    }
    console.log(loopcount)
    return ingr_list
}

app.use('/auth', authRoutes);


app.get('/', async (req, res) => {
    let recipes = await recipe_prisma_functions.get_recipes()
    let featured_ids = []
    let avail_ids = []
    let featured = []
    let i = 0
    for (r in recipes) {
        avail_ids.push(recipes[r].recipe_id)
    }
    while (i < 4) {
        let new_id = Math.floor(Math.random() * (recipes.length + 1))
        if (avail_ids.includes(new_id)) {
            if (!featured_ids.includes(new_id)) {
                featured_ids.push(new_id)
                i++
            }
        }
    }
    featured_ids = [3, 11, 13, 22]
    for (id in featured_ids) {
        featured.push(await recipe_prisma_functions.get_recipe_by_id(featured_ids[id]))
    }
    res.render('index', { user: req.user, featured });
});
app.get('/add', async (req, res) => {
    pantry = await pantry_prisma_functions.get_pantry_names()
    pantry.sort()
    res.render('recipeSubmit', { user: req.user, pantry });
});
app.post('/add', async (req, res) => {
    let ingredients = await get_ingr(req.body)
    await recipe_prisma_functions.add_recipe(req.body.recipe_name, req.body.directions)
    console.log("CREATED RECIPE: " + req.body.recipe_name)
    const new_recipe = await recipe_prisma_functions.get_recipe_by_name(req.body.recipe_name)
    console.log("RETREIVED RECIPE: " + new_recipe.name + " (ID: " + new_recipe.recipe_id + ")")
    for (ing in ingredients) {
        await recipe_prisma_functions.add_recipe_items(new_recipe.recipe_id, ingredients[ing].id, parseFloat(ingredients[ing].quan), ingredients[ing].unit, ingredients[ing].garnish ? 1 : 0)
        console.log("SUBMITTED RECIPE ITEM: " + ingredients[ing].name + " (" + ingredients[ing].quan + ingredients[ing].unit + ")")
    }

    res.redirect('/add');
})










// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
