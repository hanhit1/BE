require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy; 
const app = express();

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

const { Sequelize } = require('sequelize');
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: 'mysql'
});

sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

const facebookAccount = sequelize.define('facebookAccount', {
  facebookId: {
    type: Sequelize.STRING,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    allowNull: true
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false
  }
});

sequelize.sync();

app.use(passport.initialize());
app.use(passport.session());

passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: "http://localhost:5000/auth/facebook/callback"
},
function(accessToken, refreshToken, profile, done) {
  const email = profile?.emails && profile.emails[0] ? profile.emails[0].value : null;
  facebookAccount.findOrCreate({
    where: { facebookId: profile.id },
    defaults: { email: email, name: profile.displayName }
  })
  .then(([user, created]) => {
    return done(null, user);
  })
  .catch(err => {
    return done(err, null);
  });
}
));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

app.get('/auth/facebook', passport.authenticate('facebook', {
  scope: ['email']
}));

app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/' }), (req, res) => {
  res.redirect('/profile');
});

app.get('/profile', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.send(`Hello, ${req.user.name}!`);
});

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});