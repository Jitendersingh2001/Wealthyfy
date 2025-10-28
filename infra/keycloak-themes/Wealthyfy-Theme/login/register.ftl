<#import "layout.ftl" as layout>

<@layout.main pageTitle=msg("Register")>
  <div class="register-container d-flex justify-content-center align-items-center">
    <div>

      <!-- Header -->
      <div class="register-head text-center mb-3">
        <h3 class="text-uppercase fw-bold">Register</h3>
        <p class="mb-0">Please enter your details to create your account</p>
      </div>

      <!-- Form -->
      <form action="${url.registrationAction}" method="post" class="pb-2" autocomplete="off">

        <!-- Email -->
        <div class="form-group mb-3">
          <label for="email" class="form-label">Email<span class="text-danger"> *</span></label>
          <input type="email" class="form-control" id="email" name="email"
                 value="${email?if_exists}" placeholder="Enter your email address"
                 autocomplete="new-email" maxlength="30" required />
        </div>

        <!-- First & Last Name -->
        <div class="row">
          <div class="col-md-6 mb-3">
            <label for="firstName" class="form-label">First Name<span class="text-danger"> *</span></label>
            <input type="text" class="form-control" id="firstName" name="firstName"
                   value="${firstName?if_exists}" placeholder="Enter your first name" maxlength="20" required />
          </div>

          <div class="col-md-6 mb-3">
            <label for="lastName" class="form-label">Last Name<span class="text-danger"> *</span></label>
            <input type="text" class="form-control" id="lastName" name="lastName"
                   value="${lastName?if_exists}" placeholder="Enter your last name" maxlength="20" required />
          </div>
        </div>

        <!-- Password -->
        <div class="form-group mb-3">
          <label for="password" class="form-label">Password<span class="text-danger"> *</span></label>
          <input type="password" class="form-control" id="password" name="password"
                 placeholder="Enter your password"  maxlength="11"  required />
        </div>

        <!-- Confirm Password -->
        <div class="form-group mb-3">
          <label for="password-confirm" class="form-label">Confirm Password<span class="text-danger"> *</span></label>
          <input type="password" class="form-control" id="password-confirm" name="password-confirm"
                 placeholder="Re-enter your password" maxlength="11" required />
        </div>

        <!-- Submit Button -->
        <button type="submit" class="btn btn-primary w-100">
          <span class="button-text">Register</span>
        </button>

      </form>

      <!-- Identity Providers -->
      <#if social.providers??>
        <div class="text-center fw-bolder py-2">OR</div>
        <div class="d-flex flex-column gap-2">
          <#list social.providers as p>
            <a href="${p.loginUrl}" class="btn btn-outline-secondary w-100 d-flex align-items-center justify-content-center">
              <#if p.alias=="google">
                <i class="fab fa-google me-2"></i>
              <#elseif p.alias=="github">
                <i class="fab fa-github me-2"></i>
              <#elseif p.alias=="facebook">
                <i class="fab fa-facebook-f me-2 text-primary"></i>
              </#if>
              Sign Up with ${p.displayName}
            </a>
          </#list>
        </div>
      </#if>

      <!-- Sign In Option -->
      <div class="text-center signup-section d-flex justify-content-center pt-3 gap-1">
        <p class="mb-2 text-muted">Already have an account?</p>
        <a href="${url.loginUrl}" class="text-decoration-none">Sign In</a>
      </div>

    </div>
  </div>
</@layout.main>

<@layout.scripts>
<script src="${url.resourcesPath}/js/register.js"></script>
</@layout.scripts>
