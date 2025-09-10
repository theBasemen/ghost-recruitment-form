console.log('Script starting...');

// ===========================
// N8N WEBHOOK CONFIGURATION
// ===========================
// Your n8n webhook URL (already configured for your instance)
var N8N_WEBHOOK_URL = 'https://basemen.app.n8n.cloud/webhook/fe300862-9d94-4db2-b153-8f432187df3f';

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
    console.log('DOM loaded');
    
    // Capture source parameter on page load
    captureSourceParameter();
    
    initializeSkillsInput();
    
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
            
            // Validation
            if (!fullName || !fullName.trim()) {
                showMessage('Please enter your full name', 'error');
                resetSubmitButton();
                return;
            }
            
            if (!email || !email.trim()) {
                showMessage('Please enter your email address', 'error');
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
                try {
                    // Prepare data for n8n webhook
                    var webhookData = {
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
                    
                    // Handle file if selected
                    if (selectedFile) {
                        submitButton.innerHTML = '<span class="recruit_spinner"></span>Processing resume...';
                        
                        // Convert file to base64 for transmission
                        // n8n will handle the Airtable upload
                        const base64 = await fileToBase64(selectedFile);
                        webhookData.resumeBase64 = base64;
                        webhookData.resumeFileName = selectedFile.name;
                    }
                    
                    submitButton.innerHTML = '<span class="recruit_spinner"></span>Submitting application...';
                    
                    console.log('Submitting to n8n webhook...');
                    
                    // Submit to n8n webhook
                    const response = await fetch(N8N_WEBHOOK_URL, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(webhookData)
                    });
                    
                    console.log('Response status:', response.status);
                    
                    if (response.ok) {
                        const result = await response.json();
                        console.log('Success!', result);
                        
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
                                    '<p class="recruit_success-message">Thank you for your interest in joining our team. We have received your application and will review it carefully.</p>' +
                                    '<p class="recruit_success-submessage">We will be in touch soon if your profile matches our current opportunities.</p>' +
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
                        const errorData = await response.json().catch(() => ({}));
                        console.error('Submit error:', errorData);
                        
                        // Check for specific errors
                        if (response.status === 404) {
                            throw new Error('Form submission endpoint not found. Please contact support.');
                        } else if (response.status === 0 || !response.status) {
                            throw new Error('Network error. Please check your connection and try again.');
                        } else {
                            throw new Error(errorData.message || 'Failed to submit application. Please try again.');
                        }
                    }
                } catch (error) {
                    console.error('Submit error:', error);
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