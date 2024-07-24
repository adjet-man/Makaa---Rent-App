const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ejs = require('ejs');

const app = express();
const port = 3000;

// Set the view engine to EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Set up middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
//app.use(express.static('public'));

app.use('/uploads', express.static('uploads'));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));


// Configure Multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Create uploads directory if it doesn't exist
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Database connection
const db = mysql.createConnection({
    host: '[insert host here]',
    user: '[insert user]',
    password: '[insert password]',
    database: '[insert database name]'
});

db.connect(err => {
    if (err) throw err;
    console.log('Connected to the database');
});

// Route to serve the home page 
app.get('/', (req, res) => {
    res.render('home');
});

app.get('/home', (req, res) => {
    res.render('home');
});

// Route to serve the form page
app.get('/form', (req, res) => {
    res.render('form'); 
});

// Route to serve the select page 
app.get('/select', (req, res) => {
    res.render('select');
});

app.get('/apartments', (req, res) => {
    res.render('apartments', { locations: [] });
});



// Handle form submission
app.post('/submit', upload.single('Picture'), (req, res) => {
    const { Phone, Name, Price, Address, Type, Bathroom , Bed, Benefit_1, Benefit_2, Benefit_3, Description} = req.body;
    const Picture = req.file.filename;

    const sql = 'INSERT INTO rooms (Number, Name, Price, Location, Type, Bathroom , Bed, Benefit_1, Benefit_2, Benefit_3, Description,Picture) VALUES (?, ?, ?,?, ? , ? , ?, ? , ?, ?, ?, ?)';
    db.query(sql, [Phone, Name, Price, Address, Type, Bathroom , Bed, Benefit_1, Benefit_2, Benefit_3,Description,Picture], (err, result) => {
        
        if (err) {
            return res.render('form', { success: false, message: 'Something went wrong. Please try again later.' });
        }

        res.render('form', { success: true, message: 'Form submitted successfully' });
    });
});


// Route to handle search requests and display results on a new page
app.get('/search', (req, res) => {
    const searchTerm = `%${req.query.location}%`;
    const sql = 'SELECT * FROM rooms WHERE Location LIKE ?';   

    db.query(sql, [searchTerm], (err, results) => {
        if (err) throw err;
        res.render('apartments', { locations: results });
    });
});

app.get('/details/:rid', (req, res) => {
    const propertyId = req.params.rid;
  
    // SQL query to fetch the property details
    const query = 'SELECT * FROM rooms WHERE rid = ?';
    
    // Execute the query
    db.query(query, [propertyId], (error, results) => {
      if (error) {
        console.error('Error fetching property details:', error);
        res.status(500).render('404');
      } else if (results.length > 0) {
        res.render('details', { property: results[0] });
      } else {
        console.error('Property not found');
        res.status(404).render('404');
      }
    });
  });

  app.use((req, res, next) => {
    res.status(404).render('404');
  });

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
 

 

 