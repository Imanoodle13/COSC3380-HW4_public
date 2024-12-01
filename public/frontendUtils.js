// Frontend JS Functions

async function getCustomers() {
    try {
        const response = await fetch('/customer');
        const customers = await response.json();

        const customerTable = document.getElementById('customerTable');
        customerTable.innerHTML = ''; // Clear the table before adding new rows

        customers.forEach(customer => {
            const row = customerTable.insertRow();
            row.insertCell(0).textContent = customer.phone
            row.insertCell(1).textContent = customer.first_name;
            row.insertCell(2).textContent = customer.last_name;
            row.insertCell(3).textContent = customer.dob;
            row.insertCell(4).textContent = customer.address;
            row.insertCell(5).textContent = customer.plan_id
            row.insertCell(6).textContent = customer.enroll_date;
        });
    } catch (error) {
        console.error('Error fetching customers:', error);
    }
}

async function addCustomer() {
    const phone = document.getElementById('phone').value;
    const firstName = document.getElementById('custFN').value;
    const lastName = document.getElementById('custLN').value;
    const dob = document.getElementById('custDOB').value;
    const address = document.getElementById('custAddr').value;
    const planID = document.getElementById('planID').value;

    try {
        const response = await fetch('/customer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ phone, first_name: firstName, last_name: lastName, dob, address, planID })
        });

        alert('Customer added successfully');

    } catch (error) {
        console.error('Error adding customer:', error);
    }
}

async function getPlanOptions() {
    try {
        const response = await fetch('/PlanOptions');
        const planOptions = await response.json();
        console.log('Received Plan Options: ', planOptions);

        const planOptionTable = document.getElementById('planOptionTable');
        planOptionTable.innerHTML = '';

        planOptions.forEach(planOption => {
            const row = planOptionTable.insertRow();
            row.insertCell(0).textContent = planOption.option;
            row.insertCell(1).textContent = planOption.c_rate;
            row.insertCell(2).textContent = planOption.c_over_rate;
            row.insertCell(3).textContent = planOption.c_limit;
            row.insertCell(4).textContent = planOption.u_rate;
            row.insertCell(5).textContent = planOption.u_over_rate;
            row.insertCell(6).textContent = planOption.u_limit
        });
    } catch (err) {
        console.error('Error fetching plan options: ', err)
    }
}

//Get Plans
async function getPlan() {
    try {
        const response = await fetch('/plan');
        const plans = await response.json();

        const planTable = document.getElementById('planTable');
        planTable.innerHTML = '';

        plans.forEach(plan => {
            const row = planTable.insertRow();
            row.insertCell(0).textContent = plan.id;
            row.insertCell(1).textContent = plan.option;
            row.insertCell(2).textContent = plan.signup_date;
        });
    } catch (err) {
        console.error('Error fetching plans: ', err);
    }
}

//Create Plan initializes a plan with an initial customer
async function createPlan() {
    const option = document.getElementById('planOption').value;
    const phone = document.getElementById('phone').value;
    const first_name = document.getElementById('custFN').value;
    const last_name = document.getElementById('custLN').value;
    const dob = document.getElementById('custDOB').value;
    const address = document.getElementById('custAddr').value;
    const enroll_date = new Date();

    try {
        const response = await fetch('/customer-plan', {
           method: 'POST',
           headers: {
                'Content-Type': 'application/json'
           },
            body: JSON.stringify({
               option, phone, first_name, last_name, dob, address, enroll_date
            })
        });

        alert('Plan Created successfully!')
    } catch (err) {
        console.error('Error creating plan: ', err)
    }
}

async function getCalls() {
    try {
        const response = await fetch('/call');
        const calls = await response.json();

        const callsTable = document.getElementById('callTable');
        callsTable.innerHTML = '';

        calls.forEach(call => {
            const row = callsTable.insertRow();
            row.insertCell(0).textContent = call.phone;
            row.insertCell(1).textContent = call.start_time;
            row.insertCell(2).textContent = call.end_time;
        });
    } catch (err) {
        console.error('Error populating calls table: ', err);
    }
}

async function getUsage() {
    try {
        const response = await fetch('/usage');
        const usage_data = await response.json();

        const usageTable = document.getElementById('usageTable');
        usageTable.innerHTML = '';

        usage_data.forEach(usage => {
            const row = usageTable.insertRow();
            row.insertCell(0).textContent = usage.phone;
            row.insertCell(1).textContent = usage.date_rec;
            row.insertCell(2).textContent = usage.used;
        });
    } catch (err) {
        console.error('Error populating calls table: ', err);
    }
}

async function addCard() {

}

// General random generation functions

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(start, end) {
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    return date.toISOString().split('T')[0];
}

function randomTimestamp(start_date, end_date) {
    const start_time = start_date.getTime();
    const end_time = end_date.getTime();

    return new Date(Math.random() * (end_time - start_time) + start_time);
}

function normal_random(mean=0, sd=1) {
    const u = 1 - Math.random();
    const v = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos( 2.0 * Math.PI * v );

    return z * sd + mean;
}

// Functions for generating random customers, plans, calls, and usage

async function randomPhoneNumber() {
    // const country_code = randomInt(1, 9); Add later if doing international calls
    const response = await fetch('/customer'); //list of existing customers
    const customers = await response.json();
    const numbers = customers.map(customer => customer.phone);

    let phone_number;
    do {
        const num1 = randomInt(100, 999);
        const num2 = randomInt(100, 999);
        const num3 = randomInt(1000, 9999);
        phone_number = `(${num1})${num2}-${num3}`;
    } while (numbers.includes(phone_number)); //ensure phone number is unique

    return phone_number;
}

