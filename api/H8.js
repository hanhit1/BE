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
            console.log("error: ", err);
            res.send(err);
        }
        else {
            console.log(result);
            res.send(result);
        }
    })
})
router.get("/list-rooms", (req ,res) => {
    console.log("/list-rooms");
    const limit = parseInt(req.query.limit) || 10;  
    const page = parseInt(req.query.page) || 1;    
    const search = req.query.search || '';     
    const offset = (page - 1) * limit;
    dbConn.query(`SELECT rooms.name, area, floor, type, price, hotels.name as hotel_name, checkin_date, checkout_date
                  FROM reservations
                  INNER JOIN rooms ON reservations.room_id = rooms.room_id
                  INNER JOIN hotels ON rooms.hotel_id = hotels.hotel_id
                  WHERE reservations.checkout_date > NOW() AND hotels.name like ?
                  ORDER BY reservations.created_at DESC
                  LIMIT ? OFFSET ?` 
                  ,[`%${search}%`, limit, offset] ,(err ,result) => {
        if (err) {
            console.log("error: ", err);
            res.send(err);
        }
        else {
            console.log(result);
            res.send(result);
        } 
    })
})
router.get("/bookings/:id/room",(req, res) => {
    const id = req.params.id;
    dbConn.query(`SELECT name, area, floor, type, price 
                  FROM reservations
                  INNER JOIN rooms ON reservations.room_id = rooms.room_id
                  WHERE reservations.reservation_id = ?`
                   , [id], (err, result) =>{
        if (err) {
            console.log("error: ", err);
            res.send(err);
        }
        else {
            console.log(result);
            res.send(result); 
        }
    })
})
router.get("/user/:id/review/",(req, res) => {
    const id = req.params.id;
    dbConn.query(`SELECT * 
                  FROM hotel_reviews
                  WHERE user_id = ?`
                   , [id], (err, result) =>{
        if (err) {
            console.log("error: ", err);
            res.send(err);
        }
        else {
            console.log(result);
            res.send(result); 
        }
    })
})
app.use(router);
app.listen(port,() => {
    console.log(`Server is running on port ${port}`);
});