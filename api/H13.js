const express = require('express');
const app = express();
const port = 5000;
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('swagger-jsdoc');
const basicAuth = require('express-basic-auth');
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'My API',
      version: '1.0.0',
      description: 'API Documentation for my Node.js app'
    },
    servers: [
      {
        url: 'http://localhost:5000'
      }
    ]
  },
  apis: ['./api/*.js'] 
};
const swaggerDocs = swaggerDocument(swaggerOptions);
app.use('/docs', basicAuth({
  users: {
    'admin': '0000',
    'hanhpro': '152004'
   }, 
  challenge: true
}),
  swaggerUi.serve, 
  swaggerUi.setup(swaggerDocs)
);
app.get('/api', (req, res) => {
  res.send('Hello, API');
});
const router1 = require('./api/H8.js');
const router2 = require('./api/H7.js');
app.use(router1, router2);
app.listen(port, () => {
  console.log('Server running on port 5000');
});
