const express = require('express');
const app = express();
const port = 5000;
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const session = require('express-session');
const Passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
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
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({ secret: process.env.SESSION_SECRET,
   resave: false,
   saveUninitialized: true, 
  }));
app.use(Passport.initialize());
app.use(Passport.session());
Passport.use(new LocalStrategy(
    function(username, password, done) {
        users.findOne({where: {username}})
        .then((user) => {
            if (!user) {
                return done(null, false);
            }
            bcrypt.compare(password, user.password)
            .then((match) => {
                if (!match) {
                    return done(null, false);
                }
                return done(null, user);
            }).catch((err) => {
                return done(err);
            });
        }).catch((err) => {
            return done(err);
        });
    }
));
Passport.serializeUser(function(user, done) {
    done(null, user.id);
});
Passport.deserializeUser(function(id, done) {
    users.findByPk(id)
    .then((user) => {
        done(null, user);
    }).catch((err) => {
        done(err);
    });
});
app.post('/login', Passport.authenticate('local', { failureRedirect: '/login' }), (req, res) => {
    const token = jwt.sign( {id : req.user.id , username: req.user.username},process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN} );
    res.status(200).json({message: 'User logged in successfully', token});
});
app.listen(port, () => {
    console.log("server is running ");
})
