const db = require('../db');

// Tickets por estado
exports.ticketsByStatus = (req, res) => {
    db.query(
        `
        SELECT status, COUNT(*) as total
        FROM tickets
        GROUP BY status
        `,
        (err, results) => {
            if (err) return res.status(500).json({ error: err });
            res.json(results);
        }
    );
};

// Tiempo promedio resolución
exports.avgResolutionTime = (req, res) => {
    db.query(
        `
        SELECT AVG(TIMESTAMPDIFF(HOUR, created_at, updated_at)) as avg_resolution_time
        FROM tickets
        WHERE status = 'closed'
        `,
        (err, results) => {
            if (err) return res.status(500).json({ error: err });
            res.json(results[0]);
        }
    );
};