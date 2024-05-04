const express = require("express");
const router = express.Router();
require("dotenv").config();
const pool = require("../dbconnect");


router.post("/register", async (request, response) => {
    const {username} = request.body;
    let userID = generateUserID();

    if (!username) {
        response.status(400).send({ message: "Username is required" });
        return;
    }

    try{
        const client = await pool.connect();
        // console.log("Connected to db!");
        let duplicatedUserID = 1;

        do{
            const checkUserIDQuery = `SELECT * FROM "User" WHERE USER_ID = $1`;
            const checkUsernameResult = await client.query(checkUserIDQuery, [userID]);
            duplicatedUserID = checkUsernameResult.rows.length
            if (duplicatedUserID > 0){
                userID = generateUserID();
            }
        } while (duplicatedUserID !== 0)

        
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

        response.status(200).send({ message: "Successful registration, Your User ID is " + userID + ". Please remember your User ID, it is the only way to log in." });
    
        client.release();
    } catch (error) {
        console.error("An error occurred:", error);
        response.status(400).send({ message: "An error occurred. Please try again later." });
    }

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
