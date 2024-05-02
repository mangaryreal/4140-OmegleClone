const express = require("express");
const router = express.Router();

router.post("/register", async (request, response) => {
    response.status(200).send({userID: generateUserID()});
});

function generateUserID() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const minLength = 12;
    const maxLength = 16;
    const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
    let userID = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        userID += characters.charAt(randomIndex);
    }


    return userID;
}

module.exports = router
