const express = require('express');
const router = express.Router();
const restaurantModel = require("./models/restaurantModel");
const { findUser } = require("./findUser");
const reviewModel = require("./models/reviewModel");

// const getRating = async (restaurantList) => {
//     let service = 0;
//     let food = 0;
//     let atmosphere = 0;
//     let cleanliness = 0;
//     let price = 0;
//     let accessibility = 0;
//     let personalRating = 0;
//     try {
//         for (let i = 0; i < restaurantList.length; i++) {
//             const reviews = await reviewModel.find({ restaurantID: restaurantList[i]._id });
//             console.log('reviews', reviews)
//             console.log('restaurantID: ', restaurantList[i]._id)
//             if (reviews.length === 0) {
//                 return 0;
//             }
//             for (let j = 0; j < reviews.length; j++) {
//                 service += reviews[j].service;
//                 food += reviews[j].food;
//                 atmosphere += reviews[j].atmosphere;
//                 cleanliness += reviews[j].cleanliness;
//                 price += reviews[j].price;
//                 accessibility += reviews[j].accessibility;
//             }
//             restaurantList[i].service = service / reviews.length;
//             restaurantList[i].food = food / reviews.length;
//             restaurantList[i].atmosphere = atmosphere / reviews.length;
//             restaurantList[i].cleanliness = cleanliness / reviews.length;
//             restaurantList[i].price = price / reviews.length;
//             restaurantList[i].accessibility = accessibility / reviews.length;
//         }
//         personalRating = (service + food + atmosphere + cleanliness + price + accessibility) / (restaurantList.length * 6);
//         return personalRating;
//         // const reviews = await reviewModel.find({ restaurantID: req.params.id });
//     }
//     catch (err) {
//         console.log(err);
//     }
// }

const getRestaurantRatings = async (restaurants) => {
    try {
        const restaurantRatings = [];

        for (let i = 0; i < restaurants.length; i++) {
            const restaurant = restaurants[i];
            const reviews = await reviewModel.find({ restaurantID: restaurant._id });
            // console.log('reviews', reviews)
            if (reviews.length === 0) {
                restaurantRatings.push({ ...restaurant, averageRating: 0 });
            } else {
                let service = 0;
                let food = 0;
                let atmosphere = 0;
                let cleanliness = 0;
                let price = 0;
                let accessibility = 0;
                // console.log('reviews Service', reviews[1].Price)
                for (let j = 0; j < reviews.length; j++) {
                    service += reviews[j].Service;
                    food += reviews[j].Food;
                    atmosphere += reviews[j].Atmosphere;
                    cleanliness += reviews[j].Cleanliness;
                    price += reviews[j].Price;
                    accessibility += reviews[j].Accessibility;
                }
                const averageService = service / reviews.length;
                const averageFood = food / reviews.length;
                const averageAtmosphere = atmosphere / reviews.length;
                const averageCleanliness = cleanliness / reviews.length;
                const averagePrice = price / reviews.length;
                const averageAccessibility = accessibility / reviews.length;

                const averageRating = Math.round(((averageService + averageFood + averageAtmosphere + averageCleanliness + averagePrice + averageAccessibility) / 6) * 100) / 100;
                // console.log('averageRating', averageRating)
                restaurantRatings.push({ ...restaurant, averageRating });
            }
        }
        // console.log('restaurantRatings', restaurantRatings[0])
        return restaurantRatings;
    } catch (err) {
        console.log(err);
        return [];
    }
}


const findRestaurants = async (user, searchQuery, res, errorMsg) => {
    try {
        const restaurants = await restaurantModel.find(searchQuery);
        // const personalRating = await getRating(restaurants);
        // console.log(personalRating);
        const restaurantRatings = await getRestaurantRatings(restaurants);
        // console.log(restaurantRatings[1]);
        // console.log(restaurantRatings[0]._doc.Name);
        console.log(restaurantRatings[0]._doc.Name);
        console.log(restaurantRatings[0]);
        return restaurantRatings;
        // console.log(restaurantRatings[0]);
        // res.render('restaurantList.ejs', restaurants ? { user: user, restaurants: restaurants, errorMsg: errorMsg } : { user: user, restaurants: null, errorMsg: errorMsg });
    } catch (err) {
        console.log(err);
    }
}

