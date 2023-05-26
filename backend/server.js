const app = require("./app");
const mongoose = require('mongoose');
const dotenv = require("dotenv");
const port = process.env.PORT || 3000;

// Load environment variables
require("dotenv").config();

// Execute main function and catch any unhandled promise rejections
main().catch((err) => console.log(err));

async function main() {
  // Connect to the database
  await mongoose.connect(`${process.env.MONGODB_PROTOCOL}://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}/${process.env.MONGODB_DATABASE}`);

  // Start the server
  app.listen(port, () => {
    console.log(`Server is running on port ${port}.`);
  });
}
