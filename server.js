const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride('_method'));  // To support PUT and DELETE methods

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',  // replace with your MySQL username
    password: 'piyush@223',  // replace with your MySQL password
    database: 'productDB'
});

// Basic authentication middleware
const auth = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.setHeader('WWW-Authenticate', 'Basic realm="Admin Area"');
        return res.status(401).send('Authentication required');
    }

    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');

    if (username === 'admin' && password === 'password') { // replace with your desired credentials
        return next();
    } else {
        res.setHeader('WWW-Authenticate', 'Basic realm="Admin Area"');
        return res.status(401).send('Invalid credentials');
    }
};

// Protect the /admin route and all its subroutes with the auth middleware
app.use('/admin', auth);

// Route to display products on the main page
app.get('/', (req, res) => {
    let sql = 'SELECT * FROM products';
    db.query(sql, (err, result) => {
        if (err) {
            res.send('Error fetching data');
            return;
        }
        res.render('index', { products: result });
    });
});

// Admin panel route
app.get('/admin', (req, res) => {
    let sql = 'SELECT * FROM products';
    db.query(sql, (err, result) => {
        if (err) {
            res.send('Error fetching data');
            return;
        }
        res.render('admin', { products: result });
    });
});

// Route to show form to add a new product
app.get('/admin/add', (req, res) => {
    res.render('add');
});

// Route to handle adding a new product
app.post('/admin/add', (req, res) => {
    const { name, details, price, image } = req.body;
    let sql = `INSERT INTO products (name, details, price, image) VALUES (?, ?, ?, ?)`;
    db.query(sql, [name, details, price, image], (err) => {
        if (err) {
            res.send('Error inserting data');
            return;
        }
        res.redirect('/admin');
    });
});

// Route to show form to edit a product
app.get('/admin/edit/:id', (req, res) => {
    let sql = 'SELECT * FROM products WHERE id = ?';
    db.query(sql, [req.params.id], (err, result) => {
        if (err) {
            res.send('Error fetching data');
            return;
        }
        res.render('edit', { product: result[0] });
    });
});

// Route to handle editing a product
app.put('/admin/edit/:id', (req, res) => {
    const { name, details, price, image } = req.body;
    let sql = 'UPDATE products SET name = ?, details = ?, price = ?, image = ? WHERE id = ?';
    db.query(sql, [name, details, price, image, req.params.id], (err) => {
        if (err) {
            res.send('Error updating data');
            return;
        }
        res.redirect('/admin');
    });
});

// Route to handle deleting a product
app.delete('/admin/delete/:id', (req, res) => {
    let sql = 'DELETE FROM products WHERE id = ?';
    db.query(sql, [req.params.id], (err) => {
        if (err) {
            res.send('Error deleting data');
            return;
        }
        res.redirect('/admin');
    });
});
// Start the server
app.listen(5000, () => {
    console.log('Server running on http://localhost:5000');
});
