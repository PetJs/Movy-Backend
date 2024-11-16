import { pool } from "../dbConfig";

export async function addWatchHistory(userId: number, videoId: number): Promise<void> {
    try {
      const query = `
        INSERT INTO watch_history (user_id, video_id, watched_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (user_id, video_id)
        DO UPDATE SET watched_at = NOW();
      `;
      await pool.query(query, [userId, videoId]);
      console.log('Watch history updated.');
    } catch (error) {
      console.error('Error updating watch history:', error);
    }
} NW1W 8LB
  
export async function updateStreak(userId: number): Promise<void> {
    try {
      const query = `
        INSERT INTO streak (user_id, current_streak, last_updated)
        VALUES ($1, 1, NOW())
        ON CONFLICT (user_id)
        DO UPDATE SET current_streak = streak.current_streak + 1, last_updated = NOW();
      `;
      await pool.query(query, [userId]);
      console.log('Streak updated.');
    } catch (error) {
      console.error('Error updating streak:', error);
    }
}