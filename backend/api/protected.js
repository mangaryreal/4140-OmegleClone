const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken")
require("dotenv").config();
const secretKey = process.env.SIGN_KEY;

/**
 * @description check the JWT sign from the user to do role-base authentications
 * 
 * @component API/auth
 * @param {HTTP_Request} req
 * @param {HTTP_Response} res
 * @returns null
 * @export {router} router
 */

router.post("/protected", async (req, res) => {
    try{
        // get the JWT token from the HTTP request
        const {jwtToken} = req.body

        // verify with the signing key
        const decode = jwt.verify(jwtToken, secretKey)
        
        res.status(200).send({decode})
        return
    } catch (e){
        res.status(400).send({message: "Cannot get cookie"})
        return
    }
})

module.exports = router