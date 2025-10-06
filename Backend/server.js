
const http = require('http');
const app = require('./app');
const listEndpoints = require('express-list-endpoints'); // ADD THIS LINE
const { initializeSocket } = require('./socket');
const port = process.env.PORT || 3000;

const server = http.createServer(app);

initializeSocket(server);

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log("--- REGISTERED ROUTES ---");   // ADD THIS LINE
    console.log(listEndpoints(app));            // ADD THIS LINE
    console.log("-----------------------");   // ADD THIS LINE
});