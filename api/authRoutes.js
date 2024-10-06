const express = require('express')
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { Sequelize } = require('sequelize');
const sequelize = new Sequelize( process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql'
});
sequelize.authenticate()
.then(() => {
    console.log('Connection has been established successfully.');
}
).catch(err => {
    console.error('Unable to connect to the database:', err);
});

const users = sequelize.define('users', {
    username: {
        type: Sequelize.STRING,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    }
});
sequelize.sync();
const createToken = (user) => {
   return jwt.sign( {id : user.id , username: user.username},process.env.JWT_SECRET,
     { expiresIn: process.env.JWT_EXPIRES_IN} );
}

const register = async (req, res) => {
    const {username, password} = req.query;
    const user = await users.findOne({where: {username}})
    if (user) {
        return res.status(400).json({message: 'User already exists'});
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    users.create({username, password: hashedPassword})
    .then((user) => {
        const token = createToken(user);
        res.status(201).json({message: 'User created successfully', token})
    })
    .catch((err) => {
        res.status(500).json({message: 'Error creating user'})
    });
}
const login = async (req, res) => {
    const {username, password} = req.query;
    const user = await users.findOne({where: {username}})
    .then((user) => {
        if (!user) {
            return res.status(400).json({message: 'User not found'});
        }
        bcrypt.compare(password, user.password)
        .then((match) => {
            if (!match) {
                return res.status(401).json({message: 'Incorrect password'});
            }
            const token = createToken(user);
            res.status(200).json({message: 'User logged in successfully', token});
        })
        .catch((err) => {
            res.status(500).json({message: 'Error logging in'});
        });
    }).catch((err) => {
        res.status(500).json({message: 'Error logging in'});
    });
}
router.post('/', (req, res) => {
    res.send("heloo")
})
router.post('/register',register);
router.post("/login",login);
module.exports = router;