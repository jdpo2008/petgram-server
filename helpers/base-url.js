module.exports = {
  baseUrl:
    process.env.MODE === "PRODUCTION"
      ? "https://sheltered-cove-77224.herokuapp.com/"
      : "http://localhost:5001/",
};
