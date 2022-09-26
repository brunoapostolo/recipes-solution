//importar o express
const express = require("express");
// instanciar as rotas pegando do express
const router = express.Router();

//importar os models
const UserModel = require("../models/User.model");
const RecipeModel = require("../models/Recipe.model");

//criar as rotas aqui

//1º rota: Criar um user
router.post("/create", async (req, res) => {
  const newUser = await UserModel.create({ ...req.body });

  return res.status(201).json(newUser);
});

//2º rota: Pegar todos os users
router.get("/all", async (req, res) => {
  const allUsers = await UserModel.find();

  return res.status(200).json(allUsers);
});

//3º rota: Acessar um usuário pelo seu ID
router.get("/user/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const user = await UserModel.findById(id);

    return res.status(200).json(user);
  } catch (error) {
    return res.status(400).json(error);
  }
});

//4º Adicionar uma receita na array de favorites
router.put("/addFavorite/:idUser/:idRecipe", async (req, res) => {
  const { idUser, idRecipe } = req.params;

  //conferir se a receita já não foi adicionada
  const user = await UserModel.findById(idUser);
  if (user.favorites.includes(idRecipe)) {
    return res.status(400).json("receita já adicionada");
  }

  const userUpdate = await UserModel.findByIdAndUpdate(
    idUser,
    {
      $push: {
        favorites: idRecipe,
      },
    },
    { new: true }
  ).populate("favorites");

  await RecipeModel.findByIdAndUpdate(idRecipe, {$inc : {likes : 1 } });

  return res.status(200).json(userUpdate);
});

//5º Adicionar uma receita na array de deslikes
router.put("/addDislike/:idUser/:idRecipe", async (req, res) => {
  const { idUser, idRecipe } = req.params;

  const userUpdate = await UserModel.findByIdAndUpdate(
    idUser,
    {
      $push: {
        dislikes: idRecipe,
      },
    },
    { new: true }
  ).populate("dislikes");

  await RecipeModel.findByIdAndUpdate(idRecipe, { $inc: { dislikes: 1 } });

  return res.status(200).json(userUpdate);
});

//6º Remover uma receita na array de favorite
router.put("/removeFavorite/:idUser/:idRecipe", async (req, res) => {
  const { idUser, idRecipe } = req.params;

  const userUpdate = await UserModel.findByIdAndUpdate(
    idUser,
    {
      $pull: {
        favorites: idRecipe,
      },
    },
    { new: true }
  ).populate("favorites");

  await RecipeModel.findByIdAndUpdate(idRecipe, { $inc: { likes: -1 } });

  return res.status(200).json(userUpdate);
});

//7º Remover uma receita na array de deslikes
router.put("/removeDislike/:idUser/:idRecipe", async (req, res) => {
  const { idUser, idRecipe } = req.params;

  const userUpdate = await UserModel.findByIdAndUpdate(
    idUser,
    {
      $pull: {
        dislikes: idRecipe,
      },
    },
    { new: true }
  ).populate("dislikes");

  await RecipeModel.findByIdAndUpdate(idRecipe, { $inc: { dislikes: -1 } });

  return res.status(200).json(userUpdate);
});

module.exports = router;
