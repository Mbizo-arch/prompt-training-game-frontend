// API configuration - Updated with your Render URL
const API_BASE_URL = 'https://prompt-training-game.onrender.com';

// Game state
let score = 0;
let promptsCount = 0;
let totalQuality = 0;
let tipsOpenedThisChallenge = false;
let hasSubmitted = false;
let achievements = {
  clarityMaster: { earned: false, count: 0 },
  highScorer: { earned: false }
};

// Enhanced challenges with requirements and examples
const challenges = [
  {
    text: "Write a prompt that asks the AI to summarize a news article.",
    requirements: ["summarize", "news", "article"],
    example: "Please summarize this news article about climate change in 3 bullet points, focusing on key findings and recommendations."
  },
  {
    text: "Create a prompt that requests the AI to write a poem about autumn.",
    requirements: ["poem", "autumn", "write"],
    example: "Write a poem about autumn with four stanzas, each containing four lines. Include imagery related to falling leaves, cooler weather, and harvest time."
  },
  {
    text: "Design a prompt that asks the AI to explain quantum computing to a 10-year-old.",
    requirements: ["explain", "quantum computing", "10-year-old", "simple"],
    example: "Explain quantum computing to a 10-year-old using simple analogies and avoiding technical jargon. Compare it to something they might already understand."
  },
  {
    text: "Write a prompt that requests the AI to generate a healthy meal plan for a week.",
    requirements: ["meal plan", "healthy", "week", "generate"],
    example: "Create a healthy meal plan for breakfast, lunch, and dinner for 7 days. Include vegetarian options and specify portion sizes. Focus on whole foods and balanced nutrition."
  },
  {
    text: "Create a prompt that asks the AI to compare two programming languages.",
    requirements: ["compare", "programming languages", "two"],
    example: "Compare Python and JavaScript in terms of syntax, performance, use cases, and learning curve. Provide examples of where each language excels."
  }
];

// DOM elements
const challengeTextEl = document.getElementById('challengeText');
const userInputEl = document.getElementById('userInput');
const feedbackBoxEl = document.getElementById('feedbackBox');
const aiFeedbackEl = document.getElementById('aiFeedback');
const examplePromptEl = document.getElementById('examplePrompt');
const scoreEl = document.getElementById('score');
const promptsCountEl = document.getElementById('prompts-count');
const accuracyEl = document.getElementById('accuracy');
const submitBtn = document.getElementById('submit-btn');
const nextBtn = document.getElementById('next-btn');
const tipsSection = document.getElementById('tips-section');
const scoreChangeEl = document.getElementById('score-change');
const loadingEl = document.getElementById('loading');
const errorMessageEl = document.getElementById('error-message');
const copyBtn = document.getElementById('copy-btn');
const sharingButtonsEl = document.getElementById('sharing-buttons');

// Initialize the game
function initGame() {
  // Load saved game state if available
  loadGameState();
  
  // Generate first challenge
  nextChallenge();
  
  // Add event listeners
  copyBtn.addEventListener('click', copyPromptToClipboard);
  submitBtn.addEventListener('click', submitPrompt);
  nextBtn.addEventListener('click', nextChallenge);
  tipsSection.addEventListener('toggle', handleTipsOpen);
}

