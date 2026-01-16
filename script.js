// Get the slider and items
const slider = document.querySelector('.banner .slider');
const items = Array.from(document.querySelectorAll('.banner .slider .item'));

// New behavior: require selecting ALL images (any order) to trigger login
const requiredCount = items.length;
const selectedSet = new Set();

items.forEach((item, index) => {
    item.style.cursor = 'pointer';

    // Stop animation when hovering over an image and show number
    item.addEventListener('mouseenter', function() {
        slider.style.animationPlayState = 'paused';
        this.style.filter = 'brightness(1.2)';

        const numberLabel = document.createElement('div');
        numberLabel.className = 'sequence-label';
        numberLabel.textContent = index + 1;
        numberLabel.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 10px 15px;
            border-radius: 5px;
            font-size: 18px;
            font-weight: bold;
            z-index: 10;
            pointer-events: none;
        `;
        this.appendChild(numberLabel);
    });

    // Resume animation when leaving the image
    item.addEventListener('mouseleave', function() {
        const label = this.querySelector('.sequence-label');
        if (label) label.remove();
        // Keep selected items highlighted; otherwise restore
        if (!this.classList.contains('selected')) {
            slider.style.animationPlayState = 'running';
            this.style.filter = 'brightness(1)';
        }
    });

    // Handle click: toggle selection
    item.addEventListener('click', function() {
        const itemNumber = index + 1;

        if (selectedSet.has(itemNumber)) {
            // deselect
            selectedSet.delete(itemNumber);
            this.classList.remove('selected');
            this.style.filter = 'brightness(1)';
        } else {
            // select
            selectedSet.add(itemNumber);
            this.classList.add('selected');
            this.style.filter = 'brightness(1.2)';
        }

        console.log('Selected items:', [...selectedSet]);

        // If all required items selected, trigger login
        if (selectedSet.size === requiredCount) {
            console.log('All items selected! Triggering login...');
            triggerLogin();
            // reset selections after login is shown
            selectedSet.clear();
            items.forEach(it => { it.classList.remove('selected'); it.style.filter = 'brightness(1)'; });
        }

        // click animation
        this.style.transform += ' scale(0.95)';
        setTimeout(() => {
            this.style.transform = this.style.transform.replace(' scale(0.95)', '');
        }, 200);
    });
});

// Function to trigger login page
function triggerLogin() {
    // Create a simple login overlay
    const loginOverlay = document.createElement('div');
    loginOverlay.id = 'login-overlay';
    loginOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
    `;
    
    const loginBox = document.createElement('div');
    loginBox.style.cssText = `
        background: white;
        padding: 40px;
        border-radius: 10px;
        box-shadow: 0 0 30px rgba(0, 0, 0, 0.3);
        text-align: center;
        max-width: 400px;
    `;
    
    loginBox.innerHTML = `
        <h2 style="color: #25283B; margin-bottom: 20px;">Login Access</h2>
        <p style="color: #666; margin-bottom: 30px;">You have entered the correct sequence!</p>
        <input type="text" placeholder="Username" style="width: 100%; padding: 10px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 5px;">
        <input type="password" placeholder="Password" style="width: 100%; padding: 10px; margin-bottom: 20px; border: 1px solid #ddd; border-radius: 5px;">
        <button onclick="submitLogin()" style="width: 100%; padding: 10px; background: #25283B; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">Login</button>
        <button onclick="closeLogin()" style="width: 100%; padding: 10px; margin-top: 10px; background: #ccc; color: #333; border: none; border-radius: 5px; cursor: pointer;">Close</button>
    `;
    
    loginOverlay.appendChild(loginBox);
    document.body.appendChild(loginOverlay);
}

// Function to close login
function closeLogin() {
    const loginOverlay = document.getElementById('login-overlay');
    if (loginOverlay) {
        loginOverlay.remove();
    }
}

// Function to submit login
function submitLogin() {
    // Redirect to dashboard
    window.location.href = 'dashboard.html';
}

// Register service worker for PWA (installable + offline support)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then(reg => console.log('Service Worker registered:', reg.scope))
            .catch(err => console.warn('SW registration failed:', err));
    });
}
