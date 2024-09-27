const express = require('express');
const multer = require('multer');
const path = require('path');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Set up MySQL connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
});

// Connect to the database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('MySQL connected successfully to agritech_db...');
});

// Middleware for parsing form data and JSON
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Express session middleware
app.use(
    session({
        secret: 'secretkey',
        resave: true,
        saveUninitialized: true,
    })
);

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Serve the register page
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/register.html'));
});

// Serve the login page
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/login.html'));
});

// Dashboard (Protected Route)
app.get('/dashboard', (req, res) => {
    if (req.session.loggedin) {
        res.sendFile(path.join(__dirname, 'public/index.html')); 
    } else {
        res.redirect('/login');
    }
});

// Register route
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    // Validate user input
    if (!username || !password) {
        return res.status(400).json({ error: 'Please fill all fields' });
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user into the database
    db.query(
        'INSERT INTO users (username, password) VALUES (?, ?)',
        [username, hashedPassword],
        (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            // Redirect to login page after registration
            res.redirect('/login');
        }
    );
});

// Login route
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
        return res.status(400).json({ error: 'Please fill all fields' });
    }

    // Check for user in the database
    db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
        if (err || results.length === 0) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const user = results[0];

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Set user session
        req.session.loggedin = true;
        req.session.username = user.username;
        req.session.userId = user.id;

        // Redirect to dashboard after login
        res.redirect('/dashboard');
    });
});

// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.redirect('/login');
    });
});

// Image storage setup with multer
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 1000000 }, 
    fileFilter: (req, file, cb) => {
        checkFileType(file, cb);
    }
}).single('image');

// File type validation
function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Only images (jpg, jpeg, png) are allowed!');
    }
}

// Route to handle image upload and processing
app.post('/upload-image', (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            return res.status(400).json({ error: err });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Simulate analysis (replace with actual API call)
        const analysis = {
            name: 'Sample Plant', 
            careInstructions: 'Water daily, keep in sunlight.'
        };

        res.json({ analysis });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
