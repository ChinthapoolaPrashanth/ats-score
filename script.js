// API key management
const MODEL_NAME = 'gpt-4';
let OPENAI_API_KEY = '';

// Storage management
let storedResumes = [];
let storedJobDescriptions = [];

// Function to set API key
function setApiKey(key) {
    OPENAI_API_KEY = key.trim();
    if (typeof window !== 'undefined' && key) {
        localStorage.setItem('openai_api_key', key);
    }
}

// Load API key from localStorage
if (typeof window !== 'undefined') {
    const storedKey = localStorage.getItem('openai_api_key');
    if (storedKey) {
        setApiKey(storedKey);
    }
}

// Storage functions
function loadStoredData() {
    try {
        const resumes = localStorage.getItem('stored_resumes');
        const jobDescriptions = localStorage.getItem('stored_job_descriptions');
        
        storedResumes = resumes ? JSON.parse(resumes) : [];
        storedJobDescriptions = jobDescriptions ? JSON.parse(jobDescriptions) : [];
        
        renderStoredResumes();
        renderStoredJobDescriptions();
    } catch (error) {
        console.error('Error loading stored data:', error);
        storedResumes = [];
        storedJobDescriptions = [];
    }
}

function saveStoredData() {
    try {
        localStorage.setItem('stored_resumes', JSON.stringify(storedResumes));
        localStorage.setItem('stored_job_descriptions', JSON.stringify(storedJobDescriptions));
    } catch (error) {
        console.error('Error saving stored data:', error);
    }
}

function addStoredResume(name, content) {
    const newResume = {
        id: Date.now().toString(),
        name: name,
        content: content,
        date: new Date().toLocaleDateString(),
        timestamp: Date.now()
    };
    
    storedResumes.unshift(newResume);
    
    // Keep only last 10 resumes
    if (storedResumes.length > 10) {
        storedResumes = storedResumes.slice(0, 10);
    }
    
    saveStoredData();
    renderStoredResumes();
}

function addStoredJobDescription(name, content) {
    const newJobDescription = {
        id: Date.now().toString(),
        name: name,
        content: content,
        date: new Date().toLocaleDateString(),
        timestamp: Date.now()
    };
    
    storedJobDescriptions.unshift(newJobDescription);
    
    // Keep only last 10 job descriptions
    if (storedJobDescriptions.length > 10) {
        storedJobDescriptions = storedJobDescriptions.slice(0, 10);
    }
    
    saveStoredData();
    renderStoredJobDescriptions();
}

function deleteStoredResume(id) {
    storedResumes = storedResumes.filter(resume => resume.id !== id);
    saveStoredData();
    renderStoredResumes();
}

function deleteStoredJobDescription(id) {
    storedJobDescriptions = storedJobDescriptions.filter(job => job.id !== id);
    saveStoredData();
    renderStoredJobDescriptions();
}

