console.log('Script starting...');

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

var SUPABASE_URL = 'https://rnrfjighvqevfjeulego.supabase.co';
var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJucmZqaWdodnFldmZqZXVsZWdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk4MDkwMDIsImV4cCI6MjA1NTM4NTAwMn0.EtVRpwUoZXgSSN84aRTJifMov-jxZOcz0throxzd_cA';

window.formLoadTime = Date.now();

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

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded');
    
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
            
            if (formData.get('website_url') || formData.get('email_backup')) {
                console.log('Spam detected via honeypot');
                resetSubmitButton();
                return;
            }
            
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
            
            var applicationData = {
                full_name: formData.get('fullName'),
                email: formData.get('email'),
                country: formData.get('country'),
                studio: formData.get('studio'),
                department: formData.get('department'),
                is_internship: formData.get('internship') === 'on',
                skills: formData.get('skills'),
                experience: formData.get('experience'),
                website: formData.get('website'),
                linkedin: formData.get('linkedin'),
                artstation: formData.get('artstation'),
                showreel: formData.get('showreel'),
                showreel_password: formData.get('password'),
                message: formData.get('message')
            };
            
            console.log('Submitting data:', applicationData);
            
            fetch(SUPABASE_URL + '/rest/v1/recruit_applications', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': 'Bearer ' + SUPABASE_ANON_KEY
                },
                body: JSON.stringify(applicationData)
            })
            .then(function(response) {
                console.log('Response status:', response.status);
                if (response.ok || response.status === 201) {
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
                    return response.text().then(function(text) {
                        console.log('Error response:', text);
                        throw new Error('Server error: ' + response.status + ' - ' + text);
                    });
                }
            })
            .catch(function(error) {
                console.log('Submit error:', error.message);
                showMessage('Error submitting application: ' + error.message, 'error');
            })
            .finally(function() {
                if (!document.querySelector('.recruit_modal-overlay')) {
                    resetSubmitButton();
                }
            });
        });
    }
});

console.log('Script loaded successfully');