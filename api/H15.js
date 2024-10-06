const express = require('express');
const app = express();
const port = 5000;
const authRoutes = require('./authRoutes.js')
const authenticateJWT = require('./authenticateJWT.js')
app.use(express.json());

app.use("/api/auth",authRoutes)
app.get('/protected', authenticateJWT, (req, res) => {
  res.status(200).json({ message: 'Access granted', user: req.user });
});
app.listen(port, () => {
  console.log("server is running ");
})