// VERSION 2.0 - WITH ENHANCED ERROR HANDLING AND LOGGING
console.log('===================================');
console.log('Ghost Recruitment Form Script v2.0');
console.log('Script starting at:', new Date().toISOString());
console.log('===================================');

// ===========================
// N8N WEBHOOK CONFIGURATION
// ===========================
// Your n8n webhook URL (already configured for your instance)
var N8N_WEBHOOK_URL = 'https://basemen.app.n8n.cloud/webhook/fe300862-9d94-4db2-b153-8f432187df3f';
console.log('Webhook URL configured:', N8N_WEBHOOK_URL);

// ===========================
// INPUT SANITIZATION FUNCTIONS
// ===========================

// Sanitize text input to prevent JSON parsing errors
function sanitizeTextInput(text) {
    console.log('[SANITIZE] Input text length:', text ? text.length : 0);
    console.log('[SANITIZE] First 100 chars:', text ? text.substring(0, 100) : 'empty');
    
    if (!text) return '';
    
    // Convert to string if not already
    text = String(text);
    
    const originalLength = text.length;
    
    // Remove or replace problematic characters
    // Keep emojis but ensure they're properly encoded
    text = text
        // Normalize line breaks
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        // Remove null bytes and other control characters (except newlines and tabs)
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
        // Replace smart quotes with regular quotes
        .replace(/[\u2018\u2019]/g, "'")
        .replace(/[\u201C\u201D]/g, '"')
        // Trim excessive whitespace
        .replace(/\n{3,}/g, '\n\n')
        .trim();
    
    console.log('[SANITIZE] Output text length:', text.length);
    console.log('[SANITIZE] Characters removed:', originalLength - text.length);
    
    return text;
}

// Validate email format
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    console.log('[VALIDATE] Email validation:', email, '-> Valid:', isValid);
    return isValid;
}

// Validate URL format
function validateURL(url) {
    if (!url) return true; // URLs are optional
    try {
        new URL(url);
        console.log('[VALIDATE] URL valid:', url);
        return true;
    } catch {
        console.log('[VALIDATE] URL invalid:', url);
        return false;
    }
}

// Sanitize and validate all form data
function sanitizeFormData(data) {
    console.log('[SANITIZE FORM] Starting sanitization of form data');
    const sanitized = {};
    
    // Text fields that need sanitization
    const textFields = ['fullName', 'message', 'skills'];
    textFields.forEach(field => {
        if (data[field]) {
            console.log(`[SANITIZE FORM] Processing ${field}`);
            sanitized[field] = sanitizeTextInput(data[field]);
        }
    });
    
    // URL fields that need validation
    const urlFields = ['website', 'linkedin', 'artstation', 'showreel'];
    urlFields.forEach(field => {
        if (data[field]) {
            sanitized[field] = data[field].trim();
            if (!validateURL(sanitized[field])) {
                console.warn(`[SANITIZE FORM] Invalid URL for ${field}: ${sanitized[field]}`);
                sanitized[field] = ''; // Clear invalid URLs
            }
        }
    });
    
    // Direct copy fields (already safe)
    const safeFields = ['email', 'country', 'department', 'internship', 
                       'experience', 'showreelPassword', 'source', 'timestamp'];
    safeFields.forEach(field => {
        if (data[field] !== undefined) {
            sanitized[field] = data[field];
        }
    });
    
    console.log('[SANITIZE FORM] Sanitization complete');
    return sanitized;
}

