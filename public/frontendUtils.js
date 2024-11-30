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

// Functions for generating random customers and plans

function randomPhoneNumber() {
    // const country_code = randomInt(1, 9); Add later if doing international calls
    const num1 = randomInt(100, 999);
    const num2 = randomInt(100, 999);
    const num3 = randomInt(1000, 9999);

    return `(${num1})${num2}-${num3}`
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

    try {
        for (let i = 0; i < count; i++) {
            const option = plan_options[randomInt(0, plan_options.length - 1)].option;
            const phone = randomPhoneNumber();
            const {firstName, lastName} = randomNames();
            const dob = randomDate(new Date(1950, 0, 1), new Date(2006, 11, 31))
            const address = randomAddress();
            const enrollment_date = randomDate(new Date(2000, 0, 1), new Date()); //Assume company has been in business since 2000

            const new_plan = {
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

        alert("Plans created successfully")
    } catch (err) {
        console.log('Error adding plan in batch: ', err);
    }
}

// get a random plan from the database of existing plans
async function randomPlan() {
    try {
        const response = await fetch('/plan');
        const plans = await response.json();

        return plans[randomInt(0, plans.length - 1)].id;
    } catch (err) {
        console.error('Error fetching random plan: ', err);
        return null;
    }
}

async function generateCustomers() {
    const startTime = performance.now();

    const count = parseInt(document.getElementById('customerCount').value)
    // create array to send a batch request for performance purposes
    const promises = [];

    try {
        for(let i = 0; i < count; i++) {
            const phone = randomPhoneNumber();
            const {firstName, lastName} = randomNames();
            const dob = randomDate(new Date(1950, 0, 1), new Date(2006, 11, 31))
            const address = randomAddress();
            const plan = await randomPlan();

            const customer = {
                phone,
                first_name: firstName,
                last_name : lastName,
                dob,
                address,
                plan_id: plan,
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

        alert(`${count} customers added successfully!`)
    } catch (err) {
        console.error('Error adding customers: ', err);
    }
}

async function generateCalls() {

}