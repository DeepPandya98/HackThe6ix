const express = require('express');
const app = express();

app.use((req, res, next) => {
    console.log(`Request: ${req.method} ${req.originalUrl}`);
    next();
})
app.use(express.json());

// Routing
const dashboard = require('./routes/dashboard.js');
app.use('/', dashboard);

// Start server on post 4201
app.listen(4201, '127.0.0.1', () => {
    console.log('server listening on 4201');
});
