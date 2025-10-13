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
                <div class="col-md-6 d-flex align-items-center justify-content-center position-relative rounded-5" id="page-intro">
                    <div class="branding-background position-absolute w-100 h-100"></div>
                    <div class="branding-content position-relative text-white p-5">
                        <div class="brand-header mb-4">
                            <h1 class="h4 fw-light text-uppercase mb-2">THEGOOD NETWORK</h1>
                            <hr class="border-light border-2 w-25">
                        </div>
                        <div class="brand-main mb-4">
                            <p class="h6 mb-2">We are</p>
                            <h2 class="display-4 fw-bold mb-3">Invite only right now.</h2>
                            <p class="lead">10 Million+ people have joined our network. We invite you to join the tribe.</p>
                        </div>
                        <div class="brand-footer">
                            <p class="mb-2">Already have an account?</p>
                            <a href="#" class="text-white fw-bold text-decoration-none">Sign in</a>
                        </div>
                    </div>
                </div>
                <div class="flex-grow-1 w-50 bg-white rounded-5">
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