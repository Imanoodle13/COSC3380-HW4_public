const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const path = require('path');
const cors = require('cors');
const { generateUsage } = require('./utils')

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

// Fetch customers from database
app.get('/customer', async (req, res) => {
    //console.log("Received GET customer request");
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
    //console.log("POST Received: ", req.body);
    const client = await pool.connect();

    let { phone, first_name, last_name, dob, address, plan_id, enroll_date } = req.body;
    if (!enroll_date) { // if req does not include enrollment date, set it to right now
        enroll_date = new Date();
    }

    try {
        await client.query('BEGIN');
        // Check if the entered plan exists:
        const planCheck = await client.query('Select * FROM PLAN WHERE ID = $1', [plan_id]);
        if (planCheck.rowCount === 0) {
            return res.status(400).json({ error: 'Plan does not exist!'});
        }

        await client.query(
            'INSERT INTO customer (phone, first_name, last_name, dob, address, plan_id, enroll_date) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [phone, first_name, last_name, dob, address, plan_id, enroll_date]
        );

        await generateUsage(client, phone, enroll_date);

        await client.query('COMMIT');
        res.sendStatus(201); // Success
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err.message);
        res.sendStatus(500);
    } finally {
        client.release();
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
   //console.log('Get Plans request received: ', req.body);
   try {
       const plans = await pool.query('SELECT * FROM PLAN');
       res.json(plans.rows)
   } catch (err) {
       res.status(500).send('Error getting Plans');
   }
});

//Create a plan with an initial customer
app.post('/customer-plan', async (req, res) => {
    //console.log('Plan Option POST received: ', req.body);
    const { option, phone, first_name, last_name, dob, address, enroll_date } = req.body;

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const result = await client.query(
            'INSERT INTO plan (Option, Signup_date) VALUES ($1, $2) RETURNING ID',
            [option, enroll_date]
        );
        const planID = result.rows[0].id;

        await client.query(
            'INSERT INTO customer (Phone, First_name, Last_name, Dob, Address, Plan_ID, Enroll_date) VALUES ($1, $2, $3, $4, $5, $6, $7)',
            [phone, first_name, last_name, dob, address, planID, enroll_date]
        );

        await generateUsage(client, phone, enroll_date);

        await client.query('COMMIT');
        res.sendStatus(201); //Success
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err.message);
        res.sendStatus(500);
    } finally {
        client.release();
    }
});

app.get('/call', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM call');
        res.json(result.rows);
    } catch (err) {
        console.error('Error while fetching calls: ', err);
    }
});

app.post('/call', async (req, res) => {
   //console.log('Call POST received: ', req.body);
   let { phone, start_time, end_time } = req.body;
    start_time = new Date(start_time).toISOString();
    end_time = new Date(end_time).toISOString();

   const client = await pool.connect();

   try {
       await client.query('BEGIN');

       const result = await client.query(
           'INSERT INTO call (Phone, Start_time, End_time) VALUES ($1, $2, $3)',
           [phone, start_time, end_time]
       );

       await client.query('COMMIT');
       res.sendStatus(201); //Success
   } catch (err) {
       await client.query('ROLLBACK');
       console.error(err.message);
       res.sendStatus(500);
   } finally {
       client.release();
   }
});

app.get('/usage', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM usage');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching usage data: ', err);
    }
});

// post to create empty bills that don't exist yet
app.post('/bill', async (req, res) => {
   console.log('Create bill request received');
   const client = await pool.connect();

   await client.query('BEGIN');

   try {
       // get all plans without a bill already created
       const result = await client.query(`
            SELECT a.ID, a.Signup_date
            FROM plan as a
            LEFT OUTER JOIN bill as b ON a.ID = b.Plan_ID
            WHERE b.Plan_ID is null`);

       for (let row of result.rows) {
           const plan_id = row.id;
           let start_date = new Date(row.signup_date);
           while(start_date <= new Date()) {
               await client.query('INSERT INTO bill (Plan_ID, Start_date) VALUES ($1, $2)',
                    [plan_id, start_date.toISOString().split('T')[0]]
               );
               await client.query('UPDATE bill SET End_date = Start_date + INTERVAL \'1 month\'  WHERE Plan_ID = $1 AND Start_date = $2', [plan_id, start_date.toISOString().split('T')[0]]);

               new Date(start_date).setMonth(start_date.getMonth() + 1);
           }
       }
       await client.query('COMMIT')
   } catch (err) {
       await client.query('ROLLBACK');
       console.error('Error creating bills: ', err);
   } finally {
       client.release();
   }
});

app.put('/bill', async (req, res) => {
   //fill in bill updating logic here
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

