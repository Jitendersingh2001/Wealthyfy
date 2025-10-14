// Form Interactive Enhancements
document.addEventListener('DOMContentLoaded', function() {
    // Form elements
    const form = document.querySelector('form[action*="loginAction"]');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const submitButton = document.querySelector('button[type="submit"]');
    const rememberMeCheckbox = document.getElementById('rememberMe');

    // Add password toggle functionality
    addPasswordToggle();
    
    // Add input animations
    addInputAnimations();


    function addPasswordToggle() {
        if (!passwordInput) return;

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
        const passwordContainer = passwordInput.parentElement;
        passwordContainer.style.position = 'relative';

        // Insert toggle button
        passwordContainer.appendChild(toggleButton);

        // Toggle functionality
        toggleButton.addEventListener('click', function() {
            const icon = document.getElementById('password-toggle-icon');
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.className = 'fas fa-eye-slash';
                toggleButton.setAttribute('aria-label', 'Hide password');
            } else {
                passwordInput.type = 'password';
                icon.className = 'fas fa-eye';
                toggleButton.setAttribute('aria-label', 'Show password');
            }
        });
    }

    function addInputAnimations() {
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
