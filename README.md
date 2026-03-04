# Student Daily Report System

A web application for recording and managing student daily reports with PostgreSQL database storage.

## Features

- Student daily report form with comprehensive fields
- Real-time form validation
- PostgreSQL database storage with connection pooling
- RESTful API endpoints
- Responsive design
- Professional styling
- Health check endpoint

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)

## Setup Instructions

### 1. Install PostgreSQL

**macOS (using Homebrew):**
```bash
brew install postgresql
brew services start postgresql
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download and install from https://www.postgresql.org/download/windows/

### 2. Create Database

```bash
# Connect to PostgreSQL as superuser
sudo -u postgres psql

# Or on macOS:
psql postgres

# Create database and user
CREATE DATABASE student_reports;
CREATE USER student_app WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE student_reports TO student_app;
\q
```

### 3. Initialize Database Schema

Run the initialization script:
```bash
psql -d student_reports -f init_db.sql
```

### 4. Configure Environment

Copy and edit the environment file:
```bash
cp .env .env.local
```

Edit `.env` with your database credentials:
```env
DATABASE_URL=postgresql://student_app:your_secure_password@localhost:5432/student_reports
DB_HOST=localhost
DB_PORT=5432
DB_NAME=student_reports
DB_USER=student_app
DB_PASSWORD=your_secure_password
PORT=5677
```

### 5. Install Node.js Dependencies

```bash
npm install
```

### 6. Start the Server

```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

### 7. Access the Application

Open your browser and go to `http://localhost:5677`

## Database Schema

The application uses PostgreSQL database with the following table:

```sql
CREATE TABLE student_reports (
    id SERIAL PRIMARY KEY,
    student_name VARCHAR(255) NOT NULL,
    student_id VARCHAR(100) NOT NULL,
    report_date DATE NOT NULL,
    grade VARCHAR(10) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    attendance VARCHAR(50) NOT NULL CHECK (attendance IN ('present', 'absent', 'late')),
    homework VARCHAR(50) NOT NULL CHECK (homework IN ('completed', 'incomplete', 'not_assigned')),
    participation VARCHAR(50) NOT NULL CHECK (participation IN ('excellent', 'good', 'average', 'poor')),
    behavior VARCHAR(50) NOT NULL CHECK (behavior IN ('excellent', 'good', 'satisfactory', 'needs_improvement')),
    notes TEXT,
    submitted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

- `POST /api/submit-report` - Submit a new report
- `GET /api/reports` - Get all reports
- `GET /api/reports/:studentId` - Get reports for specific student
- `DELETE /api/reports/:id` - Delete a specific report
- `GET /api/health` - Health check endpoint

## Files Structure

- `index.html` - Main HTML form
- `styles.css` - Styling and responsive design
- `script.js` - Frontend JavaScript for form handling
- `server.js` - Express.js backend server with PostgreSQL
- `package.json` - Node.js dependencies and scripts
- `.env` - Environment configuration (database credentials)
- `init_db.sql` - Database initialization script

## Form Fields

- Student Name
- Student ID (alphanumeric)
- Date
- Grade (1-12)
- Subject
- Attendance (Present/Absent/Late)
- Homework Status (Completed/Incomplete/Not Assigned)
- Class Participation (Excellent/Good/Average/Poor)
- Behavior (Excellent/Good/Satisfactory/Needs Improvement)
- Additional Notes (optional)

## Development

### Running Tests
```bash
npm test
```

### Database Management

**Connect to database:**
```bash
psql -d student_reports -U student_app -h localhost
```

**View all reports:**
```sql
SELECT * FROM student_reports ORDER BY created_at DESC;
```

**Clear all data:**
```sql
TRUNCATE student_reports RESTART IDENTITY;
```

## Production Deployment

1. Set production environment variables
2. Use connection pooling (already implemented)
3. Enable SSL for database connections
4. Set up proper database backups
5. Configure logging and monitoring

## Troubleshooting

**Database Connection Issues:**
- Check PostgreSQL service is running
- Verify database credentials in `.env`
- Ensure database and user exist
- Check firewall/network settings

**Permission Issues:**
```sql
GRANT ALL PRIVILEGES ON DATABASE student_reports TO student_app;
GRANT ALL PRIVILEGES ON TABLE student_reports TO student_app;
GRANT USAGE, SELECT ON SEQUENCE student_reports_id_seq TO student_app;
```