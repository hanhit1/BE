const express = require('express')
const jwt = require('jsonwebtoken');
require('dotenv').config();
const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    console.log(token);
    if (!token) {
        res.status(403).json({message: "Token missing"})
    }
    try {
        decoded = jwt.verify(token,process.env.JWT_SECRET)
        console.log("decoded: ", decoded)
        req.user = decoded;
        next();
    }
    catch (err){
        return res.status(401).json({ message: "Invalid or expired token" });
    }
}
module.exports = authenticateJWT;