const config = require('../utils/config')
const { Pool } = require('pg')

const pool = new Pool({
    connectionString: config.DATABASE_URL
})

const clearDatabaseStatements = [
  'DROP TABLE public.ProductOrder',
  'DROP TABLE public.Order',
  'DROP TABLE public.Customer',
  'DROP TABLE public.Product',
  'DROP TABLE public.Category'
]

const buildDatabaseStatements = [
  'CREATE TABLE public.Category (' +
    'id SERIAL PRIMARY KEY,' +
    'category_id INTEGER DEFAULT NULL REFERENCES public.Category(id) ON DELETE RESTRICT,' +
    'name TEXT,' +
    'description TEXT DEFAULT NULL,' +
    'picture JSON DEFAULT NULL)',
  
  'CREATE TABLE public.Product (' +
    'id SERIAL PRIMARY KEY,' +
    'category_id INTEGER REFERENCES public.Category(id) ON DELETE RESTRICT,' +
    'name TEXT,' +
    'description TEXT DEFAULT NULL,' +
    'pricesAndSizes JSON,' +
    'available BOOLEAN NOT NULL,' +
    'added TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,' +
    'picture JSON DEFAULT NULL)',

  'CREATE TABLE public.Customer (' +
    'id SERIAL PRIMARY KEY,' +
    'name TEXT,' +
    'address TEXT,' +
    'mobile TEXT,' +
    'email TEXT UNIQUE,' +
    'passwordHash TEXT)',

  'CREATE TABLE public.Order (' +
    'id SERIAL PRIMARY KEY,' +
    'customer_id INTEGER REFERENCES public.Customer(id) ON DELETE RESTRICT,' +
    'orderReceived TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,' +
    'orderDispatched TIMESTAMPTZ DEFAULT NULL,' +
    'purchasePrice INTEGER NOT NULL,' +
    'customerInstructions TEXT DEFAULT NULL,' +
    'internalNotes TEXT DEFAULT NULL)',

  'CREATE TABLE public.ProductOrder (' +
    'id SERIAL PRIMARY KEY,' +
    'product_id INTEGER REFERENCES public.Product(id) ON DELETE RESTRICT,' +
    'order_id INTEGER REFERENCES public.Order(id) ON DELETE CASCADE,' +
    'priceAndSize JSON,' +
    'quantity INTEGER)'
]

const testDataInsertStatements = [
  'INSERT INTO public.Category (name, description) VALUES (\'Nissan\', \'Cars made by Nissan.\')',
  'INSERT INTO public.Category (name, category_id, description) VALUES (\'SUVs\', 1, \'SUVs made by Nissan.\')',
  'INSERT INTO public.Category (name, description) VALUES (\'Toyota\', \'Cars made by Toyota.\')'
]

module.exports = {
    async query(text, params) {
      const res = await pool.query(text, params)
      return res
    },
    async transactionConnection() {
      return pool.connect()
    },
    async endPool() {
      await pool.end()
    }
}