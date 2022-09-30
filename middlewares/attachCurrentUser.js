const ClientModel = require("../models/User.model");
async function attachCurrentUser(req, res, next) {
  try {
    const loggedInUser = req.auth;
    const user = await ClientModel.findById(loggedInUser._id, {
      passwordHash: 0,
    });
    req.currentUser = user;
    next();
  } catch (error) {
    return res.status(400).json("errinho");
  }
}
module.exports = attachCurrentUser;
