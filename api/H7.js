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
    db.connect((err) => {
      if (err) {
        console.log('error when connecting to db: ', err);
        console.log('Retrying...');
        setTimeout(connectWithRetry, 5000); 
      } else {
        console.log('connected!');
      }
    });
  };

router.get("/users",(req, res)=> {
    console.log("/users")
        dbConn.query("Select * from users", function (err, result) {
            if(err) {
              console.log("error: ", err);
              res.send(err)
            } else
            {
                console.log('users : ', result);
                res.send(result);
            }
    })

})
router.get("/users/:id",(req, res) => {
    const user_id = req.params.id;
    console.log(user_id);
    dbConn.query("Select * from users where user_id = ?", [user_id], function(err,result) {
        if (err) {
            console.log("error: ", err);
            res.send(err);
        }
        else {
            console.log(result);
            res.send(result);
        }
    })
});
app.use(router);
app.listen(port,() => {
    console.log(`Server is running on port ${port}`);
});