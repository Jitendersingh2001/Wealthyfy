$(document).ready(function () {
    const $username = $('#username');
    const $password = $('#password');
    const $loginBtn = $('button[type="submit"]');
    const $buttonText = $loginBtn.find('.button-text');

    // Toggle login button
    function toggleLoginButton() {
        const isEnabled = $username.val().trim() && $password.val().trim();
        $loginBtn.prop('disabled', !isEnabled);
    }

    toggleLoginButton();

    $username.on('input', toggleLoginButton);
    $password.on('input', toggleLoginButton);

    // Form submit validation and button state
    $('form').on('submit', function (e) {
        const email = $username.val().trim();

        // Validate email format before proceeding
        if (!AppConstants.REGEX.EMAIL.test(email)) {
            e.preventDefault();
            Toaster.show('Invalid email format. Please enter a valid email.', 'error');
            return;
        }

        // Disable button and show loading text
        $loginBtn.prop('disabled', true);
        $buttonText.text('Logging in...');
    });
});
