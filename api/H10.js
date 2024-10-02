const express = require('express');
const app = express();
const port = 5000;
const router = express.Router();
const mysql = require('mysql');
const dbConn = mysql.createConnection({
  host     : 'localhost',
  user     : 'hanhpro',
  password : '152004',
  database : 'hotel_booking_system'
});
const connectWithRetry = () => {
    dbConn.connect((err) => {
      if (err) {
        console.log('error when connecting to db: ', err);
        console.log('Retrying...');
        setTimeout(connectWithRetry, 5000); 
      } else {
        console.log('connected!');
      }
    });
  };
  router.get("/my-profile/:id", (req, res) => {
    const user_id = req.params.id;
    console.log(user_id);
    dbConn.query("Select * from users where user_id = ?", [user_id], function(err,result) {
        if (err) {
            res.status(500).json({
                status: 'error',
                message: 'Internal server error'
            });
        } else {
            res.status(200).json({
                status: 'success',
                data: result
            });
        }
    })
})
app.use(router);
app.listen(port,() => {
    console.log(`Server is running on port ${port}`);
});