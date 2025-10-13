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
    <div class="d-flex layout-main-container">
        <div id="page-intro" class="flex-grow-1 w-50">
            fdef
        </div>
        <div class="flex-grow-1 w-50">
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
