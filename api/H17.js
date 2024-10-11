require('dotenv').config({path: "../.env"});
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const jwt = require('jsonwebtoken'); 
const app = express();
const authenticateJWT = require('./authenticateJWT');
const swaggerConfig = require('../swagger');
swaggerConfig(app);
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));
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
const googleAccount = sequelize.define('googleAccount', {
    googleId: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    }
});
sequelize.sync();
app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
}, function(accessToken, refreshToken, profile, done) {
  googleAccount.findOrCreate({
    where: {googleId: profile.id}, 
    defaults: {email: profile.email, name: profile.displayName}})
  .then(([user, created]) => {
    return done(null, user);
  })
  .catch(err => {
        return done(err, null);
    });
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

app.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
  const token = jwt.sign({
    id: req.user.googleId,
    name: req.user.name,
    email: req.user.email
  }, process.env.JWT_SECRET, 
    { expiresIn :  process.env.JWT_EXPIRES_IN }
  );
  
  res.status(200).json({ message: 'Login successful', token });
});
/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Returns the profile of the logged-in user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 *       401:
 *         description: Unauthorized
 */
app.get('/profile',authenticateJWT, (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.send(`Hello, ${req.user.name}!`);
});

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
