<!DOCTYPE html>
<html lang="en">

<head>
  <title>${msg("login")?no_esc}</title>
  <#include "include/header.ftl">
</head>

<body>
  <div class="background">
    <div class="shape"></div>
    <div class="shape"></div>
  </div>

  <form id="kc-form-login" onsubmit="document.getElementById('kc-login').disabled = true; return true;"
    action="${url.loginAction}" method="post">


    <h3>${msg("Login")?no_esc}</h3>

    <label for="username">${msg("Email")}</label>
    <input type="text" id="username" name="username" value="${(login.username!'')}" placeholder="Email"/>
    <span class="error" id="username-error"> </span>


    <label for="password">${msg("Password")}</label>
    <input type="password" id="password" name="password" placeholder="Password"/>
     <span class="error" id="password-error"> </span>
    <div class="options">
      <div class="remember-me">
        <input type="checkbox" id="rememberMe" name="rememberMe" value="true" />
        <label for="rememberMe">${msg("Remember Me")}</label>
      </div>
      <div class="forgot-password">
        <a href="${url.loginResetCredentialsUrl}">${msg("Forgot Password")}</a>
      </div>

    </div>


    <button id="kc-login" type="submit">${msg("LogIn")}</button>


    <div class="or-separator"><span>OR</span></div>

    <#if social.providers??>
      <#list social.providers as p>
        <div class="social">
          <a class="go" href="${p.loginUrl}">
            <i class="fab fa-${p.alias}"></i> ${p.displayName}
          </a>
        </div>
      </#list>
    </#if>
    <div class="register-link">
      <span>Don't have an account?
        <a href="${url.registrationUrl}">Register</a>
      </span>
    </div>

  </form>
  <#include "include/footer.ftl">
  <script src="${url.resourcesPath}/js/login-validation.js"></script>
</body>

</html>