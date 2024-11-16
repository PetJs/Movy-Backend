import { Request, Response } from "express";
import * as dotenv from 'dotenv';
dotenv.config();
import { registerSchemaValidator} from "./validators/registerSchema";
import { validate } from "./validators/validators";
import { getProfileHandler } from "./handlers/profileHandler";



const express = require('express')
const cors = require('cors');
const app = express()
const bcrypt = require('bcrypt')
const {pool} = require("./dbConfig")
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

app.use(session({
    secret: "secret",

    resave: false,

    saveUninitailized: false
}))
app.use(passport.initialize())
app.use(passport.session())

app.use(flash())

const PORT = process.env.PORT || 8080;

app.get('/', checkNotAuthenticated,  (req: Request, res: Response) => {
    res.status(200).send("Hello World")
})

app.post('/register',checkAuthenticated, validate(registerSchemaValidator),registerHandler)

app.post('/login', passport.authenticate('local', {
    successRedirect: "/" ,
    failureRedirect: "/login",
    failureFlash: true
} ))

app.get('/profile/:userId', checkAuthenticated, getProfileHandler);

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