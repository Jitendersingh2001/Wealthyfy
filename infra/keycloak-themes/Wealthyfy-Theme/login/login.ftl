<#-- login.ftl -->
<#-- Use layout.ftl as base template -->
<#import "layout.ftl" as layout>
<#import "components/input.ftl" as inputField>

<@layout.main pageTitle=msg("Login")>
  <div class="login-container d-flex justify-content-center align-items-center vh-100 flex-column">

    <!-- LOGIN HEADER -->
    <div class="login-container-header text-center mb-4">
      <h1 class="text-uppercase fw-bold">Welcome Back</h1>
      <span>Enter your email and password to access your account</span>
    </div>

    <!-- LOGIN FORM -->
    <form class="w-100" method="post" autocomplete="off">
      <div class="mb-3">
        <@inputField.inputField 
          id="username" 
          label="Email" 
          placeholder="Enter your email" 
          required=true 
        />
      </div>

      <div class="mb-3">
        <@inputField.inputField 
          id="password" 
          type="password" 
          label="Password" 
          placeholder="Enter password" 
          required=true 
        />
      </div>

      <button type="submit" class="btn btn-primary w-100">Login</button>
    </form>

  </div>
</@layout.main>
