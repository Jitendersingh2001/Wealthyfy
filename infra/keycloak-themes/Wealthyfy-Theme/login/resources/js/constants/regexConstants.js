// regexConstants.js
// Centralized location for all regex patterns used across the app.
// Only one global object (AppConstants) is defined to avoid namespace pollution.

window.AppConstants = window.AppConstants || {};

AppConstants.REGEX = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
};
