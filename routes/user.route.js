const express = require("express");
const router = express.Router();
const UserRoute = express();
const { validarJWT } = require("../middleware/validar-jwt");
const { check } = require("express-validator");
const { validarCampos } = require("../middleware/validar-campos");
const {
  RegisterUser,
  LoginUser,
  VerifyEmail,
  FollowUser,
  EditProfile,
  SearchUser,
  UserProfile,
  MyProfile,
} = require("../controller/user.controller");

router.post(
  "/register",
  [
    check("name", "El Nombre es obligatorio").not().isEmpty(),
    check("email", "El email es obligatorio").not().isEmpty(),
    check("email", "El email no es valido").isEmail(),
    check("password", "El password es obligatorio").not().isEmpty(),
    check("petname", "El nombre de la mascota es obligatorio").not().isEmpty(),
    validarCampos,
  ],
  RegisterUser
);
router.post(
  "/signin",
  [
    check("email", "El email es obligatorio").not().isEmpty(),
    check("email", "El email no es valido").isEmail(),
    check("password", "El password es obligatorio").not().isEmpty(),
    validarCampos,
  ],
  LoginUser
);
router.get("/verifyemail/:id", VerifyEmail);
router.put("/follow/:id", validarJWT, FollowUser);
router.put("/editprofile", validarJWT, EditProfile);
router.get("/search", validarJWT, SearchUser);
router.get("/profile/:id", validarJWT, UserProfile);
router.get("/me", validarJWT, MyProfile);

UserRoute.use("/api/v1/user", router);

module.exports = UserRoute;
