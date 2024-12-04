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

            if (customerTable.rows.length > 100) {
                customerTable.deleteRow(0);
            }
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

async function getCardInfo() {
    try {
        const response = await fetch('/cardInfo');
        const cardInfo = await response.json();

        const card_info_table = document.getElementById('bankTable');
        card_info_table.innerHTML = '';

        cardInfo.forEach(card => {
            const row = card_info_table.insertRow();
            row.insertCell(0).textContent = card.id;
            row.insertCell(1).textContent = card.phone;
            row.insertCell(2).textContent = card.balance;

            if (card_info_table.rows.length > 100) {
                card_info_table.deleteRow(0);
            }
        });

    } catch (err) {
        console.error('Error printing card info: ', err);
    }
}

async function getBilling() {
    try {
        const response = await fetch('/billInfo');
        const billings = await response.json();

        const bill_table = document.getElementById('billingTable');
        bill_table.innerHTML = '';

        billings.forEach(bill => {
            const row = bill_table.insertRow();
            row.insertCell(0).textContent = bill.plan_id;
            row.insertCell(1).textContent = bill.start_date;
            row.insertCell(2).textContent = bill.end_date;
            row.insertCell(3).textContent = bill.total;
            row.insertCell(4).textContent = bill.remaining_balance;

            if (bill_table.rows.length > 250) {
                bill_table.deleteRow(0);
            }
        });
    } catch (err) {
        console.error('Error printing billing table: ', err);
    }
}

async function getHistory() {
    try {
        const response = await fetch('/history');
        const payments = await response.json();

        const history_table = document.getElementById('paymentHistoryTable');
        history_table.innerHTML = '';

        payments.forEach(payment => {
            const row = history_table.insertRow();
            row.insertCell(0).textContent = payment.card_id;
            row.insertCell(1).textContent = payment.date_rec;
            row.insertCell(2).textContent = payment.amount;

            if (history_table.rows.length > 250) {
                history_table.deleteRow(0);
            }
        });

        const payment_table = document.getElementById('')
    } catch (err) {
        console.error('Error printing payment history table: ', err);
    }
}

/////     /////     /////     /////     /////     /////     /////     /////     /////
//List Plan Options and Plan Count for each
async function getPopularPlans() {
    try {
        const response = await fetch('/PopularPlans');
        if (!response.ok) {
            throw new Error(`Error fetching popular plans: ${response.statusText}`);
        }

        const popularPlans = await response.json();
        console.log('Received Popular Plans: ', popularPlans);

        const popularPlansTable = document.getElementById('popularPlansTable');
        popularPlansTable.innerHTML = '';

        popularPlans.forEach(plan => {
            const row = popularPlansTable.insertRow();
            row.insertCell(0).textContent = plan["Plan Option"];
            row.insertCell(1).textContent = plan["Plan Count"];
        });
    } catch (err) {
        console.error('Error fetching popular plans: ', err);
    }
}

async function getEarningsPerPlan(year = 2024, month = 1) {
    try {
        const response = await fetch(`/EarningsPerPlan?year=${year}&month=${month}`);
        if (!response.ok) {
            throw new Error(`Error fetching earnings per plan: ${response.statusText}`);
        }

        const earnings = await response.json();
        console.log('Received Plan Earnings: ', earnings);

        // Queried month display
        const queriedMonthElement = document.getElementById('queriedMonth');
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        queriedMonthElement.textContent = `${monthNames[month - 1]} ${year}`;

        // Populate the earnings table
        const earningsTable = document.getElementById('planEarningsTable').querySelector('tbody');
        earningsTable.innerHTML = '';

        earnings.forEach(plan => {
            const row = earningsTable.insertRow();
            row.insertCell(0).textContent = plan["Option"];
            row.insertCell(1).textContent = plan["Total Earned"];
        });
    } catch (err) {
        console.error('Error fetching earnings per plan: ', err);
    }
}

function loadEarningsForSelectedMonth() {
    const year = document.getElementById('yearSelect').value;
    const month = document.getElementById('monthSelect').value;
    getEarningsPerPlan(parseInt(year), parseInt(month));
}

