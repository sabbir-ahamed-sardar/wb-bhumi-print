document.addEventListener('DOMContentLoaded', function () {
    // Initialize secure API configuration with error handling
    let secureAPI;
    let API_BASE_URL;

    try {
        secureAPI = new SecureAPIConfig();
        API_BASE_URL = secureAPI.deobfuscateUrl(secureAPI.endpoints.base);

        if (!API_BASE_URL) {
            throw new Error('Failed to initialize API configuration');
        }
    } catch (error) {
        console.error('API configuration error:', error);
        // Fallback configuration
        API_BASE_URL = 'https://wbbhumiprint.com/api';
        secureAPI = {
            endpoints: {
                login: 'login.php',
                register: 'register.php',
                logout: 'logout.php',
                verify: 'verify-token.php',
                validation: 'get-account-validation.php'
            },
            checkRateLimit: () => true,
            getClientId: () => 'fallback',
            sanitizeInput: (data) => data,
            createHeaders: () => ({ 'Content-Type': 'application/json' })
        };
    }

    // Cache DOM elements
    const elements = {
        loginContainer: document.getElementById('loginContainer'),
        registerContainer: document.getElementById('registerContainer'),
        mainContent: document.getElementById('mainContent'),
        loginForm: document.getElementById('loginForm'),
        registerForm: document.getElementById('registerForm'),
        showRegisterLink: document.getElementById('showRegister'),
        showLoginLink: document.getElementById('showLogin'),
        loginError: document.getElementById('loginError'),
        registerError: document.getElementById('registerError'),
        registerSuccess: document.getElementById('registerSuccess'),
        noticePopup: document.getElementById('noticePopup'),
        noticeButton: document.getElementById('noticeButton'),
        closeNotice: document.getElementById('closeNotice'),
        userEmailElement: document.getElementById('userEmail'),
        userNameElement: document.getElementById('userName'),
        userInitialElement: document.getElementById('userInitial'),
        logoutButton: document.getElementById('logoutButton'),
        rememberMeCheckbox: document.getElementById('rememberMe')
    };

    // Show main content immediately without authentication
    if (elements.mainContent) elements.mainContent.classList.remove('hidden');
    if (elements.loginContainer) elements.loginContainer.style.display = 'none';
    if (elements.registerContainer) elements.registerContainer.style.display = 'none';
    if (elements.noticePopup) elements.noticePopup.classList.add('hidden');

    // Show/hide functions
    function showLoginForm() {
        if (elements.loginContainer) elements.loginContainer.classList.remove('hidden');
        if (elements.registerContainer) elements.registerContainer.classList.add('hidden');
        if (elements.mainContent) elements.mainContent.classList.add('hidden');
        hideError(elements.loginError);
    }

    function showRegisterForm() {
        if (elements.loginContainer) elements.loginContainer.classList.add('hidden');
        if (elements.registerContainer) elements.registerContainer.classList.remove('hidden');
        if (elements.mainContent) elements.mainContent.classList.add('hidden');
        hideError(elements.registerError);
    }

    function showMainContent() {
        if (elements.loginContainer) elements.loginContainer.classList.add('hidden');
        if (elements.registerContainer) elements.registerContainer.classList.add('hidden');
        if (elements.mainContent) elements.mainContent.classList.remove('hidden');
    }

    // Notice popup functions
    function showNotice() {
        if (elements.noticePopup) elements.noticePopup.classList.remove('hidden');
    }

    function hideNotice() {
        if (elements.noticePopup) elements.noticePopup.classList.add('hidden');
    }

    // Add click event listeners for form switching
    if (elements.showRegisterLink) {
        elements.showRegisterLink.addEventListener('click', function (e) {
            e.preventDefault();
            const registerUrl = API_BASE_URL.replace('/api', '/register.php');
            window.open(registerUrl, '_blank');
        });
    }

    if (elements.showLoginLink) {
        elements.showLoginLink.addEventListener('click', function (e) {
            e.preventDefault();
            showLoginForm();
        });
    }

    // Add event listeners for notice popup
    if (elements.noticeButton) {
        elements.noticeButton.addEventListener('click', showNotice);
    }

    if (elements.closeNotice) {
        elements.closeNotice.addEventListener('click', hideNotice);
    }

    // Close notice when clicking outside the popup
    window.addEventListener('click', function (event) {
        if (event.target === elements.noticePopup) {
            hideNotice();
        }
    });

    // Awesome Error Popup System
    function showErrorPopup(message, type = 'error', duration = 5000) {
        // Remove existing popup if any
        hideErrorPopup();

        // Create popup container
        const popupContainer = document.createElement('div');
        popupContainer.id = 'errorPopup';
        popupContainer.className = 'error-popup-container';

        // Determine icon and colors based on type
        let icon, bgColor, borderColor, iconColor;
        switch (type) {
            case 'success':
                icon = '✅';
                bgColor = 'linear-gradient(135deg, #4CAF50, #45a049)';
                borderColor = '#4CAF50';
                iconColor = '#4CAF50';
                break;
            case 'warning':
                icon = '⚠️';
                bgColor = 'linear-gradient(135deg, #FF9800, #F57C00)';
                borderColor = '#FF9800';
                iconColor = '#FF9800';
                break;
            case 'info':
                icon = 'ℹ️';
                bgColor = 'linear-gradient(135deg, #2196F3, #1976D2)';
                borderColor = '#2196F3';
                iconColor = '#2196F3';
                break;
            default: // error
                icon = '❌';
                bgColor = 'linear-gradient(135deg, #f44336, #d32f2f)';
                borderColor = '#f44336';
                iconColor = '#f44336';
                break;
        }

        popupContainer.innerHTML = `
            <div class="error-popup" style="background: ${bgColor}; border-left: 4px solid ${borderColor};">
                <div class="error-popup-content">
                    <div class="error-popup-icon" style="color: ${iconColor};">${icon}</div>
                    <div class="error-popup-message">${message}</div>
                    <button class="error-popup-close" onclick="hideErrorPopup()">×</button>
                </div>
                <div class="error-popup-progress"></div>
            </div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .error-popup-container {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: 10000;
                max-width: 400px;
                width: 90%;
                animation: slideInCenter 0.5s ease-out;
            }
            
            .error-popup {
                background: linear-gradient(135deg, #f44336, #d32f2f);
                color: white;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                overflow: hidden;
                position: relative;
                border-left: 4px solid #f44336;
            }
            
            .error-popup-content {
                display: flex;
                align-items: center;
                padding: 16px 20px;
                position: relative;
                z-index: 2;
            }
            
            .error-popup-icon {
                font-size: 24px;
                margin-right: 12px;
                animation: bounce 1s ease-in-out infinite;
            }
            
            .error-popup-message {
                flex: 1;
                font-size: 14px;
                font-weight: 500;
                line-height: 1.4;
            }
            
            .error-popup-close {
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                font-size: 20px;
                font-weight: bold;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                margin-left: 12px;
            }
            
            .error-popup-close:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: scale(1.1);
            }
            
            .error-popup-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 3px;
                background: rgba(255, 255, 255, 0.3);
                animation: progressBar ${duration}ms linear forwards;
            }
            
            @keyframes slideInCenter {
                from {
                    transform: translate(-50%, -50%) scale(0.8);
                    opacity: 0;
                }
                to {
                    transform: translate(-50%, -50%) scale(1);
                    opacity: 1;
                }
            }
            
            @keyframes slideOutCenter {
                from {
                    transform: translate(-50%, -50%) scale(1);
                    opacity: 1;
                }
                to {
                    transform: translate(-50%, -50%) scale(0.8);
                    opacity: 0;
                }
            }
            
            @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-3px); }
            }
            
            @keyframes progressBar {
                from { width: 100%; }
                to { width: 0%; }
            }
            
            @media (max-width: 480px) {
                .error-popup-container {
                    width: 95%;
                    max-width: none;
                }
                
                .error-popup-content {
                    padding: 12px 16px;
                }
                
                .error-popup-message {
                    font-size: 13px;
                }
            }
        `;

        // Add to document
        document.head.appendChild(style);
        document.body.appendChild(popupContainer);

        // Auto-hide after duration
        setTimeout(() => {
            hideErrorPopup();
        }, duration);

        // Add click outside to close
        popupContainer.addEventListener('click', (e) => {
            if (e.target === popupContainer) {
                hideErrorPopup();
            }
        });
    }

    function hideErrorPopup() {
        const popup = document.getElementById('errorPopup');
        if (popup) {
            popup.style.animation = 'slideOutCenter 0.3s ease-in forwards';
            setTimeout(() => {
                if (popup.parentNode) {
                    popup.parentNode.removeChild(popup);
                }
                // Remove associated style
                const styles = document.querySelectorAll('style');
                styles.forEach(style => {
                    if (style.textContent.includes('error-popup-container')) {
                        style.remove();
                    }
                });
            }, 300);
        }
    }

    // Legacy error functions for backward compatibility
    function showError(element, message) {
        if (element) {
            element.textContent = message;
            element.style.display = 'block';
        }
        // Also show popup for better visibility
        showErrorPopup(message, 'error');
    }

    function hideError(element) {
        if (element) {
            element.style.display = 'none';
        }
    }

    // Helper function to make secure API calls - Optimized for speed
    async function apiCall(endpoint, method, data, timeout = 10000) {
        try {
            // Check rate limiting
            const clientId = secureAPI.getClientId();
            if (!secureAPI.checkRateLimit(clientId)) {
                throw new Error('Rate limit exceeded. Please try again later.');
            }

            // Sanitize input data
            const sanitizedData = secureAPI.sanitizeInput(data);

            // Create secure headers
            const headers = secureAPI.createHeaders(true);

            // Deobfuscate endpoint
            const deobfuscatedEndpoint = secureAPI.deobfuscateUrl(endpoint);
            if (!deobfuscatedEndpoint) {
                throw new Error('Invalid endpoint');
            }

            console.log('Making secure API call to:', `${API_BASE_URL}/${deobfuscatedEndpoint}`);

            // Create AbortController for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeout);

            const response = await fetch(`${API_BASE_URL}/${deobfuscatedEndpoint}`, {
                method: method,
                headers: headers,
                body: JSON.stringify(sanitizedData),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            let responseData;
            const contentType = response.headers.get('content-type');

            // Try to parse as JSON regardless of content type
            const text = await response.text();

            // Check if response starts with HTML tags (error page)
            if (text.trim().startsWith('<')) {
                console.error('Server returned HTML instead of JSON:', text);
                throw new Error('Server returned an invalid response format');
            }

            // Try to parse the response as JSON
            try {
                responseData = JSON.parse(text);
            } catch (jsonError) {
                console.error('JSON parsing error:', jsonError, 'Response text:', text);
                throw new Error('Failed to parse server response. Please try again later.');
            }

            if (!response.ok) {
                throw new Error(responseData.message || 'Server returned an error');
            }

            return responseData;
        } catch (error) {
            console.error('API Error:', error);
            if (error.name === 'AbortError') {
                throw new Error('Request timeout. Please check your connection and try again.');
            }
            if (error.message.includes('Failed to fetch')) {
                throw new Error('Cannot connect to server. Please check your internet connection and try again.');
            }
            if (error.message.includes('CORS')) {
                throw new Error('CORS policy error. Please contact support if this persists.');
            }
            throw error;
        }
    }

    // Helper function to check token expiration
    function isTokenExpired() {
        const expirationTime = localStorage.getItem('tokenExpiration');
        if (!expirationTime) return true;
        return new Date().getTime() > parseInt(expirationTime);
    }

    // Helper function to set token with expiration
    function setTokenWithExpiration(token, user) {
        // Set token to expire in 30 days
        const expirationTime = new Date().getTime() + (30 * 24 * 60 * 60 * 1000);
        localStorage.setItem('token', token);
        localStorage.setItem('tokenExpiration', expirationTime.toString());
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
        }
    }

    // Helper function to save login credentials for auto-login
    function saveLoginCredentials(email, password) {
        const loginCredentials = {
            email: email,
            password: password,
            timestamp: new Date().getTime()
        };
        localStorage.setItem('wb_bhumi_auto_login', JSON.stringify(loginCredentials));
    }

    // Helper function to get saved login credentials
    function getSavedLoginCredentials() {
        const savedCredentials = localStorage.getItem('wb_bhumi_auto_login');
        if (savedCredentials) {
            try {
                return JSON.parse(savedCredentials);
            } catch (error) {
                console.error('Error parsing saved credentials:', error);
                return null;
            }
        }
        return null;
    }

    // Helper function to clear saved login credentials
    function clearSavedLoginCredentials() {
        localStorage.removeItem('wb_bhumi_auto_login');
    }

    // Helper function to check if credentials are still valid (not too old)
    function areCredentialsValid(credentials) {
        if (!credentials || !credentials.timestamp) return false;
        // Consider credentials valid for 30 days
        const thirtyDaysAgo = new Date().getTime() - (30 * 24 * 60 * 60 * 1000);
        return credentials.timestamp > thirtyDaysAgo;
    }

    // Function to extract name from email
    function extractNameFromEmail(email) {
        if (!email || typeof email !== 'string') {
            return 'User';
        }

        // Extract the part before @ symbol
        const emailPart = email.split('@')[0];

        // Replace common separators with spaces
        const namePart = emailPart.replace(/[._-]/g, ' ');

        // Capitalize each word
        const words = namePart.split(' ').filter(word => word.length > 0);
        const capitalizedWords = words.map(word =>
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        );

        return capitalizedWords.join(' ') || 'User';
    }

    // Function to update user profile
    function updateUserProfile(email, userData = null) {
        // Add defensive checks
        if (!email || typeof email !== 'string') {
            console.warn('Invalid email provided to updateUserProfile:', email);
            return;
        }

        // Display email
        if (elements.userEmailElement) {
            elements.userEmailElement.textContent = email;
        }

        // Display user name
        let displayName = 'User';
        if (userData && userData.name) {
            displayName = userData.name;
        } else if (userData && userData.first_name && userData.last_name) {
            displayName = `${userData.first_name} ${userData.last_name}`;
        } else if (userData && userData.first_name) {
            displayName = userData.first_name;
        } else {
            // Extract name from email as fallback
            displayName = extractNameFromEmail(email);
        }

        if (elements.userNameElement) {
            elements.userNameElement.textContent = displayName;
        }

        // Get the first letter of the display name for the avatar
        const initial = displayName.charAt(0).toUpperCase();
        if (elements.userInitialElement && initial) {
            elements.userInitialElement.textContent = initial;
        }
    }

    // Function to handle logout
    function handleLogout() {
        // Clear the stored user data
        localStorage.removeItem('token');
        localStorage.removeItem('tokenExpiration');
        localStorage.removeItem('user');
        // Clear saved login credentials (auto-login data)
        localStorage.removeItem('wb_bhumi_auto_login');
        // Clear account validation cache
        localStorage.removeItem('accountValidationCache');
        localStorage.removeItem('accountValidationCacheTime');

        // Hide main content and show login form
        if (elements.mainContent) elements.mainContent.classList.add('hidden');
        if (elements.loginContainer) elements.loginContainer.classList.remove('hidden');
    }

    // Enhanced logout function that also sends logout request to server
    async function handleLogoutWithServer() {
        const token = localStorage.getItem('token');

        // Clear local storage first
        localStorage.removeItem('token');
        localStorage.removeItem('tokenExpiration');
        localStorage.removeItem('user');
        // Clear saved login credentials (auto-login data)
        localStorage.removeItem('wb_bhumi_auto_login');
        // Clear account validation cache
        localStorage.removeItem('accountValidationCache');
        localStorage.removeItem('accountValidationCacheTime');

        // Try to notify server about logout (optional)
        if (token) {
            try {
                await apiCall(secureAPI.endpoints.logout, 'POST', { token: token });
            } catch (error) {
                console.log('Failed to notify server about logout:', error);
            }
        }

        // Hide main content and show login form
        if (elements.mainContent) elements.mainContent.classList.add('hidden');
        if (elements.loginContainer) elements.loginContainer.classList.remove('hidden');
    }

    // Login form submission
    if (elements.loginForm) {
        elements.loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            hideError(elements.loginError);

            const submitButton = elements.loginForm.querySelector('button[type="submit"]');
            if (submitButton) submitButton.disabled = true;

            try {
                const email = document.getElementById('loginEmail').value;
                const password = document.getElementById('loginPassword').value;

                const response = await apiCall(secureAPI.endpoints.login, 'POST', {
                    email: email,
                    password: password
                });

                if (response.success) {
                    // Check if response has the expected data structure
                    if (response.data && response.data.token && response.data.user) {
                        setTokenWithExpiration(response.data.token, response.data.user);
                        updateUserProfile(response.data.user.email, response.data.user);

                        // Save login credentials for auto-login only if "Remember Me" is checked
                        if (elements.rememberMeCheckbox && elements.rememberMeCheckbox.checked) {
                            saveLoginCredentials(email, password);
                        } else {
                            // Clear saved credentials if "Remember Me" is not checked
                            clearSavedLoginCredentials();
                        }

                        showMainContent();
                        showErrorPopup('Login successful! Welcome back!', 'success', 3000);
                    } else {
                        console.error('Unexpected API response structure:', response);
                        showErrorPopup('Invalid response from server. Please try again.', 'error');
                    }
                } else {
                    showErrorPopup(response.message || 'Login failed. Please check your credentials.', 'error');
                }
            } catch (error) {
                showErrorPopup(error.message || 'An error occurred during login. Please try again.', 'error');
            } finally {
                if (submitButton) submitButton.disabled = false;
            }
        });
    }

    // Registration form submission
    if (elements.registerForm) {
        elements.registerForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            hideError(elements.registerError);
            hideError(elements.registerSuccess);

            const submitButton = elements.registerForm.querySelector('button[type="submit"]');
            if (submitButton) submitButton.disabled = true;

            try {
                const email = document.getElementById('regEmail').value;
                const password = document.getElementById('regPassword').value;
                const confirmPassword = document.getElementById('regConfirmPassword').value;

                if (password !== confirmPassword) {
                    showErrorPopup('Passwords do not match. Please try again.', 'warning');
                    return;
                }

                if (password.length < 6) {
                    showErrorPopup('Password must be at least 6 characters long.', 'warning');
                    return;
                }

                const response = await apiCall(secureAPI.endpoints.register, 'POST', {
                    email: email,
                    password: password
                });

                if (response.success) {
                    elements.registerSuccess.textContent = 'Registration successful! You can now login.';
                    elements.registerSuccess.style.display = 'block';
                    elements.registerForm.reset();
                    // Show congratulation popup
                    window.showCongratsPopup();
                    setTimeout(() => {
                        showLoginForm();
                    }, 2000);
                } else {
                    showErrorPopup(response.message || 'Registration failed. Please try again.', 'error');
                }
            } catch (error) {
                showErrorPopup(error.message || 'An error occurred during registration. Please try again.', 'error');
            } finally {
                if (submitButton) submitButton.disabled = false;
            }
        });
    }

    // No logout button exists since authentication is removed

    // Set the user profile to SABBIR AHAMED without authentication
    if (elements.userEmailElement) {
        elements.userEmailElement.textContent = 'sabbir@example.com';
    }
    if (elements.userNameElement) {
        elements.userNameElement.textContent = 'SABBIR AHAMED';
    }
    if (elements.userInitialElement) {
        elements.userInitialElement.textContent = 'S';
    }

    // Function to attempt auto-login with saved credentials
    async function attemptAutoLogin() {
        // Authentication is removed, always return false
        return false;
    }

    // Enhanced authentication status check - authentication is removed
    async function checkAuthStatus() {
        // Show main content directly without checking authentication
        showMainContent();
    }

    // Slider functionality
    function initSlider() {
        const sliderTrack = document.getElementById('sliderTrack');
        const sliderDots = document.querySelectorAll('.slider-dot');
        let currentSlide = 0;
        const slideCount = document.querySelectorAll('.slide').length;
        let slideInterval;

        // Function to update slider position
        function updateSlider() {
            if (!sliderTrack) return;
            const offset = currentSlide * -100;
            sliderTrack.style.transition = 'transform 0.5s ease-in-out';
            sliderTrack.style.transform = `translateX(${offset}%)`;

            // Update dots
            sliderDots.forEach((dot, index) => {
                if (index === currentSlide) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }

        // Function to start auto-advance timer
        function startAutoAdvance() {
            stopAutoAdvance(); // Clear any existing interval
            slideInterval = setInterval(() => {
                currentSlide = (currentSlide + 1) % slideCount;
                updateSlider();
            }, 3000);
        }

        // Function to stop auto-advance timer
        function stopAutoAdvance() {
            if (slideInterval) {
                clearInterval(slideInterval);
                slideInterval = null;
            }
        }

        // Set up click handlers for dots
        sliderDots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                currentSlide = index;
                updateSlider();
                stopAutoAdvance();
                startAutoAdvance(); // Restart timer after user interaction
            });
        });

        // Handle mouse enter/leave for slider track
        if (sliderTrack) {
            sliderTrack.addEventListener('mouseenter', stopAutoAdvance);
            sliderTrack.addEventListener('mouseleave', startAutoAdvance);
        }

        // Initialize slider
        updateSlider();
        startAutoAdvance();
    }

    // Account Expire Timer functionality
    function initAccountTimer() {
        const timerDisplay = document.getElementById('accountTimer');
        if (!timerDisplay) return;

        let userExpirationDate = null;
        let timerInterval = null;

        // Show loading state
        function showTimerLoading() {
            const timerContainer = document.getElementById('accountExpireTimer');
            const statusBadge = document.getElementById('timerStatusBadge');

            if (timerContainer && statusBadge) {
                timerContainer.classList.add('loading');
                statusBadge.textContent = 'LOADING...';
            }
        }

        // Hide loading state
        function hideTimerLoading() {
            const timerContainer = document.getElementById('accountExpireTimer');

            if (timerContainer) {
                timerContainer.classList.remove('loading');
            }
        }

        // Fetch user account validation from database - Optimized for speed
        async function fetchAccountValidation() {
            // Check if we have cached data first
            const cachedData = localStorage.getItem('accountValidationCache');
            const cacheTime = localStorage.getItem('accountValidationCacheTime');
            const now = Date.now();

            // Use cached data if it's less than 5 minutes old
            if (cachedData && cacheTime && (now - parseInt(cacheTime)) < 300000) {
                try {
                    const data = JSON.parse(cachedData);
                    userExpirationDate = new Date(data.expiration_date);
                    console.log('Using cached account data - expires on:', userExpirationDate);
                    hideTimerLoading();
                    startTimer();
                    return;
                } catch (e) {
                    console.log('Cached data corrupted, fetching fresh data');
                }
            }

            showTimerLoading();

            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    hideTimerLoading();
                    return;
                }

                // Make API call with timeout
                const response = await apiCall(secureAPI.endpoints.validation, 'POST', {
                    token: token
                }, 3000); // 3 second timeout for account validation

                if (response.success && response.data && response.data.expiration_date) {
                    // Parse the expiration date from database
                    userExpirationDate = new Date(response.data.expiration_date);
                    console.log('Fresh account data - expires on:', userExpirationDate);
                    console.log('Account status:', response.data.status);
                    console.log('Days remaining:', response.data.days_remaining);

                    // Cache the data for future use
                    localStorage.setItem('accountValidationCache', JSON.stringify(response.data));
                    localStorage.setItem('accountValidationCacheTime', now.toString());

                    // Start the timer with real expiration date
                    hideTimerLoading();
                    startTimer();
                } else {
                    // Fallback: Set default 30 days if no expiration date from server
                    userExpirationDate = new Date();
                    userExpirationDate.setDate(userExpirationDate.getDate() + 30);
                    hideTimerLoading();
                    startTimer();
                }
            } catch (error) {
                console.error('Failed to fetch account validation:', error);

                // Try to use cached data even if expired
                if (cachedData) {
                    try {
                        const data = JSON.parse(cachedData);
                        userExpirationDate = new Date(data.expiration_date);
                        console.log('Using expired cached data due to API error');
                        hideTimerLoading();
                        startTimer();
                        return;
                    } catch (e) {
                        console.log('Cached data also corrupted');
                    }
                }

                // Final fallback: Set default 30 days on error
                userExpirationDate = new Date();
                userExpirationDate.setDate(userExpirationDate.getDate() + 30);
                hideTimerLoading();
                startTimer();
            }
        }

        function updateTimer() {
            if (!userExpirationDate) return;

            const now = new Date().getTime();
            const expiration = userExpirationDate.getTime();
            const timeLeft = expiration - now;

            const timerContainer = document.getElementById('accountExpireTimer');
            const statusBadge = document.getElementById('timerStatusBadge');
            const timerIcon = document.getElementById('timerIcon');
            const expiredMessage = document.getElementById('expiredMessage');
            const renewButton = document.getElementById('renewButton');
            const daysElement = document.getElementById('timerDays');
            const hoursElement = document.getElementById('timerHours');
            const minutesElement = document.getElementById('timerMinutes');
            const secondsElement = document.getElementById('timerSeconds');

            if (timeLeft > 0) {
                const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
                const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

                // Update timer display
                if (daysElement) daysElement.textContent = days.toString().padStart(2, '0');
                if (hoursElement) hoursElement.textContent = hours.toString().padStart(2, '0');
                if (minutesElement) minutesElement.textContent = minutes.toString().padStart(2, '0');
                if (secondsElement) secondsElement.textContent = seconds.toString().padStart(2, '0');

                // Highlight the most significant time unit
                const timerUnits = document.querySelectorAll('.timer-unit');
                timerUnits.forEach(unit => unit.classList.remove('highlight'));

                if (days > 0 && daysElement) {
                    daysElement.parentElement.classList.add('highlight');
                } else if (hours > 0 && hoursElement) {
                    hoursElement.parentElement.classList.add('highlight');
                } else if (minutes > 0 && minutesElement) {
                    minutesElement.parentElement.classList.add('highlight');
                } else if (secondsElement) {
                    secondsElement.parentElement.classList.add('highlight');
                }

                // Show timer display and hide expired message
                if (timerDisplay) timerDisplay.style.display = 'flex';
                if (expiredMessage) expiredMessage.style.display = 'none';

                // Update status and styling based on time remaining
                if (timerContainer && statusBadge && timerIcon) {
                    // Remove all status classes
                    timerContainer.classList.remove('warning', 'critical', 'expired');

                    if (days <= 1) {
                        // Critical state - less than 1 day - SHOW RENEWAL POPUP
                        timerContainer.classList.add('critical');
                        statusBadge.textContent = 'CRITICAL';
                        timerIcon.textContent = '🚨';
                        // Show renewal popup for critical state
                        showRenewalPopup('critical', days, hours);
                        // Hide inline renew button
                        if (renewButton) renewButton.style.display = 'none';
                    } else if (days <= 3) {
                        // Warning state - 3 days or less
                        timerContainer.classList.add('warning');
                        statusBadge.textContent = 'WARNING';
                        timerIcon.textContent = '⚠️';
                        // Hide renewal popup and inline button for warning state
                        hideRenewalPopup();
                        if (renewButton) renewButton.style.display = 'none';
                    } else {
                        // Normal active state
                        statusBadge.textContent = 'ACTIVE';
                        timerIcon.textContent = '⏰';
                        // Hide renewal popup and inline button for normal state
                        hideRenewalPopup();
                        if (renewButton) renewButton.style.display = 'none';
                    }
                }
            } else {
                // Account expired
                if (timerContainer && statusBadge && timerIcon && expiredMessage) {
                    timerContainer.classList.remove('warning', 'critical');
                    timerContainer.classList.add('expired');
                    statusBadge.textContent = 'EXPIRED';
                    timerIcon.textContent = '💀';

                    // Hide timer display and show expired message
                    if (timerDisplay) timerDisplay.style.display = 'none';
                    expiredMessage.style.display = 'flex';
                    // Show renewal popup for expired state
                    showRenewalPopup('expired', 0, 0);
                    // Hide inline renew button
                    if (renewButton) renewButton.style.display = 'none';
                }

                if (timerInterval) {
                    clearInterval(timerInterval);
                }

                // Logout user immediately when account expires
                handleLogout();
                showErrorPopup('Your account has expired. Please contact support to renew your subscription.', 'warning', 8000);
            }
        }

        function startTimer() {
            // Clear any existing timer
            if (timerInterval) {
                clearInterval(timerInterval);
            }

            // Update timer immediately and then every second
            updateTimer();
            timerInterval = setInterval(updateTimer, 1000);
        }

        // Initialize by fetching account validation from database
        fetchAccountValidation();
    }

    // Make functions available globally
    window.showLoginForm = showLoginForm;
    window.showRegisterForm = showRegisterForm;
    window.showMainContent = showMainContent;
    window.hideErrorPopup = hideErrorPopup;
    window.showErrorPopup = showErrorPopup;

    // Function to pre-fill login form with saved credentials
    // Function to pre-fill login form with saved credentials
    function prefillLoginForm() {
        const savedCredentials = getSavedLoginCredentials();
        if (savedCredentials && areCredentialsValid(savedCredentials)) {
            const emailInput = document.getElementById('loginEmail');
            const passwordInput = document.getElementById('loginPassword');

            if (emailInput) emailInput.value = savedCredentials.email;
            if (passwordInput) passwordInput.value = savedCredentials.password;

            // Check the "Remember Me" checkbox if credentials are saved
            if (elements.rememberMeCheckbox) {
                elements.rememberMeCheckbox.checked = true;
            }
        }
    }

    // Renewal Popup Functions
    let renewalPopupShown = false;

    function showRenewalPopup(status, days, hours) {
        // Only show popup once per session to avoid annoyance
        if (renewalPopupShown) return;

        const popup = document.getElementById('renewalPopup');

        if (!popup) return;

        // Show popup with animation
        popup.style.display = 'flex';
        renewalPopupShown = true;
    }

    function hideRenewalPopup() {
        const popup = document.getElementById('renewalPopup');
        if (popup) {
            popup.style.display = 'none';
        }
    }

    // Event listener for closing renewal popup
    const closeRenewalBtn = document.getElementById('closeRenewalPopup');
    if (closeRenewalBtn) {
        closeRenewalBtn.addEventListener('click', () => {
            hideRenewalPopup();
        });
    }

    // Event listener for clicking outside popup to close
    const renewalPopup = document.getElementById('renewalPopup');
    if (renewalPopup) {
        renewalPopup.addEventListener('click', (e) => {
            if (e.target === renewalPopup) {
                hideRenewalPopup();
            }
        });
    }

    // Initialize the page
    checkAuthStatus();
    // No need to pre-fill login form since authentication is removed
    initSlider();
    // No account timer since authentication is removed
    // Just show the main content directly
});