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
   
    const {userID} = req.body;
  
    try {
      const client = await pool.connect();
      console.log("Connected to DB");
  
      // get username and userID from the database query
      // @param {string} username
      const accountQuery = `
      SELECT USERNAME, USER_ID
      FROM "User"
      WHERE USER_ID = $1
    `;
    const accountResult = await client.query(accountQuery, [userID]);
      // returns Incorrect username if there has no record in the database
      if (accountResult.rows.length === 0) {
        res.status(400).send({ message: "Incorrect user ID" });
        client.release();
        return;
      }
  
      const {
        user_id: fetchedUserID,
        username: fetchedUsername,
      } = accountResult.rows[0];

      const BannedQuery = `SELECT SUSPENDED FROM "User" WHERE USER_ID = $1`;
      const SuspensionState = await client.query(BannedQuery,[userID])

      if (SuspensionState.rows[0].suspended === true && userID === fetchedUserID){//banned
        const BannedTimeQuery = `SELECT SUSPENDED_UNTIL FROM "User" WHERE USER_ID = $1`;
        const BannedTimeResult = await client.query(BannedTimeQuery, [userID]);
        const suspendedUntil = BannedTimeResult.rows[0].suspended_until;
        console.log(suspendedUntil);

        const currentDateTime = new Date();
        const formattedDate = currentDateTime;
        console.log(formattedDate);
        console.log(suspendedUntil <= formattedDate)

        if (suspendedUntil <= formattedDate) {//time to unban

          ////////correct below
          const UnbanQuery = `UPDATE "User"
          SET NO_OF_REPORTS = 0, SUSPENDED = FALSE, SUSPENDED_UNTIL = NULL
          WHERE USER_ID = $1`;
          await client.query(UnbanQuery, [userID])

          const clearReportQuery = `DELETE FROM "Report" WHERE REPORTED_USERID = $1`;
          await client.query(clearReportQuery, [userID])
          /////////correct above
          //login
          const token = jwt.sign(
            { username: fetchedUsername, userID: fetchedUserID},
            secretKey
          );
          res.status(200).json({
            message: "Today is " + formattedDate + ". You are unbanned!",
            token: token,
            userID: fetchedUserID
          });
        } else {//still banned
          // The user is still suspended
          res.status(400).send({
            message: "You are BANNED until " + suspendedUntil,
            validation: false
          });
        }
      } else if (SuspensionState.rows[0].suspended === false && userID === fetchedUserID) {//no banned

        const token = jwt.sign(
          { username: fetchedUsername, userID: fetchedUserID},
          secretKey
        );
        res.status(200).json({ token: token, userID: fetchedUserID});
      
      } else {//cant login
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