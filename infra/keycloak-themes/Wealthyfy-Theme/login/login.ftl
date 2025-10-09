<#-- login.ftl -->
<#assign pageTitle = msg("loginPageTitle", "Sign In")>

<#-- Use layout.ftl as base template -->
<#import "layout.ftl" as layout>

<@layout.main>
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-md-6 col-lg-4">
                <div class="card mt-5">
                    <div class="card-body">
                        <#-- Display messages if any -->
                        <#if displayMessage?? && displayMessage>
                            <div class="alert alert-${messageType!}">
                                ${message!}
                            </div>
                        </#if>
                        
                        <#-- Login form -->
                        <form id="kc-form-login" onsubmit="login.disabled = true; return true;" action="${url.loginAction}" method="post">
                            <div class="mb-3">
                                <label for="username" class="form-label">
                                    <#if !realm.loginWithEmailAllowed>
                                        ${msg("username")}
                                    <#elseif !realm.registrationEmailAsUsername>
                                        ${msg("usernameOrEmail")}
                                    <#else>
                                        ${msg("email")}
                                    </#if>
                                </label>
                                <#if usernameEditDisabled??>
                                    <input tabindex="1" id="username" class="form-control" name="username" value="${(login.username!'')}" type="text" disabled />
                                <#else>
                                    <input tabindex="1" id="username" class="form-control" name="username" value="${(login.username!'')}" type="text" autofocus autocomplete="off" />
                                </#if>
                            </div>
                            
                            <div class="mb-3">
                                <label for="password" class="form-label">${msg("password")}</label>
                                <input tabindex="2" id="password" class="form-control" name="password" type="password" autocomplete="off" />
                            </div>
                            
                            <#if realm.rememberMe && !usernameEditDisabled??>
                                <div class="mb-3 form-check">
                                    <#if login.rememberMe??>
                                        <input tabindex="3" id="rememberMe" name="rememberMe" type="checkbox" checked>
                                    <#else>
                                        <input tabindex="3" id="rememberMe" name="rememberMe" type="checkbox">
                                    </#if>
                                    <label class="form-check-label" for="rememberMe">
                                        ${msg("rememberMe")}
                                    </label>
                                </div>
                            </#if>
                            
                            <div class="d-grid">
                                <button tabindex="4" name="login" id="kc-login" type="submit" class="btn btn-primary">${msg("doLogIn")}</button>
                            </div>
                        </form>
                        
                        <#if realm.password && social.providers??>
                            <hr>
                            <div class="text-center">
                                <#list social.providers as p>
                                    <a id="social-${p.alias}" class="btn btn-outline-secondary me-2" type="button" href="${p.loginUrl}">
                                        <#if p.iconClasses??>
                                            <i class="${properties.kcCommonLogoIdP!} ${p.iconClasses!}" aria-hidden="true"></i>
                                            <span class="${properties.kcFormSocialAccountNameClass!} kc-social-${p.alias}">${p.displayName!}</span>
                                        <#else>
                                            <span class="${properties.kcFormSocialAccountNameClass!} kc-social-${p.alias}">${p.displayName!}</span>
                                        </#if>
                                    </a>
                                </#list>
                            </div>
                        </#if>
                    </div>
                </div>
            </div>
        </div>
    </div>
</@layout.main>
