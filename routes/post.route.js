const express = require("express");
const PostController = require("../controller/post.controller");
const router = express.Router();
const PostRoute = express();
const requireLogin = require("../middleware/requireLogin");
const { validarJWT } = require("../middleware/validar-jwt");

router.get("/allpost", validarJWT, PostController.AllPost);
router.post("/createpost", validarJWT, PostController.CreatePost);
router.put("/editpost", validarJWT, PostController.EditPost);
router.delete("/deletepost/:id", validarJWT, PostController.DeletePost);
router.get("/me", validarJWT, PostController.MyPost);
router.put("/like", validarJWT, PostController.LikePost);
router.put("/unlike", validarJWT, PostController.UnlikePost);
router.put("/comment", validarJWT, PostController.Comment);
router.put("/deletecomment", validarJWT, PostController.DeleteComment);
router.get("/followingpost", validarJWT, PostController.GetPostByFollowing);

PostRoute.use("/post", router);

module.exports = PostRoute;
