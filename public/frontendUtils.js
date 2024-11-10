// Frontend JS Functions

async function getCustomers() {
    try {
        const response = await fetch('/customer');
        const customers = await response.json();

        const customerTable = document.getElementById('customerTable');
        customerTable.innerHTML = ''; // Clear the table before adding new rows

        customers.forEach(customer => {
            const row = customerTable.insertRow();
            row.insertCell(0).textContent = customer.id;
            row.insertCell(1).textContent = customer.first_name;
            row.insertCell(2).textContent = customer.last_name;
            row.insertCell(3).textContent = customer.dob;
            row.insertCell(4).textContent = customer.address;
            row.insertCell(5).textContent = customer.phone
        });
        document.addEventListener('DOMContentLoaded', getCustomers);
    } catch (error) {
        console.error('Error fetching customers:', error);
    }
}