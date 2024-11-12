const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;
const bcrypt = require('bcrypt'); // Make sure bcrypt is required at the top
app.use(cors());
app.use(bodyParser.json());

app.use(express.urlencoded({ extended: false }));
// Set up MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'angular', 
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Connected to the database');
});

// Insert user data
const bcrypt = require('bcrypt'); // Make sure bcrypt is required at the top

app.post('/api/insert', async (req, res) => {
  const { name, age, password } = req.body;

  // Check for required fields
  if (!name || !age || !password) {
    return res.status(400).json({ message: 'Name, age, and password are required fields' });
  }

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert data into the database
    const sql = 'INSERT INTO user (name, age, password) VALUES (?, ?, ?)';
    db.query(sql, [name, age, hashedPassword], (err, result) => {
      if (err) {
        console.error('Error inserting data:', err);
        return res.status(500).json({ message: 'Error inserting data' });
      }
      res.status(200).json({ message: 'Data inserted successfully', result });
    });
  } catch (error) {
    console.error('Error hashing password:', error);
    res.status(500).json({ message: 'Error processing request' });
  }
});


// Update a user
app.put('/api/update/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const { name, age } = req.body;

  if (!name || !age) {
    return res.status(400).json({ message: 'Name and age are required fields' });
  }

  const sql = 'UPDATE user SET name = ?, age = ? WHERE id = ?';
  db.query(sql, [name, age, userId], (err, result) => {
    if (err) {
      console.error('Error updating data:', err);
      return res.status(500).json({ message: 'Error updating data' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User updated successfully' });
  });
});

// Delete a user
app.delete('/api/delete/:id', (req, res) => {
  const userId = parseInt(req.params.id);

  const sql = 'DELETE FROM user WHERE id = ?';
  db.query(sql, [userId], (err, result) => {
    if (err) {
      console.error('Error deleting data:', err);
      return res.status(500).json({ message: 'Error deleting data' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  });
});

// Get items with search functionality
app.get('/items', (req, res) => {
  let search = req.query.search || '';
  let sql = `SELECT * FROM user WHERE name LIKE ? OR id LIKE ? OR age LIKE ?`;
  
  // Prepare the search parameters to match the wildcard search
  const searchParams = [`%${search}%`, `%${search}%`, `%${search}%`];

  db.query(sql, searchParams, (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});




app.get("/login", async (req, res) => {
  const { name, age, password, password_confirm } = req.body;

  // Check if email exists in the database
  db.query('SELECT email FROM users WHERE email = ?', [email], async (error, result) => {
    if (error) {
      console.error('Error querying database:', error);
      return res.status(500).render('register', {
        message: 'Database error'
      });
    }

    if (result.length > 0) {
      return res.render('register', {
        message: 'This email is already in use'
      });
    } else if (password !== password_confirm) {
      return res.render('register', {
        message: 'Passwords do not match!'
      });
    }

    try {
      // Hash the password
      let hashedPassword = await bcrypt.hash(password, 8);

      // Insert new user into the database
      db.query('INSERT INTO users SET ?', { name, email, password: hashedPassword }, (err, results) => {
        if (err) {
          console.error('Error inserting user:', err);
          return res.status(500).render('register', {
            message: 'Error registering user'
          });
        } else {
          return res.render('register', {
            message: 'User registered!'
          });
        }
      });
    } catch (hashError) {
      console.error('Error hashing password:', hashError);
      return res.status(500).render('register', {
        message: 'Error processing registration'
      });
    }
  });
});


// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
