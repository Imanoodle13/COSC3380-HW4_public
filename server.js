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

// Changed
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'cell_phone_company_db',
    password: 'group16!',
    port: 5433
});
/*
// http://localhost:3000/index.html
// http://localhost:3000/admin.html
// http://localhost:3000/customer.html
// http://localhost:3000/tableView.html
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'HW4',
    password: 't1T4n_F411',
    port: 5432
});*/

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/styles.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'styles.css'));
});

/**
 * Plans and customers
 * customers must exist under plans, so generate plans first and attach customers later
 * A plan will have at least 1 customer with no cap on total customers
 */

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

/////     /////     /////     /////     /////     /////     /////     /////     /////
app.get('/PopularPlans', async (req, res) => {
    try {
        const query = `
            SELECT
                PLAN_OPTION.Option AS "Plan Option",
                COUNT(PLAN.ID) AS "Plan Count"
            FROM PLAN_OPTION
            JOIN PLAN ON PLAN_OPTION.Option = PLAN.Option
            GROUP BY PLAN_OPTION.Option
            ORDER BY "Plan Count" DESC;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching popular plans: ', err);
        res.status(500).send('Error fetching popular plans');
    }
});

// Get Popular Plans
app.get('/EarningsPerPlan', async (req, res) => {
    const year = req.query.year || 2024; // Default year
    const month = req.query.month || 1; // Default month

    try {
        const query = `
            SELECT 
                PLAN_OPTION.Option             AS "Option",
                COALESCE(SUM(BILL.Payment), 0) AS "Total Earned"
            FROM PLAN_OPTION
            LEFT JOIN PLAN ON PLAN_OPTION.Option = PLAN.Option
            LEFT JOIN BILL ON 
                PLAN.ID = BILL.Plan_ID AND 
                EXTRACT(YEAR FROM BILL.Start_date) = $1 AND 
                EXTRACT(MONTH FROM BILL.Start_date) = $2
            GROUP BY PLAN_OPTION.Option
            ORDER BY "Total Earned" DESC;
        `;
        const result = await pool.query(query, [year, month]);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching earnings per plan: ', err);
        res.status(500).send('Error fetching earnings per plan');
    }
});

app.get('/limitsReached', async (req, res) => {
    try {
        const query =`
            SELECT
                CUSTOMER.phone													AS "Phone",
                PLAN_OPTION.option												AS "Plan Option",
                calculate_elapsed(start_time,end_time)							AS "Elapsed",
                calculate_elapsed(start_time,end_time) > PLAN_OPTION.c_limit	AS "CALL LIMIT REACHED",
                USAGE.used														AS "Data Used",
                USAGE.used > PLAN_OPTION.u_limit								AS "USAGE LIMIT REACHED"
            FROM PLAN
            JOIN CUSTOMER		ON PLAN.ID = CUSTOMER.Plan_ID
            JOIN PLAN_OPTION	ON PLAN.Option = PLAN_OPTION.option
            JOIN CALL			ON CUSTOMER.Phone = CALL.Phone
            JOIN USAGE			ON CUSTOMER.Phone = USAGE.Phone
            ORDER BY "Phone" DESC;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching limits: ', err);
        res.status(500).send('Error fetching limits');
    }
});

/////     /////     /////     /////     /////     /////     /////     /////     /////

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

/**
 * Create calls and usage data
 * Every aspect about call generation is random
 * usage data is generated every day for the customer
 */

app.get('/call', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM call');
        res.json(result.rows);
    } catch (err) {
        console.error('Error while fetching calls: ', err);
        res.sendStatus(500);
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
        res.sendStatus(500);
    }
});

/**
 * BILLING
 * bills will be generated for every plan
 */

app.post('/bill', async (req, res) => {
   //console.log('Create bill request received');
   const client = await pool.connect();

   try {
       await client.query('BEGIN');
       // get all plans without a bill already created
       const result = await client.query(`
            SELECT 
                a.ID,
                COALESCE(MAX(b.End_date), a.Signup_date) AS latest_date --if no bills use signup, otherwise latest end date
                
                FROM plan AS a
                
                LEFT OUTER JOIN bill as b
                    ON a.ID = b.Plan_Id
                GROUP BY a.ID
       `);
       for (let row of result.rows) {
           const plan_id = row.id;
           let start_date = new Date(row.latest_date);

           while(start_date <= new Date()) {
               await client.query('INSERT INTO bill (Plan_ID, Start_date) VALUES ($1, $2)',
                    [plan_id, start_date.toISOString().split('T')[0]]
               );
               await client.query('UPDATE bill SET End_date = Start_date + INTERVAL \'1 month\'  WHERE Plan_ID = $1 AND Start_date = $2', [plan_id, start_date.toISOString().split('T')[0]]);

               start_date.setMonth(start_date.getMonth() + 1);
           }
       }
       await client.query('COMMIT')
   } catch (err) {
       await client.query('ROLLBACK');
       console.error('Error creating bills: ', err);
       res.sendStatus(500);
   } finally {
       client.release();
   }
   res.status(200).send('Bills created successfully');
});

