<#-- Layout template with macro definition -->
    <#macro main pageTitle="Default Title">
        <!DOCTYPE html>
        <html lang="en">

        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">

            <#-- Dynamic Page Title -->
                <title>${pageTitle?no_esc}</title>

                <#-- Favicon -->
                    <link rel="icon" type="image/png" href="${url.resourcesPath}/images/favicon.png">
                    <#include "include/header.ftl">
        </head>

        <body>
            <div class="d-flex layout-main-container rounded-5">
                <div class="col-md-5 d-flex align-items-center justify-content-center position-relative rounded-5 m-3" id="page-intro">
                    <div class="branding-background position-absolute w-100 h-100"></div>
                    <div class="branding-content position-relative p-5" style="color: var(--foreground);">
                        <div class="brand-header mb-4">
                            <h1 class="h4 fw-light text-uppercase mb-2">Wealthyfy</h1>
                            <hr class="border-2 w-25" style="border-color: var(--foreground) !important;">
                        </div>
                        <div class="brand-main mb-4">
                            <h2 class="display-4 fw-bold mb-3">Your Finances, Unified.</h2>
                            <p class="lead mb-3">Wealthyfy is a smart portfolio app that brings all your investments together in one place — no matter which broker you use.</p>
                            <p class="mb-3">It automatically syncs your stocks, mutual funds, and trades, giving you a complete picture of your wealth in real time.</p>
                            <p class="mb-3">With powerful insights like profit & loss, sector allocation, and risk analysis, Wealthyfy helps you understand where your money is going and how to grow it faster.</p>
                            <p class="mb-0">Think of it as your personal finance command center — simple, secure, and built for the modern investor.</p>
                        </div>
                    </div>
                </div>
                <div class="flex-grow-1 col-md-6 rounded-5">
                    <main>
                        <#-- This is where page-specific content will be placed -->
                            <#nested>
                    </main>
                </div>
            </div>

            <#include "include/footer.ftl">
        </body>

        </html>
    </#macro>