const express = require("express");
const bcrypt = require("bcrypt");
const saltRounds = 12;
const resetPasswordSchema = require("./schema/resetPasswordSchema");

const router = express.Router();

const { database } = require("./database");
const mongodb_database = process.env.MONGODB_DATABASE;
const userCollection = database.db(mongodb_database).collection("users");

router.get("/resetPassword/:errorMessage?", (req, res) => {
  if (req.params.errorMessage === 'error') {
    return res.render("resetPassword.ejs", {
      errorMessage: "Please fill out all fields with valid information.",
      user: res.locals.user,
    });
  } else if (req.params.errorMessage === "incorrectPassworderror") {
    return res.render("resetPassword.ejs", {
      errorMessage: "Incorrect password.",
      user: res.locals.user,
    });
  } else if (req.params.errorMessage === "notMatchError") {
    return res.render("resetPassword.ejs", {
      errorMessage: "Passwords do not match.",
      user: res.locals.user,
    });
  } else if (req.params.errorMessage === "resetError") {
    return res.render("resetPassword.ejs", {
      errorMessage: "You are trying to reset the password for a different account.",
      user: res.locals.user,
    });
  }
  res.render("resetPassword.ejs", { user: res.locals.user });
});

router.post("/resetPasswordSubmit", async (req, res) => {
  var email = req.body.email;
  var password = req.body.password;
  var newPassword = req.body.newPassword;
  var newPasswordConfirm = req.body.newPasswordConfirm;

  const result = await userCollection
    .find({ email: email })
    .project({ name: 1, password: 1, _id: 1, user: 1 })
    .toArray();

  const validation = resetPasswordSchema.validate({
    email,
    password,
    newPassword,
    newPasswordConfirm,
  });

  // Check if user resets password for a different account
  if (email !== req.session.email) {
    return res.redirect("/resetPassword/resetError");
  }

  // Check if any fields are empty
  flag = false;
  Object.keys(req.body).forEach((item) => {
    if (req.body[item] === "") {
      flag = true;
    }
  })

  if (flag === true) {
    return res.redirect("/resetPassword/error");
  }

  passwordCheck = await bcrypt.compare(password, result[0].password);
  console.log(passwordCheck);

  if (validation.error) {
    return res.redirect("/resetPassword/error");
  } else if (!(await bcrypt.compare(password, result[0].password))) {
    console.log("password checks");

    return res.redirect("/resetPassword/incorrectPassworderror");
  } else {
    if (newPassword !== newPasswordConfirm) {
      return res.redirect("/resetPassword/notMatchError");
    } else {
      const hashedNewPassword = await bcrypt.hash(
        req.body.newPassword,
        saltRounds
      );
      await userCollection.updateOne(
        { email: email },
        { $set: { password: hashedNewPassword } }
      );
      res.redirect("/login");
    }
  }
});

module.exports = router;
