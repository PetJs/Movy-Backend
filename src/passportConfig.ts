import { Strategy as LocalStrategy, IStrategyOptions } from 'passport-local';
import { pool } from './dbConfig';
import { PassportStatic } from 'passport';

const bcrypt = require('bcrypt')

interface User {
    id: number;
    email: string;
    password: string;
}

export function initialize(passport: PassportStatic): void {
    const strategyOptions: IStrategyOptions = {
        usernameField: 'email', // Field in the request payload to be used as username
        passwordField: 'password', // Field in the request payload to be used as password
    };

    const authenticateUser = async (email: string, password: string, done: any) => {
        console.log('Attempting login for:', email);  // Debug log
        pool.query(
            `SELECT * FROM users WHERE email = $1`,
            [email],
            async (err, results) => {
                if (err) {
                    console.error('Database error:', err);
                    return done(err);
                }
    
                console.log('Database results:', results.rows); // Log database results
    
                if (results.rows.length > 0) {
                    const user = results.rows[0];
    
                    // Check if the password matches
                    const isMatch = await bcrypt.compare(password, user.password);
                    if (isMatch) {
                        console.log('Password match success');
                        return done(null, user);
                    } else {
                        console.log('Password incorrect');
                        return done(null, false, { message: 'Password is incorrect' });
                    }
                } else {
                    console.log('User not found');
                    return done(null, false, { message: 'Email is not registered' });
                }
            }
        );
    };
    
    passport.use(new LocalStrategy(strategyOptions, authenticateUser));

    // Serialize user for session storage
    passport.serializeUser((user: User, done) => done(null, user.id));

    // Deserialize user to attach to request object
    passport.deserializeUser(async (id, done) => {
        try {
            const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [id]);

            if (result.rows.length > 0) {
                return done(null, result.rows[0]);
            } else {
                return done(null, false);
            }
        } catch (error) {
            console.error('Error in deserializeUser:', error);
            return done(error);
        }
    });
}
