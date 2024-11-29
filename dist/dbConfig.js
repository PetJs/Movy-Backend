"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
const pg_1 = require("pg");
const dotenv = require("dotenv");
dotenv.config();
const isProduction = process.env.NODE_ENV === "production";
const connectionString = isProduction
    ? process.env.DATABASE_URL
    : `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`;
console.log('Connecting to database using:', isProduction ? 'DATABASE_URL' : 'local connection string');
const pool = new pg_1.Pool({
    connectionString,
    ssl: isProduction ? { rejectUnauthorized: false } : false,
});
exports.pool = pool;
pool.connect()
    .then(client => {
    console.log('Connected to the database');
    client.release();
})
    .catch(err => {
    console.error('Error connecting to the database:', err);
    process.exit(1);
});
//# sourceMappingURL=dbConfig.js.map