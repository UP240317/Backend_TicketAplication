const bcrypt = require('bcrypt');
const db = require('../db'); // ajusta la ruta si tu estructura es diferente

// =========================
// CREAR USUARIO
// =========================
exports.createUser = async (req, res) => {
    const { name, last_name, username, email, career_id, password, rol } = req.body;

    if (!name || !last_name || !username || !email || !password || !rol) {
        return res.status(400).json({ message: "Mínimo 6 campos requeridos" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = `
            INSERT INTO users (name, last_name, username, email, career_id, password, rol)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(
            sql,
            [name, last_name, username, email, career_id, hashedPassword, rol],
            (err) => {
                if (err) {
                    return res.status(400).json({ error: "Email o username duplicado" });
                }
                res.status(201).json({ message: "Usuario creado" });
            }
        );
    } catch (error) {
        return res.status(500).json({ error });
    }
};

// =========================
// OBTENER TODOS LOS USUARIOS
// =========================
exports.getAllUsers = (req, res) => {
    db.query("SELECT * FROM users", (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.status(200).json(results);
    });
};

// =========================
// OBTENER USUARIO POR ID
// =========================
exports.getUserById = (req, res) => {
    db.query(
        "SELECT * FROM users WHERE id = ?",
        [req.params.id],
        (err, results) => {
            if (err) return res.status(500).json({ error: err });

            if (results.length === 0) {
                return res.status(404).json({ message: "No encontrado" });
            }

            res.json(results[0]);
        }
    );
};

// =========================
// FILTRAR USUARIOS
// =========================
exports.filterUsers = (req, res) => {
    const { name, email, career_id, rol } = req.query;

    let sql = "SELECT * FROM users WHERE 1=1";
    let params = [];

    if (name) {
        sql += " AND name LIKE ?";
        params.push(`%${name}%`);
    }

    if (email) {
        sql += " AND email LIKE ?";
        params.push(`%${email}%`);
    }

    if (career_id) {
        sql += " AND career_id = ?";
        params.push(career_id);
    }

    if (rol) {
        sql += " AND rol = ?";
        params.push(rol);
    }

    db.query(sql, params, (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
};

// =========================
// CAMBIAR ESTADO (ACTIVE)
// =========================
exports.toggleUserStatus = (req, res) => {
    db.query(
        "UPDATE users SET active = NOT active WHERE id = ?",
        [req.params.id],
        (err) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ message: "Estado actualizado" });
        }
    );
};

// =========================
// ACTUALIZAR USUARIO (DINÁMICO)
// =========================
exports.updateUser = async (req, res) => {
    const userId = req.params.id;
    const fields = req.body;
    const keys = Object.keys(fields);

    if (keys.length === 0) {
        return res.status(400).json({
            message: "No se enviaron campos para actualizar"
        });
    }

    if (keys.length > 5) {
        return res.status(400).json({
            message: "Máximo 5 campos permitidos por solicitud"
        });
    }

    let sql = "UPDATE users SET ";
    let params = [];

    try {
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];

            if (key === "password") {
                const hashedPassword = await bcrypt.hash(fields[key], 10);
                sql += "password = ?";
                params.push(hashedPassword);
            } else {
                sql += `${key} = ?`;
                params.push(fields[key]);
            }

            if (i < keys.length - 1) {
                sql += ", ";
            }
        }

        sql += " WHERE id = ?";
        params.push(userId);

        db.query(sql, params, (err, result) => {
            if (err) return res.status(500).json({ error: err });

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Usuario no encontrado" });
            }

            res.json({ message: "Usuario actualizado correctamente" });
        });

    } catch (error) {
        return res.status(500).json({ error });
    }
};

// =========================
// ELIMINAR USUARIO
// =========================
exports.deleteUser = (req, res) => {
    db.query(
        "DELETE FROM users WHERE id = ?",
        [req.params.id],
        (err) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ message: "Usuario eliminado" });
        }
    );
};