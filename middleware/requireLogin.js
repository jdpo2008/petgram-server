const jwt = require("jsonwebtoken");
const UserModel = require("../models/User");

const validarJWT = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) {
    res.send({ message: "You must be log in" });
  }
  const token = authorization.replace("Bearer ", "");

  const { _id } = jwt.verify(token, process.env.JWT_KEY);

  req._id = _id;

  next();
};

const varlidarADMIN = async (req, res, next) => {
  const _id = req._id;

  try {
    const usuarioDB = await Usuario.findById(_id);

    if (!usuarioDB) {
      return res.status(404).json({
        ok: false,
        msg: "Usuario no existe",
      });
    }

    if (usuarioDB.role !== "ADMIN_ROLE") {
      return res.status(403).json({
        ok: false,
        msg: "No tiene privilegios para hacer eso",
      });
    }

    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: "Hable con el administrador",
    });
  }
};

module.exports = {
  validarJWT,
  varlidarADMIN,
};
