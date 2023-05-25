const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();

// Import schema and helper functions
const resetPasswordSchema = require("./schema/resetPasswordSchema");
const { database } = require("./database");

// Import the MongoDB client
const mongodb_database = process.env.MONGODB_DATABASE;
const userCollection = database.db(mongodb_database).collection("users");

// Display the reset password page
router.get("/resetPassword/:errorMessage?", (req, res) => {
  // If the user is not logged in, redirect them to the login page
  if (!req.session.authenticated) {
    return res.redirect('/login');
  }
  // If the user is not logged in, redirect them to the login page
  if (req.params.errorMessage === 'error') {
    errorMessage = "Please fill out all fields with valid information."
    // If the password is incorrect, display the error message
  } else if (req.params.errorMessage === "incorrectPassworderror") {
    errorMessage = "Incorrect password."
    // If the passwords do not match, display the error message
  } else if (req.params.errorMessage === "notMatchError") {
    errorMessage = "Passwords do not match."
    // If the email does not match with the account, display the error message
  } else if (req.params.errorMessage === "resetError") {
    errorMessage = "You are trying to reset the password for a different account."
  } else {
    // If everything passed, display no error message
    errorMessage = undefined;
  }
  // Render the reset password page
  return res.render("resetPassword.ejs", { user: req.session, errorMessage: errorMessage });
});

// Handle the reset password form submission
router.post("/resetPasswordSubmit", async (req, res) => {
  var email = req.body.email;
  var password = req.body.password;
  var newPassword = req.body.newPassword;
  var newPasswordConfirm = req.body.newPasswordConfirm;

  // Find the user in the database
  const result = await userCollection
    .find({ email: email })
    .project({ name: 1, password: 1, _id: 1, user: 1 })
    .toArray();

  // Validate the form data
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

  // Check if the password is correct
  passwordCheck = await bcrypt.compare(password, result[0].password);
  console.log(passwordCheck);

  if (validation.error) {
    return res.redirect("/resetPassword/error");
  } else if (!(await bcrypt.compare(password, result[0].password))) {
    // If the password is incorrect, display the error message
    return res.redirect("/resetPassword/incorrectPassworderror");
  } else {
    if (newPassword !== newPasswordConfirm) {
      // If the passwords do not match, display the error message
      return res.redirect("/resetPassword/notMatchError");
    } else {
      // If everything passed, update the password
      const hashedNewPassword = await bcrypt.hash(req.body.newPassword, 10);
      await userCollection.updateOne(
        { email: email },
        { $set: { password: hashedNewPassword } }
      );
      // Redirect the user to the login page
      return res.redirect("/login");
    }
  }
});

module.exports = router;
