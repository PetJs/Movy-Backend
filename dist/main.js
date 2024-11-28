"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = require("dotenv");
dotenv.config();
const registerSchema_1 = require("./validators/registerSchema");
const validators_1 = require("./validators/validators");
const profileHandler_1 = require("./handlers/profileHandler");
const searchHandler_1 = require("./handlers/searchHandler");
const watchlistHandler_1 = require("./handlers/watchlistHandler");
const deleteWatchlistHandler_1 = require("./handlers/deleteWatchlistHandler");
const streamHandler_1 = require("./handlers/streamHandler");
const trendingHandler_1 = require("./handlers/trendingHandler");
const tvSearchHandler_1 = require("./handlers/tvSearchHandler");
const actionHandler_1 = require("./handlers/actionHandler");
const animeHandler_1 = require("./handlers/animeHandler");
const romanceHandler_1 = require("./handlers/romanceHandler");
const hollywoodHandler_1 = require("./handlers/hollywoodHandler");
const comedyHandler_1 = require("./handlers/comedyHandler");
const recHandler_1 = require("./handlers/recHandler");
const streamTvShowhandler_1 = require("./handlers/streamTvShowhandler");
const express = require('express');
const cors = require('cors');
const app = express();
const bcrypt = require('bcrypt');
const { pool } = require("./dbConfig");
const path = require("path");
const session = require('express-session');
const flash = require('express-flash');
const passport = require('passport');
const passportConfig_1 = require("./passportConfig");
const authControler_1 = require("./auth/authControler");
(0, passportConfig_1.initialize)(passport);
app.use(cors({
    origin: process.env.CORS_ORIGIN || "*",
    methods: ['GET', 'POST'],
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/images", express.static(path.join(__dirname, "public/images")));
app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
const PORT = process.env.PORT || 8080;
app.get('/', checkNotAuthenticated, (req, res) => {
    res.status(200).send("Hello World");
});
app.post('/register', checkAuthenticated, (0, validators_1.validate)(registerSchema_1.registerSchemaValidator), authControler_1.registerHandler);
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    console.log('Attempting login for:', email);
    pool.query(`SELECT * FROM users WHERE email = $1`, [email], async (err, results) => {
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
                }
                else {
                    console.log('Password incorrect');
                    return res.status(400).send('Password is incorrect');
                }
            }
            catch (bcryptError) {
                console.error('Bcrypt error:', bcryptError);
                return res.status(500).send('Error comparing passwords');
            }
        }
        else {
            console.log('User not found');
            return res.status(400).send('Email is not registered');
        }
    });
});
app.get('/profile/:userId', checkAuthenticated, profileHandler_1.getProfileHandler);
app.get('/search', searchHandler_1.searchHandler);
app.get('/tv-search', tvSearchHandler_1.searchTVShowHandler);
app.post('/add-watchlist', watchlistHandler_1.watchlistHandler);
app.post('/delete-from-watchlist', deleteWatchlistHandler_1.deleteFromWatchlist);
app.get('/watchlist/:userId', watchlistHandler_1.getWatchlistHandler);
app.get('/stream/:userId', checkAuthenticated, streamHandler_1.streamVideoHandler);
app.get('/stream/tv/:userId', checkAuthenticated, streamTvShowhandler_1.streamTvShowHandler);
app.get('/trending', trendingHandler_1.trendingMoviesHandler);
app.get('/action-movies', actionHandler_1.actionMoviesHandler);
app.get('/anime', animeHandler_1.animeHandler);
app.get('/romance', romanceHandler_1.romanceHandler);
app.get('/hollywood', hollywoodHandler_1.hollywoodHandler);
app.get('/comedy', comedyHandler_1.comedyHandler);
app.get("/recommendations/:movie_id", recHandler_1.recommendationsHandler);
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect("/");
    }
    next();
}
function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/login");
}
app.listen(PORT, () => {
    console.log(`server is running on localhost: ${PORT}`);
});
//# sourceMappingURL=main.js.map