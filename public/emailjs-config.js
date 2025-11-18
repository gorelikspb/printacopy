// EmailJS Configuration
// ЗАПОЛНИ ЭТИ ЗНАЧЕНИЯ после регистрации на https://www.emailjs.com
// Инструкция: см. instructions/EMAIL_SETUP.md
// Быстрый старт: см. instructions/EMAILJS_QUICK_START.md
//
// ⚠️ ВАЖНО: Public Key безопасно хранить в клиентском коде - он специально
// предназначен для использования в браузере. EmailJS ограничивает количество
// отправок через этот ключ.

const EMAILJS_CONFIG = {
    // Public Key - найди в Dashboard > Account > General
    // Это публичный ключ, его можно хранить в коде
    publicKey: 'YOUR_PUBLIC_KEY',
    
    // Service ID - найди в Dashboard > Email Services
    serviceId: 'YOUR_SERVICE_ID',
    
    // Template IDs - найди в Dashboard > Email Templates
    templates: {
        // Шаблон для подтверждения пользователю (форма "Мне нужно печатать")
        printConfirmation: 'YOUR_PRINT_CONFIRMATION_TEMPLATE_ID',
        
        // Шаблон для подтверждения принтера (форма "У меня есть принтер")
        printerConfirmation: 'YOUR_PRINTER_CONFIRMATION_TEMPLATE_ID',
        
        // Шаблон для уведомления администратору (новая регистрация пользователя)
        adminPrintNotification: 'YOUR_ADMIN_PRINT_NOTIFICATION_TEMPLATE_ID',
        
        // Шаблон для уведомления администратору (новая регистрация принтера)
        adminPrinterNotification: 'YOUR_ADMIN_PRINTER_NOTIFICATION_TEMPLATE_ID'
    },
    
    // Email администратора (твой email для получения уведомлений)
    adminEmail: 'YOUR_ADMIN_EMAIL@example.com'
};

