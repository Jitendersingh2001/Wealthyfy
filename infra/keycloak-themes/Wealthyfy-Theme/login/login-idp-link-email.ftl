<#import "layout.ftl" as layout>

<@layout.main pageTitle=msg("Verify Email")>
    <div class="container d-flex justify-content-center align-items-center">
        <div class="box">

            <!-- Header -->
            <div class="login-head text-center mb-4 mt-4">
                <h3 class="text-uppercase fw-bold mb-2">Verify Your Email</h3>
                <p class="text-muted mb-0">
                    You need to verify your email address to link your account with Google.
                </p>
            </div>

            <!-- Icon -->
            <div class="text-center my-4">
                <i class="bi bi-envelope-paper text-primary" style="font-size: 3rem;"></i>
            </div>

            <!-- Message -->
            <div class="alert alert-info text-center" role="alert">
                <i class="bi bi-info-circle me-2"></i>
                <small class="mb-0">
                    An email with instructions to link your Google account <br>
                    <strong>${identityProviderBrokerCtx.username}</strong> <br>
                    with your Wealthyfy account has been sent to you.
                </small>
            </div>

            <!-- Actions -->
            <form action="${url.loginAction}" method="post" class="pb-2" autocomplete="off">
                <input type="hidden" name="submitAction" value="linkAccount" />
                
                <!-- Continue After Verification -->
                <div class="text-center mb-3">
                    <p class="text-muted mb-0">
                        If you already verified the email in a different browser,
                        <button type="submit" name="submitAction" value="continue"
                                class="btn btn-link p-0 text-decoration-none fw-semibold align-baseline">
                            Click here to continue
                        </button>.
                    </p>
                </div>
                <!-- Resend Button -->
                 <button type="submit" class="btn btn-primary btn-lg w-100 mb-3">
                    <span class="button-text fw-semibold">Resend Verification Email</span>
                </button>
            </form>
        </div>
    </div>
</@layout.main>
