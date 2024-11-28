"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchHandler = void 0;
const axios_1 = require("axios");
require("dotenv").config();
const isProduction = process.env.NODE_ENV === "production";
const MOVIE_API_URL = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.API_KEY}&query=`;
const getGenres = async () => {
    try {
        const genreResponse = await axios_1.default.get(`https://api.themoviedb.org/3/genre/movie/list?api_key=${process.env.API_KEY}`);
        return genreResponse.data.genres || [];
    }
    catch (error) {
        console.error("Error fetching genres:", error);
        return [];
    }
};
const searchHandler = async (req, res) => {
    const { query } = req.query;
    if (typeof query !== "string" || !query.trim()) {
        return res.status(400).json({ message: "Query parameter is required and should be a non-empty string." });
    }
    try {
        const genres = await getGenres();
        const response = await axios_1.default.get(`${MOVIE_API_URL}${query}`);
        if (!response.data || !Array.isArray(response.data.results)) {
            return res.status(500).json({ message: "Invalid data structure received from the movie API." });
        }
        const movies = response.data.results.map((movie) => {
            const movieGenres = Array.isArray(movie.genre_ids) && movie.genre_ids.length
                ? movie.genre_ids.map((genreId) => {
                    const genreObj = genres.find((g) => g.id === genreId);
                    return genreObj ? genreObj.name : 'Unknown Genre';
                }).join(', ')
                : 'No genres available';
            return {
                movie_id: movie.id,
                title: movie.title,
                release_year: movie.release_date ? movie.release_date.split('-')[0] : 'N/A',
                rating: movie.vote_average,
                overview: movie.overview,
                tagline: movie.tagline || 'No tagline available',
                adult: movie.adult,
                genres: movieGenres,
                posterPath: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
            };
        });
        res.json({ movies });
    }
    catch (error) {
        console.error("Error fetching movies from API:", error);
        res.status(500).json({ message: "Error fetching movies from external API." });
    }
};
exports.searchHandler = searchHandler;
//# sourceMappingURL=searchHandler.js.map