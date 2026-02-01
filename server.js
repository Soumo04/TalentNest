// API Base URL - Update this with your backend URL
const API_BASE_URL = 'http://localhost:3000/api'; // Change this to your actual API URL

// Toast notification function
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastIcon = toast.querySelector('.toast-icon');
    const toastMessage = toast.querySelector('.toast-message');
    
    // Set icon based on type
    toastIcon.textContent = type === 'success' ? '✓' : '✕';
    toastMessage.textContent = message;
    
    // Set toast class
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Format date function
function formatDate(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// ===== LOAD JOBS =====
async function loadJobs() {
    const jobsList = document.getElementById('jobsList');
    const jobSelect = document.getElementById('jobSelect');
    
    try {
        const response = await fetch(`${API_BASE_URL}/jobs`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch jobs');
        }
        
        const jobs = await response.json();
        
        // Clear loading state
        jobsList.innerHTML = '';
        jobSelect.innerHTML = '<option value="">Choose a position...</option>';
        
        if (jobs.length === 0) {
            jobsList.innerHTML = `
                <div class="loading-state">
                    <p>No active positions available at the moment.</p>
                </div>
            `;
            return;
        }
        
        // Display jobs
        jobs.forEach((job, index) => {
            // Create job card
            const jobCard = document.createElement('div');
            jobCard.className = 'job-card';
            jobCard.style.animationDelay = `${index * 0.1}s`;
            jobCard.innerHTML = `
                <div class="job-badge">Active</div>
                <h3 class="job-title">${job.title}</h3>
                <p class="job-description">${job.description}</p>
                <div class="job-location">${job.location}</div>
                <button class="btn-apply" onclick="scrollToApply('${job.id}', '${job.title}')">
                    Apply Now
                    <span>→</span>
                </button>
            `;
            jobsList.appendChild(jobCard);
            
            // Add to select dropdown
            const option = document.createElement('option');
            option.value = job.id;
            option.textContent = job.title;
            jobSelect.appendChild(option);
        });
        
    } catch (error) {
        console.error('Error loading jobs:', error);
        jobsList.innerHTML = `
            <div class="loading-state">
                <p style="color: var(--color-danger);">
                    ⚠️ Unable to load jobs. Please check your API connection.
                </p>
                <p style="color: var(--color-text-secondary); font-size: 0.875rem; margin-top: 1rem;">
                    Make sure your backend is running at: ${API_BASE_URL}
                </p>
            </div>
        `;
    }
}

// Scroll to apply section with pre-selected job
function scrollToApply(jobId, jobTitle) {
    const applySection = document.getElementById('apply');
    const jobSelect = document.getElementById('jobSelect');
    
    // Set the selected job
    jobSelect.value = jobId;
    
    // Scroll to apply section
    applySection.scrollIntoView({ behavior: 'smooth' });
    
    // Show toast
    showToast(`Ready to apply for ${jobTitle}!`, 'success');
}

// ===== SUBMIT APPLICATION =====
document.getElementById('applicationForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        jobId: document.getElementById('jobSelect').value,
        name: document.getElementById('candidateName').value,
        email: document.getElementById('candidateEmail').value,
        resumeLink: document.getElementById('resumeLink').value
    };
    
    // Validate form
    if (!formData.jobId) {
        showToast('Please select a position', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/applications`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Application submission failed');
        }
        
        // Hide form and show success message
        document.getElementById('applicationForm').style.display = 'none';
        const successMessage = document.getElementById('applicationSuccess');
        successMessage.style.display = 'block';
        document.getElementById('applicationId').textContent = data.applicationId || data.id;
        
        showToast('Application submitted successfully!', 'success');
        
        // Reset form after 5 seconds
        setTimeout(() => {
            document.getElementById('applicationForm').reset();
            document.getElementById('applicationForm').style.display = 'block';
            successMessage.style.display = 'none';
        }, 5000);
        
    } catch (error) {
        console.error('Error submitting application:', error);
        showToast(error.message || 'Failed to submit application. Please try again.', 'error');
    }
});

// ===== CHECK APPLICATION STATUS =====
document.getElementById('statusForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const applicationId = document.getElementById('applicationIdInput').value.trim();
    const statusResult = document.getElementById('statusResult');
    
    if (!applicationId) {
        showToast('Please enter an application ID', 'error');
        return;
    }
    
    // Show loading state
    statusResult.innerHTML = `
        <div class="loading-state">
            <div class="spinner"></div>
            <p>Fetching your application status...</p>
        </div>
    `;
    statusResult.style.display = 'block';
    
    try {
        const response = await fetch(`${API_BASE_URL}/applications/${applicationId}`);
        
        if (!response.ok) {
            throw new Error('Application not found');
        }
        
        const application = await response.json();
        
        // Display status
        statusResult.innerHTML = `
            <div class="status-header">
                <div class="status-info">
                    <h3>Application Status</h3>
                    <p>ID: ${application.id || application.applicationId}</p>
                </div>
                <div class="status-badge ${application.status.toLowerCase()}">
                    ${application.status}
                </div>
            </div>
            <div class="status-details">
                <div class="status-detail">
                    <span class="status-detail-label">Candidate Name:</span>
                    <span class="status-detail-value">${application.candidateName || application.name}</span>
                </div>
                <div class="status-detail">
                    <span class="status-detail-label">Email:</span>
                    <span class="status-detail-value">${application.email}</span>
                </div>
                <div class="status-detail">
                    <span class="status-detail-label">Job Title:</span>
                    <span class="status-detail-value">${application.jobTitle || 'N/A'}</span>
                </div>
                <div class="status-detail">
                    <span class="status-detail-label">Applied On:</span>
                    <span class="status-detail-value">${formatDate(application.appliedAt || application.createdAt)}</span>
                </div>
                ${application.resumeLink ? `
                <div class="status-detail">
                    <span class="status-detail-label">Resume:</span>
                    <span class="status-detail-value">
                        <a href="${application.resumeLink}" target="_blank" style="color: var(--color-primary);">View Resume</a>
                    </span>
                </div>
                ` : ''}
            </div>
        `;
        
        showToast('Status retrieved successfully!', 'success');
        
    } catch (error) {
        console.error('Error fetching status:', error);
        statusResult.innerHTML = `
            <div class="loading-state">
                <p style="color: var(--color-danger);">
                    ⚠️ Application not found. Please check your Application ID.
                </p>
            </div>
        `;
        showToast('Application not found', 'error');
    }
});

// ===== UPDATE APPLICATION STATUS (ADMIN) =====
document.getElementById('updateStatusForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const applicationId = document.getElementById('adminApplicationId').value.trim();
    const newStatus = document.getElementById('newStatus').value;
    const adminResult = document.getElementById('adminResult');
    
    if (!applicationId || !newStatus) {
        showToast('Please fill in all fields', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status: newStatus })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to update status');
        }
        
        // Show success result
        adminResult.className = 'admin-result success';
        adminResult.innerHTML = `
            <p style="font-weight: 600; color: var(--color-text-primary); margin-bottom: 0.5rem;">
                ✓ Status Updated Successfully!
            </p>
            <p style="color: var(--color-text-secondary);">
                Application <strong>${applicationId}</strong> has been updated to <strong>${newStatus}</strong>
            </p>
        `;
        adminResult.style.display = 'block';
        
        showToast('Status updated successfully!', 'success');
        
        // Reset form after 3 seconds
        setTimeout(() => {
            document.getElementById('updateStatusForm').reset();
            adminResult.style.display = 'none';
        }, 3000);
        
    } catch (error) {
        console.error('Error updating status:', error);
        
        // Show error result
        adminResult.className = 'admin-result error';
        adminResult.innerHTML = `
            <p style="font-weight: 600; color: var(--color-text-primary); margin-bottom: 0.5rem;">
                ✕ Update Failed
            </p>
            <p style="color: var(--color-text-secondary);">
                ${error.message}
            </p>
        `;
        adminResult.style.display = 'block';
        
        showToast(error.message || 'Failed to update status', 'error');
    }
});

// ===== NAVIGATION =====
// Smooth scroll for navigation links
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Remove active class from all links
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        
        // Add active class to clicked link
        link.classList.add('active');
        
        // Get target section
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            targetSection.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Update active nav link on scroll
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (window.pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// ===== INITIALIZE =====
// Load jobs when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadJobs();
    
    // Add animation delay to form groups
    document.querySelectorAll('.form-group').forEach((group, index) => {
        group.style.animationDelay = `${index * 0.1}s`;
    });
});

// ===== DEMO DATA (for testing without backend) =====
// Uncomment this section if you want to test the UI without a backend

/*
function loadDemoJobs() {
    const jobsList = document.getElementById('jobsList');
    const jobSelect = document.getElementById('jobSelect');
    
    const demoJobs = [
        {
            id: '1',
            title: 'Senior Full Stack Developer',
            description: 'We are looking for an experienced Full Stack Developer to join our innovative team. You will work on cutting-edge web applications using modern technologies.',
            location: 'San Francisco, CA (Remote)',
            isActive: true
        },
        {
            id: '2',
            title: 'UI/UX Designer',
            description: 'Join our design team to create beautiful and intuitive user experiences. Experience with Figma and user research is preferred.',
            location: 'New York, NY (Hybrid)',
            isActive: true
        }
    ];
    
    jobsList.innerHTML = '';
    jobSelect.innerHTML = '<option value="">Choose a position...</option>';
    
    demoJobs.forEach((job, index) => {
        const jobCard = document.createElement('div');
        jobCard.className = 'job-card';
        jobCard.style.animationDelay = `${index * 0.1}s`;
        jobCard.innerHTML = `
            <div class="job-badge">Active</div>
            <h3 class="job-title">${job.title}</h3>
            <p class="job-description">${job.description}</p>
            <div class="job-location">${job.location}</div>
            <button class="btn-apply" onclick="scrollToApply('${job.id}', '${job.title}')">
                Apply Now
                <span>→</span>
            </button>
        `;
        jobsList.appendChild(jobCard);
        
        const option = document.createElement('option');
        option.value = job.id;
        option.textContent = job.title;
        jobSelect.appendChild(option);
    });
}

// Uncomment to use demo data:
// document.addEventListener('DOMContentLoaded', loadDemoJobs);
*/
Chat

New Conversation

🤓 Explain a complex thing

Explain Artificial Intelligence so that I can explain it to my six-year-old child.


🧠 Get suggestions and create new ideas

Please give me the best 10 travel ideas around the world


💭 Translate, summarize, fix grammar and more…

Translate "I love you" French



AITOPIA




GET THE CODE




AITOPIA




AITOPIA

10
Upgrade





!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Career Portal - Job Application Management</title>
    <link rel="stylesheet" href="styles.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet">
</head>
<body>
    <!-- Header -->
    <header class="header">
        <div class="container">




Make a Review & Earn Credit ❤
Chat
Ask
Search
Write
Image
ChatFile
Vision
Agent
Full Page
Invite & Earn
