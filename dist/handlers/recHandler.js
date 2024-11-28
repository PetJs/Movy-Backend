"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recommendationsHandler = void 0;
const axios_1 = require("axios");
require("dotenv").config();
const RECOMMENDATIONS_API_URL = `https://api.themoviedb.org/3/movie/{movie_id}/recommendations?api_key=${process.env.API_KEY}`;
const recommendationsHandler = async (req, res) => {
    const { movie_id } = req.params;
    if (!movie_id) {
        return res.status(400).json({ message: "Movie ID is required." });
    }
    try {
        const response = await axios_1.default.get(RECOMMENDATIONS_API_URL.replace("{movie_id}", movie_id));
        if (!response.data || !Array.isArray(response.data.results)) {
            return res.status(500).json({ message: "Invalid data structure received from the Recommendations API." });
        }
        const recommendations = response.data.results.map((movie) => ({
            movie_id: movie.id,
            title: movie.title,
            original_title: movie.original_title,
            overview: movie.overview,
            popularity: movie.popularity,
            rating: movie.vote_average,
            vote_count: movie.vote_count,
            release_date: movie.release_date || "N/A",
            posterPath: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
            backdropPath: movie.backdrop_path ? `https://image.tmdb.org/t/p/w500${movie.backdrop_path}` : null,
        }));
        res.json({ recommendations });
    }
    catch (error) {
        console.error("Error fetching recommendations from API:", error);
        res.status(500).json({ message: "Error fetching recommendations from external API." });
    }
};
exports.recommendationsHandler = recommendationsHandler;
//# sourceMappingURL=recHandler.js.map