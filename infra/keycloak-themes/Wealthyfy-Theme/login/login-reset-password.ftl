<!DOCTYPE html>
<html lang="en">
<head>
  <title>${msg("Forgot Password")?no_esc}</title>
<#include "include/header.ftl">
</head>
<body>
  <div class="background">
    <div class="forget_password_shape"></div>
    <div class="forget_password_shape"></div>
  </div>
<div id="kc-content-wrapper">
<form id="kc-reset-password-form" action="${url.loginAction}" method="post">
    <h3>${msg("Forgot Password")?no_esc}</h3>

    <label for="username">${msg("Email")}</label>
    <input type="text" id="username" name="username" 
           value="${(login.username!'')}" placeholder="Enter your email" required />

    <input type="hidden" name="execution" value="${execution}" />

    <button type="submit" id="kc-form-buttons">${msg("Submit")}</button>

    <#if message??>
        <div class="error-message">${message}</div>
    </#if>

    <div id="back-to-login-btn">
        <a href="${url.loginUrl}">${msg("Back to login")}</a>
    </div>
</form>

</div>

</body>
</html>
