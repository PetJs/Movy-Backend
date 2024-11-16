"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialize = initialize;
const passport_local_1 = require("passport-local");
const dbConfig_1 = require("./dbConfig");
const bcrypt_1 = require("bcrypt");
function initialize(passport) {
    const strategyOptions = {
        usernameField: 'email',
        passwordField: 'password',
    };
    const authenticateUser = async (email, password, done) => {
        dbConfig_1.pool.query(`Select * FROM users WHERE email = $1`, [email], async (err, results) => {
            if (err) {
                throw err;
            }
            console.log(results.rows);
            if (results.rows.length > 0) {
                const user = results.rows[0];
                const isMatch = await bcrypt_1.default.compare(password, user.password, (err, isMatch) => {
                    if (err) {
                        throw err;
                    }
                    if (isMatch) {
                        return done(null, user);
                    }
                    else {
                        return done(null, false, { message: 'Password is incorrect' });
                    }
                });
            }
            else {
                return done(null, false, { message: "Email is not register" });
            }
        });
    };
    passport.use(new passport_local_1.Strategy(strategyOptions, authenticateUser));
    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser((id, done) => {
        dbConfig_1.pool.query(`SELECT * FROM users WHERE id = $1`, [id], (err, results) => {
            if (err) {
                throw err;
            }
            return done(null, results.rows[0]);
        });
    });
}
//# sourceMappingURL=passportConfig.js.map