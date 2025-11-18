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

// Check query parameter for language
const urlParams = new URLSearchParams(window.location.search);
const lang = urlParams.get('lang') || 'ru';
setLanguage(lang);

// Initialize cities when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCitiesAutocomplete);
} else {
    initCitiesAutocomplete();
}

// Initialize EmailJS
function initEmailJS() {
    if (typeof emailjs !== 'undefined' && EMAILJS_CONFIG.publicKey !== 'YOUR_PUBLIC_KEY') {
        emailjs.init(EMAILJS_CONFIG.publicKey);
    }
}

// Send email via EmailJS
async function sendEmail(templateId, templateParams) {
    if (EMAILJS_CONFIG.publicKey === 'YOUR_PUBLIC_KEY') {
        console.warn('EmailJS не настроен. Заполни emailjs-config.js');
        return { success: false, error: 'EmailJS not configured' };
    }
    
    try {
        const response = await emailjs.send(
            EMAILJS_CONFIG.serviceId,
            templateId,
            templateParams
        );
        return { success: true, response };
    } catch (error) {
        console.error('Ошибка отправки email:', error);
        return { success: false, error };
    }
}

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
    
    // Send emails via EmailJS
    const currentLang = urlParams.get('lang') || 'ru';
    
    // 1. Send confirmation to user
    const userEmailResult = await sendEmail(EMAILJS_CONFIG.templates.printConfirmation, {
        to_email: email,
        to_name: email.split('@')[0],
        city: city,
        language: currentLang,
        reply_to: EMAILJS_CONFIG.adminEmail
    });
    
    // 2. Send notification to admin
    const adminEmailResult = await sendEmail(EMAILJS_CONFIG.templates.adminPrintNotification, {
        to_email: EMAILJS_CONFIG.adminEmail,
        user_email: email,
        city: city,
        has_file: file ? 'Да' : 'Нет',
        file_name: file ? file.name : 'Нет файла',
        timestamp: new Date().toLocaleString('ru-RU')
    });
    
    // Re-enable button
    submitButton.disabled = false;
    submitButton.textContent = originalButtonText;
    
    // Show success message
    const message = translations[currentLang].printSuccess
        .replace('{email}', email)
        .replace('{city}', city);
    alert(message);
    
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
    
    // Send emails via EmailJS
    const currentLang = urlParams.get('lang') || 'ru';
    
    // 1. Send confirmation to printer owner
    const userEmailResult = await sendEmail(EMAILJS_CONFIG.templates.printerConfirmation, {
        to_email: email,
        to_name: name,
        city: city,
        has_color_printer: hasColor ? 'Да' : 'Нет',
        language: currentLang,
        reply_to: EMAILJS_CONFIG.adminEmail
    });
    
    // 2. Send notification to admin
    const adminEmailResult = await sendEmail(EMAILJS_CONFIG.templates.adminPrinterNotification, {
        to_email: EMAILJS_CONFIG.adminEmail,
        printer_name: name,
        printer_email: email,
        city: city,
        has_color_printer: hasColor ? 'Да' : 'Нет',
        timestamp: new Date().toLocaleString('ru-RU')
    });
    
    // Re-enable button
    submitButton.disabled = false;
    submitButton.textContent = originalButtonText;
    
    // Show success message
    const message = translations[currentLang].printerSuccess
        .replace('{name}', name)
        .replace('{email}', email)
        .replace('{city}', city);
    alert(message);
    
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

// Initialize EmailJS when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEmailJS);
} else {
    initEmailJS();
}


