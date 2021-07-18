require('dotenv').config()

const PORT = process.env.PORT

const DATABASE_URL = process.env.DATABASE_URL

const TESTING_DB_NOT_EMPTY = process.env.TESTING_DB_NOT_EMPTY

module.exports = {
    PORT,
    DATABASE_URL,
    TESTING_DB_NOT_EMPTY
}