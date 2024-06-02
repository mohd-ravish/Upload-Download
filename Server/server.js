const express = require('express')
const cors = require('cors')
const mysql = require("mysql");
const multer = require('multer')
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.static('public'));

require("dotenv").config()

// Port
const PORT = process.env.PORT;
// Secret key
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

// Database
const db = mysql.createConnection({
    user: "root",
    host: "localhost",
    password: "",
    database: "filesup"
})

// DB Connection
db.connect(function (err) {
    if (err) {
        console.log(err);
    } else {
        console.log("MYSQL CONNECTED");
    }
})

// location where files are stored
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        return cb(null, "./public/uploads")
    },
    filename: function (req, file, cb) {
        return cb(null, `${Date.now()}_${file.originalname}`)
    }
})

const upload = multer({ storage })

// API to upload files
app.post('/upload', upload.single('file'), (req, res) => {
    try {
        db.query("INSERT INTO files (filename) VALUES (?)", [req.file.filename], (err, result) => {
            if (err) {
                console.log(err)
            } else {
                res.send(result)
            }
        });
        console.log(req.file)

    } catch (err) {
        console.error(err);
    }
})

// API to Signup
app.post("/signup", async (req, res) => {
    const { email, password, confirmPassword } = req.body;
    try {
        // Check if the email already exists in the database
        db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
            if (err) {
                console.error(err);
                return res.json("Internal Server Error");
            }
            if (results.length === 0) {
                if (password === confirmPassword) {
                    // If the email is not in use and password is equal to confirm password, create the new user
                    const hashedPassword = await bcrypt.hash(password, 10);
                    db.query("INSERT INTO users (email, password, count) VALUES (?, ?, ?)", [email, hashedPassword, 0], (err) => {
                        if (err) {
                            console.error(err);
                            return res.json("Internal Server Error");
                        }
                        console.log("User registered");
                        return res.status(200).json("User registered");
                    });
                } else {
                    console.log("Password and confirm password do not match");
                    return res.json("Password and confirm password do not match");
                }
            } else {
                // Email already in use, send a response indicating the conflict
                console.log("Email already in use");
                return res.json("Email already in use");
            }
        });
    } catch (err) {
        console.error(err);
        return res.json("Internal Server Error");
    }
});

// API to Login
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        // Check if the user with the provided email exists
        db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
            if (err) {
                console.error(err);
                return res.json("Internal Server Error");
            }
            if (results.length === 0) {
                console.log("User not found");
                return res.json("User not found");
            } else {
                const user = results[0];
                // Compare the provided password with the stored hashed password
                const passwordMatch = await bcrypt.compare(password, user.password);
                if (passwordMatch) {
                    // Generate JWT token
                    jwt.sign({ user_id: user.user_id, email: user.email }, JWT_SECRET_KEY, { expiresIn: '4h' }, (err, token) => {
                        if (err) {
                            console.error(err);
                            return res.json({ error: "Token generation failed" });
                        }
                        console.log("User successfully loggedIn");
                        return res.status(200).json({ token });
                    });
                } else {
                    console.log("Incorrect password");
                    return res.json("Incorrect password");
                }
            }
        });
    } catch (err) {
        console.error(err);
        return res.json("Internal Server Error");
    }
});

// Middleware to verify user token
const verifyUser = (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token) {
        return res.json({ error: "You are not authorized" });
    } else {
        jwt.verify(token, JWT_SECRET_KEY, {}, (err, decoded) => {
            if (err) {
                return res.json({ error: "Token is not valid" });
            } else {
                req.user_id = decoded.user_id;
                req.email = decoded.email;
                next();
            }
        });
    }
};

// Route to verify user
app.get("/verifyUser", verifyUser, (req, res) => {
    // Get the latest count of downloaded files for the user
    db.query("SELECT count FROM users WHERE user_id = ?", [req.user_id], (err, countResult) => {
        if (err) {
            console.error('Error querying count of downloaded files:', err.stack);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
        const count = countResult[0].count;
        return res.json({ status: "success", email: req.email, count: count });
    });
});


// API to get random file
app.get('/getRandomFile', verifyUser, (req, res) => {
    try {
        const user_id = req.user_id;
        db.query("SELECT filename FROM files WHERE NOT EXISTS (SELECT 1 FROM downloaded_files WHERE downloaded_files.user_id = ? AND downloaded_files.filename = files.filename) ORDER BY RAND() LIMIT 1", [user_id], (err, result) => {
            if (err) {
                console.error('Error querying database:', err.stack);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            if (result.length === 0) {
                console.error('No files available for download');
                return res.status(404).json({ error: 'No files available for download' });
            }
            const filename = result[0].filename;
            db.query("INSERT INTO downloaded_files (user_id, filename) VALUES (?, ?)", [user_id, filename], (err) => {
                if (err) {
                    console.error('Error logging downloaded file:', err.stack);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                // Update count of downloaded files in the user table
                db.query("UPDATE users SET count = count + 1 WHERE user_id = ?", [user_id], (err) => {
                    if (err) {
                        console.error('Error updating count of downloaded files:', err.stack);
                        return res.status(500).json({ error: 'Internal Server Error' });
                    }
                    // Get the latest count of downloaded files for the user
                    db.query("SELECT count FROM users WHERE user_id = ?", [req.user_id], (err, countResult) => {
                        if (err) {
                            console.error('Error querying count of downloaded files:', err.stack);
                            return res.status(500).json({ error: 'Internal Server Error' });
                        }
                        const count = countResult[0].count;
                        console.log("User " + user_id + " downloaded " + filename);
                        return res.json({ filename, count });
                    });
                });
            });
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Server
app.listen(PORT, () => console.log(`SERVER IS RUNNING ON PORT ${PORT}`))