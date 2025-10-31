<#setting url_escaping_charset='UTF-8'>
<#import "layout.ftl" as layout>

<@layout.main pageTitle=msg("Page Expired")>
    <div class="container d-flex justify-content-center align-items-center">
        <div class="box">

            <!-- Header -->
            <div class="login-head text-center mb-4 mt-4">
                <h3 class="text-uppercase fw-bold mb-2">Page has expired</h3>

                <div class="alert alert-info d-flex align-items-center mb-3 text-center" role="alert">
                    <i class="bi bi-info-circle me-2"></i>
                    <small class="mb-0">
                        The page you’re trying to access has expired.<br>
                        Please click the link below to restart the login process.
                    </small>
                </div>

                <#-- Set encoding-safe URL -->
                <#assign encodedRedirectUri = (url.redirectUri)!''?url('UTF-8') />
                <#assign restartUrl = "/realms/" + realm.name 
                    + "/login-actions/restart?client_id=" + client.clientId 
                    + "&redirect_uri=" + encodedRedirectUri />

                <p class="text-muted mb-0">
                    To restart the login process,
                    <a href="${restartUrl}" class="text-decoration-none">click here</a>.
                </p>
            </div>
        </div>
    </div>
</@layout.main>
