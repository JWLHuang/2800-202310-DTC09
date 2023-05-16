const express = require("express");
const app = express();
const Joi = require("joi");
const mongo = require("mongodb");
const bcrypt = require("bcrypt");
const saltRounds = 12;
const session = require("express-session");
const MongoStore = require("connect-mongo");

const router = express.Router();

const { database } = require("./database");
const mongodb_database = process.env.MONGODB_DATABASE;
const userCollection = database.db(mongodb_database).collection("users");

router.get("/forgotPassword", (req, res) => {
    res.render("forgotPassword.ejs", { user: res.locals.user });
});

router.post("/forgotPasswordSubmit", async (req, res) => {
    var email = req.body.email;
    var question = req.body.question;
    var answer = req.body.answer;
    var newPassword = req.body.newPassword;
    var newPasswordConfirm = req.body.newPasswordConfirm;
    const schema = Joi.object({
        email: Joi.string().email().required(),
        question: Joi.string().max(20).required(),
        answer: Joi.string().max(20).required(),
        newPassword: Joi.string().max(20).required(),
        newPasswordConfirm: Joi.string().max(20).required(),
    });
    const result = await userCollection
        .find({ email: email })
        .project({ name: 1, question: 1, answer: 1, _id: 1, user: 1 })
        .toArray();

    const validation = schema.validate({
        email,
        question,
        answer,
        newPassword,
        newPasswordConfirm,
    });
    questionCheck = (question === result[0].question)
    answerCheck = await bcrypt.compare(answer, result[0].answer);

    if (validation.error) {
        return res.status(400).send(validation.error.details[0].message);
    } else if (!(questionCheck && answerCheck)) {
        return res.status(400).send("Invalid question/answer combination");
    } else {
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
