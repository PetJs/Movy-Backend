import { Request, Response } from "express";
import { pool } from "../dbConfig";

const bcrypt = require('bcrypt');

export const registerHandler = async (req: Request, res: Response) => {
    let { name, email, password, confirmPassword } = req.body;
    let errors: string[] = [];

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
        // Hashing Password
        console.log(bcrypt);
        const hashedPassword = await bcrypt.hash(password, 12);

        // Querying the database to see if the user already exists
        const result = await pool.query(
            `SELECT * FROM users WHERE email = $1`,
            [email]
        );

        if (result.rows.length > 0) {
            errors.push("Email already exists");
            return res.status(400).json({ errors });
        }

        // Insert the new user into the database
        const insertQuery = `
        INSERT INTO users (name, email, password)
        VALUES ($1, $2, $3) RETURNING id, name, email;
        `;

        const insertResult = await pool.query(insertQuery, [name, email, hashedPassword]);
        const newUser = insertResult.rows[0];

        // Return a success response
        res.status(201).send({
            message: "User registered successfully",
            user: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
            },
        });
    } catch (err) {
        console.error("Error in registration:", err);
        res.status(500).send("Server error");
    }
};
