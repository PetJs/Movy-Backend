"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerHandler = void 0;
const dbConfig_1 = require("../dbConfig");
const path_1 = require("path");
const bcrypt = require('bcrypt');
const registerHandler = async (req, res) => {
    let { name, email, password, confirmPassword } = req.body;
    let errors = [];
    if (password.length < 8) {
        errors.push("Password is less than 8");
    }
    if (password !== confirmPassword) {
        errors.push("Password does not match");
    }
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }
    try {
        console.log(bcrypt);
        const hashedPassword = await bcrypt.hash(password, 12);
        const result = await dbConfig_1.pool.query(`SELECT * FROM users WHERE email = $1`, [email]);
        if (result.rows.length > 0) {
            errors.push("Email already exists");
            return res.status(400).json({ errors });
        }
        const defaultPfp = path_1.default.join('images', 'pfp.jpg');
        const insertQuery = `
        INSERT INTO users (name, email, password, pfp)
        VALUES ($1, $2, $3, $4) RETURNING id, name, email, pfp;
        `;
        const insertResult = await dbConfig_1.pool.query(insertQuery, [name, email, hashedPassword, defaultPfp]);
        const newUser = insertResult.rows[0];
        res.status(201).send({
            message: "User registered successfully",
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                pfp: newUser.pfp,
            },
        });
    }
    catch (err) {
        console.error("Error in registration:", err);
        res.status(500).send("Server error");
    }
};
exports.registerHandler = registerHandler;
//# sourceMappingURL=authControler.js.map