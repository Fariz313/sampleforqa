const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;

// Middleware to parse JSON requests
app.use(bodyParser.json());

// Secret key for JWT
const secretKey = 'your-secret-key';
function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}

// Route to create a token
app.get('/api/token', (req, res) => {
    const username = makeid(10);

    if (!username) {
        return res.status(400).json({ error: 'Username is required' });
    }

    // Create a token
    const token = jwt.sign({ username }, secretKey, { expiresIn: '24h' });

    res.json({"status":"success", token });
});

// Middleware to validate the token
app.use((req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ error: 'Authorization header is required' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Bearer token is required' });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        req.user = decoded;
        next();
    });
});

// Protected route
app.get('/api/protected', (req, res) => {
    res.json({ "status":"success",message: `Hello, ${req.user.username}!` });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
