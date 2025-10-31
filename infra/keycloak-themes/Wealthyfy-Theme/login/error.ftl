<#setting url_escaping_charset='UTF-8'>
<#import "layout.ftl" as layout>

<@layout.main pageTitle=msg("Error")>
    <div class="container d-flex justify-content-center align-items-center">
        <div class="box">
            <div class="login-head text-center mb-4 mt-4">
                <!-- Error Icon -->
                <div class="mb-4">
                    <i class="fas fa-exclamation-triangle text-danger" style="font-size: 3rem;"></i>
                </div>

                <h3 class="text-uppercase fw-bold mb-3">Something Went Wrong</h3>

                <div class="alert alert-danger d-flex align-items-center mb-4 text-center" role="alert">
                    <i class="fas fa-exclamation-circle me-2"></i>
                    <small class="mb-0">
                        We encountered an unexpected error while processing your request.<br>
                        Please try again or contact support if the problem persists.
                    </small>
                </div>
            </div>
        </div>
    </div>
</@layout.main>
