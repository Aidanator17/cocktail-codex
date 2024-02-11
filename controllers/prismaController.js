const PrismaClient = require('@prisma/client').PrismaClient
const prisma = new PrismaClient()
var nl2br = require('nl2br')
const bcrypt = require('bcrypt');
const saltRounds = 10;

const user_prisma_functions = {
    get_user_by_id: async function (id) {
        const user = await prisma.user.findUnique({
            where: {
                user_id: id
            }
        })
        return user
    },
    get_user_by_email: async function (e) {
        const user = await prisma.user.findUnique({
            where: {
                email: e
            }
        })
        return user
    },
    validPassword: async function (u, pw) {
        bcrypt.compare(pw, u.password_hash, function (err, result) {
            if (err) {
                console.log(err)
            }
            // console.log(result)
            return result
        });
    },
    add_user: async function (fn, ln, e, pw) {
        bcrypt.hash(pw, saltRounds, async function (err, hash) {
            const user = await prisma.user.create({
                data: {
                    email: e,
                    password_hash: hash,
                    first_name: fn,
                    last_name: ln
                }
            })
        });
    }
}
const pantry_prisma_functions = {
    get_pantry: async function () {
        const data = await prisma.pantry_item.findMany()
        return data
    },
    get_pantry_names: async function () {
        const data = await prisma.pantry_item.findMany()
        names = []
        for (item in data) {
            names.push(data[item].name)
        }
        return names
    },
    add_userpantry: async function (pid, uid) {
        const data = await prisma.userpantry.create({
            data: {
                user_id: uid,
                pantry_item_id: pid
            }
        })
    },
    remove_userpantry: async function (upid) {
        const data = await prisma.userpantry.delete({
            where: {
                userpantry_id: upid
            }
        })
    },
    get_userpantry: async function (uid) {
        const data = await prisma.userpantry.findMany({
            where: {
                user_id: uid
            }
        })
        return data
    },
    get_userpantry_ids: async function (uid) {
        const data = await prisma.userpantry.findMany({
            where: {
                user_id: uid
            }
        })
        items = []
        for (item in data) {
            items.push(data[item].pantry_item_id)
        }
        return items
    },
    add_pantry_item: async function (n) {
        const data = await prisma.pantry_item.create({
            data: {
                name: n
            }
        })
    },
}
const recipe_prisma_functions = {
    get_recipes: async function () {
        const recipes = await prisma.recipe.findMany()
        let recipeitems = await recipe_prisma_functions.get_recipe_items()
        for (r in recipes) {
            recipes[r].ingredients = []
            recipes[r].ingredientnames = []
            recipes[r].ingredientIDs = []
            recipes[r].directions = nl2br(recipes[r].directions)
            for (ri in recipeitems) {
                if (recipes[r].recipe_id == recipeitems[ri].recipe_id) {
                    if (recipeitems[ri].isgarnish) {
                        recipes[r].ingredients.push(recipeitems[ri].item_name + " for garnish")
                        recipes[r].ingredientnames.push(recipeitems[ri].item_name)
                    }
                    else {
                        recipes[r].ingredients.push(String(recipeitems[ri].quantity) + " " + recipeitems[ri].unit + " " + recipeitems[ri].item_name)
                        recipes[r].ingredientnames.push(recipeitems[ri].item_name)
                        if (recipeitems[ri].hidden == 0) {
                            recipes[r].ingredientIDs.push(recipeitems[ri].pantry_item_id)
                        }
                    }
                }
            }
        }
        return recipes
    },
    get_recipe_by_id: async function (id) {
        const recipe = await prisma.recipe.findUnique({
            where: {
                recipe_id: id
            }
        })
        let recipeitems = await recipe_prisma_functions.get_recipe_items()
        recipe.ingredients = []
        recipe.directions = nl2br(recipe.directions)
        for (ri in recipeitems) {
            if (recipe.recipe_id == recipeitems[ri].recipe_id) {
                if (recipeitems[ri].isgarnish) {
                    recipe.ingredients.push(recipeitems[ri].item_name + " for garnish")
                }
                else {
                    recipe.ingredients.push(String(recipeitems[ri].quantity) + " " + recipeitems[ri].unit + " " + recipeitems[ri].item_name)
                }
            }
        }
        return recipe
    },
    get_recipe_by_name: async function (n) {
        const recipe = await prisma.recipe.findUnique({
            where: {
                name: n
            }
        })

        return recipe
    },
    get_recipe_items: async function () {
        const data = await prisma.node_recipeitem.findMany()
        return data
    },
    add_recipe: async function (n, dir) {
        const data = await prisma.recipe.create({
            data: {
                name: n,
                directions: dir
            }
        })
    },
    add_recipe_items: async function (rid, piid, q, u, ig) {
        const data = await prisma.recipeitem.create({
            data: {
                recipe_id: rid,
                pantry_item_id: piid,
                quantity: q,
                unit: u,
                isgarnish: ig
            }
        })
    }
}

module.exports = {
    pantry: pantry_prisma_functions,
    recipe: recipe_prisma_functions,
    user: user_prisma_functions
}