var SKILLS_DATA = [
    "2D Art", "3D Tracking", "3D Animation", "3D Artist", "3Dequalizer", "3Ds Max", 
    "Adobe Photoshop", "Adobe Suite", "After Effects", "Animation", "Arnold", "Art Director", 
    "Asset Artist", "Bidding", "Blender", "Budgeting", "Build Artist", "C++", 
    "Camera Projection", "Cfx Muscle Solutions", "Cg Generalist", "Cg Integration", 
    "Character Design", "Character Director", "Character Matchmove", "Clarisse", 
    "Client Interaction", "Coding", "Colorist", "Compositing", "Compositing Lead", 
    "Concept", "Creature Supervisor", "Data Wrangling", "Davinci", "Deadline", 
    "Digital Artist", "Director", "Dmp Artist", "Editorial", "Environment", 
    "Executive Producer", "Facility Management", "Film Experience", "Final Cut Pro", 
    "Flame", "Fluid Simulation", "Fx", "Fx Artist", "Fx Lead", "Fx Supervisor", 
    "Gaming", "Generalist", "Houdini", "Human Resources", "Illustrator", "Inferno", 
    "Katana", "Layout", "Lead", "Leadership", "Lighting", "Lighting Artist", 
    "Lighting Lead", "Lidar", "Look Development", "Lookdev", "Lustre", "Manager", 
    "Mari", "Matchmove", "Matte Painting", "Maya", "Mentor", "Modelling", "Motion", 
    "Motion Capture", "Mocha", "Nuke", "Paint", "Photography", "Photoshop", 
    "Pipeline", "Pipeline Td", "Pipeline Tool", "Previs", "Producer", "Production", 
    "Production Coordinator", "Project Management", "Python", "Qt", "R&D", "Renderer", 
    "Rigging", "Rotoscoping", "Roto", "Set Supervision", "Shader", "Shotgun", 
    "Silhouette", "Smoke", "Software", "Stereo", "Substance", "Supervising", 
    "Supervisor", "Syntheyes", "Systems", "Td", "Tech", "Technical Director", 
    "Texturing", "Tracking", "Unreal", "Vfx", "Vfx Producer", "Vfx Supervisor", 
    "Video Editing", "Visual Effects", "Vray", "Zbrush", "Zeno"
];

window.formLoadTime = Date.now();
var selectedFile = null;

// Capture source parameter from URL
function captureSourceParameter() {
    const urlParams = new URLSearchParams(window.location.search);
    const source = urlParams.get('source') || urlParams.get('ref') || urlParams.get('utm_source') || '';
    
    const sourceField = document.getElementById('source');
    if (sourceField && source) {
        sourceField.value = source;
        console.log('Source captured:', source);
    }
}

var selectedSkills = [];
var currentHighlight = -1;
var filteredSkills = [];

function initializeSkillsInput() {
    var skillsInput = document.getElementById('skillsInput');
    var skillsWrapper = document.getElementById('skillsWrapper');
    var dropdown = document.getElementById('autocompleteDropdown');
    var hiddenInput = document.getElementById('skills');
    
    if (!skillsInput || !skillsWrapper || !dropdown || !hiddenInput) return;
    
    skillsInput.addEventListener('input', function(e) {
        var value = e.target.value.trim();
        if (value.length > 0) {
            showAutocomplete(value);
        } else {
            hideAutocomplete();
        }
    });
    
    skillsInput.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            navigateDropdown(1);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            navigateDropdown(-1);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (currentHighlight >= 0 && filteredSkills[currentHighlight]) {
                selectSkill(filteredSkills[currentHighlight]);
            }
        } else if (e.key === 'Escape') {
            hideAutocomplete();
        } else if (e.key === ',' || e.key === 'Tab') {
            e.preventDefault();
            var value = skillsInput.value.trim();
            if (value) {
                var exactMatch = SKILLS_DATA.find(function(skill) {
                    return skill.toLowerCase() === value.toLowerCase();
                });
                selectSkill(exactMatch || value);
            }
        } else if (e.key === 'Backspace' && skillsInput.value === '' && selectedSkills.length > 0) {
            removeSkill(selectedSkills.length - 1);
        }
    });
    
    document.addEventListener('click', function(e) {
        if (!skillsWrapper.contains(e.target)) {
            hideAutocomplete();
        }
    });
    
    skillsWrapper.addEventListener('click', function(e) {
        if (e.target === skillsWrapper || e.target.classList.contains('recruit_skills-input-wrapper')) {
            skillsInput.focus();
        }
    });
}

function showAutocomplete(query) {
    var dropdown = document.getElementById('autocompleteDropdown');
    
    filteredSkills = SKILLS_DATA.filter(function(skill) {
        return skill.toLowerCase().includes(query.toLowerCase()) && 
               !selectedSkills.includes(skill);
    }).slice(0, 8);
    
    if (filteredSkills.length === 0) {
        hideAutocomplete();
        return;
    }
    
    dropdown.innerHTML = '';
    filteredSkills.forEach(function(skill, index) {
        var item = document.createElement('div');
        item.className = 'recruit_autocomplete-item';
        
        var regex = new RegExp('(' + escapeRegex(query) + ')', 'gi');
        var highlightedText = skill.replace(regex, '<span class="highlight">$1</span>');
        item.innerHTML = highlightedText;
        
        item.addEventListener('click', function() {
            selectSkill(skill);
        });
        
        dropdown.appendChild(item);
    });
    
    dropdown.classList.add('show');
    currentHighlight = -1;
}

