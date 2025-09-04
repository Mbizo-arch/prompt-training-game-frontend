// API configuration - Updated with your Render URL
const API_BASE_URL = 'https://prompt-training-game.onrender.com';

// DOM elements
const evaluateBtn = document.getElementById('evaluate-btn');
const loadingElement = document.getElementById('loading');
const resultContainer = document.getElementById('result-container');
const errorMessage = document.getElementById('error-message');
const scoreCircle = document.getElementById('score-circle');
const feedbackText = document.getElementById('feedback-text');
const strengthsList = document.getElementById('strengths-list');
const weaknessesList = document.getElementById('weaknesses-list');
const suggestionsText = document.getElementById('suggestions-text');

// Add event listener to the button
evaluateBtn.addEventListener('click', evaluatePrompt);

// Function to evaluate the prompt
async function evaluatePrompt() {
    const prompt = document.getElementById('prompt').value;
    const challenge = document.getElementById('challenge').value;
    
    if (!prompt.trim()) {
        alert('Please enter a prompt before evaluating.');
        return;
    }
    
    // Show loading, hide results and errors
    loadingElement.style.display = 'block';
    resultContainer.style.display = 'none';
    errorMessage.style.display = 'none';
    evaluateBtn.disabled = true;
    
    try {
        // Try to call the actual API
        const response = await fetch(`${API_BASE_URL}/api/evaluate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ prompt, challenge })
        });
        
        if (response.ok) {
            const data = await response.json();
            displayResults(data);
        } else {
            throw new Error('Server returned an error');
        }
    } catch (error) {
        console.error('API Error:', error);
        // If API call fails, use simulated evaluation
        errorMessage.style.display = 'block';
        const simulatedData = simulateEvaluation(prompt, challenge);
        displayResults(simulatedData);
    } finally {
        loadingElement.style.display = 'none';
        evaluateBtn.disabled = false;
    }
}

// Function to display results
function displayResults(data) {
    // Update score with animation
    let score = 0;
    const targetScore = data.score;
    const scoreInterval = setInterval(() => {
        scoreCircle.textContent = score;
        score++;
        if (score > targetScore) {
            clearInterval(scoreInterval);
            scoreCircle.textContent = targetScore;
        }
    }, 30);
    
    // Update feedback text
    feedbackText.textContent = data.feedback;
    
    // Update strengths
    strengthsList.innerHTML = '';
    if (data.strengths && data.strengths.length > 0) {
        data.strengths.forEach(strength => {
            const li = document.createElement('li');
            li.textContent = strength;
            strengthsList.appendChild(li);
        });
    } else {
        strengthsList.innerHTML = '<li>No strengths identified</li>';
    }
    
    // Update weaknesses
    weaknessesList.innerHTML = '';
    if (data.weaknesses && data.weaknesses.length > 0) {
        data.weaknesses.forEach(weakness => {
            const li = document.createElement('li');
            li.textContent = weakness;
            weaknessesList.appendChild(li);
        });
    } else {
        weaknessesList.innerHTML = '<li>No weaknesses identified</li>';
    }
    
    // Update suggestions
    suggestionsText.textContent = data.suggestions || 'Try refining your prompt based on the feedback above.';
    
    // Show results container
    resultContainer.style.display = 'block';
}

// Fallback function for simulated evaluation
function simulateEvaluation(prompt, challenge) {
    // Generate a score based on prompt length and complexity
    const lengthScore = Math.min(100, Math.floor(prompt.length / 2));
    const randomFactor = Math.floor(Math.random() * 20) - 10; // -10 to +10
    const score = Math.max(40, Math.min(100, lengthScore + randomFactor));
    
    // Different feedback based on score
    let feedback, strengths, weaknesses, suggestions;
    
    if (score >= 80) {
        feedback = "Excellent prompt! Clear, specific, and likely to generate a high-quality response.";
        strengths = ["Clear objective", "Appropriate length", "Good structure"];
        weaknesses = ["Could add more context", "Mention the audience"];
        suggestions = "Consider specifying the tone (e.g., formal, casual) and the intended audience.";
    } else if (score >= 60) {
        feedback = "Good prompt with a clear direction, but could be more specific.";
        strengths = ["Clear intent", "Relevant to challenge"];
        weaknesses = ["Needs more detail", "Could specify format"];
        suggestions = "Add more specific requirements and examples of what you're looking for.";
    } else {
        feedback = "Basic prompt that would benefit from more detail and specificity.";
        strengths = ["Relevant topic"];
        weaknesses = ["Too vague", "Lacks context", "No specific instructions"];
        suggestions = "Be more specific about what you want. Include examples, desired format, and any constraints.";
    }
    
    return {
        score,
        feedback,
        strengths,
        weaknesses,
        suggestions
    };
}