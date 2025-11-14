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
    alert(`Спасибо! Мы сообщим тебе на ${email}, когда появятся принтеры в ${city}.`);
    
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
    alert(`Спасибо, ${name}! Мы свяжемся с тобой на ${email}, когда появятся первые заявки в ${city}.`);
    
    // Reset form
    this.reset();
});

// File input label update
document.getElementById('print-file').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const label = document.querySelector('.file-label-text');
    if (file) {
        label.textContent = `📎 ${file.name}`;
    } else {
        label.textContent = '📎 Загрузить тестовый документ (опционально)';
    }
});


