"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchTVShowHandler = void 0;
const axios_1 = require("axios");
require("dotenv").config();
const isProduction = process.env.NODE_ENV === "production";
const TV_API_URL = `https://api.themoviedb.org/3/search/tv?api_key=${process.env.API_KEY}&query=`;
const getGenres = async () => {
    try {
        const genreResponse = await axios_1.default.get(`https://api.themoviedb.org/3/genre/tv/list?api_key=${process.env.API_KEY}`);
        return genreResponse.data.genres || [];
    }
    catch (error) {
        console.error("Error fetching genres:", error);
        return [];
    }
};
const getSeasonsAndEpisodes = async (showId) => {
    try {
        const seasonsResponse = await axios_1.default.get(`https://api.themoviedb.org/3/tv/${showId}?api_key=${process.env.API_KEY}&append_to_response=season`);
        const seasons = seasonsResponse.data.seasons || [];
        const seasonDetails = await Promise.all(seasons.map(async (season) => {
            const episodesResponse = await axios_1.default.get(`https://api.themoviedb.org/3/tv/${showId}/season/${season.season_number}?api_key=${process.env.API_KEY}`);
            const episodes = episodesResponse.data.episodes || [];
            return {
                season_number: season.season_number,
                episodes: episodes.map((episode) => ({
                    id: episode.id,
                    name: episode.name,
                    overview: episode.overview,
                    air_date: episode.air_date,
                })),
            };
        }));
        return seasonDetails;
    }
    catch (error) {
        console.error("Error fetching seasons and episodes:", error);
        return [];
    }
};
const searchTVShowHandler = async (req, res) => {
    const { query } = req.query;
    if (typeof query !== "string" || !query.trim()) {
        return res.status(400).json({ message: "Query parameter is required and should be a non-empty string." });
    }
    try {
        const genres = await getGenres();
        const response = await axios_1.default.get(`${TV_API_URL}${query}`);
        if (!response.data || !Array.isArray(response.data.results)) {
            return res.status(500).json({ message: "Invalid data structure received from the TV API." });
        }
        const movies = await Promise.all(response.data.results.map(async (show) => {
            const showGenres = Array.isArray(show.genre_ids) && show.genre_ids.length
                ? show.genre_ids.map((genreId) => {
                    const genreObj = genres.find((g) => g.id === genreId);
                    return genreObj ? genreObj.name : 'Unknown Genre';
                }).join(', ')
                : 'No genres available';
            const seasons = await getSeasonsAndEpisodes(show.id);
            return {
                show_id: show.id,
                title: show.name,
                original_name: show.original_name,
                first_air_date: show.first_air_date || 'N/A',
                rating: show.vote_average,
                overview: show.overview,
                adult: show.adult,
                genres: showGenres,
                posterPath: show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : null,
                backdropPath: show.backdrop_path ? `https://image.tmdb.org/t/p/w500${show.backdrop_path}` : null,
                seasons,
            };
        }));
        res.json({ movies });
    }
    catch (error) {
        console.error("Error fetching TV shows from API:", error);
        res.status(500).json({ message: "Error fetching TV shows from external API." });
    }
};
exports.searchTVShowHandler = searchTVShowHandler;
//# sourceMappingURL=tvSearchHandler.js.map