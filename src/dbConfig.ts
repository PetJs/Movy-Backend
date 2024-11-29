import { Pool } from 'pg';
import * as dotenv from 'dotenv';
dotenv.config();

const isProduction = process.env.NODE_ENV === "production";


const connectionString = isProduction 
  ? process.env.DATABASE_URL 
  : `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`;


const pool = new Pool({
  connectionString,
  ssl: isProduction ? { rejectUnauthorized: false } : false, 
});

pool.connect()
  .then(client => {
    console.log('Connected to the database');
    client.release(); 
  })
  .catch(err => {
    console.error('Error connecting to the database:', err);
    process.exit(1); 
  });

export { pool };
