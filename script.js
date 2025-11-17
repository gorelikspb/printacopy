// Language switching
function setLanguage(lang) {
    if (!translations[lang]) {
        console.warn(`Language ${lang} not found, using 'ru'`);
        lang = 'ru';
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
}

// Check query parameter for language
const urlParams = new URLSearchParams(window.location.search);
const lang = urlParams.get('lang') || 'ru';
setLanguage(lang);

// Smooth scroll to section
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Handle print form submission
document.getElementById('print-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const city = document.getElementById('print-city').value;
    const email = document.getElementById('print-email').value;
    const file = document.getElementById('print-file').files[0];
    
    // Save to localStorage (for demo purposes)
    const printData = {
        city: city,
        email: email,
        fileName: file ? file.name : null,
        timestamp: new Date().toISOString()
    };
    
    // Get existing data or create new array
    let printSubmissions = JSON.parse(localStorage.getItem('printSubmissions') || '[]');
    printSubmissions.push(printData);
    localStorage.setItem('printSubmissions', JSON.stringify(printSubmissions));
    
    // Show success message
    const currentLang = urlParams.get('lang') || 'ru';
    const message = translations[currentLang].printSuccess
        .replace('{email}', email)
        .replace('{city}', city);
    alert(message);
    
    // Reset form
    this.reset();
});

// Handle printer form submission
document.getElementById('printer-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('printer-name').value;
    const email = document.getElementById('printer-email').value;
    const city = document.getElementById('printer-city').value;
    const hasColor = document.getElementById('printer-color').checked;
    
    // Save to localStorage (for demo purposes)
    const printerData = {
        name: name,
        email: email,
        city: city,
        hasColor: hasColor,
        timestamp: new Date().toISOString()
    };
    
    // Get existing data or create new array
    let printerSubmissions = JSON.parse(localStorage.getItem('printerSubmissions') || '[]');
    printerSubmissions.push(printerData);
    localStorage.setItem('printerSubmissions', JSON.stringify(printerSubmissions));
    
    // Show success message
    const currentLang = urlParams.get('lang') || 'ru';
    const message = translations[currentLang].printerSuccess
        .replace('{name}', name)
        .replace('{email}', email)
        .replace('{city}', city);
    alert(message);
    
    // Reset form
    this.reset();
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


