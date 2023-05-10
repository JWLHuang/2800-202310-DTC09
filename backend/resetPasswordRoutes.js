const express = require("express");
const app = express();
const Joi = require("joi");
const mongo = require("mongodb");
const bcrypt = require("bcrypt");
const saltRounds = 12;
const session = require("express-session");
const MongoStore = require("connect-mongo");

const router = express.Router();

var { database } = require("./database");
const mongodb_database = process.env.MONGODB_DATABASE;
const userCollection = database.db(mongodb_database).collection("users");

router.get("/resetPassword", (req, res) => {
  res.render("resetPassword.ejs");
});

router.post("/resetPasswordSubmit", async (req, res) => {
  var email = req.body.email;
  var password = req.body.password;
  var newPassword = req.body.newPassword;
  var newPasswordConfirm = req.body.newPasswordConfirm;
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().max(20).required(),
    newPassword: Joi.string().max(20).required(),
    newPasswordConfirm: Joi.string().max(20).required(),
  });
  const result = await userCollection
    .find({ email: email })
    .project({ name: 1, password: 1, _id: 1, user: 1 })
    .toArray();

  const validation = schema.validate({
    email,
    password,
    newPassword,
    newPasswordConfirm,
  });
  passwordCheck = await bcrypt.compare(password, result[0].password);
  console.log(passwordCheck);

  if (validation.error) {
    return res.status(400).send(validation.error.details[0].message);
  } else if (!(await bcrypt.compare(password, result[0].password))) {
    console.log("password checks");
    console.log(password);
    console.log(result[0].password);
    return res.status(400).send("Incorrect password.");
  } else {
    // const hashedNewPasswordConfirm = await bcrypt.hash(req.body.newPasswordConfirm, saltRounds);

    if (newPassword !== newPasswordConfirm) {
      return res.status(400).send("Passwords do not match.");
    } else {
      const hashedNewPassword = await bcrypt.hash(
        req.body.newPassword,
        saltRounds
      );
      await userCollection.updateOne(
        { email: email },
        { $set: { password: hashedNewPassword } }
      );
      console.log("password updated");
      res.redirect("/login");
    }
  }
});

module.exports = router;
