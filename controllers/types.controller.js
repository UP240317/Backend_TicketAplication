const db = require('../db');

exports.getAllTypes = (req, res) => {
    db.query("SELECT * FROM types", (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
};

exports.createType = (req, res) => {
    const { type, description, area } = req.body;

    if (!type) return res.status(400).json({ message: "El campo 'type' es requerido" });

    db.query(
        "INSERT INTO types (type, description, area) VALUES (?, ?, ?)",
        [type, description, area],
        (err, result) => {
            if (err) return res.status(500).json({ error: err });
            res.status(201).json({ message: "Tipo creado correctamente", id: result.insertId });
        }
    );
};

exports.updateType = (req, res) => {
    const { type } = req.body;

    if (!type) return res.status(400).json({ message: "El campo 'type' es requerido" });

    db.query("UPDATE types SET type = ? WHERE id = ?",
        [type, req.params.id],
        (err) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ message: "Tipo actualizado correctamente" });
        });
};

exports.deleteType = (req, res) => {
    db.query("DELETE FROM types WHERE id = ?",
        [req.params.id],
        (err) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ message: "Tipo eliminado correctamente" });
        });
};