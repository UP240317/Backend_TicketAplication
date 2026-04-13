const express = require('express');
const bcrypt = require('bcrypt');
const db = require('./db');

const app = express();
app.use(express.json());

const PORT = 3000;

// USERS

// Crear usuario
app.post('/users', async (req, res) => {
    const { name, last_name, username, email, career_id, password, rol } = req.body;

    if (!name || !last_name || !username || !email || !password || !rol) {
        return res.status(400).json({ message: "Mínimo 6 campos requeridos" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
        INSERT INTO users (name, last_name, username, email, career_id, password, rol)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [name, last_name, username, email, career_id, hashedPassword, rol],
        (err) => {
            if (err) return res.status(400).json({ error: "Email o username duplicado" });
            res.status(201).json({ message: "Usuario creado" });
        });
});

// Obtener todos los usuarios
app.get('/users', (req, res) => {
    db.query("SELECT * FROM users", (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.status(200).json(results);
    });
});

// Obtener usuario por ID
app.get('/users/:id', (req, res) => {
    db.query("SELECT * FROM users WHERE id = ?", [req.params.id],
        (err, results) => {
            if (err) return res.status(500).json({ error: err });

            if (results.length === 0)
                return res.status(404).json({ message: "No encontrado" });

            res.json(results[0]);
        });
});

// Filtrar usuarios por parametros
app.get('/users/filter', (req, res) => {
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
});

// Cambiar estado de usuario
app.patch('/users/:id/status', (req, res) => {
    db.query("UPDATE users SET active = NOT active WHERE id = ?",
        [req.params.id],
        (err) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ message: "Estado actualizado" });
        });
});

// Actualizar usuario 
app.put('/users/:id', async (req, res) => {

    // Obtener el ID desde la URL
    const userId = req.params.id;

    // Obtener los campos enviados en el body
    const fields = req.body;

    // Convertir los campos en un arreglo de claves
    const keys = Object.keys(fields);

    // Validar que sí se envíen campos
    if (keys.length === 0) {
        return res.status(400).json({
            message: "No se enviaron campos para actualizar"
        });
    }

    // Validar que no se envíen más de 5 campos 
    if (keys.length > 5) {
        return res.status(400).json({
            message: "Máximo 5 campos permitidos por solicitud"
        });
    }

    // Iniciar la consulta
    let sql = "UPDATE users SET ";

    // Arreglo donde se guardarán los valores para evitar SQL Injection
    let params = [];

    // Recorrer cada campo enviado
    for (let i = 0; i < keys.length; i++) {

        const key = keys[i];

        // Si el campo es contraseña, se encripta antes de guardar
        if (key === "password") {

            // Encriptar la nueva contraseña con bcrypt
            const hashedPassword = await bcrypt.hash(fields[key], 10);

            sql += "password = ?";
            params.push(hashedPassword);

        } else {

            // Para cualquier otro campo, se agrega normalmente
            sql += `${key} = ?`;
            params.push(fields[key]);
        }

        // Agregar coma si no es el último campo
        if (i < keys.length - 1) {
            sql += ", ";
        }
    }

    // Agregar condición para actualizar solo el usuario indicado
    sql += " WHERE id = ?";
    params.push(userId);

    db.query(sql, params, (err, result) => {

        // Error de base de datos
        if (err) {
            return res.status(500).json({ error: err });
        }

        // Si no se afectó ninguna fila, el usuario no existe
        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Usuario no encontrado"
            });
        }

        // Respuesta exitosa
        res.status(200).json({
            message: "Usuario actualizado correctamente"
        });
    });
});

// Eliminar usuario
app.delete('/users/:id', (req, res) => {
    db.query("DELETE FROM users WHERE id = ?", [req.params.id],
        (err) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ message: "Usuario eliminado" });
        });
});

// CAREERS

// Obtener todas las carreras
app.get('/careers', (req, res) => {
    db.query("SELECT * FROM careers", (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});

// Filtrar carreras por nombre
app.get('/careers/filter', (req, res) => {
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
});

// Crear carrera
app.post('/careers', (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "El campo 'name' es requerido" });

    db.query("INSERT INTO careers (name) VALUES (?)", [name],
        (err, result) => {
            if (err) return res.status(500).json({ error: err });
            res.status(201).json({ message: "Carrera creada correctamente", id: result.insertId });
        });
});

// Actualizar carrera
app.put('/careers/:id', (req, res) => {
    const { name } = req.body;

    if (!name) return res.status(400).json({ message: "El campo 'name' es requerido" });

    db.query("UPDATE careers SET name = ? WHERE id = ?",
        [name, req.params.id],
        (err) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ message: "Carrera actualizada correctamente" });
        });
});

