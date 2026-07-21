const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

let userCarts = {}; // In-memory Cart Storage

// Get Cart for a user
app.get('/api/cart/:userId', (req, res) => {
    const userId = req.params.userId;
    res.json(userCarts[userId] || []);
});

// Update Cart for a user
app.post('/api/cart/:userId', (req, res) => {
    const userId = req.params.userId;
    userCarts[userId] = req.body.items;
    res.json({ message: "Cart updated successfully", cart: userCarts[userId] });
});

app.listen(8083, () => {
    console.log("Cart Service (Node.js) running on port 8083...");
});