function hideAutocomplete() {
    var dropdown = document.getElementById('autocompleteDropdown');
    dropdown.classList.remove('show');
    currentHighlight = -1;
}

function navigateDropdown(direction) {
    var items = document.querySelectorAll('.recruit_autocomplete-item');
    if (items.length === 0) return;
    
    if (currentHighlight >= 0) {
        items[currentHighlight].classList.remove('highlighted');
    }
    
    currentHighlight += direction;
    if (currentHighlight < 0) currentHighlight = items.length - 1;
    if (currentHighlight >= items.length) currentHighlight = 0;
    
    items[currentHighlight].classList.add('highlighted');
    items[currentHighlight].scrollIntoView({ block: 'nearest' });
}

function selectSkill(skill) {
    if (!skill || selectedSkills.includes(skill)) return;
    
    selectedSkills.push(skill);
    updateSkillsDisplay();
    updateHiddenInput();
    
    var skillsInput = document.getElementById('skillsInput');
    skillsInput.value = '';
    skillsInput.focus();
    hideAutocomplete();
}

function removeSkill(index) {
    selectedSkills.splice(index, 1);
    updateSkillsDisplay();
    updateHiddenInput();
    
    var skillsInput = document.getElementById('skillsInput');
    skillsInput.focus();
}

function updateSkillsDisplay() {
    var skillsWrapper = document.getElementById('skillsWrapper');
    var skillsInput = document.getElementById('skillsInput');
    
    var existingTags = skillsWrapper.querySelectorAll('.recruit_skill-tag');
    existingTags.forEach(function(tag) {
        tag.remove();
    });
    
    selectedSkills.forEach(function(skill, index) {
        var tag = document.createElement('div');
        tag.className = 'recruit_skill-tag';
        tag.innerHTML = skill + '<button type="button" class="remove-btn" data-index="' + index + '">×</button>';
        
        var removeBtn = tag.querySelector('.remove-btn');
        removeBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            removeSkill(parseInt(this.getAttribute('data-index')));
        });
        
        skillsWrapper.insertBefore(tag, skillsInput);
    });
}

function updateHiddenInput() {
    var hiddenInput = document.getElementById('skills');
    hiddenInput.value = selectedSkills.join(', ');
}

