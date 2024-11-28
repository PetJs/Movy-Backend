"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.romanceHandler = void 0;
const axios_1 = require("axios");
require("dotenv").config();
const isProduction = process.env.NODE_ENV === "production";
const ROMANCE_API_URL = `https://api.themoviedb.org/3/discover/movie?api_key=${process.env.API_KEY}&with_genres=10749`;
const romanceHandler = async (req, res) => {
    try {
        const response = await axios_1.default.get(ROMANCE_API_URL);
        if (!response.data || !Array.isArray(response.data.results)) {
            return res.status(500).json({ message: "Invalid data structure received from the Romance API." });
        }
        const romance = response.data.results.map((movie) => ({
            movie_id: movie.id,
            title: movie.title,
            original_title: movie.original_title,
            overview: movie.overview,
            popularity: movie.popularity,
            rating: movie.vote_average,
            vote_count: movie.vote_count,
            release_date: movie.release_date || 'N/A',
            posterPath: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
            backdropPath: movie.backdrop_path ? `https://image.tmdb.org/t/p/w500${movie.backdrop_path}` : null,
        }));
        res.json({ romance });
    }
    catch (error) {
        console.error("Error fetching romance from API:", error);
        res.status(500).json({ message: "Error fetching romance from external API." });
    }
};
exports.romanceHandler = romanceHandler;
//# sourceMappingURL=romanceHandler.js.map