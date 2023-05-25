const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();

// Import helper functions and schema
const { database } = require("./database");
const forgotPasswordSchema = require("./schema/forgotPasswordSchema");

// Import the MongoDB client
const mongodb_database = process.env.MONGODB_DATABASE;
const userCollection = database.db(mongodb_database).collection("users");

// Display the forgot password page
router.get("/forgotPassword/:error?", (req, res) => {
    // If the user is already logged in, redirect them to the profile page
    if (req.session.authenticated) {
        return res.redirect("/profile");
    }

    // If there is an error, display the error message
    if (req.params.error === "error") {
        errorMessage = "Please fill out all fields with valid information."
        // if user did not select a security question, display error message
    } else if (req.params.error === "questionError") {
        errorMessage = "Please select a security question."
        // if user did not enter a correct answer, display error message
    } else if (req.params.error === "incorrectAnswerError") {
        errorMessage = "Incorrect answer."
        // if the password did not match the confirm password, display error message
    } else if (req.params.error === "notMatchError") {
        errorMessage = "Passwords do not match."
        // if the email does not exist in the database, display error message
    } else if (req.params.error === "doesNotExisterror") {
        errorMessage = "Email does not exist."
        // if everything passed, display no error message
    } else {
        errorMessage = undefined;
    }
    // Render the forgot password page
    return res.render("forgotPassword.ejs", { errorMessage: errorMessage });
});


// Handle the forgot password form submission
router.post("/forgotPasswordSubmit", async (req, res) => {
    var email = req.body.email;
    var question = req.body.question;
    var answer = req.body.answer;
    var newPassword = req.body.newPassword;
    var newPasswordConfirm = req.body.newPasswordConfirm;

    // Find the user in the database
    const result = await userCollection
        .find({ email: email })
        .project({ name: 1, question: 1, answer: 1, _id: 1, user: 1 })
        .toArray();

    // Validate the form data
    const validation = forgotPasswordSchema.validate({
        email,
        question,
        answer,
        newPassword,
        newPasswordConfirm,
    });

    // Check if the email exists in the database
    if (result === undefined || result.length == 0) {
        return res.redirect("/forgotPassword/doesNotExisterror");
    }

    // Check if any of the fields are empty
    flag = false;
    Object.keys(req.body).forEach((item) => {
        if (req.body[item] === "") {
            flag = true;
        }
    })

    if (flag === true) {
        return res.redirect("/forgotPassword/error");
    }

    // Check if security question is valid
    if (!Object.keys(req.body).includes("question")) {
        return res.redirect("/forgotPassword/questionError");
    }

    // Check if the answer is correct
    questionCheck = (question === result[0].question)
    answerCheck = await bcrypt.compare(answer, result[0].answer);

    if (validation.error) {
        // If the form data is not valid, redirect the user to the forgot password page
        return res.redirect("/forgotPassword/error");
    } else if (!(questionCheck && answerCheck)) {
        // If the answer is incorrect, redirect the user to the forgot password page
        return res.redirect("/forgotPassword/incorrectAnswerError");
    } else {
        if (newPassword !== newPasswordConfirm) {
            // If the password and confirm password do not match, redirect the user to the forgot password page
            return res.redirect("/forgotPassword/notMatchError");
        } else {
            // If the password and confirm password match, update the user's password in the database
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