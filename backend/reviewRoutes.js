const express = require('express');
const router = express.Router();
const { findUser } = require("./findUser");
const restaurantModel = require("./models/restaurantModel");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const reviewModel = require("./models/reviewModel");
const Joi = require("joi");
const reviewAi = require("./ai_reviews");
const reviewSchema = require("./schema/reviewSchema");
const smartReviewSchema = require("./schema/smartReviewSchema");


// Express middleware
router.use(express.json({ limit: '50mb' }));

// Routes for writing reviews
router.get("/writeReview/:id/", async (req, res) => {
    // Check if user is logged in
    if (!req.session.authenticated) {
        return res.redirect('/login');
    }

    // Render the specific writeReview page
    const user = await findUser({ email: req.session.email });
    try {
        const restaurant = await restaurantModel.findOne({ _id: req.params.id });
        res.render("writeReview", { user: user, restaurant: restaurant });
    } catch (err) {
        req.session.error = "Restaurant not found";
        res.redirect("/filterRestaurants")
    }
});

// Routes for smart reviews
router.get("/SmartReview/:id/:errorMessage?", async (req, res) => {
    // Check if user is logged in
    if (!req.session.authenticated) {
        return res.redirect('/login');
    }
    // Render the specific writeReview page
    const user = await findUser({ email: req.session.email });
    try {
        // Handling error messages returned from generateSmartReview
        const restaurant = await restaurantModel.findOne({ _id: req.params.id });
        if (req.params.errorMessage === "missingTone") {
            return res.render("smartReview", { user: user, restaurant: restaurant, errorMessage: "Please select a valid tone." });
        } else if (req.params.errorMessage === "missingAspect") {
            return res.render("smartReview", { user: user, restaurant: restaurant, errorMessage: "Please fill in at least an aspect." });
        } else if (req.params.errorMessage === "invalidAspect") {
            return res.render("smartReview", { user: user, restaurant: restaurant, errorMessage: "Filled aspect must be within 2 to 40 characters." });
        } else if (req.params.errorMessage === "errorGenerateReview") {
            return res.render("smartReview", { user: user, restaurant: restaurant, errorMessage: "Error generating review. Please try again." });
        } else {
            return res.render("smartReview", { user: user, restaurant: restaurant });
        }
    } catch (err) {
        req.session.error = "Restaurant not found";
        res.redirect("/filterRestaurants")
    }
});

// Route for generating a review
router.post("/generateSmartReview/", async (req, res) => {
    try {
        // Convert req.body to JSON
        inputChecking = JSON.stringify(req.body)
        inputChecking = JSON.parse(inputChecking)

        // Check if a valid tone is selected
        const { error, value } = smartReviewSchema.validate(req.body);
        if (error.details[0].type === "any.required") {
            return res.redirect("/SmartReview/" + req.body.restaurantID + "/missingTone");
        }
        if (inputChecking['tone'] === undefined) {
            return res.redirect("/SmartReview/" + req.body.restaurantID + "/missingTone");
        }
        
        // Check if at least one aspect is filled
        delete inputChecking['tone'];
        delete inputChecking['restaurantID'];
        let empty = true;
        let keyArray = [];
        for (const key in inputChecking) {
            keyArray.push(key)
            if (inputChecking[key].trim() !== "") {
                empty = false;
            } else {
                delete req.body[key]
            }
        }
        if (empty) {
            return res.redirect("/SmartReview/" + req.body.restaurantID + "/missingAspect");
        }
        if (error.details[0].type === "string.min" || error.details[0].type === "string.max") {
            return res.redirect("/SmartReview/" + req.body.restaurantID + "/invalidAspect");
        }
        
        // Generate review
        try {
            const user = await findUser({ email: req.session.email });
            const restaurant = await restaurantModel.findOne({ _id: req.body.restaurantID });
            pageId = req.body.restaurantID;
            req.body.restaurantID = restaurant.Name;
            const prompt = `Generate a restaurant review based on given aspect and tone from the information below, 
            and return a review title in 20 words or less and review paragraph with 100 words to 150 words. 
            Never mention ${keyArray} aspects unless its given. Exaggerate the tone.
            The response must be in a JSON format with no new line characters starting with "{" with key "reviewTitle" and "reviewContent".
            \n ${JSON.stringify(req.body)}`;
            result = await reviewAi(prompt, 0.9);
            const generatedReview = JSON.parse(result);
            res.render("writeReview", { user: user, restaurant: restaurant, generatedReview: generatedReview });
        } catch (err) {
            res.redirect("/SmartReview/" + pageId + "/errorGenerateReview")
        }
    } catch (err) {
        console.log(err)
        return res.json({
            status: "error",
            message: "Restaurant not found."
        })
    }
});