// Submit prompt for evaluation
async function submitPrompt() {
  const prompt = userInputEl.value.trim();
  
  if (!prompt) {
    alert('Please write a prompt before submitting.');
    return;
  }
  
  // Show loading, hide errors
  loadingEl.style.display = 'block';
  errorMessageEl.style.display = 'none';
  submitBtn.disabled = true;
  
  try {
    // Try to call the actual API
    const response = await fetch(`${API_BASE_URL}/api/evaluate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        prompt: prompt, 
        challenge: challengeTextEl.textContent 
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      processEvaluationResult(data, prompt);
    } else {
      throw new Error('Server returned an error');
    }
  } catch (error) {
    console.error('API Error:', error);
    // If API call fails, use simulated evaluation
    errorMessageEl.style.display = 'block';
    const simulatedData = simulateEvaluation(prompt, challengeTextEl.textContent);
    processEvaluationResult(simulatedData, prompt);
  } finally {
    loadingEl.style.display = 'none';
  }
}

// Process the evaluation result from API or simulation
function processEvaluationResult(data, prompt) {
  const quality = data.score;
  
  // Update game state
  promptsCount++;
  totalQuality += quality;
  score += quality;
  hasSubmitted = true;
  
  // Check for achievements
  checkAchievements(quality);
  
  // Update UI
  updateScoreboard();
  showFeedback(quality, prompt, challengeTextEl.textContent, data);
  
  // Enable next button
  nextBtn.disabled = false;
  nextBtn.style.display = 'block';
  
  // Save game state
  saveGameState();
}

// Move to the next challenge
function nextChallenge() {
  // Close the tips section if open
  if (tipsSection.open) {
    tipsSection.open = false;
  }
  
  // Clear input and feedback
  userInputEl.value = '';
  feedbackBoxEl.style.display = 'none';
  examplePromptEl.style.display = 'none';
  errorMessageEl.style.display = 'none';
  sharingButtonsEl.style.display = 'none';
  
  // Enable submit button and disable next button
  submitBtn.disabled = false;
  nextBtn.disabled = true;
  nextBtn.style.display = 'none';
  
  // Reset submission state
  hasSubmitted = false;
  
  // Generate new challenge
  const randomIndex = Math.floor(Math.random() * challenges.length);
  challengeTextEl.textContent = challenges[randomIndex].text;
  tipsOpenedThisChallenge = false;
  tipsSection.classList.remove('penalty-applied');
}

// Function for copy functionality
function copyPromptToClipboard() {
  const promptText = userInputEl.value;
  if (!promptText) {
    alert('Please write a prompt before copying.');
    return;
  }
  
  navigator.clipboard.writeText(promptText).then(() => {
    // Show success feedback
    const originalText = copyBtn.textContent;
    copyBtn.textContent = '✅ Copied!';
    copyBtn.style.background = '#4caf50';
    
    // Revert after 2 seconds
    setTimeout(() => {
      copyBtn.textContent = originalText;
      copyBtn.style.background = '#a777e3';
    }, 2000);
  }).catch(err => {
    console.error('Failed to copy: ', err);
    alert('Failed to copy to clipboard. Please try again.');
  });
}

// Functions for social sharing
function shareOnTwitter() {
  const score = scoreEl.textContent;
  const message = `I scored ${score} points on Prompt Trainer! 🚀 Try it here: ${window.location.href}`;
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
  window.open(twitterUrl, '_blank', 'width=600,height=400');
}

function shareOnLinkedIn() {
  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;
  window.open(linkedInUrl, '_blank', 'width=600,height=400');
}

// Enhanced prompt evaluation with challenge-specific criteria
function simulateEvaluation(prompt, challenge) {
  let quality = 70; // Base score
  
  // Evaluate based on general criteria
  if (prompt.length > 100) quality += 10; // Longer prompts often better
  if (prompt.length < 20) quality -= 15; // Too short
  
  // Check for specific elements that make good prompts
  if (prompt.includes("please") || prompt.includes("could you")) quality += 5; // Politeness
  if (prompt.includes("step by step") || prompt.includes("detailed")) quality += 10; // Specificity
  if (prompt.includes("example") || prompt.includes("for instance")) quality += 8; // Examples
  
  // Challenge-specific evaluation
  const currentChallenge = challenges.find(c => c.text === challenge);
  if (currentChallenge) {
    currentChallenge.requirements.forEach(req => {
      if (prompt.toLowerCase().includes(req.toLowerCase())) {
        quality += 8; // Reward for addressing requirement
      } else {
        quality -= 5; // Penalty for missing requirement
      }
    });
  }
  
  // Ensure score is within bounds
  quality = Math.max(40, Math.min(quality, 95));
  
  return {
    score: quality,
    feedback: generateSimulatedFeedback(quality, prompt),
    strengths: ["Good structure", "Clear intent"],
    weaknesses: ["Could be more specific", "Needs examples"],
    suggestions: "Try adding specific examples and constraints to your prompt."
  };
}

// Generate simulated feedback based on quality
function generateSimulatedFeedback(quality, prompt) {
  let feedback = '';
  
  if (quality >= 90) {
    feedback = `Excellent! Your prompt scored ${quality}%. You provided clear instructions with good context and specificity.`;
  } else if (quality >= 75) {
    feedback = `Good job! Your prompt scored ${quality}%. It was clear but could be more specific in some areas.`;
  } else if (quality >= 60) {
    feedback = `Fair attempt. Your prompt scored ${quality}%. Try to be more specific about what you want from the AI.`;
  } else {
    feedback = `Your prompt needs improvement. It scored ${quality}%. Review the tips below and try to be more detailed.`;
  }
  
  // Add specific suggestions
  if (!prompt.includes("please") && !prompt.includes("thank")) {
    feedback += " Try using polite language like 'please' for better results.";
  }
  
  if (prompt.length < 50) {
    feedback += " Longer prompts with more details typically get better responses.";
  }
  
  return feedback;
}

// Show feedback to user with example prompt
function showFeedback(quality, prompt, challenge, data) {
  aiFeedbackEl.innerHTML = data.feedback || `Your prompt scored ${quality}%.`;
  
  // Show example prompt for lower scores
  const currentChallenge = challenges.find(c => c.text === challenge);
  if (currentChallenge && quality < 80) {
    examplePromptEl.textContent = "Example of a strong prompt: " + currentChallenge.example;
    examplePromptEl.style.display = 'block';
  }
  
  feedbackBoxEl.style.display = 'block';
  sharingButtonsEl.style.display = 'flex';
}

// Update scoreboard
function updateScoreboard() {
  scoreEl.textContent = score;
  promptsCountEl.textContent = promptsCount;
  const avgQuality = promptsCount > 0 ? Math.round(totalQuality / promptsCount) : 0;
  accuracyEl.textContent = `${avgQuality}%`;
}

// Show point change animation
function showPointChange(points) {
  const changeEl = document.createElement('div');
  changeEl.className = 'point-change';
  changeEl.textContent = points > 0 ? `+${points}` : points;
  changeEl.style.color = points > 0 ? '#4caf50' : '#ff6b6b';
  
  scoreEl.parentNode.appendChild(changeEl);
  
  // Remove the element after animation completes
  setTimeout(() => {
    changeEl.remove();
  }, 1500);
}

// Check for achievements
function checkAchievements(quality) {
  // Clarity Master - score 90+ on 3 prompts
  if (quality >= 90) {
    achievements.clarityMaster.count++;
    if (achievements.clarityMaster.count >= 3 && !achievements.clarityMaster.earned) {
      achievements.clarityMaster.earned = true;
      showAchievement("Clarity Master", "Scored 90%+ on 3 prompts", "🥇");
    }
  }
  
  // High Scorer - reach 100 points
  if (score >= 100 && !achievements.highScorer.earned) {
    achievements.highScorer.earned = true;
    showAchievement("High Scorer", "Reached 100 points", "🏆");
  }
}

// Show achievement notification
function showAchievement(title, description, icon) {
  const toast = document.createElement('div');
  toast.className = 'achievement-toast';
  toast.innerHTML = `
    <span style="font-size: 2rem;">${icon}</span>
    <div>
      <div style="font-weight: bold;">Achievement Unlocked!</div>
      <div>${title}: ${description}</div>
    </div>
  `;
  
  document.body.appendChild(toast);
  
  // Remove the toast after animation completes
  setTimeout(() => {
    document.body.removeChild(toast);
  }, 4000);
}

// Handle tips section opening
function handleTipsOpen() {
  // Only deduct points if tips are opened BEFORE submitting
  if (!hasSubmitted && !tipsOpenedThisChallenge && tipsSection.open) {
    // Deduct 10 points for opening tips before submitting
    score -= 10;
    tipsOpenedThisChallenge = true;
    
    // Update UI
    updateScoreboard();
    showPointChange(-10);
    tipsSection.classList.add('penalty-applied');
    
    // Save game state
    saveGameState();
  }
}

// Save game state to localStorage
function saveGameState() {
  const gameState = {
    score,
    promptsCount,
    totalQuality,
    achievements
  };
  localStorage.setItem('promptTrainer', JSON.stringify(gameState));
}

// Load game state from localStorage
function loadGameState() {
  const savedGame = localStorage.getItem('promptTrainer');
  if (savedGame) {
    const gameState = JSON.parse(savedGame);
    score = gameState.score || 0;
    promptsCount = gameState.promptsCount || 0;
    totalQuality = gameState.totalQuality || 0;
    achievements = gameState.achievements || {
      clarityMaster: { earned: false, count: 0 },
      highScorer: { earned: false }
    };
    
    updateScoreboard();
  }
}

// Initialize the game when page loads
document.addEventListener('DOMContentLoaded', initGame);
