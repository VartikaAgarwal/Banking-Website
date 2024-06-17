// Wait for the DOM content to be fully loaded before executing JavaScript
document.addEventListener('DOMContentLoaded', () => {
    // Add event listener to the "View All Customers" button
    document.getElementById('view-customers-button').addEventListener('click', viewAllCustomers);
});

// Function to fetch all customers from the server and display them
async function viewAllCustomers() {
    try {
        // Fetch data from the '/api/customers' endpoint
        const response = await fetch('/api/customers');

        // Check if the response is successful
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        // Parse the response JSON data
        const customers = await response.json();
        const customerList = document.getElementById('customer-list');

        // Clear any existing content in the customer list
        customerList.innerHTML = '';

        // Create a new table element dynamically
        const table = document.createElement('table');
        table.style.width = '100%';
        table.border = '1';

        // Create table header row
        const thead = table.createTHead();
        const headerRow = thead.insertRow();
        ['Name', 'Email', 'Balance', 'Actions'].forEach(text => {
            const th = document.createElement('th');
            th.textContent = text;
            headerRow.appendChild(th);
        });

        // Create table body rows for each customer
        const tbody = document.createElement('tbody');
        customers.forEach(customer => {
            const row = tbody.insertRow();
            const nameCell = row.insertCell();
            const emailCell = row.insertCell();
            const balanceCell = row.insertCell();
            const actionsCell = row.insertCell();

            // Create a link for the customer's name that triggers viewCustomer function
            const nameLink = document.createElement('a');
            nameLink.href = `javascript:viewCustomer('${customer._id}')`;
            nameLink.textContent = customer.name;
            nameCell.appendChild(nameLink);

            emailCell.textContent = customer.email;
            balanceCell.textContent = `$${customer.balance}`;

            // Create a button to view customer details
            const viewButton = document.createElement('button');
            viewButton.textContent = 'View Details';
            viewButton.onclick = () => viewCustomer(customer._id);
            actionsCell.appendChild(viewButton);
        });
        table.appendChild(tbody);

        // Append the created table to the customer list section
        customerList.appendChild(table);

        // Show/hide sections based on navigation
        showCustomersSection();
    } catch (error) {
        console.error('Error:', error);
    }
}

// Function to fetch and display details of a specific customer
async function viewCustomer(id) {
    try {
        // Fetch data from the `/api/customers/${id}` endpoint
        const response = await fetch(`/api/customers/${id}`);

        // Check if the response is successful
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        // Parse the response JSON data
        const customer = await response.json();
        const customerDetails = document.getElementById('customer-details');

        // Create a new table element for customer details
        const table = document.createElement('table');
        table.classList.add('customer-table');

        // Define rows of customer details
        const rows = [
            ['Name', customer.name],
            ['Email', customer.email],
            ['Balance', `$${customer.balance}`]
        ];

        // Populate table rows with customer data
        rows.forEach(rowData => {
            const row = table.insertRow();
            const [label, value] = rowData;
            row.insertCell(0).textContent = label;
            row.insertCell(1).textContent = value;
        });

        // Clear any existing content in customer details and append the table
        customerDetails.innerHTML = '';
        customerDetails.appendChild(table);

        // Show/hide sections based on navigation
        showCustomerDetailsSection();

        // Set the from-customer-id value for transfer form
        document.getElementById('from-customer-id').value = customer._id;
    } catch (error) {
        console.error('Error:', error);
    }
}

// Function to display the transfer form and populate the "To" customer select options
function showTransferForm() {
    fetch('/api/customers')
        .then(response => response.json())
        .then(customers => {
            const toCustomerSelect = document.getElementById('to-customer-id');
            toCustomerSelect.innerHTML = '';

            // Populate the select options with customer names and emails
            customers.forEach(customer => {
                const option = document.createElement('option');
                option.value = customer._id;
                option.textContent = `${customer.name} - ${customer.email}`;
                toCustomerSelect.appendChild(option);
            });

            // Show/hide sections based on navigation
            showTransferSection();
        })
        .catch(error => console.error('Error:', error));
}

// Function to handle form submission for transferring money between customers
document.getElementById('transfer-form').onsubmit = async function (event) {
    event.preventDefault();

    // Retrieve form data
    const fromCustomerId = document.getElementById('from-customer-id').value;
    const toCustomerId = document.getElementById('to-customer-id').value;
    const amount = document.getElementById('amount').value;
    const transferAmount = Number(amount); // Convert amount to a number

    try {
        // Send POST request to '/api/transfer' with transfer details
        const response = await fetch('/api/transfer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ fromCustomerId, toCustomerId, amount: transferAmount })
        });

        // Check if the response is successful
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        // Alert user about successful transfer
        alert('Transfer successful');

        // Refresh the customer list after successful transfer
        viewAllCustomers();
    } catch (error) {
        console.error('Error:', error);
        alert(`Error: ${error.message}`);
    }

    // Show/hide sections based on navigation
    showCustomersSection();
}

// Function to navigate back to the home section
function goHome() {
    // Show/hide sections based on navigation
    document.getElementById('customers').style.display = 'none';
    document.getElementById('home').style.display = 'block';
}

// Function to navigate back to the customers section
function goBack() {
    // Show/hide sections based on navigation
    document.getElementById('customer').style.display = 'none';
    document.getElementById('customers').style.display = 'block';
}

// Function to show the customers section and hide others
function showCustomersSection() {
    document.getElementById('home').style.display = 'none';
    document.getElementById('customers').style.display = 'block';
    document.getElementById('customer').style.display = 'none';
    document.getElementById('transfer').style.display = 'none';
}

// Function to show the customer details section and hide others
function showCustomerDetailsSection() {
    document.getElementById('home').style.display = 'none';
    document.getElementById('customers').style.display = 'none';
    document.getElementById('customer').style.display = 'block';
    document.getElementById('transfer').style.display = 'none';
}

// Function to show the transfer section and hide others
function showTransferSection() {
    document.getElementById('home').style.display = 'none';
    document.getElementById('customers').style.display = 'none';
    document.getElementById('customer').style.display = 'none';
    document.getElementById('transfer').style.display = 'block';
}
