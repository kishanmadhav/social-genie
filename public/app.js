// App State
let currentUser = null;
let selectedImage = null;
let generatedContent = null; // Store generated AI content

// DOM Elements
const loadingScreen = document.getElementById('loading');
const loginScreen = document.getElementById('login-screen');
const linkAccountsScreen = document.getElementById('link-accounts-screen');
const dashboardScreen = document.getElementById('dashboard-screen');
const loginBtn = document.getElementById('login-btn');
const linkTwitterBtn = document.getElementById('link-twitter-btn');
const linkFacebookBtn = document.getElementById('link-facebook-btn');
const toggleManualTokenBtn = document.getElementById('toggle-manual-token-btn');
const instagramTokenForm = document.getElementById('instagram-token-form');
const connectInstagramTokenBtn = document.getElementById('connect-instagram-token-btn');
const instagramAccessTokenInput = document.getElementById('instagram-access-token');
const continueToDashboardBtn = document.getElementById('continue-to-dashboard-btn');
const switchAccountBtn = document.getElementById('switch-account-btn');
const logoutBtn = document.getElementById('logout-btn');
const manageAccountsBtn = document.getElementById('manage-accounts-btn');

// AI Generator elements
const aiPrompt = document.getElementById('ai-prompt');
const captionLength = document.getElementById('caption-length');
const generateBtn = document.getElementById('generate-btn');
const aiPreview = document.getElementById('ai-preview');
const aiGeneratedImage = document.getElementById('ai-generated-image');
const aiGeneratedCaption = document.getElementById('ai-generated-caption');
const postToTwitterBtn = document.getElementById('post-to-twitter-btn');
const postToInstagramBtn = document.getElementById('post-to-instagram-btn');
const regenerateBtn = document.getElementById('regenerate-btn');

const postForm = document.getElementById('post-form');
const tweetText = document.getElementById('tweet-text');
const charCount = document.getElementById('char-count');
const imageUpload = document.getElementById('image-upload');
const imagePreview = document.getElementById('image-preview');
const previewImg = document.getElementById('preview-img');
const removeImageBtn = document.getElementById('remove-image');
const postBtn = document.getElementById('post-btn');
const tweetsList = document.getElementById('tweets-list');
const userName = document.getElementById('user-name');
const userAvatarLink = document.getElementById('user-avatar-link');
const userNameLink = document.getElementById('user-name-link');
const headerUserAvatar = document.getElementById('header-user-avatar');
const twitterStatus = document.getElementById('twitter-status');
const instagramStatus = document.getElementById('instagram-status');
const twitterConnected = document.getElementById('twitter-connected');
const facebookConnected = document.getElementById('facebook-connected');
const instagramConnected = document.getElementById('instagram-connected');
const twitterUsername = document.getElementById('twitter-username');
const facebookUsername = document.getElementById('facebook-username');
const instagramUsername = document.getElementById('instagram-username');
const instagramAccountsList = document.getElementById('instagram-accounts-list');
const successModal = document.getElementById('success-modal');
const errorModal = document.getElementById('error-modal');
const errorMessage = document.getElementById('error-message');
const closeSuccess = document.getElementById('close-success');
const closeError = document.getElementById('close-error');

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    checkAuthentication();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    // Login/Logout
    loginBtn.addEventListener('click', () => {
        window.location.href = '/auth/google';
    });

    linkTwitterBtn.addEventListener('click', () => {
        window.location.href = '/auth/twitter';
    });

    linkFacebookBtn.addEventListener('click', () => {
        window.location.href = '/auth/facebook';
    });

    toggleManualTokenBtn.addEventListener('click', () => {
        instagramTokenForm.classList.toggle('hidden');
        if (instagramTokenForm.classList.contains('hidden')) {
            toggleManualTokenBtn.innerHTML = '<i class="fas fa-key"></i> Use manual token instead';
        } else {
            toggleManualTokenBtn.innerHTML = '<i class="fas fa-times"></i> Hide manual token';
        }
    });

    connectInstagramTokenBtn.addEventListener('click', async () => {
        const token = instagramAccessTokenInput.value.trim();
        if (!token) {
            alert('Please enter your Instagram access token');
            return;
        }
        
        connectInstagramTokenBtn.disabled = true;
        connectInstagramTokenBtn.textContent = 'Connecting...';
        
        try {
            const response = await fetch('/api/link-instagram', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ access_token: token })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                alert('Instagram connected successfully!');
                location.reload();
            } else {
                alert('Failed to connect Instagram: ' + (data.error || 'Unknown error'));
            }
        } catch (error) {
            alert('Error connecting Instagram: ' + error.message);
        } finally {
            connectInstagramTokenBtn.disabled = false;
            connectInstagramTokenBtn.innerHTML = '<i class="fab fa-instagram"></i> Connect with Token';
        }
    });

    continueToDashboardBtn.addEventListener('click', () => {
        showDashboard();
    });

    switchAccountBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to sign in with a different Google account? You will be logged out.')) {
            window.location.href = '/logout';
        }
    });

    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (confirm('Are you sure you want to logout?')) {
            window.location.href = '/logout';
        }
    });

    manageAccountsBtn.addEventListener('click', () => {
        showLinkAccounts();
    });

    // AI Generator
    generateBtn.addEventListener('click', handleGenerateContent);
    regenerateBtn.addEventListener('click', handleGenerateContent);
    postToTwitterBtn.addEventListener('click', () => handlePostGenerated('twitter'));
    postToInstagramBtn.addEventListener('click', () => handlePostGenerated('instagram'));

    // Post form
    postForm.addEventListener('submit', handlePostSubmit);

    // Character count
    tweetText.addEventListener('input', updateCharCount);

    // Image upload
    imageUpload.addEventListener('change', handleImageUpload);
    removeImageBtn.addEventListener('click', removeImage);

    // Modal close buttons
    closeSuccess.addEventListener('click', () => hideModal('success'));
    closeError.addEventListener('click', () => hideModal('error'));

    // Close modals on outside click
    successModal.addEventListener('click', (e) => {
        if (e.target === successModal) hideModal('success');
    });
    errorModal.addEventListener('click', (e) => {
        if (e.target === errorModal) hideModal('error');
    });
}

