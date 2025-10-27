$(document).ready(function () {
    const $username = $('#username');
    const $password = $('#password');
    const $loginBtn = $('button[type="submit"]');

    // Toggle login button
    function toggleLoginButton() {
        $loginBtn.prop('disabled', !($username.val().trim() && $password.val().trim()));
    }

    toggleLoginButton();

    $username.on('input', toggleLoginButton);
    $password.on('input', toggleLoginButton);

    // Form submit validation
    $('form').on('submit', function (e) {
        const email = $username.val().trim();

        if (!AppConstants.REGEX.EMAIL.test(email)) {
            e.preventDefault();
            Toaster.show('Invalid email format. Please enter a valid email.', 'error');
        }
    });
});
