const express = require('express');
const addRouter = express.Router();
const prisma_functions = require("../controllers/prismaController")
const pantry_prisma_functions = prisma_functions.pantry
const recipe_prisma_functions = prisma_functions.recipe
const user_prisma_functions = prisma_functions.user
const { ensureAuthenticated, ensureNotAuthenticated, ensureAdmin } = require('../middleware/authMiddleware');


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

async function compare( a, b ) {
    if ( a.name < b.name ){
      return -1;
    }
    if ( a.name > b.name ){
      return 1;
    }
    return 0;
  }

addRouter.get('/recipe', ensureAdmin, async (req, res) => {
    pantry = await pantry_prisma_functions.get_pantry_names()
    pantry.sort()
    res.render('recipeSubmit', { user: req.user, pantry });
});
addRouter.post('/recipe', async (req, res) => {
    let ingredients = await get_ingr(req.body)
    await recipe_prisma_functions.add_recipe(req.body.recipe_name, req.body.directions)
    console.log("CREATED RECIPE: " + req.body.recipe_name)
    const new_recipe = await recipe_prisma_functions.get_recipe_by_name(req.body.recipe_name)
    console.log("RETREIVED RECIPE: " + new_recipe.name + " (ID: " + new_recipe.recipe_id + ")")
    for (ing in ingredients) {
        await recipe_prisma_functions.add_recipe_items(new_recipe.recipe_id, ingredients[ing].id, parseFloat(ingredients[ing].quan), ingredients[ing].unit, ingredients[ing].garnish ? 1 : 0)
        console.log("SUBMITTED RECIPE ITEM: " + ingredients[ing].name + " (" + ingredients[ing].quan + ingredients[ing].unit + ")")
    }

    res.redirect('/add/recipe');
})
addRouter.get('/item', ensureAdmin, async (req,res)=>{
    res.render("pantrySubmit",{user:req.user})
})
addRouter.post('/item', async (req,res)=>{
    await pantry_prisma_functions.add_pantry_item(req.body.name,req.body.img_url)
    console.log("CREATED ITEM: "+req.body.name)
    const pantry = await pantry_prisma_functions.get_pantry()
    let item_confirmation
    for (item in pantry){
        if (pantry[item].name == req.body.name){
            item_confirmation = pantry[item].name 
        }
    }
    console.log("SUCCESSFULLY RECIEVED ITEM",item_confirmation)
    res.redirect("/add/item")
})
addRouter.get('/pantry', ensureAuthenticated, async (req,res)=>{
    let userp = await pantry_prisma_functions.get_userpantry(req.user.user_id)
    let userp_full = []
    const pantry = await pantry_prisma_functions.get_pantry()
    for (item in userp){
        for (pitem in pantry){
            if (pantry[pitem].pantry_item_id == userp[item].pantry_item_id){
                userp_full.push(pantry[pitem])
                pantry.splice(pitem, 1)
            }
            else if (pantry[pitem].hidden == 1) {
                pantry.splice(pitem, 1)
            }
        }
    }
    pantry.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))
    userp_full.sort((a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0))
    res.render('addPantry', { user: req.user, pantry, user_pantry:userp_full });
})
addRouter.post('/pantry', async (req,res)=>{
    await pantry_prisma_functions.add_userpantry(parseInt(req.body.pantryitem),req.user.user_id)
    res.redirect("/add/pantry")
})

module.exports = addRouter;