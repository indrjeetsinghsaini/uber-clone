const mongoose = require('mongoose');

function connectToDb() {
    // FIX 1: Using MONGODB_URI and FIX 2: Adding the closing parenthesis for the function call
    mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to DB');
    })
    .catch(err => {
        console.log('DB CONNECTION ERROR:', err); // Added better logging for future debugging
    });
}

module.exports = connectToDb;
