$(document).ready(function () {
    const $email = $('#email');
    const $firstName = $('#firstName');
    const $lastName = $('#lastName');
    const $password = $('#password');
    const $confirmPassword = $('#password-confirm');
    const $registerBtn = $('button[type="submit"]');
    const $buttonText = $registerBtn.find('.button-text');

    /**
     * Toggles the Register button based on field completeness.
     */
    function toggleRegisterButton() {
        const allFilled = $email.val().trim() &&
                          $firstName.val().trim() &&
                          $lastName.val().trim() &&
                          $password.val().trim() &&
                          $confirmPassword.val().trim();

        $registerBtn.prop('disabled', !allFilled);
    }

    /**
     * Validates form fields before submission.
     */
    function validateForm(e) {
        const email = $email.val().trim();

        // Email validation
        if (!AppConstants.REGEX.EMAIL.test(email)) {
            e.preventDefault();
            Toaster.show('Invalid email format. Please enter a valid email.', 'error');
            return;
        }

        // All validations passed — show loading state
        showLoadingState();
    }

    /**
     * Displays a loading state to prevent double submissions.
     */
    function showLoadingState() {
        $registerBtn.prop('disabled', true);
        $buttonText.text('Registering...');
    }

    // Initial button state
    toggleRegisterButton();

    // Listen to input events
    $email.on('input', toggleRegisterButton);
    $firstName.on('input', toggleRegisterButton);
    $lastName.on('input', toggleRegisterButton);
    $password.on('input', toggleRegisterButton);
    $confirmPassword.on('input', toggleRegisterButton);

    // Form submit
    $('form').on('submit', validateForm);
});