// Check Authentication Status
async function checkAuthentication() {
    try {
        const response = await fetch('/api/user');
        const data = await response.json();

        if (data.authenticated) {
            currentUser = data.user;
            updateUserDisplay(data);
            
            // Always show link accounts screen first if no accounts linked
            if (!data.twitterLinked && !data.instagramLinked) {
                showLinkAccounts();
            } else {
                showDashboard();
                loadRecentTweets();
            }
        } else {
            showLogin();
        }
    } catch (error) {
        console.error('Authentication check failed:', error);
        showLogin();
    }
}

// Update user display elements
function updateUserDisplay(data) {
    if (data.user.avatar_url) {
        if (userAvatarLink) userAvatarLink.src = data.user.avatar_url;
        headerUserAvatar.src = data.user.avatar_url;
    }
    
    userName.textContent = data.user.name;
    if (userNameLink) userNameLink.textContent = `Welcome, ${data.user.name}!`;
    
    // Update Twitter status
    if (data.twitterLinked) {
        twitterStatus.innerHTML = `<i class="fab fa-twitter"></i> @${data.twitterAccount.username}`;
        twitterStatus.classList.add('connected');
        if (twitterConnected) {
            twitterConnected.classList.remove('hidden');
            if (twitterUsername) twitterUsername.textContent = `@${data.twitterAccount.username}`;
            if (linkTwitterBtn) linkTwitterBtn.classList.add('hidden');
        }
    } else {
        twitterStatus.innerHTML = '<i class="fab fa-twitter"></i> Not connected';
        twitterStatus.classList.remove('connected');
        if (twitterConnected) twitterConnected.classList.add('hidden');
        if (linkTwitterBtn) linkTwitterBtn.classList.remove('hidden');
    }

    // Update Facebook/Instagram status
    if (data.facebookLinked) {
        // Facebook is connected
        if (facebookConnected) {
            facebookConnected.classList.remove('hidden');
            if (facebookUsername) facebookUsername.textContent = data.facebookAccount.facebook_name;
            
            // Show Instagram accounts linked via Facebook
            if (instagramAccountsList && data.facebookAccount.instagram_accounts.length > 0) {
                instagramAccountsList.innerHTML = '<strong>Instagram Accounts:</strong>';
                data.facebookAccount.instagram_accounts.forEach(ig => {
                    const igDiv = document.createElement('div');
                    igDiv.className = 'instagram-account-item';
                    igDiv.innerHTML = `<i class="fab fa-instagram"></i> @${ig.username}`;
                    instagramAccountsList.appendChild(igDiv);
                });
            }
            
            if (linkFacebookBtn) linkFacebookBtn.classList.add('hidden');
            if (toggleManualTokenBtn) toggleManualTokenBtn.classList.add('hidden');
        }
        
        instagramStatus.innerHTML = `<i class="fab fa-instagram"></i> Via Facebook`;
        instagramStatus.classList.add('connected');
    } else if (data.instagramLinked) {
        // Manual Instagram token
        instagramStatus.innerHTML = `<i class="fab fa-instagram"></i> @${data.instagramAccount.username}`;
        instagramStatus.classList.add('connected');
        if (instagramConnected) {
            instagramConnected.classList.remove('hidden');
            if (instagramUsername) instagramUsername.textContent = `@${data.instagramAccount.username}`;
            if (instagramTokenForm) instagramTokenForm.classList.add('hidden');
        }
        if (linkFacebookBtn) linkFacebookBtn.classList.add('hidden');
    } else {
        // Not connected
        instagramStatus.innerHTML = '<i class="fab fa-instagram"></i> Not connected';
        instagramStatus.classList.remove('connected');
        if (facebookConnected) facebookConnected.classList.add('hidden');
        if (instagramConnected) instagramConnected.classList.add('hidden');
        if (linkFacebookBtn) linkFacebookBtn.classList.remove('hidden');
    }
}

