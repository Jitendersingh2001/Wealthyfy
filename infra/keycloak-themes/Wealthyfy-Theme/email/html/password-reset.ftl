<#ftl output_format="HTML" encoding="UTF-8">
<#import "../layout.ftl" as layout>

<@layout.emailLayout pageTitle="Password Reset - Wealthyfy">
  <div class="icon-wrapper">
    <div class="icon-circle">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
      </svg>
    </div>
  </div>
  
  <h2 class="modal-title">Password Reset Request</h2>
  <div class="divider"></div>
  
  <div class="greeting-text">
    Hello! <strong>${username!}</strong> requested a password reset for your Wealthyfy account.
  </div>
  
  <div class="button-wrapper">
    <a href="${link}" class="reset-button">Reset Your Password</a>
  </div>
  
  <div class="fallback-text">
    Or copy and paste this link into your browser if the button doesn't work:
  </div>
  
  <a href="${link}" class="reset-link" title="Click to copy">${link}</a>
  
  <div class="expiration-text">
    This link will expire in <strong>${linkExpirationFormatter(linkExpiration)}</strong>.
  </div>
  
  <div class="expiration-text" style="color: #dc3545; font-weight: 600;">
    If you didn't request this password reset, you can safely ignore this email.
  </div>
</@layout.emailLayout>