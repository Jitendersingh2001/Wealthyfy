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
                    <div class="branding-content position-relative p-5" style="color: white;">
                        <div class="brand-header mb-4">
                            <h1 class="h6 fw-light text-uppercase mb-2">Wealthyfy</h1>
                        </div>
                        <div class="brand-main mb-4">
                            <h2 class="display-1 fw-bold mb-4 quote-headline">
                                <div class="quote-line">Your Finances,</div>
                                <div class="quote-line">Unified.</div>
                            </h2>
                            <p class="quote-supporting mb-0">Wealthyfy is a smart portfolio app that brings all your investments together in one place — no matter which broker you use.<br><br>Get a complete picture of your wealth in real time with powerful insights and analysis.</p>
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