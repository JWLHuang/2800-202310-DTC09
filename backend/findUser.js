const usersModel = require("./models/usersModel");

module.exports = {
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