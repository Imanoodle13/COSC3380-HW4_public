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
    const today = new Date();
    const { phone, first_name, last_name, dob, address, plan_id } = req.body;
    try {
        await pool.query(
            'INSERT INTO customer (phone, first_name, last_name, dob, address, plan_id, enroll_date) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [phone, first_name, last_name, dob, address, plan_id, today]
        );
        res.sendStatus(201); // Successfully created
    } catch (err) {
        console.error(err.message);
        res.sendStatus(500);
    }
});

//Update customer needs updating for new customer schema, do not use
app.put('/customer/phone', async (req, res) => {
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

//Get Plan Options
app.get('/PlanOptions', async (req, res) => {
    try {
        const plans = await pool.query('SELECT * FROM PLAN_OPTION');
        res.json(plans.rows)
    } catch (err) {
        res.status(500).send('Error getting plan options');
    }
});

//Get Plans
app.get('/plan', async (req, res) => {
   console.log('Get Plans request received: ', req.body);
   const { id, option, signup_date } = req.body;
   try {
       const plans = await pool.query('SELECT * FROM PLAN');
       res.json(plans.rows)
   } catch (err) {
       res.status(500).send('Error getting Plans');
   }
});

//Create a Plan
app.post('/plan', async (req, res) => {
    console.log('Plan Option POST received: ', req.body);
    const { option, phone, first_name, last_name, dob, address } = req.body;
    try {
        const today = new Date();

        const result = await pool.query(
            'INSERT INTO plan (Option, Signup_date) VALUES ($1, $2) RETURNING ID',
            [option, today]
        );
        const planID = result.rows[0].id;

        await pool.query(
            'INSERT INTO customer (Phone, First_name, Last_name, Dob, Address, Plan_ID, Enroll_date) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [phone, first_name, last_name, dob, address, planID, today]
        );
    } catch (err) {
        console.error(err.message);
        res.sendStatus(500);
    }
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

