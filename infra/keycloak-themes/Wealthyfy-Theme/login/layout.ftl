<#-- Layout template with macro definition -->
    <#macro main pageTitle="Default Title">
        <!DOCTYPE html>
        <html lang="en" data-theme="light">

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
            <div class="d-flex layout-main-container">
                <div class="w-100 d-flex position-relative" id="page-intro">
                    <!-- Background -->
                    <div class="branding-background position-absolute w-100 h-100"></div>

                    <!-- Left-aligned content -->
                    <div class="branding-content position-relative h-100 d-flex flex-column justify-content-start text-white p-5 w-100">
                        <div class="brand-header mb-4">
                            <h1 class="h6 fw-light text-uppercase mb-2">Wealthyfy</h1>
                        </div>
                        <div class="brand-main mb-4">
                            <h2 class="display-1 fw-bold mb-4 quote-headline">
                                <div class="quote-line">Your Finances,</div>
                                <div class="quote-line">Unified.</div>
                            </h2>
                            <p class="quote-supporting mb-0">
                                Wealthyfy is a smart portfolio app that brings all your investments together in one place — no matter which broker you use.
                                <br>
                                <br> Get a complete picture of your wealth in real time with powerful insights and analysis.
                            </p>
                        </div>
                    </div>
                </div>

                <!--Right aligned content-->
                <div class="position-relative col-12 col-md-6">
                    <div class="right-container d-flex flex-column justify-content-center align-items-center h-100 w-100">
                    <main class = "card card-container p-4 rounded-4">
                        <#nested>
                        </main>
                    </div>
                </div>
            </div>
            <#include "include/footer.ftl">
        </body>
        </html>
    </#macro>