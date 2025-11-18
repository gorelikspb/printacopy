// Language switching
function setLanguage(lang) {
    if (!translations[lang]) {
        console.warn(`Language ${lang} not found, using 'de'`);
        lang = 'de';
    }
    
    const texts = translations[lang];
    
    // Update text content
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (texts[key]) {
            el.textContent = texts[key];
        }
    });
    
    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (texts[key]) {
            el.placeholder = texts[key];
        }
    });
    
    // Update file label default text
    const fileLabel = document.querySelector('.file-label-text');
    if (fileLabel && !document.getElementById('print-file').files[0]) {
        fileLabel.textContent = texts.printFileLabel;
    }
    
    // Update HTML lang attribute
    document.documentElement.lang = lang;
    
    // Update page title
    if (texts.pageTitle) {
        document.title = texts.pageTitle;
    }
    
    // Update language select
    const langSelect = document.getElementById('language-select');
    if (langSelect) {
        langSelect.value = lang;
    }
    
    // Save to localStorage
    localStorage.setItem('preferredLanguage', lang);
    
    // Update URL without reload
    const url = new URL(window.location);
    url.searchParams.set('lang', lang);
    window.history.replaceState({}, '', url);
}

// Switch language (called from button click)
function switchLanguage(lang) {
    setLanguage(lang);
}

// Get URL parameters (global, used in multiple places)
const urlParams = new URLSearchParams(window.location.search);

// Auto-detect language
function detectLanguage() {
    // 1. Check URL parameter first (highest priority)
    const urlLang = urlParams.get('lang');
    if (urlLang && translations[urlLang]) {
        return urlLang;
    }
    
    // 2. Check saved preference
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang && translations[savedLang]) {
        return savedLang;
    }
    
    // 3. Check browser language
    const browserLang = navigator.language || navigator.userLanguage;
    const browserLangCode = browserLang.split('-')[0].toLowerCase();
    
    // Map browser language to our supported languages
    if (browserLangCode === 'de' || browserLangCode === 'de-ch' || browserLangCode === 'de-at') {
        return 'de';
    } else if (browserLangCode === 'en' || browserLangCode === 'en-us' || browserLangCode === 'en-gb') {
        return 'en';
    } else if (browserLangCode === 'ru' || browserLangCode === 'ru-ru') {
        return 'ru';
    }
    
    // 4. Try to detect by IP (optional, async)
    detectLanguageByIP().then(ipLang => {
        if (ipLang && translations[ipLang]) {
            // Only use IP detection if no other method worked
            if (!urlLang && !savedLang && !['de', 'en', 'ru'].includes(browserLangCode)) {
                setLanguage(ipLang);
            }
        }
    }).catch(() => {
        // Ignore IP detection errors
    });
    
    // 5. Default to German
    return 'de';
}

// Detect language by IP (optional, uses free API)
async function detectLanguageByIP() {
    try {
        // Using ipapi.co (free, no API key needed, 1000 requests/day)
        const response = await fetch('https://ipapi.co/json/', {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error('IP detection failed');
        }
        
        const data = await response.json();
        const countryCode = data.country_code?.toLowerCase();
        
        // Map countries to languages
        // German-speaking countries
        if (['de', 'at', 'ch', 'li', 'lu'].includes(countryCode)) {
            return 'de';
        }
        // English-speaking countries (major ones)
        if (['us', 'gb', 'ie', 'au', 'nz', 'ca'].includes(countryCode)) {
            return 'en';
        }
        // Russian-speaking countries
        if (['ru', 'by', 'kz', 'kg', 'tj', 'uz', 'tm', 'md', 'ua'].includes(countryCode)) {
            return 'ru';
        }
        
        // Default to German for other countries
        return 'de';
    } catch (error) {
        console.log('IP detection not available, using default');
        return 'de';
    }
}

// Initialize cities autocomplete
function initCitiesAutocomplete() {
    const citiesList = document.getElementById('cities-list');
    cities.forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        citiesList.appendChild(option);
    });
    
    // Set default city to Konstanz
    document.getElementById('print-city').value = 'Konstanz';
    document.getElementById('printer-city').value = 'Konstanz';
}

