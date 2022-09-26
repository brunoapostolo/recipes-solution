//Faça a conexão com o banco de dados (mongoDB) aqui

const mongoose = require("mongoose");

async function connect() {
  try {
    const dbConnection = await mongoose.connect(process.env.MONGODB_URI);

    console.log("Conectado com o banco de dados", dbConnection.connection.name);
  } catch (error) {
    console.log("Erro de conexão com o banco de dados", error);
  }
}

module.exports = connect;


//Não se esqueça de exportar a função
