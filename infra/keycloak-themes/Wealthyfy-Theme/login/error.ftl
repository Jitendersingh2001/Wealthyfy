<!DOCTYPE html>
<html lang="en">
<head>
    <title>${msg("Login")?no_esc}</title>
    <#include "include/header.ftl">
    <style>
        body { background-color: #fff; font-family: Arial, sans-serif; }
        #kc-content-wrapper { max-width: 500px; margin: 50px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
        .error-message { color: red; margin: 15px 0; }
        #back-to-login-btn a { display: inline-block; margin-top: 10px; padding: 8px 12px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 4px; }
        #back-to-login-btn a:hover { background-color: #0056b3; }
    </style>
</head>
<body>
<div id="kc-content-wrapper">
    <h3>${msg("Error")?no_esc}</h3>

    <#-- Handle expired tokens separately -->
    <#if error?? && error == "expired_code">
        <div class="error-message">
            ${msg("Your reset link has expired. Please request a new password reset.")}
        </div>
        <a href="${url.loginUrl}">${msg("Back to login")}</a>

    <#elseif errorMessage?? && errorMessage?has_content>
        <div class="error-message">${errorMessage}</div>
        <#if url.loginAction??>
            <a href="${url.loginUrl}">${msg("Back to login")}</a>
        </#if>

    <#else>
        <div class="error-message">${msg("Unexpected error")}</div>
        <a href="${url.loginUrl}">${msg("Back to login")}</a>
    </#if>
</div>
</body>
</html>
