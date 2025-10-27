$(document).ready(function () {
    const $username = $('#username');
    const $submitBtn = $('button[type="submit"]');
    const $form = $('form');

    // Enable/disable button based on email field
    function toggleButton() {
        $submitBtn.prop('disabled', !$username.val().trim());
    }

    toggleButton();
    $username.on('input', toggleButton);

    // Validate and disable button on submit
    $form.on('submit', function (e) {
        const email = $username.val().trim();

        // Validate email format
        if (!AppConstants.REGEX.EMAIL.test(email)) {
            e.preventDefault();
            Toaster.show('Invalid email format. Please enter a valid email.', 'error');
            return;
        }

        // Disable button to prevent double submission
        $submitBtn.prop('disabled', true).addClass('disabled');
        $submitBtn.find('.button-text').text('Please wait...');
    });
});
