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

  <form id="kc-form-login" onsubmit="login.disabled = true; return true;" action="${url.loginAction}" method="post">

    <h3>${msg("register")?no_esc}</h3>

  </form>
  
</body>
</html>