app.put('/bill', async (req, res) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        //sum call duration per plan per month
        const call_query = `
            CREATE TEMPORARY TABLE call_totals AS
                SELECT 
                    p.ID AS Plan_ID,
                    EXTRACT(MONTH FROM cl.Start_time) AS month_of_calls,
                    po.C_rate,
                    po.C_over_rate,
                    po.C_limit,
                    SUM(EXTRACT(EPOCH FROM (cl.End_time::TIMESTAMP - cl.Start_time::TIMESTAMP))) / 60 AS call_duration
                   
                
                    FROM PLAN AS p
                    
                JOIN PLAN_OPTION AS po 
                    ON p.Option = po.Option
                    
                JOIN CUSTOMER AS c 
                    ON c.Plan_ID = p.ID
                    
                LEFT OUTER JOIN CALL AS cl 
                    ON cl.Phone = c.Phone
                
                WHERE cl.Billed = false
                
                GROUP BY p.ID, EXTRACT(MONTH FROM cl.Start_time),
                        po.C_rate,
                        po.C_over_rate,
                        po.C_limit
        `;
        await client.query(call_query);

        await client.query('UPDATE call SET billed = true WHERE billed = false');

        const cost_calls_query = `
            CREATE TEMPORARY TABLE cost_of_calls AS
                SELECT
                   a.plan_id, 
                   a.month_of_calls,
                   CASE
                        WHEN a.call_duration < a.C_limit then a.call_duration * a.C_rate * 1.08 --tax rate
                        else ((a.C_limit * a.c_rate) + (a.call_duration - a.C_Limit) * a.C_over_rate) * 1.08
                   END AS call_cost
                   
                   FROM call_totals AS a
        `;
        await client.query(cost_calls_query);

        //sum usage per plan per month
        const usage_query = `
            CREATE TEMPORARY TABLE usage_totals AS
                SELECT 
                    p.ID AS Plan_ID,
                    EXTRACT(MONTH FROM u.Date_rec) AS month_of_usage,
                    po.U_rate,
                    po.U_over_rate,
                    po.U_limit,
                    SUM(u.Used) AS usage
                
                    FROM PLAN AS p
                
                JOIN PLAN_OPTION AS po
                    ON p.Option = po.Option
                    
                JOIN CUSTOMER AS c 
                    ON c.Plan_ID = p.ID
                    
                LEFT OUTER JOIN USAGE AS u 
                    ON u.Phone = c.Phone
                                       
                WHERE u.Billed = false 
                
                GROUP BY p.ID, EXTRACT(MONTH FROM u.Date_rec),
                        po.U_rate,
                        po.U_over_rate,
                        po.U_limit
        `;
        await client.query(usage_query);

        await client.query('UPDATE usage SET billed = true WHERE billed = false');

        const cost_usage_query = `
            CREATE TEMPORARY TABLE cost_of_usage AS
                SELECT 
                   a.plan_id, 
                   a.month_of_usage,
                   CASE
                        WHEN a.usage < a.U_limit then a.usage * a.U_rate * 1.08
                        else ((a.U_limit * a.U_rate) + (a.Usage - a.U_limit) * a.U_over_rate) * 1.08
                   END AS usage_cost
                   
                   FROM usage_totals as a
        `;
        await client.query(cost_usage_query);

        await client.query(`
            UPDATE bill 
            SET 
                total = total + c.call_cost,
                remaining_balance = remaining_balance + c.call_cost
            FROM cost_of_calls as c
            WHERE bill.plan_id = c.plan_id AND EXTRACT(MONTH FROM bill.start_date) = c.month_of_calls
        `);

        await client.query(`
            UPDATE bill 
            SET 
                total = total + u.usage_cost,
                remaining_balance = remaining_balance + u.usage_cost
            FROM cost_of_usage as u
            WHERE bill.plan_id = u.plan_id AND EXTRACT(MONTH FROM bill.start_date) = u.month_of_usage
        `);

        await client.query('COMMIT');
        res.status(200).send('Bill successfully calculated')
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error updating billing tables: ', err);
        res.sendStatus(500);
    } finally {
        client.release();
    }
});

/**
 * Cards and payment
 * Every customer will be automatically generated with one card
 */

app.post('/card', async (req, res) => {
    const client = await pool.connect();

    const { phone } = req.body;

    try {
        await client.query('BEGIN');

        await client.query('INSERT INTO card (phone) VALUES ($1)', [phone]);

        await client.query('COMMIT');
        res.sendStatus(201);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error adding card');
        res.sendStatus(500);
    } finally {
        client.release();
    }
});

app.put('/card', async (req, res) => {
    const client = await pool.connect();

    let { plan_id, start_date, card_id, payment_amount, payment_date } = req.body;
    start_date = new Date(start_date).toISOString().split('T')[0];

    const result = await client.query(`SELECT remaining_balance FROM bill WHERE plan_id = $1 AND Start_date = $2`,
        [plan_id, start_date]
    );
    const to_pay = result.rows[0].remaining_balance;

    if(result.rows.length === 0) {
        res.status(404).send("Bill not found");
        client.release();
        return;
    }
    if (to_pay === 0) {
        res.status(400).send("Bill already paid");
        client.release();
        return;
    }
    if (payment_amount > to_pay) { //avoid customer from overpaying on a bill
        payment_amount = to_pay;
    }

    try {
        await client.query('BEGIN');

        await client.query(`UPDATE card SET balance = balance - $1 WHERE ID = $2`,
            [payment_amount, card_id]
        );

        await client.query('INSERT INTO payment_hist (Card_id, Date_rec, Amount) VALUES ($1, $2, $3)',
            [card_id, payment_date, payment_amount]
        );

        await client.query(`
           UPDATE bill SET remaining_balance = remaining_balance - $1
           WHERE Plan_ID = $2 AND Start_date = $3`,
            [payment_amount ,plan_id, start_date]);

        await client.query('COMMIT');
        res.sendStatus(201);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error updating bill or card balance: ', err);
        res.sendStatus(500);
    } finally {
        client.release();
    }
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
