<#-- login-reset-password.ftl -->
<#import "layout.ftl" as layout>

<@layout.main pageTitle=msg("Forget Password")>
    <div class="login-container d-flex justify-content-center align-items-center">
        <div class="login-box">

            <!-- Header -->
            <div class="login-head text-center mb-3">
                <h3 class="text-uppercase fw-bold">Forgot Password</h3>
                <p class="mb-0 text-muted">
                    Enter your registered email address to reset your password
                </p>
            </div>

            <!-- Form -->
            <form action="${url.loginAction}" method="post" class="pb-2" autocomplete="off">

                <!-- Email Field -->
                <div class="form-group mb-3">
                    <label for="username" class="form-label">
                        Email <span class="text-danger">*</span>
                    </label>
                    <input
                        type="email"
                        class="form-control"
                        id="username"
                        name="username"
                        value="${username?if_exists}"
                        placeholder="Enter your email address"
                        aria-describedby="username-help"
                        required
                        autocomplete="off"
                    />
                </div>

                <!-- Back to Login -->
                <div class="d-flex justify-content-end align-items-center mb-3">
                    <a href="${url.loginUrl}" class="text-decoration-none">Back to Login</a>
                </div>

                <!-- Submit Button -->
                <button type="submit" class="btn btn-primary w-100">
                    <span class="button-text">Continue</span>
                </button>

            </form>
        </div>
    </div>
</@layout.main>
            <@layout.scripts>
                <script src="${url.resourcesPath}/js/forget-password.js"></script>
            </@layout.scripts>