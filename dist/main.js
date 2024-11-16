"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = require("dotenv");
dotenv.config();
const registerSchema_1 = require("./validators/registerSchema");
const validators_1 = require("./validators/validators");
const profileHandler_1 = require("./handlers/profileHandler");
const express = require('express');
const cors = require('cors');
const app = express();
const bcrypt = require('bcrypt');
const { pool } = require("./dbConfig");
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
app.use(session({
    secret: "secret",
    resave: false,
    saveUninitailized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
const PORT = process.env.PORT || 8080;
app.get('/', checkNotAuthenticated, (req, res) => {
    res.status(200).send("Hello World");
});
app.post('/register', checkAuthenticated, (0, validators_1.validate)(registerSchema_1.registerSchemaValidator), authControler_1.registerHandler);
app.post('/login', passport.authenticate('local', {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true
}));
app.get('/profile/:userId', checkAuthenticated, profileHandler_1.getProfileHandler);
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