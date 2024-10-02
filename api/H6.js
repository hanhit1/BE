const express = require('express');
const app = express();
const port = 5000;
const router = express.Router();
router.use("/", (req, res, next) => {
    console.log('Request Type:', req.method)
  next();
})
app.get('/',router, (req, res) => {
    res.send("hello world")
});
app.listen(port,() => {
    console.log(`Server is running on port ${port}`);
});