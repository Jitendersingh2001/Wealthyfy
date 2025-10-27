<#ftl output_format="HTML" encoding="UTF-8">
    <#import "../layout.ftl" as layout>
        <#import "../macros/user-utils.ftl" as utils>

            <@layout.emailLayout pageTitle="Verify Your Email - Wealthyfy">
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

                <h2 class="modal-title">Verify Your Email Address</h2>
                <div class="divider"></div>

                <div class="greeting-text">

                    Hello <strong><@utils.getFullName user/></strong>, welcome to <strong>Wealthyfy</strong>! Please verify your email address to activate your account and get started.
                </div>

                <div class="button-wrapper">
                    <a href="${link}" class="reset-button">Verify My Email</a>
                </div>

                <div class="fallback-text">
                    If the button above doesn’t work, copy and paste the link below into your browser:
                </div>

                <a href="${link}" class="reset-link" title="Click to copy">${link}</a>

                <div class="expiration-text">
                    This verification link will expire in
                    <strong>${linkExpirationFormatter(linkExpiration)}</strong>.
                </div>

                <div class="expiration-text" style="color: #dc3545; font-weight: 600;">
                    If you didn’t sign up for a Wealthyfy account, please ignore this email.
                </div>
            </@layout.emailLayout>