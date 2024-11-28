import { Request, Response } from "express";
import { pool } from "../dbConfig";
import axios from "axios";
require("dotenv").config();

const isProduction = process.env.NODE_ENV === "production";


const getTimeDifferenceInHours = (lastUpdated: Date): number => {
  const now = new Date();
  return (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60);
};

const fetchMovieDetails = async (videoId: string): Promise<{ title: string; posterPath: string }> => {
  const url = `https://api.themoviedb.org/3/movie/${videoId}?api_key=${process.env.API_KEY}`

  const response = await axios.get(url);

  if (url) {
    return {
      title: response.data.title,
      posterPath: response.data.poster_path ? `https://image.tmdb.org/t/p/w500${response.data.poster_path}` : '',
    };
  } else {
    return {
      title: response.data.Title,
      posterPath: response.data.Poster,
    };
  }
};

export const streamVideoHandler = async (req: Request, res: Response): Promise<void> => {
  const userId = parseInt(req.params.userId);
  const videoId = req.query.videoId as string;

  const { seasonNumber, episodeNumber } = req.query;

  if (isNaN(userId) || !videoId) {
    res.status(400).json({ error: "Invalid user ID or video ID" });
    return;
  }

  try {
    // Fetch movie details
    const { title, posterPath } = await fetchMovieDetails(videoId);

    // Fetch current streak and last update
    const streakQuery = "SELECT current_streak, streak_count, last_updated FROM streak WHERE user_id = $1";
    const streakResult = await pool.query(streakQuery, [userId]);

    let currentStreak = 0;
    let streakCount = 0;
    const now = new Date();
    let lastUpdated: Date | null = null;

    if (streakResult.rows.length > 0) {
      currentStreak = streakResult.rows[0].current_streak;
      streakCount = streakResult.rows[0].streak_count;
      lastUpdated = streakResult.rows[0].last_updated;
    }

    if (lastUpdated) {
      const hoursSinceLastUpdate = getTimeDifferenceInHours(new Date(lastUpdated));
      if (hoursSinceLastUpdate > 36) {
        currentStreak = 1;
        streakCount += 1;  
      } else if (hoursSinceLastUpdate >= 24 && hoursSinceLastUpdate <= 36) {
        currentStreak += 1;
        streakCount += 1;
      }
    } else {
      currentStreak = 1;
      streakCount += 1;
    }

    // Update streak table
    const updateStreakQuery = `
      INSERT INTO streak (user_id, current_streak, streak_count, last_updated)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id)
      DO UPDATE SET current_streak = EXCLUDED.current_streak,
      streak_count = EXCLUDED.streak_count, last_updated = EXCLUDED.last_updated;
    `;
    await pool.query(updateStreakQuery, [userId, currentStreak, streakCount, now]);

    // Add to watch history
    const watchHistoryQuery = `
      INSERT INTO watch_history (user_id, video_id, movie_title, poster_path, watched_at)
      VALUES ($1, $2, $3, $4, $5)
    `;
    await pool.query(watchHistoryQuery, [userId, videoId, title, posterPath, now]);

    const isTMDB = !videoId.startsWith("tt");
    const embedUrl = `https://multiembed.mov/?video_id=${videoId}${isTMDB ? "&tmdb=1" : ""}`;

    res.status(200).json({ streamUrl: embedUrl});

  } catch (error) {
    console.error("Error processing streaming request:", error);
    res.status(500).json({ error: "An error occurred while processing the stream." });
  }
};