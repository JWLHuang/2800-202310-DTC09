const express = require('express');
const router = express.Router();
const { findUser } = require("./findUser");
const restaurantModel = require("./models/restaurantModel");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });

router.use(express.json({ limit: '50mb' }));

router.get("/writeReview/:id?", async (req, res) => {
    const user = await findUser({ email: req.session.email });
    const restaurant = await restaurantModel.findOne({ _id: req.params.id });
    res.render("writeReview", { user: user, restaurant: restaurant });
});

router.post("/processReview/", upload.array('files'), async (req, res) => {
    console.log(req.body)
    console.log(req.files)
});

module.exports = router;
