const express = require("express");
const bcrypt = require("bcrypt");
const saltRounds = 12;
const router = express.Router();
const forgotPasswordSchema = require("./schema/forgotPasswordSchema");

const { database } = require("./database");
const mongodb_database = process.env.MONGODB_DATABASE;
const userCollection = database.db(mongodb_database).collection("users");

router.get("/forgotPassword/:error?", (req, res) => {
    // If the user is already logged in, redirect them to the profile page
    if (req.session.authenticated) {
        return res.redirect("/profile");
    }

    if (req.params.error === "error") {
        return res.render("forgotPassword.ejs", {
            errorMessage: "Please fill out all fields with valid information.",
            user: res.locals.user,
        })
    } else if (req.params.error === "questionError") {
        return res.render("forgotPassword.ejs", {
            errorMessage: "Please select a security question.",
            user: res.locals.user,
        })
    } else if (req.params.error === "incorrectAnswerError") {
        return res.render("forgotPassword.ejs", {
            errorMessage: "Incorrect answer.",
            user: res.locals.user,
        })
    } else if (req.params.error === "notMatchError") {
        return res.render("forgotPassword.ejs", {
            errorMessage: "Passwords do not match.",
            user: res.locals.user,
        })
    } else if (req.params.error === "doesNotExisterror") {
        return res.render("forgotPassword.ejs", {
            errorMessage: "Email does not exist.",
            user: res.locals.user,
        })
    }
    // If the user is not logged in, render the forgot password page
    return res.render("forgotPassword.ejs", { user: res.locals.user });
});

router.post("/forgotPasswordSubmit", async (req, res) => {
    var email = req.body.email;
    var question = req.body.question;
    var answer = req.body.answer;
    var newPassword = req.body.newPassword;
    var newPasswordConfirm = req.body.newPasswordConfirm;
    const result = await userCollection
        .find({ email: email })
        .project({ name: 1, question: 1, answer: 1, _id: 1, user: 1 })
        .toArray();

    const validation = forgotPasswordSchema.validate({
        email,
        question,
        answer,
        newPassword,
        newPasswordConfirm,
    });

    console.log(req.body)
    
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
        return res.redirect("/forgotPassword/error");
    } else if (!(questionCheck && answerCheck)) {
        return res.redirect("/forgotPassword/incorrectAnswerError");
    } else {
        if (newPassword !== newPasswordConfirm) {
            return res.redirect("/forgotPassword/notMatchError");
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
