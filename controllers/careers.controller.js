const db = require('../db');

// Obtener todas las carreras
exports.getAllCareers = (req, res) => {
    db.query("SELECT * FROM careers", (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
};

// Filtrar carreras por nombre
exports.filterCareers = (req, res) => {
    let sql = "SELECT * FROM careers WHERE 1=1";
    const params = [];

    if (req.query.name) {
        sql += " AND name LIKE ?";
        params.push(`%${req.query.name}%`);
    }

    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
};

// Crear carrera
exports.createCareer = (req, res) => {
    const { name } = req.body;

    if (!name)
        return res.status(400).json({ message: "El campo 'name' es requerido" });

    db.query(
        "INSERT INTO careers (name) VALUES (?)",
        [name],
        (err, result) => {
            if (err) return res.status(500).json({ error: err });
            res.status(201).json({
                message: "Carrera creada correctamente",
                id: result.insertId
            });
        }
    );
};

// Actualizar carrera
exports.updateCareer = (req, res) => {
    const { name } = req.body;

    if (!name)
        return res.status(400).json({ message: "El campo 'name' es requerido" });

    db.query(
        "UPDATE careers SET name = ? WHERE id = ?",
        [name, req.params.id],
        (err) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ message: "Carrera actualizada correctamente" });
        }
    );
};

// Eliminar carrera
exports.deleteCareer = (req, res) => {
    db.query(
        "DELETE FROM careers WHERE id = ?",
        [req.params.id],
        (err) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ message: "Carrera eliminada correctamente" });
        }
    );
};