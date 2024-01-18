const PrismaClient = require('@prisma/client').PrismaClient
const prisma = new PrismaClient()
var nl2br  = require('nl2br')

const user_prisma_functions = {

}
const pantry_prisma_functions = {
    get_pantry: async function(){
        const data = await prisma.pantry_item.findMany()
        return data
    },
    add_userpantry: async function(pid,uid){
        const data = await prisma.userpantry.create({
            data: {
                user_id: uid,
                pantry_item_id: pid
            }
        })
    },
    remove_userpantry: async function(pid,uid){
        const data = await prisma.userpantry.delete({
            data: {
                user_id: uid,
                pantry_item_id: pid
            }
        })
    },
    add_pantry_item: async function(n){
        const data = await prisma.pantry_item.create({
            data: {
                name:n
            }
        })
    },
}
const recipe_prisma_functions = {
    get_recipes: async function(){
        const recipes = await prisma.recipe.findMany()
        let recipeitems = await recipe_prisma_functions.get_recipe_items()
        for (r in recipes){
            recipes[r].ingredients = []
            recipes[r].directions = nl2br(recipes[r].directions)
            for (ri in recipeitems){
                if (recipes[r].recipe_id == recipeitems[ri].recipe_id){
                    if (recipeitems[ri].isgarnish){
                        recipes[r].ingredients.push(recipeitems[ri].item_name+" for garnish")
                    }
                    else {
                        recipes[r].ingredients.push(String(recipeitems[ri].quantity)+" "+recipeitems[ri].unit+" "+recipeitems[ri].item_name)
                    }
                }
            }
        }
        return recipes
    },
    get_recipe_items: async function(){
        const data = await prisma.node_recipeitem.findMany()
        return data
    },
    add_recipe: async function(n,dir){
        const data = await prisma.recipe.create({
            data:{
                name:n,
                directions:dir
            }
        })
    }
}

module.exports = {
    pantry:pantry_prisma_functions,
    recipe:recipe_prisma_functions,
    user:user_prisma_functions
}