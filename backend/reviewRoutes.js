const express = require('express');
const router = express.Router();
const { findUser } = require("./findUser");
const restaurantModel = require("./models/restaurantModel");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const reviewModel = require("./models/reviewModel");
const Joi = require("joi");
const reviewRating = require("./ai_evaluate_reviews");

// Joi schema for review
const reviewSchema = Joi.object({
    reviewTitle: Joi.string().min(1).max(300).trim().required(),
    reviewBody: Joi.string().min(1).max(1000).trim().required(),
    restaurantID: Joi.string().min(1).max(100).trim().required(),
    userID: Joi.string().min(1).max(100).trim().required()
});

// Express middleware
router.use(express.json({ limit: '50mb' }));

// Routes for writing reviews
router.get("/writeReview/:id/", async (req, res) => {
    // Check if user is logged in
    if (!req.session.authenticated) {
        return res.redirect('/login');
    }

    // Reder the specific writeReview page
    const user = await findUser({ email: req.session.email });
    const restaurant = await restaurantModel.findOne({ _id: req.params.id });
    res.render("writeReview", { user: user, restaurant: restaurant });
});

// Route for processing reviews
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
            message: "Review Title and Review Body are required."
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
        result = await reviewRating(req.body.reviewTitle, req.body.reviewBody);
        const rating = JSON.parse(result);

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
        console.log(reviewContent);
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

router.get("/testing", async (req, res) => {
})

// Export routes to server.js
module.exports = router;