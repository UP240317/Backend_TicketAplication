const db = require('../db');

// Crear ticket
exports.createTicket = (req, res) => {
    const { title, description, type_id, priority, created_by } = req.body;

    const sql = `
        INSERT INTO tickets (title, description, type_id, priority, created_by)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [title, description, type_id, priority, created_by],
        (err) => {
            if (err) return res.status(500).json({ error: err });
            res.status(201).json({ message: "Ticket creado" });
        }
    );
};

// Obtener ticket por ID
exports.getTicketById = (req, res) => {
    db.query(
        "SELECT * FROM tickets WHERE id = ?",
        [req.params.id],
        (err, results) => {
            if (err) return res.status(500).json({ error: err });
            res.json(results[0]);
        }
    );
};

// Filtrar tickets
exports.filterTickets = (req, res) => {
    let sql = "SELECT * FROM tickets WHERE 1=1";
    const params = [];

    if (req.query.status) {
        sql += " AND status = ?";
        params.push(req.query.status);
    }

    if (req.query.priority) {
        sql += " AND priority = ?";
        params.push(req.query.priority);
    }

    if (req.query.type_id) {
        sql += " AND type_id = ?";
        params.push(req.query.type_id);
    }

    if (req.query.created_by) {
        sql += " AND created_by = ?";
        params.push(req.query.created_by);
    }

    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
};

// Actualizar ticket
exports.updateTicket = (req, res) => {
    const { title, description, type_id, priority, status } = req.body;

    db.query(
        `
        UPDATE tickets
        SET title = ?, description = ?, type_id = ?, priority = ?, status = ?
        WHERE id = ?
        `,
        [title, description, type_id, priority, status, req.params.id],
        (err) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ message: "Ticket actualizado" });
        }
    );
};

// Cambiar estado de ticket
exports.updateTicketStatus = (req, res) => {
    const { status } = req.body;

    if (!['open', 'in_progress', 'closed'].includes(status)) {
        return res.status(400).json({ message: "Estado inválido" });
    }

    db.query(
        "UPDATE tickets SET status = ? WHERE id = ?",
        [status, req.params.id],
        (err) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ message: "Estado actualizado" });
        }
    );
};

// Eliminar ticket
exports.deleteTicket = (req, res) => {
    db.query(
        "DELETE FROM tickets WHERE id = ?",
        [req.params.id],
        (err) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ message: "Ticket eliminado" });
        }
    );
};

// Asignar ticket
exports.assignTicket = (req, res) => {
    const { ticket_id, developer_id } = req.body;

    db.query(
        `
        UPDATE tickets
        SET assigned_to = ?, status = 'in_progress'
        WHERE id = ? AND status = 'open'
        `,
        [developer_id, ticket_id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err });

            if (result.affectedRows === 0) {
                return res.status(400).json({
                    message: "Ticket no encontrado o no está abierto"
                });
            }

            res.json({ message: "Ticket asignado correctamente" });
        }
    );
};