const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5677;

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json());
app.use(express.static('.'));

// Initialize PostgreSQL connection pool
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'student_reports',
    user: process.env.DB_USER || 'username',
    password: process.env.DB_PASSWORD || 'password',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Create table if it doesn't exist
const initializeDatabase = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS student_reports (
                id SERIAL PRIMARY KEY,
                student_name VARCHAR(255) NOT NULL,
                student_id VARCHAR(100) NOT NULL,
                report_date DATE NOT NULL,
                grade VARCHAR(10) NOT NULL,
                subject VARCHAR(255) NOT NULL,
                attendance VARCHAR(50) NOT NULL,
                homework VARCHAR(50) NOT NULL,
                participation VARCHAR(50) NOT NULL,
                behavior VARCHAR(50) NOT NULL,
                notes TEXT,
                submitted_at TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('Database table initialized successfully');
    } catch (err) {
        console.error('Error initializing database:', err);
        process.exit(1);
    }
};

// Initialize database on startup
initializeDatabase();

// API endpoint to submit a report
app.post('/api/submit-report', async (req, res) => {
    const {
        studentName,
        studentId,
        reportDate,
        grade,
        subject,
        attendance,
        homework,
        participation,
        behavior,
        notes,
        submittedAt
    } = req.body;

    // Validation
    if (!studentName || !studentId || !reportDate || !grade || !subject || 
        !attendance || !homework || !participation || !behavior) {
        return res.status(400).json({
            error: 'All required fields must be provided'
        });
    }

    try {
        const result = await pool.query(
            `INSERT INTO student_reports 
            (student_name, student_id, report_date, grade, subject, attendance, 
             homework, participation, behavior, notes, submitted_at) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
            RETURNING id`,
            [studentName, studentId, reportDate, grade, subject, 
             attendance, homework, participation, behavior, notes, submittedAt]
        );

        res.json({
            success: true,
            message: 'Report submitted successfully',
            reportId: result.rows[0].id
        });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({
            error: 'Failed to save report to database'
        });
    }
});

// API endpoint to get all reports
app.get('/api/reports', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM student_reports ORDER BY created_at DESC');
        
        res.json({
            success: true,
            reports: result.rows
        });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({
            error: 'Failed to retrieve reports'
        });
    }
});

// API endpoint to get reports by student ID
app.get('/api/reports/:studentId', async (req, res) => {
    const studentId = req.params.studentId;
    
    try {
        const result = await pool.query(
            'SELECT * FROM student_reports WHERE student_id = $1 ORDER BY report_date DESC',
            [studentId]
        );

        res.json({
            success: true,
            reports: result.rows
        });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({
            error: 'Failed to retrieve reports'
        });
    }
});

// API endpoint to delete a report
app.delete('/api/reports/:id', async (req, res) => {
    const reportId = req.params.id;
    
    try {
        const result = await pool.query('DELETE FROM student_reports WHERE id = $1', [reportId]);
        
        if (result.rowCount === 0) {
            return res.status(404).json({
                error: 'Report not found'
            });
        }

        res.json({
            success: true,
            message: 'Report deleted successfully'
        });
    } catch (err) {
        console.error('Database error:', err);
        res.status(500).json({
            error: 'Failed to delete report'
        });
    }
});

// CSV export endpoint
app.get('/api/reports/export/csv', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM student_reports ORDER BY created_at DESC');
        
        // Create CSV header
        const headers = Object.keys(result.rows[0] || {});
        let csv = headers.join(',') + '\n';
        
        // Add data rows
        result.rows.forEach(row => {
            const values = headers.map(header => {
                const value = row[header];
                // Escape commas and quotes in values
                if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                return value || '';
            });
            csv += values.join(',') + '\n';
        });
        
        // Set headers for file download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="student_reports.csv"');
        res.send(csv);
    } catch (err) {
        console.error('Error exporting CSV:', err);
        res.status(500).json({
            error: 'Failed to export CSV'
        });
    }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({ 
            status: 'healthy',
            database: 'connected',
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        res.status(500).json({ 
            status: 'unhealthy',
            database: 'disconnected',
            error: err.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Something went wrong!'
    });
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\nShutting down server...');
    try {
        await pool.end();
        console.log('Database connection pool closed.');
    } catch (err) {
        console.error('Error closing database connection:', err);
    }
    process.exit(0);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log('Press Ctrl+C to stop the server');
});