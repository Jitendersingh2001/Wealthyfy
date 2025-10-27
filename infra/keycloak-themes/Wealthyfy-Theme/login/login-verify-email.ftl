<#import "layout.ftl" as layout>

<@layout.main pageTitle=msg("Verify Email")>
    <div class="container d-flex justify-content-center align-items-center">
        <div class="box">

            <!-- Header -->
            <div class="login-head text-center mb-4 mt-4">
                <h3 class="text-uppercase fw-bold mb-2">Verify Your Email</h3>
                <p class="text-muted mb-0">
                    We've sent a verification link to your registered email address. <br>
                    Please check your inbox and click the link to verify your account.
                </p>
            </div>

            <!-- Icon / Illustration (Optional) -->
            <div class="text-center my-4">
                <i class="bi bi-envelope-check text-primary" style="font-size: 3rem;" id="email-icon"></i>
            </div>

            <!-- Help Text -->
            <#-- <div class="text-center mb-4">
                <p class="text-muted small mb-0">
                    Didn't receive the email? <br>Check your spam folder or request a new verification link below.
                </p>
            </div> -->
            
            <!-- Info Alert -->
            <div class="alert alert-info d-flex align-items-center mb-3 text-center" role="alert" id="email-verify-info">
                <i class="bi bi-info-circle me-2"></i>
                <small class="mb-0"> Didn't receive the email? <br>Check your spam folder or request a new verification link below.</small>
            </div>

            <!-- Form (Resend Email) -->
            <form action="${url.loginAction}" method="post" class="pb-2" autocomplete="off">
                <input type="hidden" name="resend" value="true"/>

                <!-- Resend Button -->
                <button type="submit" class="btn btn-primary btn-lg w-100 mb-3">
                    <span class="button-text fw-semibold">Resend Verification Email</span>
                </button>

                <!-- Back to Login -->
                 <div class="d-flex justify-content-center align-items-center mb-3">
                    <a href="${url.loginUrl}" class="text-decoration-none">Back to Login</a>
                </div>
            </form>
        </div>
    </div>
</@layout.main>
