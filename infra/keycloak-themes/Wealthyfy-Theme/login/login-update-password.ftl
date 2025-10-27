<#import "layout.ftl" as layout>

<@layout.main pageTitle=msg("Update Password")>
    <div class="container d-flex justify-content-center align-items-center">
        <div class="box">

            <!-- Header -->
            <div class="login-head text-center mb-3">
                <h3 class="text-uppercase fw-bold">Update Password</h3>
                <p class="mb-0 text-muted">Please create a new password below to restore your account access</p>
            </div>

            <!-- Form -->
            <form id="update-password-form"  action="${url.loginAction?no_esc}"  method="post" autocomplete="off">

                <!-- New Password -->
                <div class="form-group mb-3">
                    <label for="password-new" class="form-label">
                        New Password <span class="text-danger">*</span>
                    </label>
                    <input
                        type="password"
                        id="password-new"
                        name="password-new"
                        class="form-control"
                        placeholder="Enter new password"
                        required
                        autocomplete="new-password"
                    />
                </div>

                <!-- Confirm Password -->
                <div class="form-group mb-3">
                    <label for="password-confirm" class="form-label">
                        Confirm Password <span class="text-danger">*</span>
                    </label>
                    <input
                        type="password"
                        id="password-confirm"
                        name="password-confirm"
                        class="form-control"
                        placeholder="Re-enter new password"
                        required
                        autocomplete="new-password"
                    />
                </div>

                <!-- Submit Button -->
                <button type="submit" class="btn btn-primary w-100 mb-3 mt-3">
                    <span class="button-text">Update Password</span>
                </button>

            </form>
        </div>
    </div>
</@layout.main>
<@layout.scripts>
 <script src="${url.resourcesPath}/js/login-update-password.js"></script>
</@layout.scripts>
