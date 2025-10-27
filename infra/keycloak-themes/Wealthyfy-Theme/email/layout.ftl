<#-- Email Layout template with macro definition -->
<#macro emailLayout pageTitle="Email - Wealthyfy">
<#-- ======================================================
     REUSABLE EMAIL TEMPLATE
     Use this macro in email templates like password-reset.ftl
     The modal content is fully customizable via <#nested>
     ====================================================== -->

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>${pageTitle}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Titillium+Web:ital,wght@0,200;0,300;0,400;0,600;0,700;0,900;1,200;1,300;1,400;1,600;1,700&display=swap" rel="stylesheet">
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: "Titillium Web", sans-serif;
        line-height: 1.6;
        color: #1c1c1c;
        background-color: #f0f8f4;
        padding: 20px;
        font-weight: 400;
        font-style: normal;
      }
      
      .email-container {
        margin: 0 auto;
        background: linear-gradient(135deg, #03b366, #05a21a);
        border-radius: 24px;
        padding: 60px 40px;
        position: relative;
        overflow: hidden;
      }
      
      .background-pattern {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: 0.1;
        background-image: 
          radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.8) 2px, transparent 2px),
          radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.6) 2px, transparent 2px),
          radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.4) 1px, transparent 1px);
        background-size: 60px 60px, 40px 40px, 30px 30px;
      }
      
      .logo {
        text-transform: uppercase;
        text-align: center;
        color: white;
        font-size: 28px;
        font-weight: 700;
        letter-spacing: 2px;
        margin-bottom: 40px;
        position: relative;
        z-index: 1;
      }
      
      .modal {
        max-width: 800px;
        background: white;
        border-radius: 16px;
        padding: 40px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
        position: relative;
        z-index: 1;
        margin: 0 auto;
        width: 100%;
      }
      
      .icon-wrapper {
        text-align: center;
        margin-bottom: 20px;
      }
      
      .icon-circle {
        width: 80px;
        height: 80px;
        background: linear-gradient(135deg, #03b366, #05a21a);
        border-radius: 50%;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 15px;
      }
      
      .icon-circle svg {
        width: 40px;
        height: 40px;
        fill: white;
      }
      
      .modal-title {
        font-size: 24px;
        font-weight: 700;
        color: #1c1c1c;
        text-align: center;
        margin-bottom: 12px;
      }
      
      .divider {
        height: 1px;
        background: #e0e0e0;
        margin: 20px 0;
      }
      
      .greeting-text {
        font-size: 16px;
        color: #1c1c1c;
        text-align: center;
        line-height: 1.6;
        margin: 20px 0;
      }
      
      .greeting-text strong {
        color: #03b366;
        font-weight: 700;
      }
      
      .button-wrapper {
        text-align: center;
        margin: 30px 0;
      }
      
      .reset-button {
        display: inline-block;
        background: linear-gradient(135deg, #03b366, #05a21a);
        color: white;
        padding: 14px 32px;
        border-radius: 8px;
        text-decoration: none;
        font-weight: 600;
        font-size: 16px;
        transition: all 0.3s ease;
        box-shadow: 0 4px 12px rgba(3, 179, 102, 0.3);
      }
      
      .reset-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(3, 179, 102, 0.4);
      }
      
      .fallback-text {
        font-size: 14px;
        color: #6c757d;
        text-align: center;
        margin-top: 20px;
      }
      
      .reset-link {
        font-size: 12px;
        color: #03b366;
        word-break: break-all;
        text-align: center;
        display: block;
        margin-top: 10px;
        text-decoration: none;
        word-wrap: break-word;
        padding: 8px 12px;
        background: #f8f9fa;
        border: 1px solid #e9ecef;
        border-radius: 6px;
        max-width: 100%;
        overflow-wrap: anywhere;
        font-family: 'Courier New', monospace;
      }
      
      .reset-link-hint {
        font-size: 11px;
        color: #868e96;
        text-align: center;
        margin-top: 5px;
        margin-bottom: 10px;
        font-style: italic;
      }
      
      .expiration-text {
        font-size: 14px;
        color: #6c757d;
        text-align: center;
        margin: 20px 0;
      }
      
      .footer-info {
        text-align: center;
        color: white;
        margin-top: 30px;
        position: relative;
        z-index: 1;
      }
      
      .footer-copyright {
        font-size: 12px;
        opacity: 0.8;
        margin-top: 5px;
      }
      
      @media only screen and (max-width: 600px) {
        body {
          padding: 10px;
        }
        
        .email-container {
          padding: 30px 15px;
          border-radius: 16px;
        }
        
        .logo {
          font-size: 22px;
          margin-bottom: 30px;
        }
        
        .modal {
          padding: 25px 15px;
          max-width: 100%;
        }
        
        .icon-circle {
          width: 60px;
          height: 60px;
          margin-bottom: 10px;
        }
        
        .icon-circle svg {
          width: 30px;
          height: 30px;
        }
        
        .modal-title {
          font-size: 20px;
          margin-bottom: 10px;
        }
        
        .greeting-text {
          font-size: 14px;
          margin: 15px 0;
        }
        
        .reset-button {
          padding: 12px 24px;
          font-size: 15px;
        }
        
        .button-wrapper {
          margin: 20px 0;
        }
        
        .fallback-text,
        .expiration-text {
          font-size: 13px;
          margin: 15px 0;
        }
        
        .reset-link {
          font-size: 11px;
          padding: 6px 10px;
        }
        
        .footer-copyright {
          font-size: 11px;
        }
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="background-pattern"></div>
      
      <div class="logo">Wealthyfy</div>
      
      <div class="modal">
        <#nested>
      </div>
      
      <div class="footer-info">
        <div class="footer-copyright">Copyright © ${.now?string("yyyy")} Wealthyfy. All Rights Reserved.</div>
      </div>
    </div>
  </body>
</html>
</#macro>
