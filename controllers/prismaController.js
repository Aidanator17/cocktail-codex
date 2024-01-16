const PrismaClient = require('@prisma/client').PrismaClient
const prisma = new PrismaClient()

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
        const data = await prisma.recipe.findMany()
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

module.exports = pantry_prisma_functions