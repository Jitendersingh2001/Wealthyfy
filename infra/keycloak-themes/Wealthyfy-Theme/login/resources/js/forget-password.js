$(document).ready(function () {
    const $username = $('#username');
    const $submitBtn = $('button[type="submit"]');

    // Enable/disable button based on input
    function toggleButton() {
        $submitBtn.prop('disabled', !$username.val().trim());
    }

    toggleButton();
    $username.on('input', toggleButton);

    // Validate email on form submit
    $('form').on('submit', function (e) {
        const email = $username.val().trim();

        if (!AppConstants.REGEX.EMAIL.test(email)) {
            e.preventDefault();
            Toaster.show('Invalid email format. Please enter a valid email.', 'error');
        }
    });
});