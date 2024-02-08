const express = require('express');
const passport = require('passport');
const indexRouter = express.Router();
const prisma_functions = require("../controllers/prismaController")
const pantry_prisma_functions = prisma_functions.pantry
const recipe_prisma_functions = prisma_functions.recipe
const user_prisma_functions = prisma_functions.user
const { ensureAuthenticated, ensureNotAuthenticated, ensureAdmin } = require('../middleware/authMiddleware');

indexRouter.get('/', async (req, res) => {
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

module.exports = indexRouter;