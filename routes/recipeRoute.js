const express = require('express');
const recipeRouter = express.Router();
const prisma_functions = require("../controllers/prismaController")
const pantry_prisma_functions = prisma_functions.pantry
const recipe_prisma_functions = prisma_functions.recipe
const user_prisma_functions = prisma_functions.user
const { ensureAuthenticated, ensureNotAuthenticated, ensureAdmin } = require('../middleware/authMiddleware');


recipeRouter.get('/id/:id', ensureAuthenticated, async (req, res) => {
    const recipe = await recipe_prisma_functions.get_recipe_by_id(parseInt(req.params['id']))
    res.redirect("/")
});

recipeRouter.get('/all', ensureAuthenticated, async (req,res) => {
    let urecipes = []
    let urecipes_id = []
    const recipes = await recipe_prisma_functions.get_recipes()
    const userpantryIDs = await pantry_prisma_functions.get_userpantry_ids(req.user.user_id)
    for (r in recipes){
        let validDrink = true
        for (ingredient in recipes[r].ingredientIDs){
            if (!userpantryIDs.includes(recipes[r].ingredientIDs[ingredient])){
                validDrink = false
            }
        }
        if (validDrink == true) {
            urecipes.push(recipes[r])
        }
    }

    recipes.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))
    urecipes.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))

    res.render("recipes", {user:req.user, recipes, urecipes})
})

module.exports = recipeRouter;