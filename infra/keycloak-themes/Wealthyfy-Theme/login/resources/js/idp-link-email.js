$(document).ready(function () {
    const $form = $('form');
    const $resendBtn = $('#resend-btn'); // The resend button
    const $buttonText = $resendBtn.find('.button-text');

    // Check if we should show a success message after page reload
    if (window.sessionStorage.getItem('idpEmailSent') === 'true') {
        // Clear the flag
        window.sessionStorage.removeItem('idpEmailSent');
        
        // Show success toast
        Toaster.show('Verification email has been sent successfully!', 'success');
    }
    
    // Handle resend button click
    $resendBtn.on('click', function(e) {
        // Set flag to show success message after reload
        window.sessionStorage.setItem('idpEmailSent', 'true');
        
        // Show loading state immediately
        $buttonText.text('Sending...');
        // Don't disable - let the form submit normally
    });
    
    // Handle form submit to disable button after form submits
    $form.on('submit', function() {
        $resendBtn.prop('disabled', true);
    });
});