let callUsageData = [];
let rowsDisplayed = 0;

async function getCallUsageLimit() {
    try {
        const response = await fetch('/limitsReached');
        if (!response.ok) {
            throw new Error(`Error fetching limits: ${response.statusText}`);
        }

        callUsageData = await response.json();
        rowsDisplayed = 0;
        toggleRows();
    } catch (err) {
        console.error('Error fetching limits: ', err);
    }
}

function generateHeaders(tableId, headers) {
    const table = document.getElementById(tableId);
    const thead = table.querySelector('thead');
    thead.innerHTML = '';

    const headerRow = thead.insertRow();
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        headerRow.appendChild(th);
    });
}

function toggleRows() {
    const callUsageTable = document.getElementById('callUsageTable').querySelector('tbody');
    const loadMoreContainer = document.getElementById('loadMoreContainer');
    callUsageTable.innerHTML = ''; // Clear the table body

    if (rowsDisplayed === 0) {
        const headers = [
            'Phone',
            'Plan Option',
            'Elapsed',
            'CALL LIMIT REACHED',
            'Data Used',
            'USAGE LIMIT REACHED'
        ];
        generateHeaders('callUsageTable', headers);

        const rowsToShow = Math.min(10, callUsageData.length);
        for (let i = 0; i < rowsToShow; i++) { // Shows first 10
            const row = callUsageTable.insertRow();
            row.insertCell(0).textContent = callUsageData[i]["Phone"];
            row.insertCell(1).textContent = callUsageData[i]["Plan Option"];
            row.insertCell(2).textContent = callUsageData[i]["Elapsed"];
            row.insertCell(3).textContent = callUsageData[i]["CALL LIMIT REACHED"];
            row.insertCell(4).textContent = callUsageData[i]["Data Used"];
            row.insertCell(5).textContent = callUsageData[i]["USAGE LIMIT REACHED"];
        }
        rowsDisplayed = rowsToShow;

        // Load 10 more
        if (rowsDisplayed < callUsageData.length) {
            loadMoreContainer.style.display = 'block';
        }
    } else {
        rowsDisplayed = 0;
        const thead = document.getElementById('callUsageTable').querySelector('thead');
        thead.innerHTML = '';
        loadMoreContainer.style.display = 'none';
    }
}

function loadMoreRows() {
    const callUsageTable = document.getElementById('callUsageTable').querySelector('tbody');
    const loadMoreContainer = document.getElementById('loadMoreContainer');

    const rowsToAdd = Math.min(10, callUsageData.length - rowsDisplayed);
    for (let i = rowsDisplayed; i < rowsDisplayed + rowsToAdd; i++) {
        const row = callUsageTable.insertRow();
        row.insertCell(0).textContent = callUsageData[i]["Phone"];
        row.insertCell(1).textContent = callUsageData[i]["Plan Option"];
        row.insertCell(2).textContent = callUsageData[i]["Elapsed"];
        row.insertCell(3).textContent = callUsageData[i]["CALL LIMIT REACHED"];
        row.insertCell(4).textContent = callUsageData[i]["Data Used"];
        row.insertCell(5).textContent = callUsageData[i]["USAGE LIMIT REACHED"];
    }
    rowsDisplayed += rowsToAdd;

    // Hide "Load More Rows" button if all rows are displayed
    if (rowsDisplayed >= callUsageData.length) {
        loadMoreContainer.style.display = 'none';
    }
}

function formatPhoneNumber(phone) {
    return phone.replace(/[^0-9]/g, '').replace(/(\d{3})(\d{3})(\d{4})/, '($1)$2-$3');
}

