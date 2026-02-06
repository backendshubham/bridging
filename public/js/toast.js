// Modern Toast Notification System

class ToastManager {
    constructor() {
        this.container = null;
        this.init();
    }

    init() {
        // Create toast container if it doesn't exist
        if (!document.getElementById('toast-container')) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        } else {
            this.container = document.getElementById('toast-container');
        }
    }

    show(message, type = 'info', title = null, duration = 5000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };

        const titles = {
            success: 'Success',
            error: 'Error',
            warning: 'Warning',
            info: 'Information'
        };

        toast.innerHTML = `
            <div class="toast-icon">${icons[type] || icons.info}</div>
            <div class="toast-content">
                ${title ? `<div class="toast-title">${title}</div>` : ''}
                <div class="toast-message">${message}</div>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">×</button>
            <div class="toast-progress"></div>
        `;

        this.container.appendChild(toast);

        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => {
                this.remove(toast);
            }, duration);
        }

        return toast;
    }

    remove(toast) {
        toast.classList.add('hiding');
        setTimeout(() => {
            if (toast.parentElement) {
                toast.parentElement.removeChild(toast);
            }
        }, 300);
    }

    success(message, title = 'Success', duration = 5000) {
        return this.show(message, 'success', title, duration);
    }

    error(message, title = 'Error', duration = 5000) {
        return this.show(message, 'error', title, duration);
    }

    warning(message, title = 'Warning', duration = 5000) {
        return this.show(message, 'warning', title, duration);
    }

    info(message, title = 'Information', duration = 5000) {
        return this.show(message, 'info', title, duration);
    }
}

// Initialize toast manager
const toast = new ToastManager();

// Make it globally available
window.toast = toast;

// Auto-show flash messages from server
document.addEventListener('DOMContentLoaded', function() {
    // Check for success messages
    const successMessages = document.querySelectorAll('.alert-success');
    successMessages.forEach(alert => {
        toast.success(alert.textContent.trim());
        alert.style.display = 'none';
    });

    // Check for error messages
    const errorMessages = document.querySelectorAll('.alert-error');
    errorMessages.forEach(alert => {
        toast.error(alert.textContent.trim());
        alert.style.display = 'none';
    });

    // Check for warning messages
    const warningMessages = document.querySelectorAll('.alert-warning');
    warningMessages.forEach(alert => {
        toast.warning(alert.textContent.trim());
        alert.style.display = 'none';
    });

    // Check for info messages
    const infoMessages = document.querySelectorAll('.alert-info');
    infoMessages.forEach(alert => {
        toast.info(alert.textContent.trim());
        alert.style.display = 'none';
    });
});

