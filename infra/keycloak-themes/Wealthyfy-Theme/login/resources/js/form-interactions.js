// Form Interactive Enhancements
document.addEventListener('DOMContentLoaded', function() {
    // Form elements
    const form = document.querySelector('form[action*="loginAction"]');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const newPasswordInput = document.getElementById('password-new');
    const confirmPasswordInput = document.getElementById('password-confirm');
    const submitButton = document.querySelector('button[type="submit"]');
    const rememberMeCheckbox = document.getElementById('rememberMe');

    // Add password toggle functionality
    addPasswordToggle(passwordInput);
    addPasswordToggle(newPasswordInput);
    addPasswordToggle(confirmPasswordInput);
    
    // Add input animations
    addInputAnimations();


    function addPasswordToggle(inputField) {
        if (!inputField) return;

        // Create toggle button
        const toggleButton = document.createElement('button');
        toggleButton.type = 'button';
        toggleButton.className = 'btn btn-link position-absolute pe-3';
        toggleButton.style.border = 'none';
        toggleButton.style.background = 'none';
        toggleButton.style.zIndex = '10';
        toggleButton.style.right = '0';
        toggleButton.style.top = '68%';
        toggleButton.style.transform = 'translateY(-50%)';
        toggleButton.innerHTML = '<i class="fas fa-eye" id="password-toggle-icon"></i>';
        toggleButton.setAttribute('aria-label', 'Toggle password visibility');

        // Add relative positioning to password container
        const passwordContainer = inputField.parentElement;
        passwordContainer.style.position = 'relative';

        // Insert toggle button
        passwordContainer.appendChild(toggleButton);

        // Toggle functionality
        toggleButton.addEventListener('click', function() {
            const icon = document.getElementById('password-toggle-icon');
            if (inputField.type === 'password') {
                inputField.type = 'text';
                icon.className = 'fas fa-eye-slash';
                toggleButton.setAttribute('aria-label', 'Hide password');
            } else {
                inputField.type = 'password';
                icon.className = 'fas fa-eye';
                toggleButton.setAttribute('aria-label', 'Show password');
            }
        });
    }

    function addInputAnimations(inputField) {
        [usernameInput, passwordInput].forEach(input => {
            if (!input) return;

            // Focus animations
            input.addEventListener('focus', function() {
                this.parentElement.classList.add('focused');
            });

            input.addEventListener('blur', function() {
                this.parentElement.classList.remove('focused');
                if (this.value.trim()) {
                    this.parentElement.classList.add('filled');
                } else {
                    this.parentElement.classList.remove('filled');
                }
            });

            // Check if field has value on load
            if (input.value.trim()) {
                input.parentElement.classList.add('filled');
            }
        });
    }
});
