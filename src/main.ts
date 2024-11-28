import { Request, Response } from "express";
import * as dotenv from 'dotenv';
dotenv.config();
import { registerSchemaValidator} from "./validators/registerSchema";
import { validate } from "./validators/validators";
import { getProfileHandler } from "./handlers/profileHandler";
import { searchHandler } from "./handlers/searchHandler";
import { watchlistHandler, getWatchlistHandler } from "./handlers/watchlistHandler"; 
import { deleteFromWatchlist } from "./handlers/deleteWatchlistHandler";
import { streamVideoHandler } from "./handlers/streamHandler";
import { trendingMoviesHandler } from "./handlers/trendingHandler";
import { searchTVShowHandler } from "./handlers/tvSearchHandler";
import { actionMoviesHandler } from "./handlers/actionHandler";
import { animeHandler } from "./handlers/animeHandler";
import { romanceHandler } from "./handlers/romanceHandler";
import { hollywoodHandler } from "./handlers/hollywoodHandler";
import { comedyHandler } from "./handlers/comedyHandler";
import { recommendationsHandler } from "./handlers/recHandler";
import { streamTvShowHandler } from "./handlers/streamTvShowhandler";


const express = require('express')
const cors = require('cors');
const app = express()
const bcrypt = require('bcrypt')
const {pool} = require("./dbConfig")
const path = require("path");
const session = require('express-session')
const flash = require('express-flash')
const passport = require('passport')

import { initialize } from './passportConfig';
import { registerHandler } from "./auth/authControler";

initialize(passport)

app.use(cors({
    origin: process.env.CORS_ORIGIN || "*", 
    methods: ['GET', 'POST'],
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({extended: false}))

app.use("/images", express.static(path.join(__dirname, "public/images")));

app.use(session({
    secret: "secret",

    resave: false,

    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())

app.use(flash())

const PORT = process.env.PORT || 8080;

app.get('/', checkNotAuthenticated,  (req: Request, res: Response) => {
    res.status(200).send("Hello World")
})

app.post('/register',checkAuthenticated, validate(registerSchemaValidator),registerHandler)

app.post('/login', async (req: Request, res: Response) => {
    const { email, password } = req.body;
    console.log('Attempting login for:', email);

    pool.query(
        `SELECT * FROM users WHERE email = $1`,
        [email],
        async (err: Error, results: { rows: { id: number, email: string, password: string }[] }) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).send('Database error');
            }

            console.log('Database results:', results.rows);

            if (results.rows.length > 0) {
                const user = results.rows[0];

                try {
                    const isMatch = await bcrypt.compare(password, user.password);

                    if (isMatch) {
                        console.log('Password match success');
                        return res.status(201).send({
                            message: 'Login successful',
                            userId: user.id,  
                          });
                    } else {
                        console.log('Password incorrect');
                        return res.status(400).send('Password is incorrect');
                    }
                } catch (bcryptError) {
                    console.error('Bcrypt error:', bcryptError);
                    return res.status(500).send('Error comparing passwords');
                }
            } else {
                console.log('User not found');
                return res.status(400).send('Email is not registered');
            }
        }
    );
});

app.get('/profile/:userId', checkAuthenticated, getProfileHandler);

app.get('/search', searchHandler)

app.get('/tv-search', searchTVShowHandler)

app.post('/add-watchlist', watchlistHandler)

app.post('/delete-from-watchlist', deleteFromWatchlist)

app.get('/watchlist/:userId', getWatchlistHandler)

app.get('/stream/:userId', checkAuthenticated, streamVideoHandler);

app.get('/stream/tv/:userId', checkAuthenticated, streamTvShowHandler);

app.get('/trending', trendingMoviesHandler)

app.get('/action-movies', actionMoviesHandler)

app.get('/anime', animeHandler)

app.get('/romance', romanceHandler)

app.get('/hollywood', hollywoodHandler)

app.get('/comedy', comedyHandler)

app.get("/recommendations/:movie_id", recommendationsHandler);


function checkAuthenticated(req:Request, res:Response, next: ()=>{}){
    if(req.isAuthenticated()){
        return res.redirect("/")
    }
    next()
}

function checkNotAuthenticated(req:Request, res:Response, next: ()=>{}){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect("/login")
}

app.listen(PORT, ()=>{
    console.log(`server is running on localhost: ${PORT}`)
})