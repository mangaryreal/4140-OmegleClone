const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
require("dotenv").config();
const secretKey = process.env.SIGN_KEY;
const pool = require("../dbconnect");

/**
 * @description Login operations for users
 *
 * @component API/auth
 * @param {HTTP_Request} req
 * @param {HTTP_Response} res
 * @returns null
 * @export {router} router
 */

router.post("/login", async (req, res) => {
   
    const {username} = req.body;
  
    try {
      const client = await pool.connect();
      console.log("Connected to DB");
  
      // get username and userID from the database query
      // @param {string} username
      const accountQuery = `
        SELECT USERNAME, USER_ID
        FROM "User"
        WHERE USERNAME = $1
      `;
      const accountResult = await client.query(accountQuery, [username]);
  
      // returns Incorrect username if there has no record in the database
      if (accountResult.rows.length === 0) {
        res.status(400).send({ message: "Incorrect username" });
        client.release();
        return;
      }
  
      const {
        username: fetchedUsername,
        userID: userID,
      } = accountResult.rows[0];

      const BannedQuery = `SELECT SUSPENDED FROM "User" WHERE USERNAME = $1`;
      const SuspensionState = await client.query(BannedQuery,[username])

      if (SuspensionState.rows[0].suspended === true && username === fetchedUsername){
        res.status(400).send({ message: "YOU ARE BANNED" });
      } else if (SuspensionState.rows[0].suspended === false && username === fetchedUsername) {
        res.status(200);
        const token = jwt.sign(
          { username: fetchedUsername, userID: userID},
          secretKey
        );
        res.json({ token: token, userID: userID});
      } else {
        res.status(400).send({ validation: false });
      }
  
        client.release();

    } catch (error) {
      console.log(error);
      res
        .status(400)
        .send({ message: "An error occurred. Please try again later." });
    }
  });
  
  module.exports = router;