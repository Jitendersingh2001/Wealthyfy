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
    emailSentMessage: 'A password reset email has been sent if the account exists.',
    expiredActionTokenSessionExistsMessage: 'This verification link has expired. Please request a new one.',
    invalidPasswordMinSpecialCharsMessage: 'Password must include at least one special character.',
    invalidPasswordMinUpperCaseCharsMessage: 'Password must include at least one uppercase letter.',
    invalidPasswordMinLowerCaseCharsMessage: 'Password must include at least one lowercase letter.',
    invalidPasswordMinDigitsMessage: 'Password must include at least one digit.',
    invalidPasswordMinLengthMessage: 'Password must be at least 8 characters long.',
    notMatchPasswordMessage: 'The passwords you entered don’t match. Please double-check and try again.',
    invalid_user_credentials: 'Invalid email or password. Please try again.',
    resetPasswordMessage: 'Enter your new password to complete the password reset process.',
    loginTimeout: 'Your login session has timed out. Please try again.',
    invalidPasswordMaxLengthMessage: 'Password must not exceed 10 characters.',
    verifyEmailMessage: 'Please verify your email address to continue.',
});
