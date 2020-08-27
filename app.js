require("dotenv").config();
const cors = require("cors");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");

// import de las rutas
const UserRoute = require("./routes/user.route");
const PostRoute = require("./routes/post.route");

// import de utilidades
const { validarJWT } = require("./middleware/validar-jwt");
const { dbConnection } = require("./db");

// Se inicializa la Base de datos
dbConnection();

// se crea la aplicacion de express
const app = express();

// Se establece el motor de las vistas
const handlebars = require("express-handlebars").create({
  defaultLayout: "main",
});
app.engine("handlebars", handlebars.engine);
app.set("view engine", "handlebars");

// Se asignan los cors para las solicitudes http
app.use(cors());

// Se parsea el body en las solicitudes http
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Se setea la creacion del path en el archivo
app.use(fileUpload({ createParentPath: true }));

// Directorio público
app.use(express.static(path.join(__dirname, "public")));
app.use("/image/profile", express.static("./public/images/profile"));
app.use("/image/post", express.static("./public/images/post"));

// Se asignan las rutas a usar

app.use(UserRoute);
app.use(PostRoute);
app.get("/", (req, res) => {
  res.send({
    status: true,
    message: "Api funcionando correctamente",
  });
});

// enpoint para test del token
app.use("/test", validarJWT, (req, res) => {
  res.send({ message: "success" });
});

// Si la url no es valida indica el error
app.use("*", (req, res) => {
  res.send({ status: false, message: "Endpoint not found" });
});

const PORT = process.env.PORT;
app.set("port", PORT || 5000);

app.listen(PORT, () => {
  console.log(
    "Server operaivo sobre el PORT: \x1b[32m%s\x1b[0m",
    app.get("port")
  );
});
