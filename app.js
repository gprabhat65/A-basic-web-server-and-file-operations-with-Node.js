const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname))); 

app.get('/', (req, res) => {
    // res.sendFile(path.join(__dirname, 'index.html'));
});

const readData = () => {
    const data = fs.readFileSync('database.json', 'utf-8');
    return JSON.parse(data);
};

const writeData = (data) => {
    fs.writeFileSync('database.json', JSON.stringify(data, null, 2));
};

app.get('/api/users', (req, res) => {
    const data = readData();
    res.json(data.users);
});

app.post('/api/users', (req, res) => {
    const data = readData();
    const newUser = req.body;

    newUser.id = data.users.length ? data.users[data.users.length - 1].id + 1 : 1;

    if (!newUser.name || !newUser.email || !newUser.roll_no || !newUser.department) {
        return res.status(400).json({ message: 'Please provide name, email, roll number, and department.' });
    }

    data.users.push(newUser);
    writeData(data);
    res.json({ message: 'User added successfully', user: newUser });
});

app.put('/api/users/:id', (req, res) => {
    const data = readData();
    const userId = parseInt(req.params.id, 10);
    const userIndex = data.users.findIndex((user) => user.id === userId);

    if (userIndex === -1) {
        return res.status(404).json({ message: 'User not found' });
    }

    data.users[userIndex] = { ...data.users[userIndex], ...req.body };
    writeData(data);
    res.json({ message: 'User updated successfully', user: data.users[userIndex] });
});

app.delete('/api/users', (req, res) => {
    const { id, roll_no } = req.body; //
    const data = readData();

    if (!id && !roll_no) {
        return res.status(400).json({ message: 'Please provide either an ID or Roll Number to delete.' });
    }

    const userIndex = data.users.findIndex((user) => user.id === parseInt(id, 10) || user.roll_no === roll_no);

    if (userIndex === -1) {
        return res.status(404).json({ message: 'User not found' });
    }

    data.users.splice(userIndex, 1);
    writeData(data);
    res.json({ message: 'User deleted successfully' });
});

app.listen(PORT, () => {
    console.log(`Server is running on: http://localhost:${PORT}`);
});