router.get("/snake", async (req, res) => {
    const user = await findUser({ email: req.session.email });
    user ? res.locals.user = user : res.locals.user = null;
    res.render("snake");
});

router.get('/restaurants', async (req, res) => {
    const errorMsg = req.session.error ? req.session.error : null;
    delete req.session.error;
    const filterParam = req.query.filter; // Get the filter data from the query parameter
    if (!filterParam) return res.redirect("/filterRestaurants/error"); // If there is no filter data, redirect to the filter page with an error message
    const filterData = JSON.parse(decodeURIComponent(req.query.filter)); // Decode and parse the filter data from the query parameter
    try {
        const user = await findUser({ email: req.session.email });
        if (!user) {
            return res.redirect("/login")
        } else if (user.dietary_preferences.length === 0) {
            const searchQuery = {
                $and: Object.keys(filterData).map((field) => ({
                    [field]: { $regex: filterData[field], $options: "i" }
                }))
            }
            findRestaurants(user, searchQuery, res, errorMsg);
        } else {
            const searchTerms = user.dietary_preferences
            const searchQuery = {
                $and: [
                    {
                        $or: searchTerms.map((term) => ({
                            "Dietary Restrictions": { $regex: term, $options: "i" }
                        }))
                    },
                    {
                        $and: Object.keys(filterData).map((field) => ({
                            [field]: { $regex: filterData[field], $options: "i" }
                        }))
                    }
                ]
            }
            const restaurants = await findRestaurants(user, searchQuery, res, errorMsg);
            // console.log(restaurants)
            // console.log(restaurants[0]._doc.Name);
            // console.log(restaurants[0].averageRating);
            return res.render('restaurantList.ejs', restaurants ? { user: user, restaurants: restaurants, errorMsg: errorMsg } : { user: user, restaurants: null, errorMsg: errorMsg })
        }
    } catch (err) {
        console.log(err);
    }
});

router.get('/restaurant/:id?', async (req, res) => {
    const user = await findUser({ email: req.session.email });
    try {
        const restaurant = await restaurantModel.findOne({ _id: req.params.id });
        const reviews = await reviewModel.find({ restaurantID: req.params.id });
        for (let i = 0; i < reviews.length; i++) {
            const author = await findUser({ _id: reviews[i].userID }, { name: 1 });
            reviews[i].userID = author.name;
        }
        if (restaurant) {
            res.render("restaurant", restaurant ? { user: user, restaurant: restaurant, userLatitude: 49.17555, userLongitude: -123.13254, reviews: reviews } : { user: user, restaurant: null });
        } else {
            req.session.error = "Restaurant not found";
            res.redirect("/filterRestaurants")
        }

    } catch (error) {
        console.log(error)
        req.session.error = "Restaurant not found";
        res.redirect("/filterRestaurants")
    }
});

router.get("/filterRestaurants/:message?", async (req, res) => {
    const errorMsg = req.session.error ? req.session.error : null;
    delete req.session.error;
    try {
        if (!req.session.authenticated) {
            return res.redirect('/login');
        }
        const user = await findUser({ email: req.session.email });
        const cuisine = await restaurantModel.distinct("Cuisine");
        const price = await restaurantModel.distinct("Price");
        const award = await restaurantModel.distinct("Award");
        const location = await restaurantModel.distinct("Location");

        cuisine.push("Hi")
        price.push("Chris")
        award.push("Don't")
        location.push("Select")

        if (req.params.message === "error") {
            return res.render("filterRestaurants.ejs", { user: user, cuisine: cuisine, price: price, award: award, location: location, errorMessage: "At least one filter must be selected", errorMsg: errorMsg });
        }
        res.render("filterRestaurants.ejs", { user: user, cuisine: cuisine, price: price, award: award, location: location, errorMsg: errorMsg });
    } catch (err) {
        console.log(err);
    }
});

router.post("/filterRestaurantsResults", async (req, res) => {
    let filterData = req.body;

    if (Object.keys(filterData).length === 0 || filterData === undefined) {
        return res.redirect("/filterRestaurants/error");
    }

    if (filterData["Cuisine"] === "Hi" &&
        filterData["Price"] === "Chris" &&
        filterData["Award"] === "Don't" &&
        filterData["Location"] === "Select") {

        res.redirect("/snake");
        return;
    }

    res.redirect(`/restaurants?filter=${encodeURIComponent(JSON.stringify(filterData))}`);
})

module.exports = router;