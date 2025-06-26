// API key management
const MODEL_NAME = 'gpt-4';
let OPENAI_API_KEY = '';

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

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const resumeText = document.getElementById('resumeText');
    const jobDescription = document.getElementById('jobDescription');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const loadingDiv = document.getElementById('loading');
    const apiKeyInput = document.getElementById('apiKey');
    const saveApiKeyBtn = document.getElementById('saveApiKey');
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

    // Navigation elements
    const navItems = document.querySelectorAll('.nav-item');
    const contentSections = document.querySelectorAll('.content-section');

    // DOM Elements for file names
    const resumeFileName = document.getElementById('resumeFileName');
    const jobDescriptionFileName = document.getElementById('jobDescriptionFileName');

    // Initialize character counters
    updateCharCount(resumeText, resumeCharCount);
    updateCharCount(jobDescription, jobCharCount);

    // Event Listeners
    analyzeBtn.addEventListener('click', analyzeResume);
    saveApiKeyBtn.addEventListener('click', saveApiKey);
    resumeFileInput.addEventListener('change', (e) => handleFileUpload(e, resumeFileInput, resumeText, resumeFileName));
    jobDescriptionFileInput.addEventListener('change', (e) => handleFileUpload(e, jobDescriptionFileInput, jobDescription, jobDescriptionFileName));
    
    // Character counter listeners
    resumeText.addEventListener('input', () => updateCharCount(resumeText, resumeCharCount));
    jobDescription.addEventListener('input', () => updateCharCount(jobDescription, jobCharCount));

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

    // Load saved API key into input
    if (OPENAI_API_KEY) {
        apiKeyInput.value = OPENAI_API_KEY;
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
            'api': 'API Configuration'
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

    // Function to save API key
    function saveApiKey() {
        const key = apiKeyInput.value.trim();
        if (key) {
            setApiKey(key);
            showNotification('API key saved successfully!', 'success');
        } else {
            showNotification('Please enter a valid API key', 'error');
        }
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
            textarea.style.height = (textarea.scrollHeight) + 'px';
            
            // Trigger scroll event to update scroll buttons
            textarea.dispatchEvent(new Event('scroll'));
            
        } catch (error) {
            console.error('Error reading file:', error);
            fileNameElement.textContent = `Error: ${file.name}`;
            fileNameElement.style.color = 'var(--error-600)';
            
            // Show error message in the textarea
            textarea.value = 'Error: Could not read file. Please try another file or paste the text manually.';
            textarea.style.height = '100px';
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
        const currentApiKey = apiKeyInput.value.trim() || OPENAI_API_KEY;
        if (!currentApiKey) {
            showNotification('Please enter your OpenAI API key.', 'error');
            return;
        }

        // Update API key if changed
        if (currentApiKey !== OPENAI_API_KEY) {
            setApiKey(currentApiKey);
        }

        // Show loading state
        loadingDiv.classList.remove('hidden');
        analyzeBtn.disabled = true;

        try {
            // Call OpenAI API
            try {
                const prompt = `You are a senior ATS resume optimization expert with 20+ years in HR technology and recruitment. You provide analysis superior to Teal, Jobscan, Resume Worded, and TopResume. Focus on achieving 95%+ ATS scores through comprehensive keyword analysis, structural optimization, content enhancement, and competitive positioning. Provide specific, actionable advice with exact phrases, formatting recommendations, and industry insights. Include line-by-line improvements only when necessary and impactful. Response must be valid JSON with keys: "score" (0-100), "requiredSkills" (array), "missingSkills" (array), "analysis" (detailed string), "suggestions" (comprehensive string). Only output JSON.

RESUME:
${resume}

JOB DESCRIPTION:
${jobDesc}"`;

                // Call OpenAI API with the current API key
                const response = await callOpenAI(currentApiKey, prompt);
                
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
                        content: 'You are an expert ATS resume analyzer. Provide only valid JSON responses.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.3,
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
        suggestionsText.innerHTML = formatTextWithBullets(result.suggestions);
        
        // Display actionable steps
        const actionableSteps = document.getElementById('actionableSteps');
        actionableSteps.innerHTML = formatActionableSteps(result.suggestions);
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

    // Format actionable steps
    function formatActionableSteps(text) {
        if (!text) return '';
        
        const sections = [];
        const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        
        let currentSection = null;
        let currentItems = [];
        
        lines.forEach(line => {
            if (line.match(/^[A-Z][^:]*:$/) || line.match(/^[A-Z][^:]*\s*\(/)) {
                // This is a section header
                if (currentSection) {
                    sections.push({
                        title: currentSection,
                        items: currentItems
                    });
                }
                currentSection = line.replace(/[:()]/g, '').trim();
                currentItems = [];
            } else if (line.startsWith('-') || line.startsWith('•') || line.startsWith('*') || line.match(/^\d+\./)) {
                // This is a list item
                currentItems.push(line.replace(/^[-•*]\s*/, '').replace(/^\d+\.\s*/, ''));
            }
        });
        
        // Add the last section
        if (currentSection) {
            sections.push({
                title: currentSection,
                items: currentItems
            });
        }
        
        return sections.map(section => `
            <div class="suggestion-section">
                <h4>${section.title}</h4>
                <ul>
                    ${section.items.map(item => `<li>${item}</li>`).join('')}
                </ul>
            </div>
        `).join('');
    }
});