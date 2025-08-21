document.addEventListener('DOMContentLoaded', () => {
    // Keep registration section for later, start with home
    const registrationSection = document.getElementById('registration-section');
    const dashboardSection = document.getElementById('dashboard-section');
    const registrationForm = document.getElementById('registration-form');
    const userNameSpan = document.getElementById('user-name');
    const trackersGrid = document.querySelector('.trackers-grid');
    const healthBar = document.getElementById('health-bar');
    const healthBarValue = document.getElementById('health-bar-value');

    // Registration form inputs for validation
    const nameInput = document.getElementById('name');
    const ageInput = document.getElementById('age');
    const phoneInput = document.getElementById('phone');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    // New Login elements
    const loginSection = document.getElementById('login-section');
    const loginForm = document.getElementById('login-form');
    const showLoginLink = document.getElementById('show-login-link');
    const showSignupLink = document.getElementById('show-signup-link');
    let registeredUser = null;

    // Reminder elements
    const reminderForm = document.getElementById('reminder-form');
    const reminderText = document.getElementById('reminder-text');
    const reminderTime = document.getElementById('reminder-time');
    const remindersList = document.getElementById('reminders-list');
    const alarmSound = document.getElementById('alarm-sound');
    let reminders = [];

    // Sidebar elements
    const menuButton = document.getElementById('menu-button');
    const sidebar = document.getElementById('sidebar');
    const closeButton = document.getElementById('close-button');
    const overlay = document.getElementById('overlay');
    const sidebarLinks = document.querySelectorAll('.sidebar-link');

    // Main content sections
    const sections = {
        'home-section': document.getElementById('home-section'),
        'registration-section': document.getElementById('registration-section'),
        'login-section': document.getElementById('login-section'),
        'dashboard-section': document.getElementById('dashboard-section'),
        'reminders-section': document.getElementById('reminders-section'),
        'doctors-section': document.getElementById('doctors-section'),
        'emergency-section': document.getElementById('emergency-section'),
        'footer': document.getElementById('footer'),
        'about-section': document.getElementById('about-section'),
    };
    
    // Links in sidebar map to different sections
    const linkSectionMap = {
        '#home-section': 'home-section',
        '#registration-section': 'registration-section',
        '#dashboard-section': 'dashboard-section',
        '#reminders-section': 'reminders-section',
        '#doctors-section': 'doctors-section',
        '#emergency-section': 'emergency-section',
        '#footer': 'footer',
        '#about-section': 'about-section',
    };

    let userRegistered = false;

    // Sidebar functionality
    const openSidebar = () => {
        sidebar.classList.add('open');
        overlay.classList.remove('hidden');
        overlay.classList.add('visible');
    };

    const closeSidebar = () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('visible');
        // We use a timeout to hide the overlay after the transition
        setTimeout(() => {
             if (!sidebar.classList.contains('open')) {
                overlay.classList.add('hidden');
             }
        }, 400);
    };

    menuButton.addEventListener('click', openSidebar);
    closeButton.addEventListener('click', closeSidebar);
    overlay.addEventListener('click', closeSidebar);
    
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');

            // Find the section key from the link map
            const targetId = Object.keys(linkSectionMap).find(key => href.endsWith(key));
            
            if (targetId && linkSectionMap[targetId]) {
                 e.preventDefault();
                 const sectionKey = linkSectionMap[targetId];

                // Don't show dashboard if user is not registered yet
                if (sectionKey === 'dashboard-section' && !userRegistered) {
                    closeSidebar();
                    alert("Please sign up or log in first to see the dashboard!");
                    return;
                }
                 
                // Hide all sections
                Object.values(sections).forEach(section => {
                    if(section) section.classList.add('hidden');
                });

                // Show target section
                if (sections[sectionKey]) {
                    sections[sectionKey].classList.remove('hidden');
                     // The footer is part of the main flow, so we just scroll to it
                    if (sectionKey === 'footer') {
                        sections[sectionKey].scrollIntoView({ behavior: 'smooth' });
                    }
                }
            }
            closeSidebar();
        });
    });

    const healthMetrics = {
        height: { label: 'Height', value: null, unit: 'cm', scoreWeight: 0, type: 'number' },
        weight: { label: 'Weight', value: null, unit: 'kg', scoreWeight: 2, type: 'number' },
        bmi: { label: 'BMI', value: null, unit: '', status: '' },
        hydration: { label: 'Hydration', value: null, unit: 'glasses', scoreWeight: 1, type: 'number' },
        heartbeat: { label: 'Heartbeat', value: null, unit: 'bpm', scoreWeight: 1.5, idealMin: 60, idealMax: 100, type: 'number' },
        bloodPressure: { label: 'Blood Pressure', value: null, unit: 'mmHg', scoreWeight: 1.5, type: 'text' },
        sugarLevel: { label: 'Sugar Level (Fasting)', value: null, unit: 'mg/dL', scoreWeight: 1.5, idealMin: 70, idealMax: 100, type: 'number' },
        sleep: { label: 'Sleep', value: null, unit: 'hours', scoreWeight: 1.5, idealMin: 7, idealMax: 9, type: 'number' }
    };

    function clearValidationErrors() {
        document.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
            el.style.display = 'none';
        });
        document.querySelectorAll('.form-group input').forEach(el => {
            el.classList.remove('invalid');
        });
    }

    function validateForm() {
        let isValid = true;
        clearValidationErrors();

        // Name validation (max 13 chars)
        if (nameInput.value.length > 13) {
            isValid = false;
            const errorEl = nameInput.nextElementSibling;
            errorEl.textContent = 'Name must be 13 characters or less.';
            errorEl.style.display = 'block';
            nameInput.classList.add('invalid');
        }

        // Age validation (13+)
        if (parseInt(ageInput.value, 10) < 13) {
            isValid = false;
            const errorEl = ageInput.nextElementSibling;
            errorEl.textContent = 'You must be at least 13 years old.';
            errorEl.style.display = 'block';
            ageInput.classList.add('invalid');
        }

        // Phone number validation (exactly 10 digits)
        if (!/^\d{10}$/.test(phoneInput.value)) {
            isValid = false;
            const errorEl = phoneInput.nextElementSibling;
            errorEl.textContent = 'Phone number must be exactly 10 digits.';
            errorEl.style.display = 'block';
            phoneInput.classList.add('invalid');
        }

        // Password validation
        const password = passwordInput.value;
        const passwordErrorEl = passwordInput.nextElementSibling;
        let passwordError = '';

        if (password.length < 8 || password.length > 20) {
            passwordError = 'Password must be between 8 and 20 characters.';
        } else if (!/[A-Z]/.test(password)) {
            passwordError = 'Password must contain at least one capital letter.';
        } else if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            passwordError = 'Password must contain at least one special character.';
        }

        if (passwordError) {
            isValid = false;
            passwordErrorEl.textContent = passwordError;
            passwordErrorEl.style.display = 'block';
            passwordInput.classList.add('invalid');
        }
        
        // Basic required field check
        [nameInput, ageInput, phoneInput, emailInput, passwordInput].forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                const errorEl = input.nextElementSibling;
                if (!errorEl.textContent) { // Don't overwrite specific errors
                     errorEl.textContent = 'This field is required.';
                     errorEl.style.display = 'block';
                     input.classList.add('invalid');
                }
            }
        });


        return isValid;
    }

    registrationForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        const name = nameInput.value;
        const email = emailInput.value;
        const phone = phoneInput.value;
        const password = passwordInput.value;

        registeredUser = { name, email, phone, password };
        
        userNameSpan.textContent = name;
        userRegistered = true;

        registrationSection.classList.add('hidden');
        loginSection.classList.add('hidden');
        sections['home-section'].classList.add('hidden');
        dashboardSection.classList.remove('hidden');

        populateDashboard();
        updateOverallHealth();
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        registrationSection.classList.add('hidden');
        loginSection.classList.remove('hidden');
        sections['home-section'].classList.add('hidden');
    });

    showSignupLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginSection.classList.add('hidden');
        registrationSection.classList.remove('hidden');
        sections['home-section'].classList.add('hidden');
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const identifier = document.getElementById('login-identifier').value;
        const password = document.getElementById('login-password').value;

        if (!registeredUser) {
            alert('No user is registered. Please sign up first.');
            return;
        }

        if ((identifier === registeredUser.email || identifier === registeredUser.phone) && password === registeredUser.password) {
            // Successful login
            userNameSpan.textContent = registeredUser.name;
            userRegistered = true;

            loginSection.classList.add('hidden');
            registrationSection.classList.add('hidden');
            sections['home-section'].classList.add('hidden');
            dashboardSection.classList.remove('hidden');

            // Populate dashboard if it's the first time logging in this session
            if (trackersGrid.innerHTML === '') {
                populateDashboard();
                updateOverallHealth();
            }
        } else {
            alert('Invalid credentials. Please try again.');
        }
    });

    // --- Reminder and Alarm System ---

    function renderReminders() {
        remindersList.innerHTML = '';
        if (reminders.length === 0) {
            remindersList.innerHTML = '<p>No reminders set yet. Add one above!</p>';
            return;
        }

        reminders.sort((a, b) => a.time.localeCompare(b.time));

        reminders.forEach(reminder => {
            const reminderEl = document.createElement('div');
            reminderEl.className = 'reminder-item';
            reminderEl.dataset.id = reminder.id;
            
            const timeFormatted = reminder.time.split(':');
            const hours = parseInt(timeFormatted[0], 10);
            const minutes = timeFormatted[1];
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const displayHours = hours % 12 || 12; // convert 0 to 12
            
            reminderEl.innerHTML = `
                <div class="reminder-details">
                    <span class="reminder-time">${displayHours}:${minutes} ${ampm}</span>
                    <span class="reminder-text">${reminder.text}</span>
                </div>
                <button class="delete-reminder-btn" title="Delete Reminder">&times;</button>
            `;
            remindersList.appendChild(reminderEl);
        });
    }

    function addReminder(e) {
        e.preventDefault();
        const text = reminderText.value.trim();
        const time = reminderTime.value;

        if (!text || !time) {
            alert('Please fill in both fields for the reminder.');
            return;
        }

        const newReminder = {
            id: Date.now(),
            text,
            time,
        };

        reminders.push(newReminder);
        renderReminders();
        reminderForm.reset();
    }

    remindersList.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-reminder-btn')) {
            const id = e.target.closest('.reminder-item').dataset.id;
            reminders = reminders.filter(reminder => reminder.id != id);
            renderReminders();
        }
    });

    function checkAlarms() {
        if (reminders.length === 0) return;

        const now = new Date();
        const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        const dueReminders = reminders.filter(r => r.time === currentTime);

        if (dueReminders.length > 0) {
            alarmSound.play().catch(err => console.error("Audio play failed:", err));
            dueReminders.forEach(due => {
                alert(`Reminder: ${due.text}`);
                // Remove the reminder after it has gone off
                reminders = reminders.filter(r => r.id !== due.id);
            });
            renderReminders();
        }
    }
    
    reminderForm.addEventListener('submit', addReminder);
    // Initial render
    renderReminders(); 
    // Check for alarms every 10 seconds to reduce load
    setInterval(checkAlarms, 10000); 

    // ------------------------------------

    function populateDashboard() {
        trackersGrid.innerHTML = '';
        for (const key in healthMetrics) {
            const metric = healthMetrics[key];
            const card = document.createElement('div');
            card.className = 'tracker-card';
            card.id = `card-${key}`;

            if (key === 'bmi') {
                 card.innerHTML = `
                    <h3>${metric.label}</h3>
                    <div class="tracker-value" id="bmi-value">--</div>
                    <p class="metric-status" id="bmi-status">Enter height and weight to calculate.</p>
                `;
            } else {
                card.innerHTML = `
                    <h3>${metric.label}</h3>
                    <div class="tracker-value">${metric.value || '--'} ${metric.unit}</div>
                    <input type="${metric.type || 'number'}" class="tracker-input" data-metric="${key}" value="" placeholder="${metric.type === 'text' ? 'e.g., 120/80' : 'Enter value...'}">
                    <p class="metric-status"></p>
                `;
            }
            trackersGrid.appendChild(card);
        }

        document.querySelectorAll('.tracker-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const metricKey = e.target.dataset.metric;
                const value = e.target.value;
                
                if (metricKey) {
                     if (healthMetrics[metricKey].type === 'number') {
                        healthMetrics[metricKey].value = value ? parseFloat(value) : null;
                     } else {
                        healthMetrics[metricKey].value = value || null;
                     }
                    
                    const valueDisplay = e.target.parentElement.querySelector('.tracker-value');
                    valueDisplay.textContent = `${healthMetrics[metricKey].value || '--'} ${healthMetrics[metricKey].unit}`;
                    updateOverallHealth();
                }
            });
        });
    }

    function calculateScore(value, min, max) {
        if (value === null || isNaN(value)) return 0;
        if (value >= min && value <= max) return 100;
        if (value < min) return Math.max(0, 100 - ((min - value) / min) * 100);
        return Math.max(0, 100 - ((value - max) / max) * 100);
    }
    
    function updateMetricCard(key, statusText, statusClass = '') {
        const card = document.getElementById(`card-${key}`);
        if (card) {
            const statusEl = card.querySelector('.metric-status');
            statusEl.textContent = statusText;
            statusEl.className = 'metric-status'; // Reset classes
            if (statusClass) {
                statusEl.classList.add(statusClass);
            }
        }
    }

    function updateOverallHealth() {
        let totalScore = 0;
        let totalWeight = 0;
        let metricsEntered = 0;

        // --- Individual Metric Scoring ---

        // 1. BMI
        const height = healthMetrics.height.value;
        const weight = healthMetrics.weight.value;
        let bmiScore = 0;
        if (height && weight && height > 0) {
            const heightInMeters = height / 100;
            const bmi = weight / (heightInMeters * heightInMeters);
            healthMetrics.bmi.value = bmi.toFixed(1);
            
            document.getElementById('bmi-value').textContent = healthMetrics.bmi.value;

            if (bmi < 18.5) {
                healthMetrics.bmi.status = 'Underweight';
                bmiScore = 75;
                updateMetricCard('bmi', 'Status: Underweight. Consider consulting a doctor for advice on healthy weight gain.', 'warn');
            } else if (bmi >= 18.5 && bmi <= 24.9) {
                healthMetrics.bmi.status = 'Healthy Weight';
                bmiScore = 100;
                 updateMetricCard('bmi', 'Status: Healthy Weight. Great job!', 'good');
            } else if (bmi >= 25 && bmi <= 29.9) {
                healthMetrics.bmi.status = 'Overweight';
                bmiScore = 75;
                updateMetricCard('bmi', 'Status: Overweight. Focus on a balanced diet and regular exercise.', 'warn');
            } else {
                healthMetrics.bmi.status = 'Obese';
                bmiScore = 50;
                 updateMetricCard('bmi', 'Status: Obese. It is highly recommended to consult a healthcare provider.', 'bad');
            }
        } else {
            healthMetrics.bmi.value = null;
            document.getElementById('bmi-value').textContent = '--';
            updateMetricCard('bmi', 'Enter height and weight to calculate.');
        }

        if(healthMetrics.bmi.value !== null) {
            totalScore += bmiScore * healthMetrics.weight.scoreWeight;
            totalWeight += healthMetrics.weight.scoreWeight;
            metricsEntered += 2; // Count height and weight
        }

        // 2. Hydration
        const hydrationTarget = healthMetrics.bmi.status === 'Overweight' || healthMetrics.bmi.status === 'Obese' ? 10 : 8;
        const hydrationValue = healthMetrics.hydration.value;
        updateMetricCard('hydration', `Recommended: ${hydrationTarget} glasses/day.`);
        if(hydrationValue !== null) {
            const hydrationScore = Math.min(100, (hydrationValue / hydrationTarget) * 100);
            totalScore += hydrationScore * healthMetrics.hydration.scoreWeight;
            totalWeight += healthMetrics.hydration.scoreWeight;
            metricsEntered++;
        }
        
        // 3. Heartbeat
        const { heartbeat } = healthMetrics;
        if(heartbeat.value !== null) {
            totalScore += calculateScore(heartbeat.value, heartbeat.idealMin, heartbeat.idealMax) * heartbeat.scoreWeight;
            totalWeight += heartbeat.scoreWeight;
            updateMetricCard('heartbeat', 'Ideal resting range: 60-100 bpm.');
            metricsEntered++;
        }

        // 4. Blood Pressure
        const { bloodPressure } = healthMetrics;
        let bpScore = 0;
        if(bloodPressure.value) {
            const parts = bloodPressure.value.split('/');
            if (parts.length === 2) {
                const systolic = parseInt(parts[0], 10);
                const diastolic = parseInt(parts[1], 10);
                if (!isNaN(systolic) && !isNaN(diastolic)) {
                    if (systolic < 120 && diastolic < 80) bpScore = 100;
                    else if (systolic <= 129 && diastolic < 80) bpScore = 80; // Elevated
                    else if (systolic <= 139 || diastolic <= 89) bpScore = 60; // Stage 1
                    else bpScore = 40; // Stage 2+
                }
            }
             updateMetricCard('bloodPressure', 'Ideal: < 120/80 mmHg.');
        }
         if(bloodPressure.value !== null) {
            totalScore += bpScore * bloodPressure.scoreWeight;
            totalWeight += bloodPressure.scoreWeight;
            metricsEntered++;
        }

        // 5. Sugar Level
        const { sugarLevel } = healthMetrics;
        if(sugarLevel.value !== null) {
            totalScore += calculateScore(sugarLevel.value, sugarLevel.idealMin, sugarLevel.idealMax) * sugarLevel.scoreWeight;
            totalWeight += sugarLevel.scoreWeight;
            updateMetricCard('sugarLevel', 'Ideal fasting range: 70-100 mg/dL.');
            metricsEntered++;
        }

        // 6. Sleep
        const { sleep } = healthMetrics;
         if(sleep.value !== null) {
            totalScore += calculateScore(sleep.value, sleep.idealMin, sleep.idealMax) * sleep.scoreWeight;
            totalWeight += sleep.scoreWeight;
            updateMetricCard('sleep', 'Ideal range: 7-9 hours/night.');
            metricsEntered++;
        }
        
        // --- Final Calculation ---
        const healthBarMessage = document.getElementById('health-bar-message');
        if (totalWeight === 0 || metricsEntered < 3) {
            healthBar.style.width = '0%';
            healthBarValue.textContent = 'Enter at least 3 metrics to see your score';
            healthBarMessage.textContent = '';
            return;
        }

        const healthPercentage = Math.round(totalScore / totalWeight);
        
        healthBar.style.width = `${healthPercentage}%`;
        healthBarValue.textContent = `Overall Score: ${healthPercentage}%`;

        if (healthPercentage >= 90) {
             healthBarMessage.textContent = "Excellent! You have a great daily routine.";
        } else if (healthPercentage >= 70) {
            healthBarMessage.textContent = "Good job! Keep up the healthy habits.";
        } else if (healthPercentage >= 50) {
            healthBarMessage.textContent = "You're on the right track. A few adjustments could make a big difference.";
        } else {
            healthBarMessage.textContent = "There's room for improvement. Let's focus on one or two areas to start.";
        }
    }
});
