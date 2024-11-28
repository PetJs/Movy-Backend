import { Request, Response } from "express";
import { pool } from "../dbConfig";
require("dotenv").config();


export const deleteFromWatchlist = async(req: Request, res:Response) =>{
    const {user_id, movie_id} = req.body;

    if(!user_id || !movie_id){
        return res.status(400).json({ message: 'User ID and Movie ID are required.' });
    }

    const deleteQuery= `
        DELETE FROM watchlist 
        WHERE user_id = $1 AND movie_id = $2;
    `;

    try{
        const result = await pool.query(deleteQuery, [user_id, movie_id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Movie not found in watchlist.' });
        }
        res.status(200).json({ message: 'Movie removed from watchlist.' });
    }catch(error){
        console.error('Error deleting movie from watchlist:', error);
        res.status(500).json({ message: 'Error deleting movie from watchlist.' });
    }
}