const { create, remove, update } = require("./crud.controller");
const { login, logout } = require("./auth.controller");

module.exports = {
  create,
  remove,
  update,
  login,
  logout,
};
