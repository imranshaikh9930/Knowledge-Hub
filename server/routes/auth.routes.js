const express = require("express");
const {loginController,registerController} = require("../controllers/auth.controller");
const router = express.Router();

router.get("/", async (req, res) => {

    res.send("Ye mera Project hain ");

});


router.post("/register",registerController)

router.post("/login",loginController)

module.exports = router;