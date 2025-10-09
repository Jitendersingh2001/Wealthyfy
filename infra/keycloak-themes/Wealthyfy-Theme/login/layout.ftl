<#-- Layout template with macro definition -->
<#macro main>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <#-- Dynamic Page Title -->
    <title>
        <#if pageTitle??>
            ${pageTitle?no_esc}
        <#else>
            ${msg("login")?no_esc}
        </#if>
    </title>

    <#-- Favicon -->
    <link rel="icon" type="image/png" href="${url.resourcesPath}/images/favicon.png">
    <#include "include/header.ftl">
</head>

<body class="d-flex flex-column min-vh-100">
    <#-- Main content area -->
    <main class="flex-grow-1">
        <#-- This is where page-specific content will be placed -->
        <#nested>
    </main>

    <#include "include/footer.ftl">
</body>

</html>
</#macro>
