document.addEventListener("DOMContentLoaded", function () {
    toastr.options = {
        positionClass: "toast-bottom-right",
    };
    const form = document.getElementById("kc-form-login");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");

    // Regex patterns
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

    form.addEventListener("submit", function (event) {
        let hasError = false;

        // Email validation
        if (!usernameInput.value.trim()) {
            toastr.error("Email is required.");
            hasError = true;
        } else if (!emailRegex.test(usernameInput.value.trim())) {
            toastr.error("Please enter a valid email address.");
            hasError = true;
        }
        
        // Password validation
        if (!passwordInput.value.trim()) {
            toastr.error("Password is required.");
            hasError = true;
        } else if (!passwordRegex.test(passwordInput.value.trim())) {
            toastr.error("Password must be at least 8 characters, include uppercase, lowercase, number, and special character.");
            hasError = true;
        }

        // Prevent form submission if there are errors
        if (hasError) {
            event.preventDefault();
            document.getElementById("kc-login").disabled = false;
        }
    });
});
