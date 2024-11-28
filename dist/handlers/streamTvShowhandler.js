"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.streamTvShowHandler = void 0;
const dbConfig_1 = require("../dbConfig");
const axios_1 = require("axios");
require("dotenv").config();
const fetchMovieDetails = async (videoId) => {
    const url = `https://api.themoviedb.org/3/${videoId.startsWith('tv') ? 'tv' : 'movie'}/${videoId}?api_key=${process.env.API_KEY}`;
    try {
        const response = await axios_1.default.get(url);
        if (videoId.startsWith('tv')) {
            return {
                title: response.data.name,
                posterPath: response.data.poster_path ? `https://image.tmdb.org/t/p/w500${response.data.poster_path}` : '',
            };
        }
        else {
            return { title: '', posterPath: '' };
        }
    }
    catch (error) {
        console.error("Error fetching TV show details:", error);
        throw new Error("Failed to fetch TV show details");
    }
};
const streamTvShowHandler = async (req, res) => {
    const userId = parseInt(req.params.userId);
    const videoId = req.query.videoId;
    const { seasonNumber, episodeNumber } = req.query;
    if (isNaN(userId) || !videoId || !seasonNumber || !episodeNumber) {
        res.status(400).json({ error: "Invalid parameters, videoId, seasonNumber, or episodeNumber missing" });
        return;
    }
    try {
        const { title, posterPath } = await fetchMovieDetails(videoId);
        const watchHistoryQuery = `
      INSERT INTO watch_history (user_id, video_id, movie_title, poster_path, watched_at)
      VALUES ($1, $2, $3, $4, $5)
    `;
        await dbConfig_1.pool.query(watchHistoryQuery, [userId, videoId, title, posterPath, new Date()]);
        const tvembedUrl = `https://multiembed.mov/directstream.php?video_id=${videoId}&tmdb=1&s=${seasonNumber}&e=${episodeNumber}`;
        console.log(`Received TV show stream request for userId: ${userId}, videoId: ${videoId}, seasonNumber: ${seasonNumber}, episodeNumber: ${episodeNumber}`);
        res.status(200).json({ streamTvUrl: tvembedUrl });
    }
    catch (error) {
        console.error("Error processing TV show stream request:", error);
        res.status(500).json({ error: "An error occurred while processing the TV show stream." });
    }
};
exports.streamTvShowHandler = streamTvShowHandler;
//# sourceMappingURL=streamTvShowhandler.js.map