app.delete('/careers/:id', (req, res) => {
    db.query("DELETE FROM careers WHERE id = ?",
        [req.params.id],
        (err) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ message: "Carrera eliminada correctamente" });
        });
});

// TYPES

// Obtener todos los tipos de ticket
app.get('/types', (req, res) => {
    db.query("SELECT * FROM types", (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});

// Crear tipo de ticket
app.post('/types', (req, res) => {
    const { type } = req.body;

    if (!type) return res.status(400).json({ message: "El campo 'type' es requerido" });

    db.query("INSERT INTO types (type, description, area) VALUES (?, ?, ?)",
        [type, description, area],
        (err, result) => {
            if (err) return res.status(500).json({ error: err });
            res.status(201).json({ message: "Tipo creado correctamente", id: result.insertId });
        });
});

// Actualizar tipo de ticket
app.put('/types/:id', (req, res) => {
    const { type } = req.body;

    if (!type) return res.status(400).json({ message: "El campo 'type' es requerido" });

    db.query("UPDATE types SET type = ? WHERE id = ?",
        [type, req.params.id],
        (err) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ message: "Tipo actualizado correctamente" });
        });
});

// Eliminar tipo de ticket
app.delete('/types/:id', (req, res) => {
    db.query("DELETE FROM types WHERE id = ?",
        [req.params.id],
        (err) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ message: "Tipo eliminado correctamente" });
        });
});

//TICKETS

// Crear ticket
app.post('/tickets', (req, res) => {
    const { title, description, type_id, priority, created_by } = req.body;

    const sql = `
        INSERT INTO tickets (title, description, type_id, priority, created_by)
        VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql, [title, description, type_id, priority, created_by],
        (err) => {
            if (err) return res.status(500).json({ error: err });
            res.status(201).json({ message: "Ticket creado" });
        });
});

// Obtener ticket por ID
app.get('/tickets/:id', (req, res) => {
    db.query("SELECT * FROM tickets WHERE id = ?",
        [req.params.id],
        (err, results) => {
            if (err) return res.status(500).json({ error: err });
            res.json(results[0]);
        });
});

// Filtrar tickets por parametros
app.get('/tickets', (req, res) => {
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
});

// Actualizar ticket
app.put('/tickets/:id', (req, res) => {
    const { title, description, type_id, priority, status } = req.body;

    db.query(`
        UPDATE tickets
        SET title = ?, description = ?, type_id = ?, priority = ?, status = ?
        WHERE id = ?
    `,
        [title, description, type_id, priority, status, req.params.id],
        (err) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ message: "Ticket actualizado" });
        });
});

// Cambiar estado de ticket
app.patch('/tickets/:id', (req, res) => {
    const { status } = req.body;

    if (!['open', 'in_progress', 'closed'].includes(status)) {
        return res.status(400).json({ message: "Estado inválido" });
    }

    db.query("UPDATE tickets SET status = ? WHERE id = ?",
        [status, req.params.id],
        (err) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ message: "Estado actualizado" });
        });
});

// Eliminar ticket
app.delete('/tickets/:id', (req, res) => {
    db.query("DELETE FROM tickets WHERE id = ?",
        [req.params.id],
        (err) => {
            if (err) return res.status(500).json({ error: err });
            res.json({ message: "Ticket eliminado" });
        });
});

// Asignar ticket a desarrollador
app.post('/tickets/assign', (req, res) => {
    const { ticket_id, developer_id } = req.body;

    db.query(`
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
        });
});

// Obtener tickets relacionados a un usuario 
app.get('/users/:id/tickets', (req, res) => {
    db.query(`
        SELECT * FROM tickets
        WHERE created_by = ? OR assigned_to = ?
    `,
        [req.params.id, req.params.id],
        (err, results) => {
            if (err) return res.status(500).json({ error: err });
            res.json(results);
        });
});

// KPIs

// Obtener cantidad de tickets por estado
app.get('/kpi/tickets/status', (req, res) => {
    db.query(`
        SELECT status, COUNT(*) as total
        FROM tickets
        GROUP BY status
    `,
        (err, results) => {
            if (err) return res.status(500).json({ error: err });
            res.json(results);
        });
});

// Obtener tiempo promedio de resolución de tickets cerrados
app.get('/kpi/tickets/avg-time', (req, res) => {
    db.query(`
        SELECT AVG(TIMESTAMPDIFF(HOUR, created_at, updated_at)) as avg_resolution_time
        FROM tickets
        WHERE status = 'closed'
    `,
        (err, results) => {
            if (err) return res.status(500).json({ error: err });
            res.json(results[0]);
        });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});