// Show Screens
function showLogin() {
    hideAllScreens();
    loginScreen.classList.remove('hidden');
}

function showLinkAccounts() {
    hideAllScreens();
    linkAccountsScreen.classList.remove('hidden');
}

function showDashboard() {
    hideAllScreens();
    dashboardScreen.classList.remove('hidden');
}

function hideAllScreens() {
    loadingScreen.classList.add('hidden');
    loginScreen.classList.add('hidden');
    linkAccountsScreen.classList.add('hidden');
    dashboardScreen.classList.add('hidden');
}

// Character Count
function updateCharCount() {
    const count = tweetText.value.length;
    charCount.textContent = count;
    
    // Update character count styling
    charCount.className = 'char-count';
    if (count > 260) {
        charCount.classList.add('danger');
    } else if (count > 240) {
        charCount.classList.add('warning');
    }
    
    // Enable/disable post button
    postBtn.disabled = count === 0 || count > 280;
}

// Image Upload
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            showError('Image file is too large. Please choose a file smaller than 5MB.');
            return;
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            showError('Please select a valid image file.');
            return;
        }

        selectedImage = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            imagePreview.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
    }
}

function removeImage() {
    selectedImage = null;
    imageUpload.value = '';
    imagePreview.classList.add('hidden');
    previewImg.src = '';
}