// Initialize everything when DOM is ready
function initApp() {
    // Auto-detect and set language
    const detectedLang = detectLanguage();
    setLanguage(detectedLang);
    
    // Initialize cities autocomplete
    initCitiesAutocomplete();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// EmailJS removed - using Cloudflare Worker instead

// Smooth scroll to section
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Handle print form submission
document.getElementById('print-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const city = document.getElementById('print-city').value;
    const email = document.getElementById('print-email').value;
    const file = document.getElementById('print-file').files[0];
    const submitButton = this.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    
    // Disable button during submission
    submitButton.disabled = true;
    submitButton.textContent = 'Отправка...';
    
    // Save to localStorage (for backup)
    const printData = {
        city: city,
        email: email,
        fileName: file ? file.name : null,
        timestamp: new Date().toISOString()
    };
    
    let printSubmissions = JSON.parse(localStorage.getItem('printSubmissions') || '[]');
    printSubmissions.push(printData);
    localStorage.setItem('printSubmissions', JSON.stringify(printSubmissions));
    
    // Send email via Cloudflare Worker
    const workerUrl = 'https://printacopy.gorelikgo.workers.dev';
    const currentLang = urlParams.get('lang') || 'ru';
    
    console.log('Отправка формы:', { type: 'user', email, city, fileName: file ? file.name : null });
    
    try {
        console.log('Отправка запроса на:', workerUrl);
        const response = await fetch(workerUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'user',
                email: email,
                city: city,
                fileName: file ? file.name : null
            })
        });
        
        console.log('Ответ получен, статус:', response.status);
        const result = await response.json();
        console.log('Результат:', result);
        
        // Re-enable button
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
        
        if (result.success) {
            // Show success message
            const message = translations[currentLang].printSuccess
                .replace('{email}', email)
                .replace('{city}', city);
            console.log('Успешно! Показываю сообщение:', message);
            alert(message);
        } else {
            console.error('Ошибка в ответе:', result);
            alert('Ошибка отправки. Попробуй ещё раз.');
        }
    } catch (error) {
        console.error('Ошибка отправки:', error);
        console.error('Детали ошибки:', error.message, error.stack);
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
        alert('Ошибка отправки. Попробуй ещё раз. Проверь консоль (F12) для деталей.');
    }
    
    // Reset form (keep default city)
    this.reset();
    document.getElementById('print-city').value = 'Konstanz';
});

// Handle printer form submission
document.getElementById('printer-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const name = document.getElementById('printer-name').value;
    const email = document.getElementById('printer-email').value;
    const city = document.getElementById('printer-city').value;
    const hasColor = document.getElementById('printer-color').checked;
    const submitButton = this.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    
    // Disable button during submission
    submitButton.disabled = true;
    submitButton.textContent = 'Отправка...';
    
    // Save to localStorage (for backup)
    const printerData = {
        name: name,
        email: email,
        city: city,
        hasColor: hasColor,
        timestamp: new Date().toISOString()
    };
    
    let printerSubmissions = JSON.parse(localStorage.getItem('printerSubmissions') || '[]');
    printerSubmissions.push(printerData);
    localStorage.setItem('printerSubmissions', JSON.stringify(printerSubmissions));
    
    // Send email via Cloudflare Worker
    const workerUrl = 'https://printacopy.gorelikgo.workers.dev';
    const currentLang = urlParams.get('lang') || 'ru';
    
    console.log('Отправка формы:', { type: 'printer', name, email, city, hasColor });
    
    try {
        console.log('Отправка запроса на:', workerUrl);
        const response = await fetch(workerUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'printer',
                name: name,
                email: email,
                city: city,
                hasColor: hasColor
            })
        });
        
        console.log('Ответ получен, статус:', response.status);
        const result = await response.json();
        console.log('Результат:', result);
        
        // Re-enable button
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
        
        if (result.success) {
            // Show success message
            const message = translations[currentLang].printerSuccess
                .replace('{name}', name)
                .replace('{email}', email)
                .replace('{city}', city);
            console.log('Успешно! Показываю сообщение:', message);
            alert(message);
        } else {
            console.error('Ошибка в ответе:', result);
            alert('Ошибка отправки. Попробуй ещё раз.');
        }
    } catch (error) {
        console.error('Ошибка отправки:', error);
        console.error('Детали ошибки:', error.message, error.stack);
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
        alert('Ошибка отправки. Попробуй ещё раз. Проверь консоль (F12) для деталей.');
    }
    
    // Reset form (keep default city)
    this.reset();
    document.getElementById('printer-city').value = 'Konstanz';
});

// File input label update
document.getElementById('print-file').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const label = document.querySelector('.file-label-text');
    const currentLang = urlParams.get('lang') || 'ru';
    if (file) {
        label.textContent = `📎 ${file.name}`;
    } else {
        label.textContent = translations[currentLang].printFileLabel;
    }
});

// EmailJS removed - using Cloudflare Worker instead


