class SetuEventTypes:

    SETU_CONSNET_CANCELATION_EVENTS = [
        "UserCancelled",
        "UserRejected",
        "NoFIPAccountsDiscovered",
        "FIPDenied"
    ]


    SETU_CONSENT_CANCELLATION_LOG_MESSAGE = {
        'cancel_not_understand' : "User cancelled consent - did not understand",
        'cancel_will_share_later' : "User cancelled consent - I will share later",
        'cancel_not_want_to_share' : "User cancelled consent - do not want to share",
        'reject_not_understand' : "User rejected consent - did not understand why my data is being requested",
        'reject_not_want_to_share' : "User rejected consent - I do not want to share my data with FIU",
        'reject_accounts_not_found' : "User rejected consent - no accounts found to share",
        'reject_other' : "User rejected consent - other reason",
        'no_fip_accounts_found' : "No FIP accounts discovered for the user",
        "FIP_DENIED_CONSENT" : "FIP denied consent request"
    }

    SETU_CONSENT_STATUS_EVENT_TYPE = "CONSENT_STATUS_UPDATE"
    SETU_SESSION_STATUS_EVENT_TYPE = "SESSION_STATUS_UPDATE"