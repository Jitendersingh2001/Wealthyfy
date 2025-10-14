<#-- login.ftl -->
<#-- Use layout.ftl as base template -->
<#import "layout.ftl" as layout>

<@layout.main pageTitle=msg("Login")>
    <div class="login-container d-flex justify-content-center align-items-center">
        <div>
            
            <!-- Header -->
            <div class="login-head text-center mb-3">
                <h3 class="text-uppercase fw-bold">Welcome Back</h3>
                <p class="mb-0">Please enter your login and password to access your account</p>
            </div>
            
            <!-- Form -->
            <form action="${url.loginAction}" method="post">
                
                <!-- Username / Email -->
                <div class="mb-3">
                    <label for="username" class="form-label">Email<span class="text-danger"> *</span> </label>
                    <input type="text" class="form-control" id="username" name="username" autofocus 
                           value="${username?if_exists}" />
                </div>
                
                <!-- Password -->
                <div class="mb-3">
                    <label for="password" class="form-label">Password <span class="text-danger"> *</span></label>
                    <input type="password" class="form-control" id="password" name="password" />
                </div>
                
                <!-- Remember me and Forgot password row -->
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <!-- Remember me (only if enabled in realm) -->
                    <#if realm.rememberMe?? && realm.rememberMe>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="rememberMe" name="rememberMe" />
                            <label class="form-check-label" for="rememberMe">Remember me</label>
                        </div>
                    <#else>
                        <!-- Empty div to preserve spacing if rememberMe is off -->
                        <div></div>
                    </#if>

                    <!-- Forgot password (only if enabled) -->
                    <#if realm.resetPasswordAllowed?? && realm.resetPasswordAllowed>
                        <a href="${url.loginResetCredentialsUrl}" class="text-decoration-none">Forgot password?</a>
                    </#if>
                </div>
                
                <!-- Submit button -->
                <button type="submit" class="btn btn-primary w-100">Login</button>
            </form>
        </div>
    </div>
</@layout.main>