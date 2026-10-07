const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const port = 8000;

app.use(cors());
app.use(express.json());

// Serve static frontend files from the root directory
app.use(express.static(path.join(__dirname, '../')));

// Initialize SQLite database
const dbPath = path.resolve(__dirname, 'hackathon.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Error opening database " + err.message);
    } else {
        db.run(`CREATE TABLE IF NOT EXISTS registrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            track TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
    }
});

// Register endpoint
app.post('/api/register', (req, res) => {
    const { name, email, track } = req.body;
    
    if (!name || !email || !track) {
        return res.status(400).json({ error: "Все поля обязательны!" });
    }

    db.run(
        `INSERT INTO registrations (name, email, track) VALUES (?, ?, ?)`,
        [name, email, track],
        function(err) {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(200).json({ status: "success", message: "Регистрация успешна!" });
        }
    );
});

// Get registrations
app.get('/api/registrations', (req, res) => {
    db.all("SELECT * FROM registrations", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(200).json(rows);
    });
});

app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});
