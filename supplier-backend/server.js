const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const supplierRoutes = require('./src/routes/supplierRoutes');
const { errorHandler, notFound } = require('./src/middleware/errorHandler');

dotenv.config();
const app = express();

// Middlewares
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

// Connect DB
connectDB();

// Routes
app.use('/api/suppliers', supplierRoutes);

// Healthcheck
app.get('/health', (req, res) => res.json({ ok: true, time: new Date() }));

// Error handlers
app.use(notFound);
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
