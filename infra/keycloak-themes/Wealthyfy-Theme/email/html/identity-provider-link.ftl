<#ftl output_format="HTML" encoding="UTF-8">
<#import "../layout.ftl" as layout>
<#import "../macros/user-utils.ftl" as utils>

<@layout.emailLayout pageTitle="Link Google Account - Wealthyfy">
  
  <!-- Icon -->
  <div class="icon-wrapper">
    <div class="icon-circle">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 
                 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 
                 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 
                 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
      </svg>
    </div>
  </div>

  <!-- Title -->
  <h2 class="modal-title">Link Your Google Account</h2>
  <div class="divider"></div>

  <!-- Message -->
  <div class="greeting-text">
    Hello <strong><@utils.getFullName user/></strong>,  
    <br><br>
    Someone requested to link your <strong>Wealthyfy</strong> account with your
    <strong>Google account</strong> (<strong>${identityProviderBrokerCtx.username}</strong>).
    <br><br>
    If this was you, please click the button below to confirm and securely link your accounts.
  </div>

  <!-- Link Button -->
  <div class="button-wrapper">
    <a href="${link}" class="reset-button">Link to Confirm Account Linking</a>
  </div>

  <!-- Fallback text -->
  <div class="fallback-text">
    If the button above doesn’t work, copy and paste the link below into your browser:
  </div>
  
  <!-- Direct Link -->
  <a href="${link}" class="reset-link" title="Click to copy">${link}</a>

  <!-- Expiration info -->
  <div class="expiration-text">
    This link will expire within <strong>${linkExpirationFormatter(linkExpiration)}</strong>.
  </div>

  <!-- Safety note -->
  <div class="expiration-text" style="color: #dc3545; font-weight: 600;">
    If you didn’t request to link your Wealthyfy account with Google, please ignore this email.
  </div>

</@layout.emailLayout>
