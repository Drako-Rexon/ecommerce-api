const { default: mongoose } = require("mongoose");

const dbConnect = () => {
    try {
        mongoose.set('strictQuery', true);

        const dbConnection = mongoose.connect(process.env.MONGODB_URL);
        console.log("Connection to DB Successful");
    } catch (err) {
        console.log("Error in Connection to DB: ", err);
        // throw new Error(err);
    }
}

module.exports = dbConnect;