const express = require("express");
const router = express.Router();
require("dotenv").config();
const pool = require("../dbconnect");

router.post("/report", async (request, response) => {
    const{report_reason, reporter_name, reported_name} = request.body;
      // get the current time, and format it as PostgreSQL Date format
    const currentDateTime = new Date();
    const formattedDate = currentDateTime
        .toISOString()
        .slice(0, 19)
        .replace("T", " ");


        try{
            const client = await pool.connect();
            console.log("Connected to db!");
            
            const fetchReporterUserIDQuery = `SELECT USER_ID FROM "User" WHERE USERNAME = $1`;
            const reporterResult = await client.query(fetchReporterUserIDQuery, [reporter_name]);
            const reporter_id = reporterResult.rows[0].user_id;
            
            const fetchReportedUserIDQuery = `SELECT USER_ID FROM "User" WHERE USERNAME = $1`;
            const reportedResult = await client.query(fetchReportedUserIDQuery, [reported_name]);
            const reported_id = reportedResult.rows[0].user_id;
    
            const submitReportQuery = `INSERT INTO "Report" (REPORT_DATE, REPORT_REASON, REPORTER_ID, REPORTED_USERID) VALUES ($1, $2, $3, $4)`;
            const reportValues = [formattedDate , report_reason, reporter_id, reported_id];
            console.log(formattedDate, report_reason, reporter_id, reported_id)
            await client.query(submitReportQuery, reportValues);

            const recordReportTimesQuery = `UPDATE "User" SET NO_OF_REPORTS = NO_OF_REPORTS + $1 WHERE USER_ID = $2`;
            const recordReportValues = [1,reported_id];
            await client.query(recordReportTimesQuery,recordReportValues);

            console.log("Reported User successfully");

            const countNoOfReportForUserQuery = `SELECT COUNT(*) AS num_reports FROM "Report" WHERE REPORTED_USERID = $1`;
            const countNoOfReportForUserResult = await client.query(countNoOfReportForUserQuery,[reported_id]);
            const noOfReports = countNoOfReportForUserResult.rows[0].num_reports;

            console.log("fetched current number of reports IS " + noOfReports)

            if(noOfReports == 3){
                const sevenDaysLater = new Date(formattedDate);
                sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
                const bannedQuery = `UPDATE "User" SET SUSPENDED = $1, SUSPENDED_UNTIL = $2 WHERE USER_ID = $3`;
                const banValues = [true, sevenDaysLater , reported_id];
                await client.query(bannedQuery, banValues);
                //kick out of room here
                //how to connect to socket and disconnect them idk
             }
            response.status(200).send({
                message: "You (" + reporter_name + ") have successfully reported " + reported_name + " for " + report_reason,
                reported_name: reported_name
              });
         client.release();
        } catch (error) {
            console.error("An error occurred:", error);
            response.status(400).send({ message: "An error occurred. Please try again later." });
        }
    
    
});

module.exports = router
