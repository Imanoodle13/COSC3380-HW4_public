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
        console.error('Error fetchin plans: ', err);
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

    try {
        const response = await fetch('/plan', {
           method: 'POST',
           headers: {
                'Content-Type': 'application/json'
           },
            body: JSON.stringify({
               option, phone, first_name, last_name, dob, address
            })
        });

        alert('Plan Created successfully!')
    } catch (err) {
        console.error('Error creating plan: ', err)
    }
}