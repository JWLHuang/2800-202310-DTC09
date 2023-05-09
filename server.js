require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongo = require('mongodb');
const Joi = require('joi');
let ejs = require('ejs');
const bcrypt = require('bcrypt');

const app = express();

const port = process.env.PORT || 3000;
app.set("views", __dirname + "/views");


app.get('/', (req, res) => {
    res.render('index.ejs');
});

app.get('/login', (req, res) => {
    res.render('login.ejs');
});

app.get('/404', (req, res) => {
    res.render('404.ejs');
});



app.listen(port, () => console.log(`Listening on port ${port}`));