function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function showMessage(message, type) {
    var existing = document.querySelector('.recruit_message');
    if (existing) {
        existing.remove();
    }
    
    var messageDiv = document.createElement('div');
    messageDiv.className = 'recruit_message recruit_' + type;
    messageDiv.textContent = message;
    
    var form = document.getElementById('recruitmentForm');
    form.insertBefore(messageDiv, form.firstChild);
    
    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Convert file to base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('===================================');
    console.log('[DOM] DOMContentLoaded event fired');
    console.log('[DOM] Form version from HTML:', document.querySelector('.recruit_container').getAttribute('data-form-version'));
    console.log('[DOM] Script version: 2.0');
    console.log('===================================');
    
    // Capture source parameter on page load
    captureSourceParameter();
    
    initializeSkillsInput();
    
    // Character counter for message field
    var messageField = document.getElementById('message');
    var messageCounter = document.getElementById('messageCounter');
    
    if (messageField && messageCounter) {
        function updateCharCounter() {
            const currentLength = messageField.value.length;
            const maxLength = 5000;
            messageCounter.textContent = `(${currentLength}/${maxLength})`;
            
            // Change color when approaching limit
            if (currentLength > maxLength * 0.9) {
                messageCounter.style.color = '#ef4444';
            } else {
                messageCounter.style.color = '#999999';
            }
        }
        
        messageField.addEventListener('input', updateCharCounter);
        messageField.addEventListener('paste', function() {
            setTimeout(updateCharCounter, 10);
        });
        
        // Initial update
        updateCharCounter();
    }
    
    var fileUpload = document.getElementById('fileUpload');
    var fileInput = document.getElementById('resume');
    var fileSelected = document.getElementById('fileSelected');
    
    if (fileUpload && fileInput && fileSelected) {
        fileUpload.addEventListener('click', function() {
            fileInput.click();
        });
        
        fileUpload.addEventListener('dragover', function(e) {
            e.preventDefault();
            fileUpload.classList.add('recruit_dragover');
        });
        
        fileUpload.addEventListener('dragleave', function() {
            fileUpload.classList.remove('recruit_dragover');
        });
        
        fileUpload.addEventListener('drop', function(e) {
            e.preventDefault();
            fileUpload.classList.remove('recruit_dragover');
            var files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFileSelect(files[0]);
            }
        });
        
        fileInput.addEventListener('change', function() {
            if (this.files.length > 0) {
                handleFileSelect(this.files[0]);
            }
        });
        
        function handleFileSelect(file) {
            if (file.type !== 'application/pdf') {
                showMessage('Please select a PDF file only.', 'error');
                return;
            }
            
            if (file.size > 10 * 1024 * 1024) {
                showMessage('File size must be less than 10MB.', 'error');
                return;
            }
            
            // Store the selected file
            selectedFile = file;
            
            fileSelected.innerHTML = '<div class="recruit_file-selected"><svg class="recruit_file-selected-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>' + file.name + ' (' + (file.size / 1024 / 1024).toFixed(2) + 'MB)</div>';
            fileSelected.style.display = 'block';
        }
    }
    
    var form = document.getElementById('recruitmentForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Form submitted');
            
            var submitButton = form.querySelector('button[type="submit"]');
            if (submitButton.disabled) return;
            
            submitButton.disabled = true;
            submitButton.innerHTML = '<span class="recruit_spinner"></span>Submitting...';
            submitButton.style.background = '#e5e5e5';
            submitButton.style.color = '#999999';
            
            var formData = new FormData(form);
            
            var fullName = formData.get('fullName');
            var email = formData.get('email');
            var consent = formData.get('consent');
            
            function resetSubmitButton() {
                submitButton.disabled = false;
                submitButton.textContent = 'Submit Application';
                submitButton.style.background = '';
                submitButton.style.color = '';
            }
            
            // Enhanced Validation
            if (!fullName || !fullName.trim()) {
                showMessage('Please enter your full name', 'error');
                resetSubmitButton();
                return;
            }
            
            // Validate full name length
            if (fullName.length > 100) {
                showMessage('Full name is too long (max 100 characters)', 'error');
                resetSubmitButton();
                return;
            }
            
            if (!email || !email.trim()) {
                showMessage('Please enter your email address', 'error');
                resetSubmitButton();
                return;
            }
            
            // Validate email format
            if (!validateEmail(email)) {
                showMessage('Please enter a valid email address', 'error');
                resetSubmitButton();
                return;
            }
            
            // Validate message length if provided
            var message = formData.get('message');
            if (message && message.length > 5000) {
                showMessage('Your message is too long (max 5000 characters)', 'error');
                resetSubmitButton();
                return;
            }
            
            if (!consent) {
                showMessage('Please accept the privacy policy to continue', 'error');
                resetSubmitButton();
                return;
            }
            
            // Honeypot spam protection
            if (formData.get('website_url') || formData.get('email_backup')) {
                console.log('Spam detected via honeypot');
                // Silently fail for bots
                setTimeout(function() {
                    resetSubmitButton();
                    showMessage('Thank you for your submission!', 'success');
                }, 2000);
                return;
            }
            
            // Time-based spam protection
            var submitTime = Date.now();
            var formLoadTime = window.formLoadTime || submitTime - 5000;
            if (submitTime - formLoadTime < 3000) {
                console.log('Spam detected: too fast submission');
                setTimeout(function() {
                    showMessage('Please take a moment to review your application before submitting.', 'error');
                    resetSubmitButton();
                }, 1000);
                return;
            }
            
            // Handle file upload and form submission
            async function submitApplication() {
                console.log('[SUBMIT] Starting application submission');
                
                try {
                    // Prepare raw data for n8n webhook
                    var rawData = {
                        fullName: formData.get('fullName'),
                        email: formData.get('email'),
                        country: formData.get('country') || '',
                        department: formData.get('department') || '',
                        internship: formData.get('internship') === 'on',
                        skills: formData.get('skills') || '',
                        experience: formData.get('experience') || '',
                        website: formData.get('website') || '',
                        linkedin: formData.get('linkedin') || '',
                        artstation: formData.get('artstation') || '',
                        showreel: formData.get('showreel') || '',
                        showreelPassword: formData.get('password') || '',
                        message: formData.get('message') || '',
                        source: formData.get('source') || '',
                        timestamp: new Date().toISOString()
                    };
                    
                    console.log('[SUBMIT] Raw data prepared');
                    console.log('[SUBMIT] Message field preview:', rawData.message.substring(0, 200));
                    
                    // Sanitize all form data to prevent JSON errors
                    var webhookData = sanitizeFormData(rawData);
                    
                    console.log('[SUBMIT] Data sanitized');
                    console.log('[SUBMIT] Sanitized message preview:', webhookData.message.substring(0, 200));
                    
                    // Handle file if selected
                    if (selectedFile) {
                        submitButton.innerHTML = '<span class="recruit_spinner"></span>Processing resume...';
                        console.log('[SUBMIT] Processing file:', selectedFile.name, 'Size:', selectedFile.size);
                        
                        try {
                            // Convert file to base64 for transmission
                            const base64 = await fileToBase64(selectedFile);
                            webhookData.resumeBase64 = base64;
                            webhookData.resumeFileName = selectedFile.name;
                            console.log('[SUBMIT] File converted to base64 successfully');
                        } catch (fileError) {
                            console.error('[SUBMIT] File processing error:', fileError);
                            showMessage('Error processing resume file. Please try again or submit without the file.', 'error');
                            // Continue without file rather than failing completely
                        }
                    }
                    
                    submitButton.innerHTML = '<span class="recruit_spinner"></span>Submitting application...';
                    
                    // Test JSON stringification before sending
                    let jsonPayload;
                    try {
                        jsonPayload = JSON.stringify(webhookData);
                        console.log('[SUBMIT] JSON stringified successfully, size:', jsonPayload.length, 'bytes');
                    } catch (stringifyError) {
                        console.error('[SUBMIT] JSON stringify error:', stringifyError);
                        throw new Error('Failed to prepare data for submission. Please check your input for special characters.');
                    }
                    
                    console.log('[SUBMIT] Sending to webhook:', N8N_WEBHOOK_URL);
                    
                    // Submit to n8n webhook with better error handling
                    const response = await fetch(N8N_WEBHOOK_URL, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: jsonPayload
                    });
                    
                    console.log('[SUBMIT] Response received');
                    console.log('[SUBMIT] Response status:', response.status);
                    console.log('[SUBMIT] Response OK:', response.ok);
                    console.log('[SUBMIT] Response headers:', response.headers);
                    
                    if (response.ok) {
                        console.log('[SUBMIT] Response is OK, attempting to parse response body');
                        
                        // Try to parse JSON response, but handle gracefully if it fails
                        let result = {};
                        const contentType = response.headers.get('content-type');
                        console.log('[SUBMIT] Response content-type:', contentType);
                        
                        if (contentType && contentType.includes('application/json')) {
                            console.log('[SUBMIT] Content type is JSON, attempting to parse');
                            try {
                                const responseText = await response.text();
                                console.log('[SUBMIT] Response text received, length:', responseText.length);
                                console.log('[SUBMIT] Response text preview:', responseText.substring(0, 200));
                                
                                if (responseText.trim()) {
                                    result = JSON.parse(responseText);
                                    console.log('[SUBMIT] JSON parsed successfully:', result);
                                } else {
                                    console.log('[SUBMIT] Response body is empty, treating as success');
                                }
                            } catch (jsonError) {
                                console.error('[SUBMIT] JSON parse error:', jsonError);
                                console.warn('[SUBMIT] Response is not valid JSON, but submission was successful');
                                // Continue anyway since the response was OK
                            }
                        } else {
                            // Non-JSON response but still successful
                            console.log('[SUBMIT] Non-JSON response, reading as text');
                            try {
                                const textResponse = await response.text();
                                console.log('[SUBMIT] Text response:', textResponse);
                            } catch (textError) {
                                console.error('[SUBMIT] Error reading text response:', textError);
                            }
                        }
                        
                        console.log('[SUBMIT] Submission successful, showing success modal');
                        
                        // Show success modal
                        document.body.insertAdjacentHTML('beforeend', 
                            '<div class="recruit_modal-overlay">' +
                                '<div class="recruit_modal-content">' +
                                    '<button class="recruit_modal-close" onclick="window.location.href=\'https://www.ghostvfx.com\'">' +
                                        '<svg viewBox="0 0 24 24" fill="none">' +
                                            '<path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"/>' +
                                        '</svg>' +
                                    '</button>' +
                                    '<div class="recruit_success-animation">' +
                                        '<div class="recruit_success-circle">' +
                                            '<div class="recruit_success-checkmark">' +
                                                '<svg viewBox="0 0 24 24">' +
                                                    '<path class="checkmark-path" d="M9 12l2 2 4-4"></path>' +
                                                '</svg>' +
                                            '</div>' +
                                        '</div>' +
                                    '</div>' +
                                    '<h2 class="recruit_success-title">Application Submitted Successfully!</h2>' +
                                    '<p class="recruit_success-message">Thank you for sharing your details with us. We will hang on to your information, and look forward to getting in touch when the right opportunity arises.</p>' +
                                    '<p class="recruit_success-submessage">To comply with GDPR, we'll store your information for up to 2 years. If you would like your data removed, or have any other questions please write to jobs@ghostvfx.com</p>' +
                                    '<button class="recruit_modal-button" onclick="window.location.href=\'https://www.ghostvfx.com\'">' +
                                        'Continue to GhostVFX' +
                                    '</button>' +
                                '</div>' +
                            '</div>'
                        );
                        
                        // Reset form
                        form.reset();
                        selectedSkills = [];
                        updateSkillsDisplay();
                        if (fileSelected) {
                            fileSelected.style.display = 'none';
                        }
                        
                        setTimeout(function() {
                            var overlay = document.querySelector('.recruit_modal-overlay');
                            if (overlay) {
                                overlay.addEventListener('click', function(e) {
                                    if (e.target === overlay) {
                                        window.location.href = 'https://www.ghostvfx.com';
                                    }
                                });
                            }
                        }, 100);
                    } else {
                        // Handle non-OK responses
                        console.log('[SUBMIT ERROR] Response not OK');
                        let errorMessage = 'Failed to submit application. Please try again.';
                        
                        try {
                            const contentType = response.headers.get('content-type');
                            console.log('[SUBMIT ERROR] Error response content-type:', contentType);
                            
                            if (contentType && contentType.includes('application/json')) {
                                const errorText = await response.text();
                                console.log('[SUBMIT ERROR] Error response text:', errorText);
                                
                                if (errorText.trim()) {
                                    const errorData = JSON.parse(errorText);
                                    console.error('[SUBMIT ERROR] Parsed error data:', errorData);
                                    if (errorData.message) {
                                        errorMessage = errorData.message;
                                    }
                                }
                            } else {
                                const textError = await response.text();
                                console.error('[SUBMIT ERROR] Text error response:', textError);
                            }
                        } catch (parseError) {
                            console.error('[SUBMIT ERROR] Could not parse error response:', parseError);
                        }
                        
                        // Check for specific HTTP errors
                        if (response.status === 404) {
                            throw new Error('Form submission endpoint not found. Please contact support at jobs@ghostvfx.com');
                        } else if (response.status === 413) {
                            throw new Error('File too large. Please reduce file size and try again.');
                        } else if (response.status === 400) {
                            throw new Error('Invalid form data. Please check your inputs and try again.');
                        } else if (response.status >= 500) {
                            throw new Error('Server error. Please try again in a few moments.');
                        } else {
                            throw new Error(errorMessage);
                        }
                    }
                } catch (error) {
                    console.error('===================================');
                    console.error('[SUBMIT FATAL ERROR] Submission failed:', error);
                    console.error('[SUBMIT FATAL ERROR] Error name:', error.name);
                    console.error('[SUBMIT FATAL ERROR] Error message:', error.message);
                    console.error('[SUBMIT FATAL ERROR] Error stack:', error.stack);
                    console.error('===================================');
                    
                    showMessage('Error: ' + error.message, 'error');
                    resetSubmitButton();
                }
            }
            
            submitApplication();
        });
    }
});

console.log('Script loaded successfully');
console.log('n8n webhook URL:', N8N_WEBHOOK_URL);
console.log('===================================');
console.log('Ghost Recruitment Form v2.0 Ready');
console.log('All event listeners attached');
console.log('===================================');
