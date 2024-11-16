import { Request, Response } from "express";
import { pool } from "../dbConfig";
import { addWatchHistory, updateStreak } from "../db_handler/profile";

// Handler function for fetching user profile data
export const getProfileHandler = async (req: Request, res: Response): Promise<void> => {
  const userId: number = parseInt(req.params.userId);
  const videoId: number = parseInt(req.query.videoId as string);

  if (isNaN(userId)) {
    res.status(400).json({ error: 'Invalid user ID' });
    return;
  }

  if (videoId && isNaN(videoId)) {
    res.status(400).json({ error: 'Invalid video ID' });
    return;
  }


  try {
    // If videoId is provided in the body, update watch history and streak
    if (videoId) {
      // Call addWatchHistory to record the video watch
      await addWatchHistory(userId, videoId);

      // Call updateStreak to update the user's streak
      await updateStreak(userId);
    }

    // Get watch history
    const watchHistoryQuery = 'SELECT * FROM watch_history WHERE user_id = $1 ORDER BY watched_at DESC';
    const watchHistoryResult = await pool.query(watchHistoryQuery, [userId]);

    // Get streak data
    const streakQuery = 'SELECT current_streak, last_updated FROM streak WHERE user_id = $1';
    const streakResult = await pool.query(streakQuery, [userId]);

    const userQuery = 'SELECT name, email FROM users WHERE id = $1';
    const userResult = await pool.query(userQuery, [userId]);

    // If user is not found
    if (userResult.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const user = userResult.rows[0];

    // Respond with profile data
    res.status(200).json({
      user: {
        name: user.name,
        email: user.email,
      },
      watchHistory: watchHistoryResult.rows,
      streak: streakResult.rows.length > 0 ? streakResult.rows[0] : { current_streak: 0, last_updated: null }
    });
  } catch (error) {
    console.error('Error fetching profile data:', error);
    res.status(500).json({ error: 'An error occurred while retrieving profile data.' });
  }
};
