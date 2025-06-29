# ATS Pro - Advanced Resume Optimizer

A professional-grade ATS (Applicant Tracking System) resume analyzer that provides comprehensive analysis and optimization recommendations to help you achieve 95%+ ATS compatibility scores.

## ✨ Features

### 🎯 Advanced Analysis
- **GPT-4 Powered**: Uses OpenAI's latest GPT-4 model for superior analysis
- **95%+ Score Target**: Optimized prompts to help you reach excellent ATS scores
- **Industry Expert Analysis**: Professional-grade recommendations superior to Jobscan and Teal
- **Real-time Optimization**: Instant feedback and actionable improvements

### 🎨 Enhanced User Experience
- **Scroll Buttons**: Easy navigation through long resume and job description text
- **Character Counters**: Real-time character count with color-coded feedback
- **Professional UI**: Modern, responsive design with smooth animations
- **File Upload Support**: Upload PDF, DOCX, DOC, and TXT files
- **Smart Notifications**: User-friendly success and error messages

### 🔒 Security & Privacy
- **Secure API Key Management**: API keys stored locally in browser
- **Environment Variables**: Support for .env file configuration
- **No Data Storage**: Your resume and job description data never leaves your browser

### 📊 Comprehensive Results
- **ATS Score**: Animated score display with visual progress bar
- **Skills Analysis**: Required vs. missing skills identification
- **Professional Analysis**: Detailed breakdown of resume strengths and weaknesses
- **Actionable Recommendations**: Step-by-step improvement plan
- **Industry Insights**: Expert-level optimization suggestions

## 🚀 Getting Started

### Prerequisites
- OpenAI API key (Get one at [OpenAI Platform](https://platform.openai.com/))
- Modern web browser

### Installation
1. Clone or download this repository
2. Open `index.html` in your web browser
3. Enter your OpenAI API key in the provided field
4. Click "Save Key" to store it securely

### Usage
1. **Paste or Upload Resume**: Add your resume content in the left textarea
2. **Paste or Upload Job Description**: Add the target job description in the right textarea
3. **Analyze**: Click "Analyze with GPT-4" to get your ATS score and recommendations
4. **Review Results**: Examine your score, skills analysis, and improvement suggestions
5. **Implement Changes**: Follow the actionable recommendations to optimize your resume

## 🎨 UI Features

### Scroll Navigation
- **Up/Down Buttons**: Located in the top-right corner of each textarea
- **Smart Visibility**: Buttons fade when not needed
- **Smooth Scrolling**: Animated navigation through content

### Character Counters
- **Real-time Updates**: Live character count as you type
- **Color-coded Feedback**:
  - Gray: No content
  - Yellow: Less than 100 characters
  - Orange: 100-500 characters
  - Green: 500+ characters

### Professional Design
- **Modern Gradients**: Beautiful color schemes and animations
- **Responsive Layout**: Works perfectly on desktop and mobile
- **Smooth Animations**: Engaging user experience with CSS animations
- **Professional Typography**: Clean, readable Inter font

## 🔧 Technical Details

### File Structure
```
ats-score/
├── index.html          # Main application interface
├── style.css           # Professional styling and animations
├── script.js           # Core functionality and API integration
├── .gitignore          # Git ignore patterns
└── README.md           # This documentation
```

### API Integration
- **OpenAI GPT-4**: Latest model for superior analysis
- **Secure Communication**: HTTPS-only API calls
- **Error Handling**: Comprehensive error management and user feedback
- **Rate Limiting**: Optimized for API usage limits

### Browser Compatibility
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 🎯 ATS Score Interpretation

### Score Ranges
- **90-100%**: Excellent ATS compatibility
- **70-89%**: Good score with room for improvement
- **50-69%**: Fair score, significant improvements needed
- **Below 50%**: Poor ATS compatibility, major changes required

### Analysis Components
1. **Keyword Matching**: Identifies required skills and missing keywords
2. **Format Analysis**: Evaluates resume structure and formatting
3. **Content Quality**: Assesses professional language and impact
4. **ATS Optimization**: Checks for ATS-friendly formatting

## 🔒 Privacy & Security

- **Local Storage**: API keys stored securely in your browser
- **No Server Storage**: Your data never leaves your device
- **HTTPS Only**: Secure communication with OpenAI API
- **Environment Variables**: Support for secure API key management

## 🛠️ Development

### Local Development
1. Clone the repository
2. Create a `.env` file with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```
3. Open `index.html` in your browser
4. Start developing!

### Customization
- **Styling**: Modify `style.css` for custom themes
- **Functionality**: Extend `script.js` for additional features
- **API Integration**: Update API calls in the script file

## 📈 Performance

- **Fast Analysis**: Optimized prompts for quick results
- **Efficient UI**: Smooth animations and responsive design
- **Memory Efficient**: Minimal resource usage
- **Offline Capable**: Works without internet after initial load

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

If you encounter any issues or have questions:
1. Check the browser console for error messages
2. Verify your OpenAI API key is valid
3. Ensure you have a stable internet connection
4. Try refreshing the page and re-entering your data

---

**ATS Pro** - Your path to 95%+ ATS compatibility starts here! 🚀

## Features

- **Resume Analysis**: Upload or paste your resume content
- **Job Description Matching**: Compare against job descriptions
- **ATS Score**: Get a compatibility score (0-100%)
- **Skills Analysis**: View required skills and identify missing ones
- **Improvement Suggestions**: Get actionable feedback to improve your resume
- **File Support**: Upload .txt, .docx, or paste text directly

## How It Works

1. Paste or upload your resume
2. Paste or upload a job description
3. Click "Analyze Match"
4. View your ATS score and improvement suggestions

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ats-score.git
   cd ats-score
   ```

2. Open `index.html` in your web browser

## Usage

1. Open the application in your web browser
2. Enter your resume and job description
3. Click "Analyze Match" to see your results
4. Review your score, skills match, and improvement suggestions

## Technologies Used

- HTML5, CSS3, JavaScript (ES6+)
- OpenAI API for analysis
- Mammoth.js for DOCX file parsing
- Vanilla JavaScript (no frameworks)

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

This tool provides suggestions and should not be the sole factor in resume preparation. Always tailor your resume to each job application.

