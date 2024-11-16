import { Strategy as LocalStrategy, IStrategyOptions} from 'passport-local';
import { pool } from './dbConfig';
import bcrypt from 'bcrypt';
import { PassportStatic } from 'passport';


interface User {
    id: number;
    email: string;
    password: string;
}

export function initialize(passport: PassportStatic): void{
    const strategyOptions: IStrategyOptions = {
        usernameField: 'email', 
        passwordField: 'password', 
    };

    const authenticateUser = async(
        email: string, 
        password: string, 
        done: (error: any, user?: false | { [key: string]: any }, options?: { message: string }) => void)=>{

        pool.query(
            `Select * FROM users WHERE email = $1`,
            [email],
            async (err: Error, results: {rows: any[]})=>{
                if(err){
                    throw err;
                }
                console.log(results.rows);

                if(results.rows.length > 0){
                    const user = results.rows[0];

                    const isMatch = await bcrypt.compare(password, user.password, (err, isMatch)=>{
                        if(err){
                            throw err
                        }
                        if(isMatch){
                            return done(null, user)
                        }else{
                            return done(null, false, { message: 'Password is incorrect' })
                        }
                    })
                }else{
                    return done(null, false, {message: "Email is not register"})
                }
            }
        )
    }

    passport.use(
        new LocalStrategy(
            strategyOptions,
            authenticateUser
        )
    )

    passport.serializeUser((user:User, done)=>done(null, user.id))

    passport.deserializeUser((id, done)=>{
        pool.query(
            `SELECT * FROM users WHERE id = $1`, [id], (err, results) => {
                if(err){
                    throw err;
                }
                return done(null, results.rows[0])
            }
        )
    })
}