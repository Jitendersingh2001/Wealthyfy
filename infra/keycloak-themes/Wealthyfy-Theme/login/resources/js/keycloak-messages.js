/**
 * KeycloakErrorMessages.js
 * --------------------------------------
 * Centralized mapping of Keycloak error keys to user-friendly messages.
 * This file should be loaded globally before page-specific scripts.
 */
const KeycloakMessages = Object.freeze({
    invalidUserMessage: 'Invalid email or password. Please try again.',
    missingUsernameMessage: 'Please enter your email address.',
    missingPasswordMessage: 'Please enter your password.',
    invalidEmailMessage: 'The email address format is incorrect.',
    accountDisabledMessage: 'Your account has been disabled. Contact support.',
    accountTemporarilyDisabledMessage: 'Too many failed attempts. Try again later.',
    expiredActionMessage: 'Your session has expired. Please log in again.',
    expiredCodeMessage: 'Login session expired. Please try again.',
    missingTotpMessage: 'Two-factor authentication code is required.',
    invalidTotpMessage: 'Invalid authentication code. Please try again.',
    emailSentMessage: 'A password reset email has been sent if the account exists.'
});
