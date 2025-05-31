console.log('Script starting...');

// Skills data from CSV
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

// Configuration
var SUPABASE_URL = 'https://rnrfjighvqevfjeulego.supabase.co';
var SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJucmZqaWdodnFldmZqZXVsZWdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk4MDkwMDIsImV4cCI6MjA1NTM4NTAwMn0.EtVRpwUoZXgSSN84aRTJifMov-jxZOcz0throxzd_cA';

// Track form load time
window.formLoadTime = Date.now();

// Skills functionality
var selectedSkills = [];
var currentHighlight = -1;
var filteredSkills = [];

function initializeSkillsInput() {
    var skillsInput = document.getElementById('skillsInput');
    var skillsWrapper = document.getElementById('skillsWrapper');
    var dropdown = document.getElementById('autocompleteDropdown');
    var hiddenInput = document.getElementById('skills');
    
    if (!skillsInput || !skillsWrapper || !dropdown || !hiddenInput) return;
    
    // Handle input typing
    skillsInput.addEventListener('input', function(e) {
        var value = e.target.value.trim();
        
        if (value.length > 0) {
            showAutocomplete(value);
        } else {
            hideAutocomplete();
        }
    });
    
    // Handle key navigation
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
                // Find closest match or use as is
                var exactMatch = SKILLS_DATA.find(function(skill) {
                    return skill.toLowerCase() === value.toLowerCase();
                });
                selectSkill(exactMatch || value);
            }
        } else if (e.key === 'Backspace' && skillsInput.value === '' && selectedSkills.length > 0) {
            removeSkill(selectedSkills.length - 1);
        }
    });
    
    // Handle clicking outside
    document.addEventListener('click', function(e) {
        if (!skillsWrapper.contains(e.target)) {
            hideAutocomplete();
        }
    });
    
    // Handle wrapper click to focus input
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
    }).slice(0, 8); // Limit to 8 suggestions
    
    if (filteredSkills.length === 0) {
        hideAutocomplete();
        return;
    }
    
    dropdown.innerHTML = '';
    filteredSkills.forEach(function(skill, index) {
        var item = document.createElement('div');
        item.className = 'recruit_autocomplete-item';
        
        // Highlight matching text
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
    
    // Remove previous highlight
    if (currentHighlight >= 0) {
        items[currentHighlight].classList.remove('highlighted');
    }
    
    // Update highlight index
    currentHighlight += direction;
    if (currentHighlight < 0) currentHighlight = items.length - 1;
    if (currentHighlight >= items.length) currentHighlight = 0;
    
    // Add new highlight
    items[currentHighlight].classList.add('highlighted');
    items[currentHighlight].scrollIntoView({ block: 'nearest' });
}

function selectSkill(skill) {
    if (!skill || selectedSkills.includes(skill)) return;
    
    selectedSkills.push(skill);
    updateSkillsDisplay();
    updateHiddenInput();
    
    var skillsInput = document.getElementById('skill