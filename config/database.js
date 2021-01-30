require('dotenv').config();

module.exports = {
    database: `mongodb+srv://admin-dondon28:${process.env.MONGODB_ATLAS_PW}@cluster0.loiov.mongodb.net/MedSpec_Users`,
    dbOptions: {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
}