// Route for submitting reviews
router.post("/processReview/", upload.array('files'), async (req, res) => {
    // Check if user is logged in
    if (!req.session.authenticated) {
        return res.redirect('/login');
    }
    const { error, value } = reviewSchema.validate(req.body);

    // Check if review title and review body are empty
    if (error) {
        return res.json({
            status: "error",
            message: error.message
        })
    }

    // Check if user exists
    const user = await findUser({ email: req.session.email });
    if (!user) {
        return res.json({
            status: "error",
            message: "User not found."
        })
    }

    // Check if restaurant exists
    const restaurant = await restaurantModel.findOne({ _id: req.body.restaurantID });
    if (!restaurant) {
        return res.json({
            status: "error",
            message: "Restaurant not found."
        })
    }

    // Check Photo Upload Errors
    uploadError = req.files.length > 3 ? "Maximum 3 images allowed." : undefined;       // Check if more than 3 images uploaded
    req.files.forEach(file => {
        if (file.size > 512000) {
            uploadError = "Maximum file size is 500KB."                             // Check if file size is more than 500KB
        }
        if (file.mimetype != "image/png" && file.mimetype != "image/jpeg" && file.mimetype != "image/jpg") {
            uploadError = "Only image files are allowed"                           // Check if file is not an image
        }
    })
    if (uploadError) {
        return res.json({
            status: "error",
            message: 'Maximum 3 images with size 500KB or less allowed.'
        })
    } else {
        // Evaluate review using AI
        const prompt = `First, search for offensive word. If there's any, give me reponse in a JSON format starting with "{" with key "offensive_words" and value "true". 
        Otherwise, give me a rating out of 5 in json format on service, food, atmosphere, cleanliness, price, accessibility in lower case 
        based on the review below. If the aspect is missing, make it 2.5. 
        Also, give me a positive comment with max 3 words and a negative comment with max 3 words on the review below.
        The response must be in a JSON format starting with "{" with key "service", "food", "atmosphere", "cleanliness", "price", "accessibility", "positiveTag", "negativeTag".
        "positiveTag", "negativeTag" can be empty if there is no positive or negative comment.
        \n\n Review Title:${req.body.reviewTitle}.\n\nReview Content:${req.body.reviewBody}
    }`;
        result = await reviewAi(prompt, 0.5);
        const rating = JSON.parse(result);
        if (rating.offensive_words) {
            return res.json({
                status: "error",
                message: "Sorry, but offensive language is prohibited."
            })
        }

        // Create review object
        var index = 1;
        var image = {};
        req.files.forEach(file => {
            const imagefield = "image" + index.toString().padStart(2, '0');
            image[imagefield + "Buffer"] = file.buffer;
            image[imagefield + "Type"] = file.mimetype;
            index += 1;
        })
        req.body['TimeStamp'] = Date.now();
        const reviewContent = Object.assign({}, req.body, image, rating);
        const review = new reviewModel(reviewContent);

        // Upload images and review to database
        try {
            await review.save();
            return res.json({
                status: "success",
                message: "Review submitted successfully!\nRedirecting to restaurant page..."
            })
        } catch (err) {
            console.log(err);
        }
    }
});

router.get('/myReviews', async (req, res) => {
    // Check if user is logged in
    if (!req.session.authenticated) {
        return res.redirect('/login');
    }
    try {
        const user = await findUser({ email: req.session.email });
        const reviews = await reviewModel.find({ userID: user._id }, { image03Buffer: 0, image03Type: 0, image02Buffer: 0, image02Type: 0 }).sort({ TimeStamp: -1 });
        for (const review of reviews) {
            const restaurant = await restaurantModel.findOne({ _id: review.restaurantID }, { Name: 1 });
            review.restaurantName = restaurant.Name;
        };
        res.render("myReviews", { user: user, reviews: reviews });
    } catch (err) {
        console.log(err);
    }
});



// Export routes to server.js
module.exports = router;