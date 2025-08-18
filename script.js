document.addEventListener('DOMContentLoaded', () => {
    const registrationSection = document.getElementById('registration-section');
    const dashboardSection = document.getElementById('dashboard-section');
    const registrationForm = document.getElementById('registration-form');
    const userNameSpan = document.getElementById('user-name');
    const trackersGrid = document.querySelector('.trackers-grid');
    const healthBar = document.getElementById('health-bar');
    const healthBarValue = document.getElementById('health-bar-value');

    const healthMetrics = {
        height: { label: 'Height', value: 170, unit: 'cm', max: 220, weight: 0.5 },
        weight: { label: 'Weight', value: 70, unit: 'kg', max: 150, weight: 1.5 },
        hydration: { label: 'Hydration', value: 8, unit: 'glasses', max: 12, weight: 1 },
        heartbeat: { label: 'Heartbeat', value: 70, unit: 'bpm', max: 120, weight: 1.5 },
        bloodPressure: { label: 'Blood Pressure', value: '120/80', unit: 'mmHg', weight: 1.5, type: 'text' },
        sugarLevel: { label: 'Sugar Level', value: 90, unit: 'mg/dL', max: 140, weight: 1.5 },
        sleep: { label: 'Sleep Schedule', value: 8, unit: 'hours', max: 10, weight: 1.5 }
    };

    registrationForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        userNameSpan.textContent = name;

        registrationSection.classList.add('hidden');
        dashboardSection.classList.remove('hidden');

        populateDashboard();
        updateOverallHealth();
    });

    function populateDashboard() {
        trackersGrid.innerHTML = '';
        for (const key in healthMetrics) {
            const metric = healthMetrics[key];
            const card = document.createElement('div');
            card.className = 'tracker-card';
            card.innerHTML = `
                <h3>${metric.label}</h3>
                <div class="tracker-value">${metric.value} ${metric.unit}</div>
                <input type="${metric.type || 'number'}" class="tracker-input" data-metric="${key}" value="${metric.value}" placeholder="Update value...">
            `;
            trackersGrid.appendChild(card);
        }

        document.querySelectorAll('.tracker-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const metricKey = e.target.dataset.metric;
                const newValue = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;
                
                if (!isNaN(newValue) || e.target.type === 'text') {
                    healthMetrics[metricKey].value = newValue;
                    e.target.previousElementSibling.textContent = `${newValue} ${healthMetrics[metricKey].unit}`;
                    updateOverallHealth();
                }
            });
        });
    }

    function updateOverallHealth() {
        let totalScore = 0;
        let totalWeight = 0;

        for (const key in healthMetrics) {
            const metric = healthMetrics[key];
            if (metric.type !== 'text') {
                 // Simple normalization: value / max * 100
                 // In a real app, this would be more complex (e.g., ideal ranges)
                const score = (metric.value / metric.max) * 100;
                totalScore += score * metric.weight;
                totalWeight += metric.weight;
            }
        }
        
        const healthPercentage = Math.min(100, Math.max(0, totalScore / totalWeight));
        
        healthBar.style.width = `${healthPercentage}%`;
        healthBarValue.textContent = `${Math.round(healthPercentage)}%`;
    }

});

