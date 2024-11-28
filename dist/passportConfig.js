"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initialize = initialize;
const passport_local_1 = require("passport-local");
const dbConfig_1 = require("./dbConfig");
const bcrypt = require('bcrypt');
function initialize(passport) {
    const strategyOptions = {
        usernameField: 'email',
        passwordField: 'password',
    };
    const authenticateUser = async (email, password, done) => {
        console.log('Attempting login for:', email);
        dbConfig_1.pool.query(`SELECT * FROM users WHERE email = $1`, [email], async (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return done(err);
            }
            console.log('Database results:', results.rows);
            if (results.rows.length > 0) {
                const user = results.rows[0];
                const isMatch = await bcrypt.compare(password, user.password);
                if (isMatch) {
                    console.log('Password match success');
                    return done(null, user);
                }
                else {
                    console.log('Password incorrect');
                    return done(null, false, { message: 'Password is incorrect' });
                }
            }
            else {
                console.log('User not found');
                return done(null, false, { message: 'Email is not registered' });
            }
        });
    };
    passport.use(new passport_local_1.Strategy(strategyOptions, authenticateUser));
    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser(async (id, done) => {
        try {
            const result = await dbConfig_1.pool.query(`SELECT * FROM users WHERE id = $1`, [id]);
            if (result.rows.length > 0) {
                return done(null, result.rows[0]);
            }
            else {
                return done(null, false);
            }
        }
        catch (error) {
            console.error('Error in deserializeUser:', error);
            return done(error);
        }
    });
}
//# sourceMappingURL=passportConfig.js.map