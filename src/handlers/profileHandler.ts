import { Request, Response } from "express";
import { pool } from "../dbConfig";


export const getProfileHandler = async (req: Request, res: Response): Promise<void> => {
  const userId: number = parseInt(req.params.userId);

  if (isNaN(userId)) {
    res.status(400).json({ error: 'Invalid user ID' });
    return;
  }

  try {
    
    const watchHistoryQuery = 'SELECT * FROM watch_history WHERE user_id = $1 ORDER BY watched_at DESC';
    const watchHistoryResult = await pool.query(watchHistoryQuery, [userId]);

    const streakQuery = "SELECT current_streak, streak_count, last_updated FROM streak WHERE user_id = $1";
    const streakResult = await pool.query(streakQuery, [userId]);

    const userQuery = 'SELECT name, email, pfp FROM users WHERE id = $1';
    const userResult = await pool.query(userQuery, [userId]);

    if (userResult.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const user = userResult.rows[0];

    res.status(200).json({
      user: {
        pfp: user.pfp,
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
