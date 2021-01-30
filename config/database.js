require('dotenv').config();

// Database Configuration
module.exports = {
    database: `mongodb+srv://admin-dondon28:${process.env.MONGODB_ATLAS_PW}@cluster0.loiov.mongodb.net/MedSpec_UsersDB`,
    dbOptions: {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
}