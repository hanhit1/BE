const express = require('express');
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
/**
 * @swagger
 * /my-profile/{id}:
 *   get:
 *     summary: Get user profile by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user ID
 *     responses:
 *       200:
 *         description: A user object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user_id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 phone:
 *                   type: string
 *                 address:
 *                   type: string
 *                 email:
 *                   type: string
 *                 password:
 *                   type: string
 */
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
/**
 * @swagger
 * /list-rooms:
 *   get:
 *     summary: Get a list of booked rooms
 *     description: Retrieves a paginated list of rooms that have been booked, optionally filtered by hotel name. Only rooms with a checkout date greater than the current date are included.
 *     parameters:
 *       - in: query
 *         name: limit
 *         required: false
 *         description: Number of rooms to return per page (default is 10).
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         required: false
 *         description: Page number to retrieve (default is 1).
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         required: false
 *         description: A string to filter the list of rooms by hotel name.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of booked rooms with their details.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     description: The name of the room.
 *                   area:
 *                     type: number
 *                     description: The area of the room in square meters.
 *                   floor:
 *                     type: integer
 *                     description: The floor number where the room is located.
 *                   type:
 *                     type: string
 *                     description: The type of the room (e.g., Single, Double, Suite).
 *                   price:
 *                     type: number
 *                     description: The price of the room per night.
 *                   hotel_name:
 *                     type: string
 *                     description: The name of the hotel where the room is located.
 *                   checkin_date:
 *                     type: string
 *                     format: date
 *                     description: The date when the room can be checked in.
 *                   checkout_date:
 *                     type: string
 *                     format: date
 *                     description: The date when the room can be checked out.
 *       500:
 *         description: Internal server error.
 */
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
/**
 * @swagger
 * /bookings/{id}/room:
 *   get:
 *     summary: Get a room by booking ID
 *     description: room details by booking ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The booking ID.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A room with its details.
 *         content:
 *           application/json:
 *             schema:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     description: The name of the room.
 *                   area:
 *                     type: number
 *                     description: The area of the room in square meters.
 *                   floor:
 *                     type: integer
 *                     description: The floor number where the room is located.
 *                   type:
 *                     type: string
 *                     description: The type of the room (e.g., Single, Double, Suite).
 *                   price:
 *                     type: number
 *                     description: The price of the room per night.
 *       500:
 *         description: Internal server error.
 */

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
/**
 * @swagger
 * /user/{id}/review:
 *   get:
 *     summary: Get list reviews by user ID
 *     description: list reviews by user ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The user ID.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A list of reviews.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: 
 *                  type: object
 *                  properties:
 *                   review_id:
 *                     type: string
 *                   hotel_id:
 *                     type: number
 *                   user_id:
 *                     type: integer
 *                   rating:
 *                     type: integer
 *                   comment:
 *                     type: string
 *                   created_at:
 *                     type: string
 *                     format: date
 *       500:
 *         description: Internal server error.
 */
router.get("/user/:id/review",(req, res) => {
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
module.exports = router;
// app.use(router);
// app.listen(port,() => {
//     console.log(`Server is running on port ${port}`);
// });