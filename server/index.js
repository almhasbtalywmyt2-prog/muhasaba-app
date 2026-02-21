const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

const DATA_FILE = path.join(__dirname, 'reports.json');

// Ensure data file exists
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

app.get('/', (req, res) => {
    res.send('Muhasaba Server is Running');
});

app.post('/api/report', (req, res) => {
    const report = req.body;
    report.timestamp = new Date().toISOString();

    console.log('Received report:', report);

    try {
        const data = JSON.parse(fs.readFileSync(DATA_FILE));
        data.push(report);
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        res.status(200).json({ message: 'Report saved successfully' });
    } catch (error) {
        console.error('Error saving report:', error);
        res.status(500).json({ error: 'Failed to save report' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
