const express = require('express');
const router = express.Router();
const { findUser } = require("./findUser");
const restaurantModel = require("./models/restaurantModel");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const reviewModel = require("./models/reviewModel");

router.use(express.json({ limit: '50mb' }));

router.get("/writeReview/:id?", async (req, res) => {
    const user = await findUser({ email: req.session.email });
    const restaurant = await restaurantModel.findOne({ _id: req.params.id });
    res.render("writeReview", { user: user, restaurant: restaurant });
});

router.post("/processReview/", upload.array('files'), async (req, res) => {
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
        console.log(uploadError);
    } else {
        console.log("No error");
        var index = 1;
        var image = {};
        req.files.forEach(file => {
            const imagefield = "image" + index.toString().padStart(2, '0');
            image[imagefield+"Buffer"] = file.buffer;
            image[imagefield+"Type"] = file.mimetype;
            index += 1;
        })
        const reviewContent = Object.assign({}, req.body, image);
        const review = new reviewModel(reviewContent);
        await review.save();
        console.log('Rewiew saved');
    }
});

module.exports = router;