function loadStoredResume(id) {
    const resume = storedResumes.find(r => r.id === id);
    if (resume) {
        resumeText.value = resume.content;
        updateCharCount(resumeText, resumeCharCount);
        showNotification(`Loaded resume: ${resume.name}`, 'success');
        
        // Update active state
        document.querySelectorAll('.stored-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-resume-id="${id}"]`)?.classList.add('active');
    }
}

function loadStoredJobDescription(id) {
    const jobDescription = storedJobDescriptions.find(j => j.id === id);
    if (jobDescription) {
        document.getElementById('jobDescription').value = jobDescription.content;
        updateCharCount(document.getElementById('jobDescription'), document.getElementById('jobCharCount'));
        showNotification(`Loaded job description: ${jobDescription.name}`, 'success');
        
        // Update active state
        document.querySelectorAll('.stored-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-job-id="${id}"]`)?.classList.add('active');
    }
}

function renderStoredResumes() {
    const container = document.getElementById('storedResumesList');
    if (!container) return;
    
    if (storedResumes.length === 0) {
        container.innerHTML = '<div class="no-resumes">No resumes stored yet</div>';
        return;
    }
    
    container.innerHTML = storedResumes.map(resume => `
        <div class="stored-item" data-resume-id="${resume.id}">
            <div class="stored-item-info">
                <div class="stored-item-name">${resume.name}</div>
                <div class="stored-item-date">${resume.date}</div>
            </div>
            <div class="stored-item-actions">
                <button class="stored-item-btn" onclick="loadStoredResume('${resume.id}')" title="Load">
                    <i class="fas fa-download"></i>
                </button>
                <button class="stored-item-btn delete" onclick="deleteStoredResume('${resume.id}')" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function renderStoredJobDescriptions() {
    const container = document.getElementById('storedJobDescriptionsList');
    if (!container) return;
    
    if (storedJobDescriptions.length === 0) {
        container.innerHTML = '<div class="no-resumes">No job descriptions stored yet</div>';
        return;
    }
    
    container.innerHTML = storedJobDescriptions.map(job => `
        <div class="stored-item" data-job-id="${job.id}">
            <div class="stored-item-info">
                <div class="stored-item-name">${job.name}</div>
                <div class="stored-item-date">${job.date}</div>
            </div>
            <div class="stored-item-actions">
                <button class="stored-item-btn" onclick="loadStoredJobDescription('${job.id}')" title="Load">
                    <i class="fas fa-download"></i>
                </button>
                <button class="stored-item-btn delete" onclick="deleteStoredJobDescription('${job.id}')" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const resumeText = document.getElementById('resumeText');
    const jobDescription = document.getElementById('jobDescription');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const loadingDiv = document.getElementById('loading');
    const scoreElement = document.getElementById('score');
    const scoreRing = document.getElementById('scoreRing');
    const scoreLabel = document.getElementById('scoreLabel');
    const scoreDescription = document.getElementById('scoreDescription');
    const analysisText = document.getElementById('analysisText');
    const suggestionsText = document.getElementById('suggestionsText');
    const resumeFileInput = document.getElementById('resumeFile');
    const jobDescriptionFileInput = document.getElementById('jobDescriptionFile');
    const resumeCharCount = document.getElementById('resumeCharCount');
    const jobCharCount = document.getElementById('jobCharCount');
    const pageTitle = document.getElementById('pageTitle');
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.querySelector('.sidebar');
    
    // Save buttons
    const saveResumeBtn = document.getElementById('saveResumeBtn');
    const saveJobDescriptionBtn = document.getElementById('saveJobDescriptionBtn');

    // Navigation elements
    const navItems = document.querySelectorAll('.nav-item');
    const contentSections = document.querySelectorAll('.content-section');

    // DOM Elements for file names
    const resumeFileName = document.getElementById('resumeFileName');
    const jobDescriptionFileName = document.getElementById('jobDescriptionFileName');

    // Initialize character counters
    updateCharCount(resumeText, resumeCharCount);
    updateCharCount(jobDescription, jobCharCount);

    // Load stored data
    loadStoredData();

    // Event Listeners
    analyzeBtn.addEventListener('click', analyzeResume);
    resumeFileInput.addEventListener('change', (e) => handleFileUpload(e, resumeFileInput, resumeText, resumeFileName));
    jobDescriptionFileInput.addEventListener('change', (e) => handleFileUpload(e, jobDescriptionFileInput, jobDescription, jobDescriptionFileName));
    
    // Save button listeners
    saveResumeBtn.addEventListener('click', saveResume);
    saveJobDescriptionBtn.addEventListener('click', saveJobDescription);
    
    // Character counter listeners
    resumeText.addEventListener('input', () => {
        updateCharCount(resumeText, resumeCharCount);
        updateSaveButtonVisibility(saveResumeBtn, resumeText.value);
    });
    jobDescription.addEventListener('input', () => {
        updateCharCount(jobDescription, jobCharCount);
        updateSaveButtonVisibility(saveJobDescriptionBtn, jobDescription.value);
    });

    // Navigation listeners
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const section = item.getAttribute('data-section');
            navigateToSection(section);
        });
    });

    // Mobile menu toggle
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    // Scroll button functionality
    setupScrollButtons();

    // Function to update save button visibility
    function updateSaveButtonVisibility(button, content) {
        if (content.trim().length > 50) {
            button.style.display = 'inline-flex';
        } else {
            button.style.display = 'none';
        }
    }

    // Function to save resume
    function saveResume() {
        const content = resumeText.value.trim();
        if (content.length < 50) {
            showNotification('Resume content is too short to save', 'error');
            return;
        }
        
        const name = prompt('Enter a name for this resume:');
        if (name && name.trim()) {
            addStoredResume(name.trim(), content);
            showNotification('Resume saved successfully!', 'success');
        }
    }

    // Function to save job description
    function saveJobDescription() {
        const content = jobDescription.value.trim();
        if (content.length < 50) {
            showNotification('Job description content is too short to save', 'error');
            return;
        }
        
        const name = prompt('Enter a name for this job description:');
        if (name && name.trim()) {
            addStoredJobDescription(name.trim(), content);
            showNotification('Job description saved successfully!', 'success');
        }
    }

    // Function to navigate between sections
    function navigateToSection(sectionName) {
        // Update navigation
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-section') === sectionName) {
                item.classList.add('active');
            }
        });

        // Update content sections
        contentSections.forEach(section => {
            section.classList.remove('active');
            if (section.id === sectionName + 'Section') {
                section.classList.add('active');
            }
        });

        // Update page title
        const titles = {
            'upload': 'Upload Content',
            'results': 'Analysis Results',
            'storage': 'Stored Content'
        };
        pageTitle.textContent = titles[sectionName] || 'ATS Pro';

        // Close mobile menu
        sidebar.classList.remove('open');
    }

    // Function to update character count
    function updateCharCount(textarea, counterElement) {
        const count = textarea.value.length;
        counterElement.textContent = count.toLocaleString() + ' characters';
        
        // Change color based on content length
        if (count === 0) {
            counterElement.style.color = 'var(--text-tertiary)';
        } else if (count < 100) {
            counterElement.style.color = 'var(--warning-600)';
        } else if (count < 500) {
            counterElement.style.color = 'var(--primary-600)';
        } else {
            counterElement.style.color = 'var(--success-600)';
        }
    }

    // Function to setup scroll buttons
    function setupScrollButtons() {
        const textareas = [resumeText, jobDescription];
        
        textareas.forEach(textarea => {
            const container = textarea.parentElement;
            const scrollUpBtn = container.querySelector('.scroll-up');
            const scrollDownBtn = container.querySelector('.scroll-down');
            
            if (scrollUpBtn && scrollDownBtn) {
                scrollUpBtn.addEventListener('click', () => {
                    textarea.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                });
                
                scrollDownBtn.addEventListener('click', () => {
                    textarea.scrollTo({
                        top: textarea.scrollHeight,
                        behavior: 'smooth'
                    });
                });
                
                // Show/hide scroll buttons based on content
                textarea.addEventListener('scroll', () => {
                    const showUp = textarea.scrollTop > 50;
                    const showDown = textarea.scrollTop < (textarea.scrollHeight - textarea.clientHeight - 50);
                    
                    scrollUpBtn.style.opacity = showUp ? '1' : '0.5';
                    scrollDownBtn.style.opacity = showDown ? '1' : '0.5';
                });
                
                // Initial check
                textarea.dispatchEvent(new Event('scroll'));
            }
        });
    }

    // Function to show notifications
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            ${type === 'success' ? 'background: var(--success-600);' : 
              type === 'error' ? 'background: var(--error-600);' : 
              'background: var(--primary-600);'}
        `;
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Handle file uploads
    async function handleFileUpload(event, input, textarea, fileNameElement) {
        const file = input.files[0];
        if (!file) return;

        // Update file name display
        const fileName = file.name.length > 30 ? file.name.substring(0, 27) + '...' : file.name;
        fileNameElement.textContent = fileName;
        fileNameElement.style.color = 'var(--success-600)';
        fileNameElement.style.fontWeight = '500';
        fileNameElement.title = file.name; // Show full name on hover

        // Show loading state for file processing
        const originalText = fileNameElement.textContent;
        fileNameElement.textContent = 'Processing...';
        fileNameElement.style.color = 'var(--text-tertiary)';

        try {
            const text = await readFileAsText(file);
            
            // Update the textarea with the file content or message
            textarea.value = typeof text === 'string' ? text : 'Could not read file content';
            
            // Update character count
            updateCharCount(textarea, textarea === resumeText ? resumeCharCount : jobCharCount);
            
            // Update save button visibility
            if (textarea === resumeText) {
                updateSaveButtonVisibility(saveResumeBtn, textarea.value);
            } else {
                updateSaveButtonVisibility(saveJobDescriptionBtn, textarea.value);
            }
            
            // Show appropriate message based on file type
            const fileExt = file.name.split('.').pop().toLowerCase();
            const unsupportedTypes = ['pdf', 'docx', 'doc'];
            
            if (unsupportedTypes.includes(fileExt)) {
                fileNameElement.style.color = 'var(--warning-600)'; // Yellow for warning
                fileNameElement.textContent = `${fileExt.toUpperCase()} - ${fileName}`;
            } else {
                fileNameElement.textContent = fileName;
                fileNameElement.style.color = 'var(--success-600)'; // Green for success
            }
            
            // Auto-expand textarea to fit content
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 400) + 'px';
            
            // Ensure scroll buttons are visible and functional
            setTimeout(() => {
                textarea.dispatchEvent(new Event('scroll'));
                setupScrollButtons();
            }, 100);
            
        } catch (error) {
            console.error('Error reading file:', error);
            fileNameElement.textContent = `Error: ${file.name}`;
            fileNameElement.style.color = 'var(--error-600)';
            
            // Show error message in the textarea
            textarea.value = 'Error: Could not read file. Please try another file or paste the text manually.';
            textarea.style.height = '100px';
            
            // Ensure scroll buttons are visible
            setTimeout(() => {
                textarea.dispatchEvent(new Event('scroll'));
            }, 100);
        }
    }

    // Read file as text or handle different file types
    async function readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            // Handle different file types
            const fileType = file.name.split('.').pop().toLowerCase();
            const isTextFile = ['txt', 'csv', 'json', 'xml', 'html', 'css', 'js'].includes(fileType);
            const isDocx = fileType === 'docx';
            const isPdf = fileType === 'pdf';
            const isDoc = fileType === 'doc';
            
            // Handle DOCX files with mammoth.js
            if (isDocx && window.mammoth) {
                reader.onload = function(event) {
                    const arrayBuffer = event.target.result;
                    mammoth.extractRawText({arrayBuffer: arrayBuffer})
                        .then(function(result) {
                            resolve(result.value);
                        })
                        .catch(function(error) {
                            console.error('Error extracting text from DOCX:', error);
                            reject('Error reading DOCX file. Please try another file or paste the text manually.');
                        });
                };
                reader.readAsArrayBuffer(file);
                return;
            }
            
            // Show appropriate message for unsupported file types
            if (isPdf) {
                resolve('PDF content cannot be extracted directly. Please copy/paste the text manually.');
                return;
            }
            
            if (isDoc) {
                resolve('DOC content cannot be extracted directly. Please save as .txt or copy/paste the text.');
                return;
            }
            
            // For text files, try to read them
            if (isTextFile) {
                reader.onload = (event) => resolve(event.target.result);
                reader.onerror = (error) => reject(error);
                reader.readAsText(file);
            } else {
                resolve('Unsupported file type. Please upload a text or DOCX file, or paste the content directly.');
            }
        });
    }

    // Main analysis function
    async function analyzeResume() {
        const resume = resumeText.value.trim();
        const jobDesc = jobDescription.value.trim();

        if (!resume || !jobDesc) {
            showNotification('Please provide both resume and job description.', 'error');
            return;
        }

        // Check for API key
        if (!OPENAI_API_KEY) {
            showNotification('Please configure your OpenAI API key in the browser console or contact support.', 'error');
            return;
        }

        // Show loading state
        loadingDiv.classList.remove('hidden');
        analyzeBtn.disabled = true;

        try {
            // Call OpenAI API
            try {
                const prompt = `You are an extremely strict ATS resume analysis expert with 20+ years in HR technology. Your job is to critically evaluate resumes against job descriptions with the same rigor as Jobscan and Teal, but even more strict.