async function checkBill() {
    const phone = document.getElementById('searchPhone').value.trim(); // Get the phone number

    const tableBody = document.getElementById('checkBillTable');
    tableBody.innerHTML = ''; // Clear the table before adding new rows

    try {
        // Fetch the data from the server
        const response = await fetch(`/CheckBill?phone=${encodeURIComponent(phone)}`);
        if (!response.ok) {
            throw new Error(`Error fetching bill: ${response.statusText}`);
        }

        const bills = await response.json();
        console.log('Received Bills: ', bills); // Debugging log

        if (bills.length === 0) {
            // If no bills are found, show a message in the table
            const row = tableBody.insertRow();
            const cell = row.insertCell(0);
            cell.colSpan = 2;
            cell.textContent = 'No records found for this phone number.';
            cell.style.textAlign = 'center';
            return;
        }

        // Loop through the bills and add rows to the table
        bills.forEach(bill => {
            const row = tableBody.insertRow();
            row.insertCell(0).textContent = bill["Plan_ID"]; // Use the exact property name from the server response
            row.insertCell(1).textContent = bill["Total_Owed"]; // Use the exact property name from the server response
        });
    } catch (err) {
        console.error('Error fetching bill:', err);
    }
}
/////     /////     /////     /////     /////     /////     /////     /////     /////

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

            if (callsTable.rows.length > 250) {
                callsTable.deleteRow(0);
            }
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

            if(usageTable.rows.length > 250) {
                usageTable.deleteRow(0);
            }
        });
    } catch (err) {
        console.error('Error populating calls table: ', err);
    }
}

async function addCard() {
    const phone = document.getElementById('cardCust').value;
    try {
        await fetch('/card', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
               phone
            })
        });
        alert('Card added successfully!');
    } catch (err) {
        alert('Error adding card');
        console.error('Error adding card: ', err);
    }
}

async function makePayment() {
    const plan_id = document.getElementById('planID').value;
    const start_date = document.getElementById('startDate').value;
    const card_id = document.getElementById('cardID').value;
    const payment_amount = document.getElementById('paymentAmount').value;

    if (!plan_id || !start_date || !card_id || !payment_amount) {
        alert('Please fill in all fields.');
        return;
    }
 
 
    const payment_date = new Date().toISOString().split('T')[0];

    const payment = {
        plan_id: parseInt(plan_id),
        start_date: start_date,
        card_id: parseInt(card_id),
        payment_amount: parseFloat(payment_amount),
        payment_date: payment_date
    };

    try {
        const response = await fetch('/card', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payment)
        });

        if (response.ok) {
            alert('Payment successful!');
        } else {
            const errorMessage = await response.text();
            alert(`Payment failed: ${errorMessage}`);
        }
    } catch (err) {
        console.error('Error making payment:', err);
        alert('An error occurred while processing the payment.');
    }
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
    const card_promises = [];

    let plan_options = [];

    try {
        const response = await fetch('/PlanOptions');
        plan_options = await response.json();
    } catch (err) {
        console.log('Error fetching plan options to generate random plan(s): ', err);
        return null;
    }

    let new_plan; // declare outside to print in error statement to debug
    try {
        for (let i = 0; i < count; i++) {
            const option = plan_options[randomInt(0, plan_options.length - 1)].option;
            const phone = await randomPhoneNumber();
            const {firstName, lastName} = randomNames();
            const dob = randomDate(new Date(1950, 0, 1), new Date(2008, 11, 31))
            const address = randomAddress();
            const enrollment_date = randomDate(new Date(2019, 0, 1), new Date()); //Assume company has been in business since 2019

            new_plan = {
                option,
                phone,
                first_name: firstName,
                last_name: lastName,
                dob,
                address,
                enroll_date: enrollment_date,
            };


            const plan_response = await fetch('/customer-plan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(new_plan),
            })

            const cardPromise = fetch('/card', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ phone }),
            });
            promises.push(cardPromise);
        }

        const card_result = await Promise.all(promises);

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

            const customerResponse = await fetch('/customer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(customer),
            })

            const cardPromise = fetch('/card', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ phone }),
            });
            promises.push(cardPromise);
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

