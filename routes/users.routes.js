//importar o express
const express = require("express");
// instanciar as rotas pegando do express
const router = express.Router();
const bcrypt = require("bcrypt");
const saltRounds = 10;
const generateToken = require("../config/jwt.config");
//importar os models
const UserModel = require("../models/User.model");
const RecipeModel = require("../models/Recipe.model");
const isAuth = require("../middlewares/isAuth");
const attachCurrentUser = require("../middlewares/attachCurrentUser");
const nodemailer = require("nodemailer");
let transporter = nodemailer.createTransport({
  service: "Outlook",
  auth: {
    secure: false,
    user: "bruno.apos13.85wdftironhack_bruno.apos13@outlook.com",
    pass: "kkklmpkkklmp@3713132",
  },
});
//criar as rotas aqui

//1º rota: Criar um user
router.post("/create", async (req, res) => {
  try {
    const { password, email } = req.body;
    const salt = await bcrypt.genSalt(saltRounds);
    const passwordHash = await bcrypt.hash(password, salt);
    const newUser = await UserModel.create({
      ...req.body,
      passwordHash: passwordHash,
    });
    delete newUser._doc.passwordHash;
    const mailOptions = {
      from: "bruno.apos13.85wdftironhack_bruno.apos13@outlook.com",
      to: email,
      subject: "Autenticando email",
      html: `<h1>Você enviou o conteudo no email fornecido</h1><a href=http://localhost:4000/users/activate-account/${newUser._id}>Link para ativação do usuario</a>`,
    };
    await transporter.sendMail(mailOptions);
    return res.status(201).json(newUser);
  } catch (error) {
    return res.status(400).json(error);
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email: email });
    if (await bcrypt.compare(password, user.passwordHash)) {
      delete user._doc.passwordHash;
      const token = generateToken(user);
      return res.status(200).json({ token: token, user: user });
    } else {
      return res.status(400).json("Usuário não encontrado");
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json("ERRINHO");
  }
});
//2º rota: Pegar todos os users
router.get("/all", async (req, res) => {
  const allUsers = await UserModel.find();

  return res.status(200).json(allUsers);
});

//3º rota: Acessar um usuário pelo seu ID
router.get("/meuusuario", isAuth, attachCurrentUser, async (req, res) => {
  try {
    return res.status(200).json(req.currentUser);
  } catch (error) {
    return res.status(400).json("ooooooo");
  }
});

//4º Adicionar uma receita na array de favorites
router.put(
  "/addFavorite/:idRecipe",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    const { idRecipe } = req.params;

    //conferir se a receita já não foi adicionada
    const user = await UserModel.findById(req.currentUser._id);
    if (user.favorites.includes(idRecipe)) {
      return res.status(400).json("receita já adicionada");
    }

    const receitinha = await RecipeModel.findById(idRecipe);
    const userUpdate = await UserModel.findByIdAndUpdate(
      req.currentUser._id,
      {
        $push: {
          favorites: idRecipe,
        },
      },
      { new: true }
    ).populate("favorites");
    const mailOptions = {
      from: "bruno.apos13.85wdftironhack_bruno.apos13@outlook.com",
      to: req.currentUser.email,
      subject: "Você favoritou uma receita",
      html: `<h1>Você adicionou a receita ${receitinha.title}</h1> <h2>Level: ${receitinha.level}, cusinha: ${receitinha.cuisine} creator: ${receitinha.creator}</h2><p>Muito obrigao por curtir essa receita</p>`,
    };
    await transporter.sendMail(mailOptions);

    await RecipeModel.findByIdAndUpdate(idRecipe, { $inc: { likes: 1 } });

    return res.status(200).json(userUpdate);
  }
);

//5º Adicionar uma receita na array de deslikes
router.put(
  "/addDislike/:idRecipe",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    const { idRecipe } = req.params;

    const userUpdate = await UserModel.findByIdAndUpdate(
      req.currentUser._id,
      {
        $push: {
          dislikes: idRecipe,
        },
      },
      { new: true }
    ).populate("dislikes");

    await RecipeModel.findByIdAndUpdate(idRecipe, { $inc: { dislikes: 1 } });

    return res.status(200).json(userUpdate);
  }
);

//6º Remover uma receita na array de favorite
router.put(
  "/removeFavorite/:idRecipe",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    const { idRecipe } = req.params;

    const userUpdate = await UserModel.findByIdAndUpdate(
      req.currentUser._id,
      {
        $pull: {
          favorites: idRecipe,
        },
      },
      { new: true }
    ).populate("favorites");

    await RecipeModel.findByIdAndUpdate(idRecipe, { $inc: { likes: -1 } });

    return res.status(200).json(userUpdate);
  }
);

//7º Remover uma receita na array de deslikes
router.put(
  "/removeDislike/:idRecipe",
  isAuth,
  attachCurrentUser,
  async (req, res) => {
    const { idRecipe } = req.params;

    const userUpdate = await UserModel.findByIdAndUpdate(
      req.currentUser._id,
      {
        $pull: {
          dislikes: idRecipe,
        },
      },
      { new: true }
    ).populate("dislikes");

    await RecipeModel.findByIdAndUpdate(idRecipe, { $inc: { dislikes: -1 } });

    return res.status(200).json(userUpdate);
  }
);
router.get("/profileusuario", isAuth, attachCurrentUser, async (req, res) => {
  try {
    //console.log(req.currentUser);
    const loggedInUser = req.currentUser;
    console.log(loggedInUser);

    const user = await UserModel.findById(loggedInUser._id, {
      passwordHash: 0,
    });

    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});
router.put("/edit", isAuth, attachCurrentUser, async (req, res) => {
  try {
    const loggedInUser = req.currentUser;

    const editedUser = await UserModel.findByIdAndUpdate(
      loggedInUser._id,
      {
        ...req.body,
      },
      { new: true, runValidators: true }
    );

    delete editedUser._doc.passwordHash;

    return res.status(200).json(editedUser);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});
router.post("/sign-up", async (req, res) => {
  try {
    //pegando a senha do body
    const { password, email } = req.body;

    //checando se a senha existe e se ela passou na RegEx

    //gerar salt
    const salt = await bcrypt.genSalt(saltRounds);
    console.log(salt);
    //gerar passwordHash com a senha enviada pelo usuário mais o salt criado
    const passwordHash = await bcrypt.hash(password, salt);
    console.log(passwordHash);

    const newUser = await UserModel.create({
      ...req.body,
      passwordHash: passwordHash,
    });

    delete newUser._doc.passwordHash;

    // Dispara e-mail para o usuário

    return res.status(201).json(newUser);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});

router.get("/profile", isAuth, attachCurrentUser, async (req, res) => {
  try {
    //console.log(req.currentUser);
    const loggedInUser = req.currentUser;
    console.log(loggedInUser);

    const user = await UserModel.findById(loggedInUser._id, {
      passwordHash: 0,
    }).populate("posts");

    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    return res.status(400).json(error);
  }
});
module.exports = router;
