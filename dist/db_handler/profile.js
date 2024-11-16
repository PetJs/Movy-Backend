"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addWatchHistory = addWatchHistory;
exports.updateStreak = updateStreak;
const dbConfig_1 = require("../dbConfig");
async function addWatchHistory(userId, videoId) {
    try {
        const query = `
        INSERT INTO watch_history (user_id, video_id, watched_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (user_id, video_id)
        DO UPDATE SET watched_at = NOW();
      `;
        await dbConfig_1.pool.query(query, [userId, videoId]);
        console.log('Watch history updated.');
    }
    catch (error) {
        console.error('Error updating watch history:', error);
    }
}
async function updateStreak(userId) {
    try {
        const query = `
        INSERT INTO streak (user_id, current_streak, last_updated)
        VALUES ($1, 1, NOW())
        ON CONFLICT (user_id)
        DO UPDATE SET current_streak = streak.current_streak + 1, last_updated = NOW();
      `;
        await dbConfig_1.pool.query(query, [userId]);
        console.log('Streak updated.');
    }
    catch (error) {
        console.error('Error updating streak:', error);
    }
}
//# sourceMappingURL=profile.js.map