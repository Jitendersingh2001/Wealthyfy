// /assets/js/toaster.js
const Toaster = (() => {
    /**
     * Show a toast message
     * @param {string} message - The message to display
     * @param {string} type - success, info, warning, error
     */
    function show(message, type = 'error') {
        const bgColor = {
            success: '#399918', // green
            info: '#093FB4',    // blue
            warning: '#FEB21A', // yellow
            error: '#DD0303'    // red
        }[type] || '#dc3545';

        $.toast({
            text: message,
            position: 'bottom-right',
            hideAfter: 3000,
            loader: false,
            stack: false,
            allowToastClose: false,
            showHideTransition: 'slide',
            bgColor: bgColor,
        });
    }

    return { show };
})();
