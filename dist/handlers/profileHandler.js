"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProfileHandler = void 0;
const dbConfig_1 = require("../dbConfig");
const getProfileHandler = async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
        res.status(400).json({ error: 'Invalid user ID' });
        return;
    }
    try {
        const watchHistoryQuery = 'SELECT * FROM watch_history WHERE user_id = $1 ORDER BY watched_at DESC';
        const watchHistoryResult = await dbConfig_1.pool.query(watchHistoryQuery, [userId]);
        const streakQuery = "SELECT current_streak, streak_count, last_updated FROM streak WHERE user_id = $1";
        const streakResult = await dbConfig_1.pool.query(streakQuery, [userId]);
        const userQuery = 'SELECT name, email, pfp FROM users WHERE id = $1';
        const userResult = await dbConfig_1.pool.query(userQuery, [userId]);
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
    }
    catch (error) {
        console.error('Error fetching profile data:', error);
        res.status(500).json({ error: 'An error occurred while retrieving profile data.' });
    }
};
exports.getProfileHandler = getProfileHandler;
//# sourceMappingURL=profileHandler.js.map