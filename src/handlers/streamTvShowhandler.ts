import { Request, Response } from "express";
import { pool } from "../dbConfig";
import axios from "axios";
require("dotenv").config();

const fetchMovieDetails = async (videoId: string): Promise<{ title: string; posterPath: string }> => {
  const url = `https://api.themoviedb.org/3/${videoId.startsWith('tv') ? 'tv' : 'movie'}/${videoId}?api_key=${process.env.API_KEY}`;

  try {
    const response = await axios.get(url);

    // Return details based on whether it's a TV show
    if (videoId.startsWith('tv')) {
      return {
        title: response.data.name, // TV shows use 'name' for the title
        posterPath: response.data.poster_path ? `https://image.tmdb.org/t/p/w500${response.data.poster_path}` : '',
      };
    } else {
      return { title: '', posterPath: '' }; // Return empty for non-TV shows
    }
  } catch (error) {
    console.error("Error fetching TV show details:", error);
    throw new Error("Failed to fetch TV show details");
  }
};

// Handler for TV shows
export const streamTvShowHandler = async (req: Request, res: Response): Promise<void> => {
  const userId = parseInt(req.params.userId);
  const videoId = req.query.videoId as string;
  const { seasonNumber, episodeNumber } = req.query;

  if (isNaN(userId) || !videoId || !seasonNumber || !episodeNumber) {
    res.status(400).json({ error: "Invalid parameters, videoId, seasonNumber, or episodeNumber missing" });
    return;
  }

  try {
    // Fetch TV show details
    const { title, posterPath } = await fetchMovieDetails(videoId);

    // Fetch watch history (optional, can be omitted based on requirements)
    const watchHistoryQuery = `
      INSERT INTO watch_history (user_id, video_id, movie_title, poster_path, watched_at)
      VALUES ($1, $2, $3, $4, $5)
    `;
    await pool.query(watchHistoryQuery, [userId, videoId, title, posterPath, new Date()]);

    const tvembedUrl = `https://multiembed.mov/directstream.php?video_id=${videoId}&tmdb=1&s=${seasonNumber}&e=${episodeNumber}`;

    console.log(`Received TV show stream request for userId: ${userId}, videoId: ${videoId}, seasonNumber: ${seasonNumber}, episodeNumber: ${episodeNumber}`);

    // Return TV show stream URL
    res.status(200).json({ streamTvUrl: tvembedUrl });

  } catch (error) {
    console.error("Error processing TV show stream request:", error);
    res.status(500).json({ error: "An error occurred while processing the TV show stream." });
  }
};
