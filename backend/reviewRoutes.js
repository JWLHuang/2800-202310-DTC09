const express = require('express');
const router = express.Router();
const { findUser } = require("./findUser");
const restaurantModel = require("./models/restaurantModel");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const reviewModel = require("./models/reviewModel");
const Joi = require("joi");

const reviewSchema = Joi.object({
    reviewTitle: Joi.string().min(1).max(300).trim().required(),
    reviewBody: Joi.string().min(1).max(1000).trim().required(),
    restaurantID: Joi.string().min(1).max(100).trim().required(),
    userID: Joi.string().min(1).max(100).trim().required()
});

router.use(express.json({ limit: '50mb' }));

router.get("/writeReview/:id/", async (req, res) => {
    if (!req.session.authenticated) {
        return res.redirect('/login');
    }
    const user = await findUser({ email: req.session.email });
    const restaurant = await restaurantModel.findOne({ _id: req.params.id });
    res.render("writeReview", { user: user, restaurant: restaurant });
});

router.post("/processReview/", upload.array('files'), async (req, res) => {
    if (!req.session.authenticated) {
        return res.redirect('/login');
    }
    const { error, value } = reviewSchema.validate(req.body);
    if (error) {
        return res.json({
            status: "error",
            message: "Review Title and Review Body are required."
        })
    }
    uploadError = req.files.length > 3 ? "Maximum 3 images allowed." : undefined;
    req.files.forEach(file => {
        if (file.size > 512000) {
            uploadError = "Maximum file size is 500KB."
        }
        if (file.mimetype != "image/png" && file.mimetype != "image/jpeg" && file.mimetype != "image/jpg") {
            uploadError = "Only image files are allowed"
        }
    })
    if (uploadError) {
        return res.json({
            status: "error",
            message: 'Maximum 3 images with size 500KB or less allowed.'
        })
    } else {
        console.log("No error");
        var index = 1;
        var image = {};
        req.files.forEach(file => {
            const imagefield = "image" + index.toString().padStart(2, '0');
            image[imagefield + "Buffer"] = file.buffer;
            image[imagefield + "Type"] = file.mimetype;
            index += 1;
        })
        const reviewContent = Object.assign({}, req.body, image);
        const review = new reviewModel(reviewContent);
        try {
            await review.save();
            return res.json({
                status: "success",
                message: "Review submitted successfully!\nRedirecting to restaurant page..."})
        } catch (err) {
            console.log(err);
        }
    }
});

module.exports = router;
