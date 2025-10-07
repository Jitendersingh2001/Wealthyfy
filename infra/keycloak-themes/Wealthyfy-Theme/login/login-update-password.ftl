<!DOCTYPE html>
<html lang="en">
<head>
    <title>${msg("Update Password")?no_esc}</title>
    <#include "include/header.ftl">
</head>
<body>
<div class="background">
    <div class="forget_password_shape"></div>
    <div class="forget_password_shape"></div>
</div>

<div id="kc-content-wrapper">
    <form id="kc-update-password-form" action="${url.loginAction}" method="post">

        <!-- Hidden fields required by Keycloak -->
        <input type="text" name="username" value="" autocomplete="username" readonly style="display:none;">
        <input type="password" name="password" autocomplete="current-password" style="display:none;">
        <input type="hidden" name="execution" value="${execution}" />
        <input type="hidden" name="client_id" value="${client_id!}" />
        <input type="hidden" name="tab_id" value="${tab_id!}" />

        <h3>${msg("Update Password")?no_esc}</h3>

        <!-- Visible fields -->
        <label for="password-new">${msg("New Password")}</label>
        <input type="password" id="password-new" name="password-new" placeholder="Enter new password" required/>

        <label for="password-confirm">${msg("Confirm Password")}</label>
        <input type="password" id="password-confirm" name="password-confirm" placeholder="Confirm new password" required/>

        <button type="submit" id="kc-form-buttons">${msg("Submit")}</button>
    </form>
</div>
</body>
</html>
