require('dotenv').config()

const PORT = process.env.PORT

const DATABASE_URL = process.env.DATABASE_URL

const ADMIN_EMAIL = process.env.ADMIN_EMAIL
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH

module.exports = {
    PORT,
    DATABASE_URL,
    ADMIN_EMAIL,
    ADMIN_PASSWORD_HASH
}