require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongo = require('mongodb');
const Joi = require('joi');
let ejs = require('ejs');
const bcrypt = require('bcrypt');
