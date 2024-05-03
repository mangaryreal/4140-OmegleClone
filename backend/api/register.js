const express = require("express");
const router = express.Router();
require("dotenv").config();
const pool = require("../dbconnect");


router.post("/register", async (request, response) => {
    const {username} = request.body;
    const userID = generateUserID();

    if (!username) {
        response.status(400).send({ message: "Username is required" });
        return;
    }

    try{
        const client = await pool.connect();
        console.log("Connected to db!");
        const checkUsernameQuery = `SELECT * FROM "User" WHERE USERNAME = $1`;
        const checkUsernameResult = await client.query(checkUsernameQuery, [username]);
    
        if (checkUsernameResult.rows.length > 0) {
          response.status(400).send({ message: "Duplicated username" });
          client.release();
          return;
        }

        const insertUserQuery = `INSERT INTO "User" (USER_ID, USERNAME) VALUES ($1, $2)`;
        const insertUserValues = [userID,username];
        await client.query(insertUserQuery, insertUserValues);

        console.log("User data inserted successfully");

        response.status(200).send({ message: "Successful registration" });
    
        client.release();
    } catch (error) {
        console.error("An error occurred:", error);
        response.status(400).send({ message: "An error occurred. Please try again later." });
    }

   // response.status(200).send({userID: generateUserID()});

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
