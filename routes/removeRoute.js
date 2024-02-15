const express = require('express');
const removeRouter = express.Router();
const prisma_functions = require("../controllers/prismaController")
const pantry_prisma_functions = prisma_functions.pantry
const recipe_prisma_functions = prisma_functions.recipe
const user_prisma_functions = prisma_functions.user
const { ensureAuthenticated, ensureNotAuthenticated, ensureAdmin } = require('../middleware/authMiddleware');

removeRouter.get('/pantry/all', ensureAuthenticated, async (req, res) => {
    userpantry = await pantry_prisma_functions.get_userpantry(req.user.user_id)
    for (item in userpantry){
            await pantry_prisma_functions.remove_userpantry(userpantry[item].userpantry_id)
    }
    res.redirect("/add/pantry")
});

removeRouter.get('/pantry/id/:id', ensureAuthenticated, async (req, res) => {
    userpantry = await pantry_prisma_functions.get_userpantry(req.user.user_id)
    for (item in userpantry){
        if (String(userpantry[item].pantry_item_id) == req.params['id']){
            await pantry_prisma_functions.remove_userpantry(userpantry[item].userpantry_id)
        }
    }
    res.redirect("/add/pantry")
});

module.exports = removeRouter;