import { Request, Response } from "express";
import { pool } from "../dbConfig";
require("dotenv").config();

const isProduction = process.env.NODE_ENV === "production";

export const watchlistHandler = async (req: Request, res: Response) => {
    const { user_id, movie_id, title, release_year, rating, overview, posterPath } = req.body;

    // Validate essential fields
    if (!user_id || !movie_id || !title || !release_year || !rating || !posterPath) {
        return res.status(400).json({ message: 'User ID, Movie ID, Title, Release Year, Rating, and Poster Path are required.' });
    }

    // Validate rating and release year
    if (typeof rating !== 'number' || isNaN(rating)) {
        return res.status(400).json({ message: 'Rating must be a valid number.' });
    }

    if (typeof release_year !== 'string' || isNaN(Number(release_year))) {
        return res.status(400).json({ message: 'Release Year must be a valid year.' });
    }

    const query = `
    INSERT INTO watchlist (user_id, movie_id, title, release_year, rating, overview, poster_path)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (user_id, movie_id) DO NOTHING;
    `;

    try {
        await pool.query(query, [user_id, movie_id, title, release_year, rating, overview, posterPath]);
        res.status(201).json({ message: 'Movie added to watchlist.' });
    } catch (error) {
        console.error('Error adding movie to watchlist:', error);
        res.status(500).json({ message: 'Error adding movie to watchlist', error: error.message });
    }
}


export const getWatchlistHandler = async (req: Request, res: Response) => {
    const user_id = parseInt(req.params.userId);

    console.log(user_id)

    if (!user_id) {
        return res.status(400).json({ message: 'User ID is required to fetch the watchlist.' });
    }

    const query = `
        SELECT id, movie_id, title, release_year, rating, overview, poster_path AS "posterPath"
        FROM watchlist
        WHERE user_id = $1
        ORDER BY release_year DESC;
    `;

    try {
        const result = await pool.query(query, [user_id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No movies found in the watchlist.' });
        }
        res.status(200).json(result.rows); 
    } catch (error) {
        console.error('Error fetching watchlist:', error);
        res.status(500).json({ message: 'Error fetching watchlist.' });
    }
};