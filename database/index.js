require('dotenv').config()
const { Pool } = require('pg')

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
})

module.exports = {
    async query(text, params) {
      const res = await pool.query(text, params)
      return res
    }
}