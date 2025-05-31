// This is what you need to ADD to your existing scripts.js file
// Your current file stops too early - add everything below:

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded');
    
    // Initialize skills input
    initializeSkillsInput();
    
    // File upload handler
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
    
    // Form submission
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
            
            // Get form data
            var formData = new FormData(form);
            
            // Basic validation
            var fullName = formData.get('fullName');
            var email = formData.get('email');
            var consent = formData.get('consent');
            
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
            
            // Honeypot spam detection
            if (formData.get('website_url') || formData.get('email_backup')) {
                console.log('Spam detected via honeypot');
                resetSubmitButton();
                return;
            }
            
            // Timing-based spam detection
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
            
            function resetSubmitButton() {
                submitButton.disabled = false;
                submitButton.textContent = 'Submit Application';
                submitButton.style.background = '';
                submitButton.style.color = '';
            }
            
            // Prepare data for Supabase
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
            
            // Submit to Supabase
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
                                '<p class="recruit_success-message">Thank you for your interest in joining our team. We\'ve received your application and will review it carefully.</p>' +
                                '<p class="recruit_success-submessage">We\'ll be in touch soon if your profile matches our current opportunities.</p>' +
                                '<button class="recruit_modal-button" onclick="window.location.href=\'https://www.ghostvfx.com\'">' +
                                    'Continue to GhostVFX' +
                                '</button>' +
                            '</div>' +
                        '</div>'
                    );
                    
                    // Also allow clicking backdrop to close
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
                // Only reset if modal not shown (error case)
                if (!document.querySelector('.recruit_modal-overlay')) {
                    submitButton.disabled = false;
                    submitButton.textContent = 'Submit Application';
                    submitButton.style.background = '';
                    submitButton.style.color = '';
                }
            });
        });
    }
});
