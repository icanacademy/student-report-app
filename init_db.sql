-- Create database (run this as postgres superuser)
CREATE DATABASE student_reports;

-- Connect to the database and create user
\c student_reports;

-- Create user (optional - you can use existing user)
-- CREATE USER student_app WITH PASSWORD 'secure_password';

-- Grant privileges
-- GRANT ALL PRIVILEGES ON DATABASE student_reports TO student_app;

-- Create the main table
CREATE TABLE IF NOT EXISTS student_reports (
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

-- Create indexes for better performance
CREATE INDEX idx_student_reports_student_id ON student_reports(student_id);
CREATE INDEX idx_student_reports_report_date ON student_reports(report_date);
CREATE INDEX idx_student_reports_created_at ON student_reports(created_at);

-- Grant table permissions (if using separate user)
-- GRANT ALL PRIVILEGES ON TABLE student_reports TO student_app;
-- GRANT USAGE, SELECT ON SEQUENCE student_reports_id_seq TO student_app;

-- Insert sample data (optional)
INSERT INTO student_reports (
    student_name, student_id, report_date, grade, subject, 
    attendance, homework, participation, behavior, notes, submitted_at
) VALUES 
    ('John Doe', 'STU001', '2025-09-05', '5', 'Mathematics', 
     'present', 'completed', 'excellent', 'good', 'Great participation in class discussions', 
     '2025-09-05 10:30:00'),
    ('Jane Smith', 'STU002', '2025-09-05', '5', 'English', 
     'present', 'completed', 'good', 'excellent', 'Very well behaved and attentive', 
     '2025-09-05 11:00:00');

-- Verify the setup
SELECT 'Database setup completed successfully!' as status;