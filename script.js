document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('reportForm');
    const messageDiv = document.getElementById('message');
    const submitBtn = document.querySelector('.submit-btn');
    
    // Set today's date as default
    const dateInput = document.getElementById('reportDate');
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        console.log('Form submitted, starting validation...');
        
        if (!validateForm()) {
            console.log('Form validation failed');
            showMessage('Please fill in all required fields correctly.', 'error');
            return;
        }
        
        console.log('Form validation passed, preparing to submit...');
        
        const formData = getFormData();
        console.log('Form data to submit:', formData);
        
        try {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';
            form.classList.add('loading');
            
            console.log('Making fetch request...');
            const response = await fetch('/api/submit-report', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                showMessage('Report submitted successfully!', 'success');
                form.reset();
                dateInput.value = today; // Reset date to today
            } else {
                showMessage(result.error || 'Failed to submit report. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            console.error('Full error details:', error.message, error.stack);
            showMessage(`Network error: ${error.message}. Please try again.`, 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Report';
            form.classList.remove('loading');
        }
    });
    
    function validateForm() {
        const requiredFields = [
            'studentName', 'studentId', 'reportDate', 'grade', 
            'subject', 'attendance', 'homework', 'participation', 'behavior'
        ];
        
        let isValid = true;
        
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (!field.value.trim()) {
                field.style.borderColor = '#e74c3c';
                isValid = false;
            } else {
                field.style.borderColor = '#27ae60';
            }
        });
        
        // Student ID can be alphanumeric
        const studentId = document.getElementById('studentId').value;
        if (studentId && studentId.trim().length < 1) {
            document.getElementById('studentId').style.borderColor = '#e74c3c';
            isValid = false;
        }
        
        // Validate date is not in the future
        const reportDate = document.getElementById('reportDate').value;
        const selectedDate = new Date(reportDate);
        const currentDate = new Date();
        currentDate.setHours(23, 59, 59, 999); // Set to end of today
        
        if (selectedDate > currentDate) {
            document.getElementById('reportDate').style.borderColor = '#e74c3c';
            showMessage('Report date cannot be in the future.', 'error');
            isValid = false;
        }
        
        return isValid;
    }
    
    function getFormData() {
        return {
            studentName: document.getElementById('studentName').value.trim(),
            studentId: document.getElementById('studentId').value.trim(),
            reportDate: document.getElementById('reportDate').value,
            grade: document.getElementById('grade').value,
            subject: document.getElementById('subject').value.trim(),
            attendance: document.getElementById('attendance').value,
            homework: document.getElementById('homework').value,
            participation: document.getElementById('participation').value,
            behavior: document.getElementById('behavior').value,
            notes: document.getElementById('notes').value.trim(),
            submittedAt: new Date().toISOString()
        };
    }
    
    function showMessage(text, type) {
        messageDiv.textContent = text;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';
        
        // Hide message after 5 seconds
        setTimeout(() => {
            messageDiv.style.display = 'none';
        }, 5000);
        
        // Scroll to message
        messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    // Real-time validation feedback
    const inputs = form.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.hasAttribute('required')) {
                if (this.value.trim()) {
                    this.style.borderColor = '#27ae60';
                } else {
                    this.style.borderColor = '#e74c3c';
                }
            }
        });
        
        input.addEventListener('focus', function() {
            this.style.borderColor = '#3498db';
        });
    });
});