SCORING CRITERIA (Be very strict):
- Only resumes that match 90%+ of required skills, keywords, and formatting should score above 80
- Deduct 10-15 points for each missing critical skill
- Deduct 5-10 points for vague/generic language
- Deduct 5-10 points for poor formatting or structure
- Deduct 5-10 points for lack of quantifiable achievements
- Deduct 5-10 points for missing industry-specific keywords
- Most resumes should score between 30-70 unless they are truly exceptional

ANALYSIS REQUIREMENTS:
1. Extract ALL required skills from job description
2. Identify ALL missing skills in resume
3. Provide specific, actionable suggestions with exact text to add
4. Specify exact location where each suggestion should be added (Summary, Experience, Skills, etc.)
5. Give concrete examples of what to add, not vague advice

RESPONSE FORMAT (valid JSON only):
{
  "score": 0-100,
  "requiredSkills": ["skill1", "skill2"],
  "missingSkills": ["skill1", "skill2"],
  "analysis": "Detailed analysis of strengths and weaknesses",
  "suggestions": [
    {
      "location": "Summary section",
      "action": "Add this exact text",
      "text": "Results-driven professional with 5+ years of experience in [specific skill]..."
    },
    {
      "location": "Experience section - [Job Title]",
      "action": "Add this bullet point",
      "text": "Led cross-functional team of 10 members to deliver [specific project] resulting in 25% increase in efficiency"
    }
  ],
  "deductions": [
    "Missing critical skill: [skill name] (-15 points)",
    "Vague language in summary (-10 points)"
  ]
}

