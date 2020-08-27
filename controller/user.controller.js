const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { response } = require("express");
const UserModel = require("../models/User");
const PostModel = require("../models/Post");
const { sendEmail } = require("../helpers/sendEmail");
const { baseUrl } = require("../helpers/base-url");
const imageType = require("../helpers/imageType");
const { generarJWT } = require("../helpers/jwt");

const RegisterUser = async (req, res) => {
  const { name, email, password, petname } = req.body;

  try {
    //find existing user in database
    const valid = await UserModel.findOne({ email }).exec();

    if (valid) {
      return res
        .status(422)
        .send({ status: false, message: "user already exists" });
    }

    const profilePic = `${baseUrl}image/profile/no-pic.jpg`;
    if (req.files && req.files.image) {
      const image = req.files.image;
      const fileName = imageType(image, name);
      image.mv(`./profile/images/profile/${fileName}`);
      profilePic = `${baseUrl}image/profile/${fileName}`;
    }

    const user = new UserModel({
      email,
      password,
      name,
      petname,
      isEmailVerified: false,
      profilePic,
      followers: [],
      following: [],
    });

    const result = await user.save();

    if (result) {
      sendEmail(result);
      res.status(200).send({
        status: true,
        message: "success, check your email",
        user,
      });
    } else {
      res.status(500).send({
        status: false,
        message: "error al guardar el usurio",
      });
    }
  } catch (error) {
    res.send({ status: false, message: error });
  }
};

const LoginUser = async (req, res = response) => {
  const { email, password } = req.body;
  try {
    // Verificar email
    const usuarioDB = await UserModel.findOne({ email });
    if (!usuarioDB) {
      return res.status(404).json({
        ok: false,
        msg: "Usuario no encontrado",
      });
    }
    // Verificar contraseña
    const validPassword = bcrypt.compareSync(password, usuarioDB.password);
    if (!validPassword) {
      return res.status(400).json({
        ok: false,
        msg: "La Contraseña no es válida",
      });
    }

    const { _id, isEmailVerified } = usuarioDB;

    if (!isEmailVerified) {
      return res.status(401).json({
        status: false,
        message: "Email must be verified",
      });
    }

    // Generar el TOKEN - JWT
    const token = await generarJWT(_id);

    return res.status(200).send({
      status: true,
      message: "success",
      token,
      user: usuarioDB,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      ok: false,
      msg: "Error inesperado en la operación",
      error,
    });
  }
};

const VerifyEmail = async (req, res) => {
  const { id } = req.params;
  UserModel.findByIdAndUpdate(id, {
    $set: { isEmailVerified: true },
  }).exec((err, post) => {
    if (err || !post) {
      return res.send({ status: false, message: "User not found" });
    }
    res.render("email");
  });
};

const FollowUser = async (req, res) => {
  const userId = req.user._id;
  const { id } = req.params;
  try {
    const updateFollowers = await UserModel.findOneAndUpdate(
      { _id: id },
      {
        $addToSet: { followers: userId },
      }
    );
    await UserModel.findOneAndUpdate(
      { _id: userId },
      {
        $addToSet: { following: id },
      }
    );
    if (!updateFollowers) {
      res.send({
        status: false,
        message: "user that you want to follow not found",
      });
    }
    res.send({ status: true, message: "sucess" });
  } catch (error) {
    res.send({ status: false, message: error });
  }
};

const EditProfile = async (req, res) => {
  const userId = req.user._id;
  try {
    let hashedPassword;
    if (req.body.password) {
      hashedPassword = await bcrypt.hash(req.body.password, 12);
      req.body.password = hashedPassword;
    } else {
      hashedPassword = undefined;
    }

    if (!req.files) {
      const user = await UserModel.findByIdAndUpdate(
        { _id: userId },
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );
      if (!user) return res.send({ status: false, message: "User not found" });
      res.send({
        status: true,
        message: "success changed profile",
        user: user,
      });
    } else {
      const image = req.files.image;
      const fileName = imageType(image, req.user.name);
      image.mv(`./public/images/profile/${fileName}`);

      await UserModel.findByIdAndUpdate({ _id: userId }, req.body, {
        new: true,
        runValidators: true,
      });

      const update = await UserModel.findByIdAndUpdate(
        { _id: userId },
        { profilePic: `${baseUrl}image/profile/${fileName}` },
        {
          new: true,
          runValidators: true,
        }
      );

      res.send({
        status: true,
        message: "success changed profile",
        user: update,
      });
    }
  } catch (error) {
    console.log(error);
    res.send({ status: false, message: error.message });
  }
};

const SearchUser = async (req, res) => {
  try {
    const user = await UserModel.find(
      { name: { $regex: req.query.user } },
      "name petname profilePic"
    );
    if (user.length === 0) {
      res.send({ status: false, message: "User not found" });
    }

    res.send({ status: true, message: "success", users: user });
  } catch (error) {
    res.send({ status: false, message: error });
  }
};

const UserProfile = async (req, res) => {
  const { id } = req.params;
  _Profile(req, res, id)
    .then((response) => {
      return response;
    })
    .catch((err) => {
      return err;
    });
};

const MyProfile = async (req, res) => {
  _Profile(req, res, req.user._id)
    .then((response) => {
      return response;
    })
    .catch((err) => {
      return err;
    });
};

async function _Profile(req, res, id) {
  try {
    const user = await UserModel.findById({ _id: id }).lean();
    const userPost = await PostModel.find({ postedBy: req.user._id })
      .populate("postedBy", "name")
      .sort({ createdAt: -1 })
      .lean();
    user.password = undefined;
    res.send({
      status: true,
      message: "success",
      user: {
        detail: user,
        posts: userPost,
      },
    });
  } catch (error) {
    res.send({ status: false, message: error });
  }
}

module.exports = {
  RegisterUser,
  LoginUser,
  VerifyEmail,
  FollowUser,
  EditProfile,
  SearchUser,
  UserProfile,
  MyProfile,
};
