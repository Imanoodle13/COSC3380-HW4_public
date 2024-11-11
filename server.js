const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const path = require('path');
const cors = require('cors');
const { normal_random } = require('./utils')

const app = express();
app.use(bodyParser.json());
app.use(cors()); // Enable CORS for cross-origin requests

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'cell_phone_company_db',
    password: 'group16!',
    port: 5433,
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/styles.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'styles.css'));
});

// Fetch data from PostgreSQL
app.get('/customer', async (req, res) => {
    console.log("Received GET customer request");
    try {
        const result = await pool.query('SELECT * FROM customer');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.sendStatus(500);
    }
});

// Add a customer
app.post('/customer', async (req, res) => {
    console.log("POST Received: ", req.body);
    const { first_name, last_name, dob, address, phone } = req.body;
    try {
        await pool.query(
            'INSERT INTO customer (first_name, last_name, dob, address, phone) VALUES ($1, $2, $3, $4, $5)',
            [first_name, last_name, dob, address, phone]
        );
        res.sendStatus(201); // Successfully created
    } catch (err) {
        console.error(err.message);
        res.sendStatus(500);
    }
});

//Update customer
app.put('/customer/:id', async (req, res) => {
    const { id } = req.params;
    const { first_name, last_name, dob, address } = req.body;
    try {
        await pool.query(
            'UPDATE customer SET first_name = $1, last_name = $2, dob = $3, address = $4 WHERE id = $5',
            [first_name, last_name, dob, address]
        );
        res.sendStatus(200);
    } catch (err) {
        console.error(err.message);
        res.sendStatus(500);
    }
});



// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

