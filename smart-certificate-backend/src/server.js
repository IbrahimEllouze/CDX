const express = require("express");
const apiRoutes = require("./routes/api");
const cors = require('cors');
require("dotenv").config();

const app = express();

app.use(cors({
    origin: 'http://localhost:3001', // Allow only the frontend origin
    methods: ['GET', 'POST'], // Allowed methods
    allowedHeaders: ['Content-Type'] // Allowed headers
  }));
app.use(express.json());
app.use("/api", apiRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));