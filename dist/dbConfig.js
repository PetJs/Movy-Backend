"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
const pg = require("pg");
require("dotenv").config();
const isProduction = process.env.NODE_ENV === "production";
const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`;
const pool = new pg.Pool({
    connectionString: isProduction ? process.env.DATABASE_URL : connectionString
});
exports.pool = pool;
pool.connect()
    .then(client => {
    console.log('Connected to the database');
    client.release();
})
    .catch(err => {
    console.error('Error connecting to the database:', err);
});
//# sourceMappingURL=dbConfig.js.map