const usersModel = require("./models/usersModel");

// Export the function
module.exports = {
    // Find a user in the database and return its object.
    findUser: async (searchCriteria) => {
        try {
            let user = await usersModel.findOne(searchCriteria);
            return user;
        }
        catch (error) {
            console.log(error);
            return null;
        }
    }
}