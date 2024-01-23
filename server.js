const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser')
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const prisma_functions = require("./controllers/prismaController")
const pantry_prisma_functions = prisma_functions.pantry
const recipe_prisma_functions = prisma_functions.recipe
const user_prisma_functions = prisma_functions.user

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

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'))

// Passport local strategy
passport.use(new LocalStrategy(
    (username, password, done) => {
        // Replace this with your authentication logic
        if (username === 'user' && password === 'password') {
            return done(null, { id: 1, username: 'user' });
        } else {
            return done(null, false, { message: 'Invalid credentials' });
        }
    }
));

// Passport serialize and deserialize user
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    // Replace this with your logic to fetch user from database
    done(null, { id: 1, username: 'user' });
});

async function get_ingr(reqbody){
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
    // console.log(req.body)
    while (ingr_num <= length / 4) {
        let ingr_id
        loopcount++
        for (item in all_ing){
            if (reqbody["item_name_" + ingr_num] == all_ing[item].name){
                ingr_id = all_ing[item].pantry_item_id
                break
            }
        }
        if (reqbody["garnish_" + ingr_num] == "yes") {
            ingr_list.push({
                id:ingr_id,
                name: reqbody["item_name_" + ingr_num],
                quan: reqbody["quan_num_" + ingr_num],
                unit: reqbody["unit_name_" + ingr_num],
                garnish: true
            })
        }
        else {
            ingr_list.push({
                id:ingr_id,
                name: reqbody["item_name_" + ingr_num],
                quan: reqbody["quan_num_" + ingr_num],
                unit: reqbody["unit_name_" + ingr_num],
                garnish: false
            })
        }
        ingr_num++
    }
    // console.log(loopcount)
    return ingr_list
}



app.get('/', async (req, res) => {
    console.log(await recipe_prisma_functions.get_recipe_by_id(4))

    let recipes = await recipe_prisma_functions.get_recipes()
    res.render('index', { user: req.user, recipes });
});
app.get('/add', async (req, res) => {
    pantry = await pantry_prisma_functions.get_pantry_names()
    pantry.sort()
    res.render('recipeSubmit', { user: req.user, pantry });
});
app.post('/add', async (req, res) => {
    let ingredients = await get_ingr(req.body)
    console.log(ingredients)

    res.redirect('/add');
})










// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
