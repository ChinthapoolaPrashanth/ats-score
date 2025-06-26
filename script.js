// API key management
const MODEL_NAME = 'gpt-3.5-turbo';
let OPENAI_API_KEY = '';

// Function to set API key
function setApiKey(key) {
    OPENAI_API_KEY = key.trim();
    if (typeof window !== 'undefined' && key) {
        localStorage.setItem('openai_api_key', key);
    }
}

// Load API key in this order:
// 1. From localStorage (browser)
// 2. From environment variable (Node.js)
// 3. Prompt the user (if in browser)
if (typeof window !== 'undefined') {
    // Browser environment - check for key in localStorage
    const storedKey = localStorage.getItem('openai_api_key');
    if (storedKey) {
        setApiKey(storedKey);
    } else {
        const apiKey = prompt('Please enter your OpenAI API key:');
        if (apiKey) {
            setApiKey(apiKey);
        } else {
            alert('An API key is required for this application to work. Please refresh the page to enter your key.');
        }
    }
} else if (typeof process !== 'undefined' && process.env.OPENAI_API_KEY) {
    // Node.js environment
    setApiKey(process.env.OPENAI_API_KEY);
}

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const resumeText = document.getElementById('resumeText');
    const jobDescription = document.getElementById('jobDescription');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const resultDiv = document.getElementById('result');
    const loadingDiv = document.getElementById('loading');
    const apiKeyInput = document.getElementById('apiKey');
    const scoreElement = document.getElementById('score');
    const analysisText = document.getElementById('analysisText');
    const suggestionsText = document.getElementById('suggestionsText');
    const resumeFileInput = document.getElementById('resumeFile');
    const jobDescriptionFileInput = document.getElementById('jobDescriptionFile');
    const enhancedResumeTextarea = document.getElementById('enhancedResume');
    const downloadBtn = document.getElementById('downloadBtn');

    // DOM Elements for file names
    const resumeFileName = document.getElementById('resumeFileName');
    const jobDescriptionFileName = document.getElementById('jobDescriptionFileName');

    // Event Listeners
    analyzeBtn.addEventListener('click', analyzeResume);
    downloadBtn.addEventListener('click', downloadEnhancedResume);
    resumeFileInput.addEventListener('change', (e) => handleFileUpload(e, resumeFileInput, resumeText, resumeFileName));
    jobDescriptionFileInput.addEventListener('change', (e) => handleFileUpload(e, jobDescriptionFileInput, jobDescription, jobDescriptionFileName));

    // Handle file uploads
    async function handleFileUpload(event, input, textarea, fileNameElement) {
        const file = input.files[0];
        if (!file) return;

        // Update file name display
        const fileName = file.name.length > 30 ? file.name.substring(0, 27) + '...' : file.name;
        fileNameElement.textContent = fileName;
        fileNameElement.style.color = '#28a745';
        fileNameElement.style.fontWeight = '500';
        fileNameElement.title = file.name; // Show full name on hover

        // Show loading state for file processing
        const originalText = fileNameElement.textContent;
        fileNameElement.textContent = 'Processing...';
        fileNameElement.style.color = '#6c757d';

        try {
            const text = await readFileAsText(file);
            
            // Update the textarea with the file content or message
            textarea.value = typeof text === 'string' ? text : 'Could not read file content';
            
            // Show appropriate message based on file type
            const fileExt = file.name.split('.').pop().toLowerCase();
            const unsupportedTypes = ['pdf', 'docx', 'doc'];
            
            if (unsupportedTypes.includes(fileExt)) {
                fileNameElement.style.color = '#ffc107'; // Yellow for warning
                fileNameElement.textContent = `${fileExt.toUpperCase()} - ${fileName}`;
            } else {
                fileNameElement.textContent = fileName;
                fileNameElement.style.color = '#28a745'; // Green for success
            }
            
            // Auto-expand textarea to fit content
            textarea.style.height = 'auto';
            textarea.style.height = (textarea.scrollHeight) + 'px';
            
        } catch (error) {
            console.error('Error reading file:', error);
            fileNameElement.textContent = `Error: ${file.name}`;
            fileNameElement.style.color = '#dc3545';
            
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
            alert('Please provide both resume and job description.');
            return;
        }

        // Prompt for API key if not set
        if (!OPENAI_API_KEY) {
            OPENAI_API_KEY = prompt('Please enter your OpenAI API key:');
            if (!OPENAI_API_KEY) {
                alert('API key is required to analyze the resume.');
                return;
            }
            // Save to localStorage for future use
            if (typeof localStorage !== 'undefined') {
                localStorage.setItem('openai_api_key', OPENAI_API_KEY);
            }
        }

        // Show loading state
        loadingDiv.classList.remove('hidden');
        analyzeBtn.disabled = true;
        
        // Reset enhanced resume section
        if (enhancedResumeTextarea) {
            enhancedResumeTextarea.value = '';
        }
        if (downloadBtn) {
            downloadBtn.disabled = true;
        }

        try {
            // Call OpenAI API
            try {
                const prompt = `Analyze the following resume against the job description and provide a comprehensive assessment to help achieve a 90% ATS score.

RESUME:
${resume}

JOB DESCRIPTION:
${jobDesc}

Please provide a detailed analysis in the following JSON format:

{
  "score": [current_score_0-100],
  "requiredSkills": [array_of_skills_from_job_description],
  "missingSkills": [array_of_skills_in_job_but_not_in_resume],
  "analysis": "Detailed analysis of current resume strengths and weaknesses",
  "suggestions": "Provide specific, actionable suggestions including:

1. EXACT LINES TO ADD: Provide 3-5 specific bullet points or sentences that should be added to the resume. Use this format:
   • [Exact bullet point to add to experience section]
   • [Exact sentence to add to skills section]
   • [Exact line to add to summary/objective]

2. KEYWORDS TO INCLUDE: List specific keywords from the job description that should be incorporated into the resume

3. FORMAT IMPROVEMENTS: Suggest specific formatting changes for better ATS parsing

4. SKILL ENHANCEMENTS: How to better highlight existing skills that match the job requirements

5. ATS OPTIMIZATION: Specific tips to improve ATS parsing and scoring

Focus on providing concrete, implementable suggestions that will directly improve the ATS score to 90% or higher. Be specific about where and how to add content to the resume. Include exact phrases and keywords from the job description."`;

                // Call OpenAI API with the global OPENAI_API_KEY
                const response = await callOpenAI(OPENAI_API_KEY, prompt);
                
                // Debug: Log the raw response
                console.log('Raw API response:', response);
                
                // Parse the response
                let result;
                try {
                    // Clean the response to ensure it's valid JSON
                    let jsonString = response.trim();
                    
                    // If the response starts with ```json and ends with ```, remove them
                    if (jsonString.startsWith('```json') && jsonString.endsWith('```')) {
                        jsonString = jsonString.substring(7, jsonString.length - 3).trim();
                    }
                    
                    // Parse the JSON
                    result = JSON.parse(jsonString);
                    console.log('Parsed result:', result);
                    
                    // Validate the response has the required fields
                    if (typeof result.score === 'undefined' || 
                        typeof result.analysis === 'undefined' || 
                        typeof result.suggestions === 'undefined') {
                        throw new Error('Missing required fields in response');
                    }
                    
                    // Ensure score is a number
                    result.score = parseFloat(result.score);
                    if (isNaN(result.score)) {
                        throw new Error('Score must be a number');
                    }
                } catch (e) {
                    console.error('Error parsing AI response:', e);
                    console.log('Raw response:', response);
                    throw new Error('Could not parse the analysis. The AI response was not in the expected format. Please try again.');
                }

                // Update the UI with results
                displayResults(result);

            } catch (error) {
                console.error('Analysis Error:', error);
                throw error; // Re-throw to be caught by outer catch
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred: ' + error.message);
        } finally {
            // Hide loading state
            loadingDiv.classList.add('hidden');
            analyzeBtn.disabled = false;
        }
    }

    // Call OpenAI API
    async function callOpenAI(apiKey, prompt) {
        console.log('Making API call to OpenAI...');
        const finalApiKey = apiKey || OPENAI_API_KEY;
        console.log('API Key starts with:', finalApiKey ? finalApiKey.substring(0, 8) + '...' : 'No API key');
        
        if (!finalApiKey) {
            throw new Error('No API key provided');
        }
        
        try {
            const requestBody = {
                model: MODEL_NAME,
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert ATS (Applicant Tracking System) resume analyzer. Your goal is to help candidates achieve a 90% or higher ATS score. Provide specific, actionable suggestions including exact lines to add to the resume, keywords to include, and formatting improvements. Focus on concrete, implementable advice that will directly improve the ATS score. Your response MUST be a valid JSON object with these exact keys: "score" (number 0-100), "requiredSkills" (array of strings), "missingSkills" (array of strings), "analysis" (string), and "suggestions" (string). Only output the JSON object, no other text.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                temperature: 0.2,  // Slightly lower temperature for more consistent results
                max_tokens: 4000,  // Increased token limit for more detailed analysis
                response_format: { type: "json_object" }  // Ensure JSON response format
            };
            
            console.log('Request body:', JSON.stringify(requestBody, null, 2));
            
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${finalApiKey}`,
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
            
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                let errorMessage = `HTTP error! status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    console.error('API Error Details:', errorData);
                    errorMessage = errorData.error?.message || errorMessage;
                } catch (e) {
                    console.error('Error parsing error response:', e);
                }
                throw new Error(`API Error: ${errorMessage}`);
            }

            const data = await response.json();
            console.log('API Response:', data);
            
            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                throw new Error('Invalid response format from API');
            }

            return data.choices[0].message.content;
            
        } catch (error) {
            console.error('API Call Error Details:', {
                name: error.name,
                message: error.message,
                stack: error.stack,
                type: typeof error
            });
            throw new Error(`Failed to connect to the analysis service: ${error.message}. Please check your internet connection and try again.`);
        }
    }

    // Display results in the UI
    function displayResults(result) {
        try {
            console.log('Displaying results:', result);
            
            // Ensure score is a number between 0 and 100
            const score = Math.min(100, Math.max(0, parseFloat(result.score) || 0));
            
            // Update the page title with the score
            document.title = `Resume Matcher - ${score}% Match`;
            
            // Make sure the result div is visible first
            resultDiv.classList.remove('hidden');
            
            // Force a reflow to ensure the element is visible before animating
            void resultDiv.offsetHeight;
            
            // Scroll to top to show the score
            window.scrollTo({ top: 0, behavior: 'smooth' });
            
            // Update score with animation
            animateValue(scoreElement, 0, score, 1500);
            
            // Update required skills
            const requiredSkillsContainer = document.getElementById('requiredSkills');
            if (requiredSkillsContainer && Array.isArray(result.requiredSkills)) {
                requiredSkillsContainer.innerHTML = result.requiredSkills
                    .map(skill => `<span class="skill-tag">${skill}</span>`)
                    .join('') || '<p>No skills detected in job description.</p>';
            }
            
            // Update missing skills
            const missingSkillsContainer = document.getElementById('missingSkills');
            if (missingSkillsContainer && Array.isArray(result.missingSkills)) {
                missingSkillsContainer.innerHTML = result.missingSkills
                    .map(skill => `<span class="skill-tag missing">${skill}</span>`)
                    .join('') || '<p>No missing skills found. Great job!</p>';
            }
            
            // Update analysis and suggestions if they exist in the DOM
            if (analysisText) {
                analysisText.innerHTML = formatTextWithBullets(String(result.analysis || 'No analysis provided.'));
            }
            
            if (suggestionsText) {
                suggestionsText.innerHTML = formatTextWithBullets(String(result.suggestions || 'No suggestions provided.'));
            }
            
            // Update actionable steps
            const actionableStepsContainer = document.getElementById('actionableSteps');
            if (actionableStepsContainer) {
                actionableStepsContainer.innerHTML = formatActionableSteps(String(result.suggestions || ''));
            }
            
            // Generate and display enhanced resume
            generateEnhancedResume(resumeText.value, jobDescription.value, result);
            
            // Add a class to the body to indicate results are shown
            document.body.classList.add('results-shown');
            
        } catch (error) {
            console.error('Error displaying results:', error);
            // Show error to user in the result div
            resultDiv.innerHTML = `
                <div class="error-message">
                    <h3>Error</h3>
                    <p>${error.message || 'An error occurred while processing your request.'}</p>
                </div>
            `;
            resultDiv.classList.remove('hidden');
        }
    }

    // Helper function to animate the score counter
    function animateValue(element, start, end, duration) {
        const range = end - start;
        let current = start;
        const increment = end > start ? 1 : -1;
        const stepTime = Math.abs(Math.floor(duration / range));
        const timer = setInterval(function() {
            current += increment;
            element.textContent = current;
            if (current === end) {
                clearInterval(timer);
            }
        }, stepTime);
    }

    // Format text with bullet points
    function formatTextWithBullets(text) {
        if (!text) return '';
        
        // Replace numbered lists with bullet points for better readability
        let formattedText = text
            .replace(/^\d+[.)]\s*/gm, '• ')  // Replace numbered lists (1. 2. 3.)
            .replace(/\n/g, '<br>')           // Replace newlines with <br> tags
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // Bold text
            .replace(/_(.*?)_/g, '<em>$1</em>');  // Italic text
        
        // Add spacing between paragraphs
        formattedText = formattedText.replace(/<br>\s*<br>/g, '</p><p>');
        
        return `<p>${formattedText}</p>`;
    }

    // Format actionable steps
    function formatActionableSteps(text) {
        if (!text) return '<p>No actionable steps provided.</p>';
        
        // Split text into sections and extract specific actionable items
        const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        
        let actionableSteps = [];
        
        lines.forEach(line => {
            // Look for numbered lists, bullet points, or specific action items
            if (line.match(/^\d+[.)]\s*/) || // Numbered lists (1. 2. 3.)
                line.match(/^[•\-\*]\s*/) || // Bullet points
                line.match(/^EXACT LINES TO ADD:/i) ||
                line.match(/^KEYWORDS TO INCLUDE:/i) ||
                line.match(/^FORMAT IMPROVEMENTS:/i) ||
                line.match(/^SKILL ENHANCEMENTS:/i) ||
                line.match(/^ATS OPTIMIZATION:/i) ||
                line.includes('Add') ||
                line.includes('Include') ||
                line.includes('Update') ||
                line.includes('Modify') ||
                line.includes('Change') ||
                line.includes('Improve')) {
                
                // Clean up the line
                let cleanLine = line
                    .replace(/^\d+[.)]\s*/, '') // Remove numbering
                    .replace(/^[•\-\*]\s*/, '') // Remove bullet points
                    .replace(/^(EXACT LINES TO ADD|KEYWORDS TO INCLUDE|FORMAT IMPROVEMENTS|SKILL ENHANCEMENTS|ATS OPTIMIZATION):\s*/i, '') // Remove section headers
                    .trim();
                
                if (cleanLine.length > 10) { // Only include substantial suggestions
                    actionableSteps.push(cleanLine);
                }
            }
        });
        
        // If no specific actionable items found, create general steps from the text
        if (actionableSteps.length === 0) {
            // Split by sentences and create steps
            const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 20);
            actionableSteps = sentences.slice(0, 5); // Take first 5 substantial sentences
        }
        
        if (actionableSteps.length === 0) {
            return '<p>Review the suggestions above for specific improvements.</p>';
        }
        
        // Format as a list
        const formattedSteps = actionableSteps
            .map(step => `<li>${step}</li>`)
            .join('');
        
        return `<ul>${formattedSteps}</ul>`;
    }

    // Generate and display enhanced resume
    function generateEnhancedResume(originalResume, jobDesc, result) {
        try {
            // Extract actionable suggestions
            const suggestions = String(result.suggestions || '');
            const missingSkills = Array.isArray(result.missingSkills) ? result.missingSkills : [];
            
            // Parse suggestions to extract specific additions
            const additions = parseSuggestionsForAdditions(suggestions);
            
            // Create enhanced resume
            let enhancedResume = originalResume;
            
            // Add missing skills to skills section
            if (missingSkills.length > 0) {
                enhancedResume = addSkillsToResume(enhancedResume, missingSkills);
            }
            
            // Add specific content from suggestions
            if (additions.length > 0) {
                enhancedResume = addContentToResume(enhancedResume, additions);
            }
            
            // Add keywords from job description
            enhancedResume = addKeywordsFromJobDesc(enhancedResume, jobDesc);
            
            // Display enhanced resume
            if (enhancedResumeTextarea) {
                enhancedResumeTextarea.value = enhancedResume;
                enhancedResumeTextarea.style.height = 'auto';
                enhancedResumeTextarea.style.height = (enhancedResumeTextarea.scrollHeight) + 'px';
            }
            
            // Enable download button
            if (downloadBtn) {
                downloadBtn.disabled = false;
            }
            
        } catch (error) {
            console.error('Error generating enhanced resume:', error);
            if (enhancedResumeTextarea) {
                enhancedResumeTextarea.value = 'Error generating enhanced resume. Please try again.';
            }
        }
    }
    
    // Parse suggestions to extract specific additions
    function parseSuggestionsForAdditions(suggestions) {
        const additions = [];
        const lines = suggestions.split('\n');
        
        lines.forEach(line => {
            const trimmedLine = line.trim();
            // Look for bullet points or specific additions
            if (trimmedLine.match(/^[•\-\*]\s*/) || 
                trimmedLine.includes('Add') || 
                trimmedLine.includes('Include') ||
                trimmedLine.match(/^EXACT LINES TO ADD:/i)) {
                
                let cleanLine = trimmedLine
                    .replace(/^[•\-\*]\s*/, '')
                    .replace(/^EXACT LINES TO ADD:\s*/i, '')
                    .trim();
                
                if (cleanLine.length > 10 && !cleanLine.includes(':')) {
                    additions.push(cleanLine);
                }
            }
        });
        
        return additions;
    }
    
    // Add missing skills to resume
    function addSkillsToResume(resume, missingSkills) {
        // Look for skills section
        const skillsPatterns = [
            /skills?:/i,
            /technical skills?:/i,
            /competencies?:/i,
            /expertise?:/i
        ];
        
        let skillsAdded = false;
        let enhancedResume = resume;
        
        skillsPatterns.forEach(pattern => {
            if (pattern.test(resume) && !skillsAdded) {
                // Add missing skills to existing skills section
                const skillsText = missingSkills.join(', ');
                enhancedResume = enhancedResume.replace(pattern, (match) => {
                    return match + ' ' + skillsText + ', ';
                });
                skillsAdded = true;
            }
        });
        
        // If no skills section found, add one
        if (!skillsAdded) {
            const skillsSection = '\n\nSKILLS:\n' + missingSkills.join(', ');
            enhancedResume += skillsSection;
        }
        
        return enhancedResume;
    }
    
    // Add specific content from suggestions
    function addContentToResume(resume, additions) {
        let enhancedResume = resume;
        
        // Add additions to experience section or create one
        if (additions.length > 0) {
            const experiencePatterns = [
                /experience?:/i,
                /work history?:/i,
                /employment?:/i
            ];
            
            let contentAdded = false;
            
            experiencePatterns.forEach(pattern => {
                if (pattern.test(resume) && !contentAdded) {
                    // Add to existing experience section
                    const additionsText = '\n• ' + additions.join('\n• ');
                    enhancedResume = enhancedResume.replace(pattern, (match) => {
                        return match + '\n' + additionsText;
                    });
                    contentAdded = true;
                }
            });
            
            // If no experience section found, add one
            if (!contentAdded) {
                const experienceSection = '\n\nEXPERIENCE:\n• ' + additions.join('\n• ');
                enhancedResume += experienceSection;
            }
        }
        
        return enhancedResume;
    }
    
    // Add keywords from job description
    function addKeywordsFromJobDesc(resume, jobDesc) {
        // Extract important keywords from job description
        const keywords = extractKeywords(jobDesc);
        let enhancedResume = resume;
        
        // Add keywords to summary or create one
        const summaryPatterns = [
            /summary?:/i,
            /objective?:/i,
            /profile?:/i
        ];
        
        let keywordsAdded = false;
        
        summaryPatterns.forEach(pattern => {
            if (pattern.test(resume) && !keywordsAdded) {
                // Add keywords to existing summary
                const keywordsText = keywords.slice(0, 5).join(', ');
                enhancedResume = enhancedResume.replace(pattern, (match) => {
                    return match + ' Proficient in ' + keywordsText + '. ';
                });
                keywordsAdded = true;
            }
        });
        
        // If no summary found, add one
        if (!keywordsAdded) {
            const summarySection = '\n\nSUMMARY:\nExperienced professional with expertise in ' + keywords.slice(0, 5).join(', ') + '.';
            enhancedResume = summarySection + '\n\n' + enhancedResume;
        }
        
        return enhancedResume;
    }
    
    // Extract keywords from job description
    function extractKeywords(jobDesc) {
        const commonKeywords = [
            'management', 'leadership', 'development', 'analysis', 'design',
            'implementation', 'coordination', 'planning', 'strategy', 'optimization',
            'automation', 'integration', 'deployment', 'maintenance', 'support',
            'collaboration', 'communication', 'problem-solving', 'innovation', 'efficiency'
        ];
        
        const keywords = [];
        const words = jobDesc.toLowerCase().match(/\b\w+\b/g) || [];
        
        commonKeywords.forEach(keyword => {
            if (words.includes(keyword.toLowerCase()) && !keywords.includes(keyword)) {
                keywords.push(keyword);
            }
        });
        
        return keywords;
    }
    
    // Download enhanced resume
    function downloadEnhancedResume() {
        try {
            const enhancedResume = enhancedResumeTextarea.value;
            if (!enhancedResume || enhancedResume.trim() === '') {
                alert('No enhanced resume available to download.');
                return;
            }
            
            // Create blob and download
            const blob = new Blob([enhancedResume], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'enhanced_resume_ats_optimized.txt';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            // Show success message
            alert('Enhanced resume downloaded successfully!');
            
        } catch (error) {
            console.error('Error downloading resume:', error);
            alert('Error downloading resume. Please try again.');
        }
    }
});
