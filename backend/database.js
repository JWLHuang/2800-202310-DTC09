const { MongoClient } = require("mongodb");

// Load the environment variables from the .env file
require("dotenv").config();

// Get the MongoDB Atlas URI from the environment variables
const mongodb_host = process.env.MONGODB_HOST;
const mongodb_user = process.env.MONGODB_USER;
const mongodb_password = process.env.MONGODB_PASSWORD;

// Create a new MongoClient
const atlasURI = `mongodb+srv://${mongodb_user}:${mongodb_password}@${mongodb_host}/?retryWrites=true`;
var database = new MongoClient(atlasURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Export the database module
module.exports = { database };
