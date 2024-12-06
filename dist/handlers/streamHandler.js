"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.streamVideoHandler = void 0;
const dbConfig_1 = require("../dbConfig");
const axios_1 = require("axios");
require("dotenv").config();
const isProduction = process.env.NODE_ENV === "production";
const getTimeDifferenceInHours = (lastUpdated) => {
    const now = new Date();
    return (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);
};
const fetchMovieDetails = async (videoId) => {
    const url = `https://api.themoviedb.org/3/movie/${videoId}?api_key=${process.env.API_KEY}`;
    const response = await axios_1.default.get(url);
    if (url) {
        return {
            title: response.data.title,
            posterPath: response.data.poster_path ? `https://image.tmdb.org/t/p/w500${response.data.poster_path}` : '',
        };
    }
    else {
        return {
            title: response.data.Title,
            posterPath: response.data.Poster,
        };
    }
};
const streamVideoHandler = async (req, res) => {
    const userId = parseInt(req.params.userId);
    const videoId = req.query.videoId;
    if (isNaN(userId) || !videoId) {
        res.status(400).json({ error: "Invalid user ID or video ID" });
        return;
    }
    try {
        const { title, posterPath } = await fetchMovieDetails(videoId);
        const streakQuery = "SELECT current_streak, streak_count, last_updated FROM streak WHERE user_id = $1";
        const streakResult = await dbConfig_1.pool.query(streakQuery, [userId]);
        let currentStreak = 0;
        let streakCount = 0;
        const now = new Date();
        let lastUpdated = null;
        if (streakResult.rows.length > 0) {
            currentStreak = streakResult.rows[0].current_streak;
            streakCount = streakResult.rows[0].streak_count;
            lastUpdated = streakResult.rows[0].last_updated;
        }
        const isNewDay = lastUpdated ? now.toDateString() !== new Date(lastUpdated).toDateString() : true;
        if (isNewDay) {
            const hoursSinceLastUpdate = lastUpdated ? getTimeDifferenceInHours(new Date(lastUpdated)) : 0;
            if (!lastUpdated || hoursSinceLastUpdate > 36) {
                currentStreak = 1;
            }
            else if (hoursSinceLastUpdate >= 24) {
                currentStreak += 1;
            }
            streakCount += 1;
        }
        const updateStreakQuery = `
      INSERT INTO streak (user_id, current_streak, streak_count, last_updated)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id)
      DO UPDATE SET current_streak = EXCLUDED.current_streak,
      streak_count = EXCLUDED.streak_count, last_updated = EXCLUDED.last_updated;
    `;
        await dbConfig_1.pool.query(updateStreakQuery, [userId, currentStreak, streakCount, now]);
        const watchHistoryQuery = `
      INSERT INTO watch_history (user_id, video_id, movie_title, poster_path, watched_at)
      VALUES ($1, $2, $3, $4, $5)
    `;
        await dbConfig_1.pool.query(watchHistoryQuery, [userId, videoId, title, posterPath, now]);
        const isTMDB = !videoId.startsWith("tt");
        const embedUrl = `https://multiembed.mov/?video_id=${videoId}${isTMDB ? "&tmdb=1" : ""}`;
        res.status(200).json({ streamUrl: embedUrl });
    }
    catch (error) {
        console.error("Error processing streaming request:", error);
        res.status(500).json({ error: "An error occurred while processing the stream." });
    }
};
exports.streamVideoHandler = streamVideoHandler;
//# sourceMappingURL=streamHandler.js.map