async function generatePayments(paymentCount) {
    const [cardsResponse, customersResponse, plansResponse, billsResponse, historyResponse] = await Promise.all([
        fetch('/cardInfo'),
        fetch('/customer'),
        fetch('/plan'),
        fetch('/billInfo'),
        fetch('/history')
    ]);

    const cards = await cardsResponse.json();
    const customers = await customersResponse.json();
    const plans = await plansResponse.json();
    const bills = await billsResponse.json();
    const history = await historyResponse.json();

    const promises = [];
    const seenPayments = new Set();

    for(let i = 0; i < paymentCount; i++) {
        const randomCard = cards[randomInt(0, cards.length - 1)];

        const randomCustomer = customers.find(c => c.phone === randomCard.phone);

        const customerPlan = plans.find(plan => plan.id === randomCustomer.plan_id);

        const customerBills = bills.filter(bill => bill.plan_id === customerPlan.id && bill.remaining_balance > 0);


        if (customerBills.length === 0) {
            console.warn(`No bills found for plan ID: ${customerPlan.id}`);
            continue;
        }

        let randomBill = customerBills[randomInt(0, customerBills.length - 1)];

        let paymentAmount = randomBill.remaining_balance;

        const partial_pay_chance = 0.10;
        if (Math.random() < partial_pay_chance) {
            paymentAmount = Math.random() * randomBill.remaining_balance * 0.85 + randomBill.remaining_balance * .15;
        }
        if (paymentAmount === 0 || randomBill.remaining_balance - paymentAmount < 0) {
            console.warn(`Bill overpayment attempted, skipping`);
            continue;
        }

        const paymentDate = new Date(randomDate(new Date(randomBill.start_date), new Date(randomBill.end_date))).toISOString().split('T')[0];

        const existingPayment = history.filter(record =>
            record.card_id === randomCard.id && record.Date_rec === paymentDate
        );
        if (existingPayment.length > 0) {
            console.warn(`Duplicate payment attempt for Card: ${randomCard.id} on date: ${paymentDate}`);
            continue;
        }

        const paymentKey = `${randomCard.id}-${paymentDate}`;
        if(seenPayments.has(paymentKey)) {
            console.warn(`Duplicate payment attempt for Card: ${randomCard.id} on date: ${paymentDate}`);
            continue;
        }

        seenPayments.add(paymentKey);

        promises.push(
            fetch ('/card', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    plan_id: customerPlan.id,
                    start_date: randomBill.start_date,
                    card_id: randomCard.id,
                    payment_amount: paymentAmount,
                    payment_date: paymentDate
                })
            })
        );

    }
    await Promise.all(promises);
}

async function simulate() {
    try {
        const planCount = parseInt(document.getElementById('planCount').value);
        console.log('Generating plans:', planCount);
        await generatePlans(planCount);
        console.log(`${planCount} Plans generated successfully.`);

        const customerCount = parseInt(document.getElementById('customerCount').value);
        console.log('Generating customers:', customerCount);
        await generateCustomers(customerCount);
        console.log(`${customerCount} Customers generated successfully.`);

        const callCount = parseInt(document.getElementById('callCount').value);
        console.log('Generating calls:', callCount);
        await generateCalls(callCount);
        console.log(`${callCount} Calls generated successfully.`);

        alert("Simulation completed successfully!");
    } catch (err) {
        console.error('Error running simulation: ', err);
        alert("An error occurred during the simulation.");
    }
}

async function updateBills() {
    const startTime = performance.now();

    // Create empty billing rows for plans without any bills
    try {
        await fetch('/bill', {
            method: 'POST',
        });

        await fetch('/bill', {
            method: 'PUT',
        });
        alert('Bills updated Successfully')
    } catch (err) {
        console.error('Error updating Bills', err);
        alert('Error Updating Bills');
    }

    console.log('After update request');

    const paymentCount = document.getElementById('paymentCount').value;
    await generatePayments(paymentCount);
    console.log(`${paymentCount} Payments generated successfully.`);

    const endTime = performance.now();
    const elapsed = endTime - startTime;
    document.getElementById('billUpdateTimeTaken').innerText =
            `Time to process: ${elapsed.toFixed()} ms`;
}
