$(document).ready(function () {
    const $passwordNew = $('#password-new');
    const $passwordConfirm = $('#password-confirm');
    const $submitBtn = $('button[type="submit"]');
    const $form = $('#update-password-form');

    /**
     * Enable/disable button dynamically based on field values.
     */
    function toggleButton() {
        const newPwd = $passwordNew.val().trim();
        const confirmPwd = $passwordConfirm.val().trim();
        $submitBtn.prop('disabled', !(newPwd && confirmPwd));
    }

    toggleButton();

    // Enable button only when both inputs have values
    $passwordNew.on('input', toggleButton);
    $passwordConfirm.on('input', toggleButton);

    /**
     * Validate password match and disable button on submit.
     */
    $form.on('submit', function (e) {
        // Disable button to prevent double submissions
        $submitBtn.prop('disabled', true).addClass('disabled');
        $submitBtn.find('.button-text').text('Updating...');
    });
});
