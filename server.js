const express = require('express');

const usersRoutes = require('./routes/users.routes');
const careersRoutes = require('./routes/careers.routes');
const typesRoutes = require('./routes/types.routes');
const ticketsRoutes = require('./routes/tickets.routes');
const kpiRoutes = require('./routes/kpi.routes');

const app = express();
app.use(express.json());

app.use('/users', usersRoutes);
app.use('/careers', careersRoutes);
app.use('/types', typesRoutes);
app.use('/tickets', ticketsRoutes);
app.use('/kpi', kpiRoutes);

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});