RESUME:
${resume}

JOB DESCRIPTION:
${jobDesc}`;

                // Call OpenAI API
                const response = await callOpenAI(OPENAI_API_KEY, prompt);
                
                // Debug: Log the raw response
                console.log('Raw API response:', response);
                
                // Parse the response
                let result;
                try {
                    // Clean the response to ensure it's valid JSON
                    let jsonString = response.trim();
                    
                    // Remove any markdown code blocks if present
                    if (jsonString.startsWith('```json')) {
                        jsonString = jsonString.replace(/```json\n?/, '').replace(/\n?```/, '');
                    } else if (jsonString.startsWith('```')) {
                        jsonString = jsonString.replace(/```\n?/, '').replace(/\n?```/, '');
                    }
                    
                    result = JSON.parse(jsonString);
                } catch (parseError) {
                    console.error('JSON parse error:', parseError);
                    console.log('Attempted to parse:', response);
                    throw new Error('Invalid response format from API');
                }
                
                // Validate the result structure
                if (!result.score || !result.requiredSkills || !result.missingSkills || !result.analysis || !result.suggestions) {
                    throw new Error('Incomplete response from API');
                }
                
                // Display results
                displayResults(result);
                
            } catch (apiError) {
                console.error('API Error:', apiError);
                throw new Error(`API Error: ${apiError.message}`);
            }
            
        } catch (error) {
            console.error('Analysis error:', error);
            showNotification(`Analysis failed: ${error.message}`, 'error');
        } finally {
            // Hide loading state
            loadingDiv.classList.add('hidden');
            analyzeBtn.disabled = false;
        }
    }

    // Call OpenAI API
    async function callOpenAI(apiKey, prompt) {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: MODEL_NAME,
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert ATS resume analyzer. Provide only valid JSON responses with strict scoring.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.1,
                max_tokens: 4000
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`API request failed: ${response.status} ${response.statusText}. ${errorData.error?.message || ''}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    // Display results
    function displayResults(result) {
        // Navigate to results section
        navigateToSection('results');
        
        // Animate score
        const targetScore = result.score;
        animateValue(scoreElement, 0, targetScore, 2000);
        
        // Update score ring
        const circumference = 2 * Math.PI * 54; // r=54
        const offset = circumference - (targetScore / 100) * circumference;
        scoreRing.style.strokeDashoffset = offset;
        
        // Update score labels
        if (targetScore >= 90) {
            scoreLabel.textContent = 'Excellent';
            scoreLabel.style.color = 'var(--success-600)';
            scoreDescription.textContent = 'Your resume is highly optimized for ATS systems';
        } else if (targetScore >= 80) {
            scoreLabel.textContent = 'Very Good';
            scoreLabel.style.color = 'var(--success-600)';
            scoreDescription.textContent = 'Strong ATS compatibility with minor improvements needed';
        } else if (targetScore >= 70) {
            scoreLabel.textContent = 'Good';
            scoreLabel.style.color = 'var(--primary-600)';
            scoreDescription.textContent = 'Good score with room for improvement';
        } else if (targetScore >= 50) {
            scoreLabel.textContent = 'Fair';
            scoreLabel.style.color = 'var(--warning-600)';
            scoreDescription.textContent = 'Fair score, significant improvements needed';
        } else {
            scoreLabel.textContent = 'Poor';
            scoreLabel.style.color = 'var(--error-600)';
            scoreDescription.textContent = 'Poor ATS compatibility, major changes required';
        }
        
        // Display skills
        displaySkills('requiredSkills', result.requiredSkills, false);
        displaySkills('missingSkills', result.missingSkills, true);
        
        // Display analysis and suggestions
        analysisText.innerHTML = formatTextWithBullets(result.analysis);
        suggestionsText.innerHTML = formatActionableSuggestions(result.suggestions);
        
        // Display deductions if available
        const deductionsSection = document.getElementById('deductionsSection');
        if (result.deductions && result.deductions.length > 0) {
            const deductionsElement = document.getElementById('deductions');
            if (deductionsElement) {
                deductionsElement.innerHTML = formatDeductions(result.deductions);
            }
            if (deductionsSection) {
                deductionsSection.style.display = 'block';
            }
        } else {
            if (deductionsSection) {
                deductionsSection.style.display = 'none';
            }
        }
    }

    // Display skills
    function displaySkills(elementId, skills, isMissing) {
        const element = document.getElementById(elementId);
        element.innerHTML = '';
        
        if (skills && skills.length > 0) {
            skills.forEach(skill => {
                const skillTag = document.createElement('span');
                skillTag.className = `skill-tag ${isMissing ? 'missing' : ''}`;
                skillTag.textContent = skill;
                element.appendChild(skillTag);
            });
        } else {
            const noSkills = document.createElement('span');
            noSkills.className = 'skill-tag';
            noSkills.textContent = isMissing ? 'No missing skills found' : 'No required skills identified';
            noSkills.style.opacity = '0.6';
            element.appendChild(noSkills);
        }
    }

    // Animate value
    function animateValue(element, start, end, duration) {
        const startTime = performance.now();
        const difference = end - start;
        
        function updateValue(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = Math.round(start + (difference * easeOutQuart));
            
            element.textContent = currentValue;
            
            if (progress < 1) {
                requestAnimationFrame(updateValue);
            }
        }
        
        requestAnimationFrame(updateValue);
    }

    // Format text with bullets
    function formatTextWithBullets(text) {
        if (!text) return '';
        
        return text
            .split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0)
            .map(line => {
                if (line.startsWith('-') || line.startsWith('•') || line.startsWith('*')) {
                    return `<li>${line.substring(1).trim()}</li>`;
                } else if (line.match(/^\d+\./)) {
                    return `<li>${line}</li>`;
                } else {
                    return `<p>${line}</p>`;
                }
            })
            .join('')
            .replace(/<li>/g, '<ul><li>')
            .replace(/<\/li>/g, '</li></ul>')
            .replace(/<\/ul><ul>/g, '');
    }

    // Format actionable suggestions with location-specific guidance
    function formatActionableSuggestions(suggestions) {
        if (!suggestions || !Array.isArray(suggestions)) return '';
        
        return suggestions.map(suggestion => `
            <div class="suggestion-item">
                <div class="suggestion-header">
                    <i class="fas fa-map-marker-alt"></i>
                    <strong>${suggestion.location}</strong>
                </div>
                <div class="suggestion-action">
                    <i class="fas fa-plus-circle"></i>
                    <span>${suggestion.action}</span>
                </div>
                <div class="suggestion-text">
                    <code>${suggestion.text}</code>
                </div>
            </div>
        `).join('');
    }

    // Format deductions
    function formatDeductions(deductions) {
        if (!deductions || !Array.isArray(deductions)) return '';
        
        return deductions.map(deduction => `
            <div class="deduction-item">
                <i class="fas fa-minus-circle"></i>
                <span>${deduction}</span>
            </div>
        `).join('');
    }
});