// Post Submission
async function handlePostSubmit(event) {
    event.preventDefault();
    
    const text = tweetText.value.trim();
    if (!text) {
        showError('Please enter some text for your tweet.');
        return;
    }

    if (text.length > 280) {
        showError('Tweet text exceeds 280 characters.');
        return;
    }

    // Disable form during submission
    postBtn.disabled = true;
    postBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Posting...';

    try {
        const formData = new FormData();
        formData.append('text', text);
        
        if (selectedImage) {
            formData.append('image', selectedImage);
        }

        const response = await fetch('/api/tweet', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (data.success) {
            showSuccess();
            resetForm();
            loadRecentTweets(); // Refresh tweets list
        } else {
            showError(data.error || 'Failed to post tweet. Please try again.');
        }
    } catch (error) {
        console.error('Post submission error:', error);
        showError('Network error. Please check your connection and try again.');
    } finally {
        // Re-enable form
        postBtn.disabled = false;
        postBtn.innerHTML = '<i class="fab fa-twitter"></i> Post Tweet';
    }
}

// Reset Form
function resetForm() {
    tweetText.value = '';
    removeImage();
    updateCharCount();
}

// Load Recent Tweets
async function loadRecentTweets() {
    try {
        tweetsList.innerHTML = '<div class="loading-tweets"><i class="fas fa-spinner fa-spin"></i><span>Loading tweets...</span></div>';
        
        const response = await fetch('/api/tweets');
        const data = await response.json();

        if (data.success && data.tweets.length > 0) {
            displayTweets(data.tweets);
        } else {
            tweetsList.innerHTML = '<div class="loading-tweets"><i class="fas fa-twitter"></i><span>No tweets found</span></div>';
        }
    } catch (error) {
        console.error('Error loading tweets:', error);
        tweetsList.innerHTML = '<div class="loading-tweets"><i class="fas fa-exclamation-triangle"></i><span>Failed to load tweets</span></div>';
    }
}

// Display Tweets
function displayTweets(tweets) {
    if (tweets.length === 0) {
        tweetsList.innerHTML = '<div class="loading-tweets"><i class="fas fa-twitter"></i><span>No tweets found</span></div>';
        return;
    }

    const tweetsHTML = tweets.map(tweet => {
        const date = new Date(tweet.posted_at);
        const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        
        return `
            <div class="tweet-item">
                <div class="tweet-text">${escapeHtml(tweet.text)}</div>
                <div class="tweet-meta">
                    <div class="tweet-date">${formattedDate}</div>
                    <div class="tweet-stats">
                        <div class="tweet-stat">
                            <i class="fas fa-heart"></i>
                            <span>0</span>
                        </div>
                        <div class="tweet-stat">
                            <i class="fas fa-retweet"></i>
                            <span>0</span>
                        </div>
                        <div class="tweet-stat">
                            <i class="fas fa-reply"></i>
                            <span>0</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    tweetsList.innerHTML = tweetsHTML;
}

// Utility Functions
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// AI Content Generation Handler
async function handleGenerateContent() {
    const prompt = aiPrompt.value.trim();
    const maxWords = parseInt(captionLength.value) || 30;

    if (!prompt) {
        showError('Please enter a prompt to generate content');
        return;
    }

    generateBtn.disabled = true;
    generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    aiPreview.classList.add('hidden');

    try {
        const response = await fetch('/api/generate-content', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt, caption_length: maxWords })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to generate content');
        }

        // Store generated content
        generatedContent = {
            image_base64: data.image_base64, // For immediate display
            caption: data.caption,
            image_url: data.image_url,
            s3_url: data.s3_url // Store S3 URL for posting
        };

        // Display preview
        aiGeneratedImage.src = data.image_base64;
        aiGeneratedCaption.textContent = data.caption;
        aiPreview.classList.remove('hidden');

        // Scroll to preview
        aiPreview.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    } catch (error) {
        console.error('Generation error:', error);
        showError(error.message || 'Failed to generate content. Please check your OpenAI API key in .env file');
    } finally {
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> Generate Content';
    }
}

// Post Generated Content Handler
async function handlePostGenerated(platform) {
    if (!generatedContent) {
        showError('No content to post. Please generate content first.');
        return;
    }

    const platformName = platform === 'twitter' ? 'X' : 'Instagram';
    const confirmMessage = `Are you sure you want to post this content to ${platformName}?`;

    if (!confirm(confirmMessage)) {
        return;
    }

    const btn = platform === 'twitter' ? postToTwitterBtn : postToInstagramBtn;
    const originalText = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Posting...';

    try {
        const response = await fetch('/api/post-generated', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                caption: generatedContent.caption,
                image_base64: generatedContent.image_base64,
                s3_url: generatedContent.s3_url, // Include S3 URL
                platform: platform
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to post content');
        }

        showSuccess();
        
        // Clear generated content
        generatedContent = null;
        aiPreview.classList.add('hidden');
        aiPrompt.value = '';
        
        // Reload tweets if posted to Twitter
        if (platform === 'twitter') {
            loadRecentTweets();
        }

    } catch (error) {
        console.error('Post error:', error);
        showError(error.message || `Failed to post to ${platformName}`);
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

function showSuccess() {
    successModal.classList.remove('hidden');
}

function showError(message) {
    errorMessage.textContent = message;
    errorModal.classList.remove('hidden');
}

function hideModal(type) {
    if (type === 'success') {
        successModal.classList.add('hidden');
    } else if (type === 'error') {
        errorModal.classList.add('hidden');
    }
}

// Handle keyboard shortcuts
document.addEventListener('keydown', (event) => {
    // Ctrl/Cmd + Enter to submit post
    if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        if (!postBtn.disabled && tweetText.value.trim()) {
            handlePostSubmit(event);
        }
    }
    
    // Escape to close modals
    if (event.key === 'Escape') {
        hideModal('success');
        hideModal('error');
    }
});
