<#import "layout.ftl" as layout>

<@layout.main pageTitle=msg("Link Account")>
    <div class="container d-flex justify-content-center align-items-center">
        <div class="box">

            <div class="login-head text-center mb-4 mt-4">
                <h3 class="text-uppercase fw-bold mb-2">Account Already Exists</h3>
                <p class="text-muted mb-0">
                    We found an existing account associated with this email address. <br>
                    To continue, please link your existing account to proceed with login.
                </p>
            </div>

            <div class="text-center my-4">
                <i class="bi bi-envelope-check text-primary" style="font-size: 3rem;" id="email-icon"></i>
            </div>
            
            <div class="alert alert-info d-flex align-items-center mb-3 text-center" role="alert" id="email-verify-info">
                <i class="bi bi-info-circle me-2"></i>
              <small class="mb-0"> User with email ${identityProviderBrokerCtx.username} already exists.</small>
            </div>

            <form action="${url.loginAction}" method="post" class="pb-2" autocomplete="off">
                
                <button type="submit" name="submit" value="true" class="btn btn-primary btn-lg w-100 mb-3">
                    <span class="button-text fw-semibold">Link To Existing Account</span>
                </button>

                <div class="d-flex justify-content-center align-items-center mb-3">
                    <a href="${url.loginUrl}" class="text-decoration-none">Back to Login</a>
                </div>
            </form>
        </div>
    </div>
</@layout.main>