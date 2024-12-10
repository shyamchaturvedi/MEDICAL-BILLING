const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const session = require('express-session');
const mongoose = require('mongoose');

dotenv.config();

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/pharmacyDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('MongoDB connected successfully');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// Create Mongoose Schemas
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const medicineSchema = new mongoose.Schema({
    medicineId: { type: String, required: true, unique: true },
    rackNo: { type: String, required: true },
    medicineName: { type: String, required: true },
    genericName: { type: String, required: true },
    mrp: { type: Number, required: true },
    sellPrice: { type: Number, required: true },
    expiryDate: { type: Date, required: true },
    quantity: { type: Number, required: true, min: 0 },
    supplierPrice: { type: Number, required: true },
    supplier: { type: String, required: true },
});

// Create Mongoose Models
const User = mongoose.model('User', userSchema);
const Medicine = mongoose.model('Medicine', medicineSchema);

// Create Express app
const app = express();
const port = 3000;

// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secret_key',
    resave: false,
    saveUninitialized: true,
}));

// Index page (landing page)
app.get('/', (req, res) => {
    res.render('index');
});

// Dashboard page
app.get('/dashboard', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.render('dashboard', { user: req.session.user });
});

// Login page
app.get('/login', (req, res) => {
    res.render('login', { message: req.session.message });
    req.session.message = ""; // Clear message after displaying
});

// Registration page
app.get('/register', (req, res) => {
    res.render('register', { message: req.session.message });
    req.session.message = ""; // Clear message after displaying
});

// Medicine stock page
app.get('/stock', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    const medicines = await Medicine.find();
    res.render('stock', { user: req.session.user, medicines, message: req.session.message || '' });
    req.session.message = ""; // Clear message after displaying (if it was set).
});

// Add medicine page
app.get('/add-medicine', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.render('add-medicine', { message: req.session.message });
    req.session.message = ""; // Clear message after displaying
});

// Login submission route
app.post('/submit_login', async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    // Validate login credentials
    if (user && bcrypt.compareSync(password, user.password)) {
        req.session.user = username;
        res.redirect('/dashboard');
    } else {
        req.session.message = 'Invalid credentials';
        res.redirect('/login');
    }
});

// Registration submission route
app.post('/submit_register', async (req, res) => {
    const { username, password, confirmPassword } = req.body;

    if (username && password && password === confirmPassword) {
        if (await User.exists({ username })) {
            req.session.message = 'Username already exists';
            return res.redirect('/register');
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        req.session.message = 'Registration successful! Please log in.';
        res.redirect('/login');
    } else {
        req.session.message = 'Invalid registration data';
        res.redirect('/register');
    }
});

// Add medicine submission route
app.post('/add-medicine', async (req, res) => {
    const { rackNo, medicineName, genericName, mrp, sellPrice, expiryDate, quantity, supplierPrice, supplier } = req.body;

    // Generate a unique medicine ID
    const medicines = await Medicine.find();
    const medicineCount = medicines.length + 1; // Count the existing medicines
    const medicineId = `AMC${String(medicineCount).padStart(4, '0')}`; // Generate ID like AMC0001

    // Create a new medicine entry
    const newMedicine = new Medicine({
        medicineId,
        rackNo,
        medicineName,
        genericName,
        mrp,
        sellPrice,
        expiryDate,
        quantity,
        supplierPrice,
        supplier
    });

    await newMedicine.save();
    req.session.message = 'Medicine added successfully!';
    res.redirect('/add-medicine');
});

// Edit medicine page
app.get('/edit-medicine/:id', async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
        req.session.message = "Medicine not found.";
        return res.redirect('/stock');
    }
    res.render('edit-medicine', { medicine, message: req.session.message });
    req.session.message = ""; // Clear message after using
});

// Update medicine submission route
app.post('/update-medicine/:id', async (req, res) => {
    const { rackNo, medicineName, genericName, mrp, sellPrice, expiryDate, quantity, supplierPrice, supplier } = req.body;

    // Update the medicine entry
    await Medicine.findByIdAndUpdate(req.params.id, {
        rackNo,
        medicineName,
        genericName,
        mrp,
        sellPrice,
        expiryDate,
        quantity,
        supplierPrice,
        supplier
    });
    
    req.session.message = "Medicine updated successfully!";
    res.redirect('/stock');
});

// Logout route
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error(err);
            return res.redirect('/');
        }
        res.redirect('/');
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});