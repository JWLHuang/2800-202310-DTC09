const authorizationModel = require("./models/usersModel")

module.exports = {
    searchByEmail: (searchObject) => {
    const result = authorizationModel.find(
        {email: searchObject}
    );
    return result
}
}