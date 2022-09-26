//Escreva suas rotas para as receitas aqui//

//Importe o express e instancie o Router aqui
//importar o express
const express = require("express");
// instanciar as rotas pegando do express
const router = express.Router();

// Importe os models aqui
const RecipeModel = require("../models/Recipe.model");
const UserModel = require("../models/User.model");

//1º rota: Criar uma receita
router.post("/create", async (req, res) => {
  const newUser = await RecipeModel.create({ ...req.body });

  return res.status(201).json(newUser);
});

//2º rota: Acessar todas as receitas
router.get("/all", async (req, res) => {
  const allRecipes = await RecipeModel.find();

  return res.status(200).json(allRecipes);
});

//3º rota: Acessar uma única receita pelo seu ID

//4º rota: Criar várias receitas de uma só vez
router.post("/create-many", async (req, res) => {
  const recipes = await RecipeModel.insertMany([...req.body]);
  return res.status(200).json(recipes);
});

//5º rota: Deletar uma receita pelo seu ID - não esqueça de remover a ref do UserModel
router.delete("/delete/:idRecipe", async (req, res) => {
  const { idRecipe } = req.params;
  const deleteRecipe = await RecipeModel.findByIdAndDelete(idRecipe);

  //remover as referencias
  await UserModel.updateMany(
    {
      $or: [
        { favorites: { $in: [idRecipe] } },
        { dislikes: { $in: [idRecipe] } },
      ],
    },
    {
      $pull: {
        favorites: idRecipe,
        dislikes: idRecipe,
      },
    },
    {
      new: true,
    }
  );

  return res.status(200).json(deleteRecipe);
});

//6º rota: Acessar todos os usuários que favoritaram essa receita
router.get("/users-like/:idRecipe", async (req, res) => {
  const { idRecipe } = req.params;

  const users = await UserModel.find({ favorites: idRecipe });

  return res.status(200).json(users);
});

//7º rota: Acessar todos os usuários que deram dislike essa receita
router.get("/users-dislike/:idRecipe", async (req, res) => {
  const { idRecipe } = req.params;

  const users = await UserModel.find({ dislikes: idRecipe });

  return res.status(200).json(users);
});

//Não se esqueça de exportar o router!
module.exports = router;