function randomNames() {
    const firstNames = ['Bill', 'Bob', 'Joe', 'Alice', 'Jessica', 'David']
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Garcia', 'Li', 'Jones']
    return {
        firstName: firstNames[randomInt(0, firstNames.length - 1)],
        lastName: lastNames[randomInt(0, lastNames.length - 1)]
    };
}

function randomAddress() {
    const streets = ['Main St', 'Elgin St', 'Cullen Blvd', 'MLK Blvd', 'Wheeler Ave']
    const streetNum = randomInt(100, 9999);
    const streetName = streets[randomInt(0, streets.length - 1)];

    return `${streetNum} ${streetName}`;
}

//Generates a random plan with an initial customer
async function generatePlans() {
    const startTime = performance.now();

    const count = parseInt(document.getElementById('planCount').value);
    console.log("Generate plans function called, count: ", count);
    const promises = [];
    let plan_options = [];

    try {
        const response = await fetch('/PlanOptions');
        plan_options = await response.json();
    } catch (err) {
        console.log('Error fetching plan options to generate random plan(s): ', err);
        return null;
    }

    let new_plan;
    try {
        for (let i = 0; i < count; i++) {
            const option = plan_options[randomInt(0, plan_options.length - 1)].option;
            const phone = await randomPhoneNumber();
            const {firstName, lastName} = randomNames();
            const dob = randomDate(new Date(1950, 0, 1), new Date(2006, 11, 31))
            const address = randomAddress();
            const enrollment_date = randomDate(new Date(2000, 0, 1), new Date()); //Assume company has been in business since 2000

            new_plan = {
                option,
                phone,
                first_name: firstName,
                last_name: lastName,
                dob,
                address,
                enroll_date: enrollment_date,
            };

            promises.push(
                fetch('/customer-plan', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(new_plan),
                })
            );
        }

        const result = await Promise.all(promises);

        const endTime = performance.now();
        const elapsed = endTime - startTime;
        document.getElementById('planTimeTaken').innerText =
            `Time to process: ${elapsed.toFixed()} ms`;

    } catch (err) {
        console.log('Error adding plan in batch: ', err);
        console.log(new_plan);
    }
}

// get a random plan from the database of existing plans
async function randomPlan() {
    try {
        const response = await fetch('/plan');
        const plans = await response.json();
        const index = randomInt(0, plans.length - 1);

        return {
            plan_id: plans[index].id,
            signup_date: new Date(plans[index].signup_date),
        };
    } catch (err) {
        console.error('Error fetching random plan: ', err);
        return null;
    }
}

// Generate customers for existing plans
async function generateCustomers() {
    const startTime = performance.now();

    const count = parseInt(document.getElementById('customerCount').value)
    // create array to send a batch request for performance purposes
    const promises = [];

    try {
        for(let i = 0; i < count; i++) {
            const phone = await randomPhoneNumber();
            const {firstName, lastName} = randomNames();
            const dob = randomDate(new Date(1950, 0, 1), new Date(2006, 11, 31))
            const address = randomAddress();

            const plan = await randomPlan();
            const index = randomInt(0, plan.length - 1);
            const random_enrollment = randomDate(new Date(plan.signup_date), new Date());

            const customer = {
                phone,
                first_name: firstName,
                last_name : lastName,
                dob,
                address,
                plan_id: plan.plan_id,
                enroll_date: random_enrollment,
            };

            promises.push(
                fetch('/customer', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(customer),
                })
            );
        }
        const results = await Promise.all(promises);

        const endTime = performance.now();
        const elapsed = endTime - startTime;
        document.getElementById('customerTimeTaken').innerText =
            `Time to process: ${elapsed.toFixed()} ms`;

    } catch (err) {
        console.error('Error adding customers: ', err);
    }
}

async function generateCalls() {
    const startTime = performance.now();

    const count = parseInt(document.getElementById('callCount').value);

    const promises = []; // for batch request

    const response = await fetch('/customer'); //list of existing customers
    const customers = await response.json();

    const numbers = customers.map(customer => customer.phone);
    const enrollments = customers.map(customer => customer.enroll_date);

    try {
        for(let i = 0; i < count; i++) {
            const index = randomInt(0, numbers.length - 1);

            const number = numbers[index];

            const start = randomTimestamp(new Date(enrollments[index]), new Date()); // start the call after they enroll, up until today

            let duration = normal_random(20 * 60000, 5 * 60000); //convert from ms to minutes
            if (duration <= 10 * 1000) {
                duration = 30 * 1000; // If invalid duration, set to 30 seconds
            }
            const end = new Date(start.getTime() + duration)
            const call = {
                phone: number,
                start_time: start,
                end_time: end,
            };

            promises.push(
                fetch('/call', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(call),
                })
            );
        }
        const endTime = performance.now();
        const elapsed = endTime - startTime;
        document.getElementById('callTimeTaken').innerText =
            `Time to process: ${elapsed.toFixed()} ms`;

    } catch (err) {
        console.error('Error generating calls: ', err);
    }
}

async function simulate() {
    try {
        const planCount = parseInt(document.getElementById('planCount').value);
        await generatePlans(planCount);
        console.log(`${planCount} Plans generated successfully.`);

        const customerCount = parseInt(document.getElementById('customerCount').value);
        await generateCustomers(customerCount);
        console.log(`${customerCount} Customers generated successfully.`);

        const callCount = parseInt(document.getElementById('callCount').value);
        await generateCalls(callCount);
        console.log(`${callCount} Calls generated successfully.`);

        alert("Simulation completed successfully!");
    } catch (err) {
        console.error('Error running simulation: ', err);
        alert("An error occurred during the simulation.");
    }
}