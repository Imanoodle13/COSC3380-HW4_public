const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'school',
    password: 'your_password',
    port: 5432,
});


app.get('/students', async (req, res) => {
    const result = await pool.query('SELECT * FROM students');
    res.json(result.rows);
});

app.post('/students', async (req, res) => {
    const { name } = req.body;
    await pool.query('INSERT INTO students (name) VALUES ($1)', [name]);
    res.sendStatus(201);
});

app.put('/students/:id', async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    await pool.query('UPDATE students SET name = $1 WHERE id = $2', [name, id]);
    res.sendStatus(200);
});

app.delete('/students/:id', async (req, res) => {
    const { id } = req.params;
    await pool.query('DELETE FROM students WHERE id = $1', [id]);
    res.sendStatus(200);
});

app.listen(3000, () => console.log('Server running on port 3000'));