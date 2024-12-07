const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as the templating engine
app.set('view engine', 'ejs');

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Middleware for parsing request body
app.use(bodyParser.urlencoded({ extended: true }));

// Session middleware
app.use(session({
    secret: 'mySecret', // Use a secure random string in production
    resave: false,
    saveUninitialized: true
}));

// In-memory data stores
let users = {}; // Store registered users
let medicines = [ // Sample medicines with unique IDs
    { id: '1', name: 'Ranitidine Hcl Tablets', mrp: 30 },
    { id: '2', name: 'Paracetamol', mrp: 10 },
    { id: '3', name: 'Ibuprofen', mrp: 20 },
    { id: '4', name: 'Cetrizine', mrp: 15 }
];
let slipNumber = 1; // Track slip numbers for bills
let bills = []; // Store bills

// Home route that redirects to login
app.get('/', (req, res) => {
    res.redirect('/login');
});

// Login route
app.get('/login', (req, res) => {
    res.render('login', { error: req.session.error || null });
    req.session.error = null; // Reset error on the login page
});

// Signup route
app.get('/signup', (req, res) => {
    res.render('signup', { error: req.session.error || null });
});

// Handle signup logic
app.post('/signup', (req, res) => {
    const { email, password } = req.body;

    // Simple validation
    if (users[email]) {
        req.session.error = 'User already exists!';
        return res.redirect('/signup');
    }

    // Register user
    users[email] = { email, password }; // Store user info, hash the password in production
    res.redirect('/login');
});

// Handle login logic
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Validate user credentials
    if (users[email] && users[email].password === password) {
        req.session.user = users[email]; // Save user in session
        return res.redirect('/dashboard');
    } else {
        req.session.error = 'Invalid email or password';
        return res.redirect('/login');
    }
});

// Dashboard route
app.get('/dashboard', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login'); // Redirect to login if not authenticated
    }
    res.render('dashboard', { user: req.session.user, medicines }); // Pass user info and medicines
});

// Add Medicine route (GET)
app.get('/add-medicine', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login'); // Redirect if not authenticated
    }
    res.render('add_medicine'); // Render Add Medicine form
});

// Handle Add Medicine logic (POST)
app.post('/add-medicine', (req, res) => {
    const medicine = { id: String(medicines.length + 1), ...req.body }; // Create new medicine with unique ID
    medicines.push(medicine); // Save medicine

    const currentSlipNumber = slipNumber++; // Update slip number

    // Render the slip for the added medicine
    res.render('slip', { slipNumber: currentSlipNumber, addedMedicine: medicine });
});

// View all medicines
app.get('/medicines', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login'); // Redirect if not authenticated
    }
    res.render('stock', { medicines }); // Render stock with medicines
});

// Bill route
app.get('/bill', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login'); // Redirect if not authenticated
    }
    res.render('bill', { slipNumber, medicines }); // Pass slipNumber and medicines to the bill page
});

// Handle Bill Submission
app.post('/submit-bill', (req, res) => {
    const { customerName, billNumber, items } = req.body;

    if (!items) {
        req.session.error = 'Items cannot be empty.';
        return res.redirect('/bill');
    }

    let billItems;
    try {
        billItems = items.split(';').map(item => JSON.parse(item)).filter(item => item.name); // Parse items
    } catch (error) {
        req.session.error = 'Invalid items JSON format.';
        return res.redirect('/bill');
    }

    const totalAmount = billItems.reduce((total, item) => total + (item.mrp * (item.quantity || 0)), 0);

    const bill = {
        customerName,
        billNumber,
        items: billItems,
        totalAmount
    };

    bills.push(bill); // Store the generated bill

    res.render('bill_slip', { bill }); // Display the bill slip
});

// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/dashboard'); // Handle error if needed
        }
        res.redirect('/login'); // Redirect to login after logout
    });
});

// Edit Medicine Route (GET)
app.get('/edit-medicine/:id', (req, res) => {
    const medicineId = req.params.id;
    const medicine = medicines.find(med => med.id === medicineId);

    if (!medicine) {
        return res.status(404).send('Medicine not found'); // Handle not found case
    }

    res.render('edit_medicine', { medicine }); // Render edit form with specific medicine data
});

// Handle Edit Medicine logic (POST)
app.post('/edit-medicine/:id', (req, res) => {
    const medicineId = req.params.id;
    const updatedMedicine = req.body;

    const index = medicines.findIndex(med => med.id === medicineId);
    if (index !== -1) {
        medicines[index] = { ...medicines[index], ...updatedMedicine }; // Update existing medicine
        res.redirect('/medicines'); // Redirect back to medicines list
    } else {
        res.status(404).send('Medicine not found'); // Handle not found case
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});