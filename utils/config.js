require('dotenv').config()

let PORT = process.env.PORT

let DATABASE_URL
if(process.env.NODE_ENV === 'production') DATABASE_URL = process.env.DATABASE_URL
else if(process.env.NODE_ENV === 'development') DATABASE_URL = process.env.DATABASE_URL
else if(process.env.NODE_ENV === 'test') DATABASE_URL = process.env.DATABASE_URL

module.exports = {
    PORT,
    DATABASE_URL
}