const config = require('../utils/config')
const { Pool } = require('pg')

const pool = new Pool({
    connectionString: config.DATABASE_URL
})

module.exports = {
    async query(text, params) {
      const res = await pool.query(text, params)
      return res
    },
    async transactionConnection() {
      return pool.connect()
    }
}