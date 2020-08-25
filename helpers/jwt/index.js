require("dotenv").config();
const jwt = require("jsonwebtoken");
const { baseUrl } = require("../base-url");

exports.generarJWT = (uid) => {
  return new Promise((resolve, reject) => {
    const payload = {
      uid,
    };
    jwt.sign(
      payload,
      process.env.JWT_KEY,
      {
        expiresIn: "1h",
        issuer: baseUrl,
        audience: baseUrl,
      },
      (err, token) => {
        if (err) {
          console.log(err);
          reject("No se pudo generar el JWT");
        } else {
          resolve(token);
        }
      }
    );
  });
};
