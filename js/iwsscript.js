var softphone_connector_initialized = false;
function networkError(message) {
    log.error(message);
}
function onConnectedSession(message) {
    if (softphone_connector_initialized == true) {
        return;
    }
    updateConnectionLed("led-yellow", "Connection in standby ...");
}
function onDisconnectedSession(message) {
    $("#led").removeClass();
    $("#led").addClass("led-red");
    $(".led-msg p").text("Session disconnected");
    softphone_connector_initialized = false;
}
function onActivateSession(message) {
    loggerSap.info("onActivateSession ", message);
    if (softphone_connector_initialized == true) {
        return;
    }
    window.addEventListener("message", receiveMessage);
    updateConnectionLed("led-green", "");
    softphone_connector_initialized = true;
}
function onActivatePureEmbeddableSessionFullPEF(message) {
    loggerSap.info("onActivatePureEmbeddableSessionFullPEF ", message);
    if (softphone_connector_initialized == true) {
        return;
    }
    window.addEventListener("message", receiveMessage);
    softphone_connector_initialized = true;
}
//==================================================================
// VOICE INBOUND
//==================================================================
function onEventRingingInbound(message) {
    loggerSap.info("onEventRingingInbound : ", message);
    var payload = {
        ANI: buildANI(message.ANI),
        Type: "CALL",
        EventType: "INBOUND",
        Action: "NOTIFY"
    };
    loggerSap.info("*** posting message : ", payload);
    parent.postMessage({ payload: payload }, "*");
}
function onEventEstablishedInbound(message) {
    loggerSap.info("onEventEstablishedInbound : ", message);
    var payload = {
        ANI: buildANI(message.ANI),
        Type: "CALL",
        EventType: "INBOUND",
        Action: "ACCEPT",
        ExternalReferenceID: replaceAll(message.ConnectionID, "-", ""),
        Custom_1: message.ConnectionID,
        Custom_2: message.MediaType
    };
    loggerSap.info("*** posting message : ", payload);
    parent.postMessage({ payload: payload }, "*");
}
function onEventReleasedInbound(message) {
    loggerSap.info("onEventReleasedInbound : ", message);
    var payload = {
        ExternalReferenceID: replaceAll(message.ConnectionID, "-", ""),
        Type: "CALL",
        Action: "END",
        EventType: "UPDATEACTIVITY"
    };
    if (message.Service == 'PureCloud') {
        payload.RecordingId = message.InteractionID;
    }
    loggerSap.info("*** posting message : ", payload);
    parent.postMessage({ payload: payload }, "*");
}
//==================================================================
// VOICE OUTBOUND
//==================================================================
function onEventEstablishedOutbound(message) {
    loggerSap.info("onEventEstablishedOutbound : ", message);
    var payload = {
        Type: "CALL",
        Action: "ACCEPT",
        EventType: "OUTBOUND",
        ExternalReferenceID: replaceAll(message.ConnectionID, "-", ""),
        ANI: message.DNIS
    };
    if (message.attachdata && message.attachdata.activity_uuid) {
        payload.EventType = "UPDATEACTIVITY";
        payload.ActivityUUID = message.attachdata.activity_uuid;
    }
    loggerSap.info("*** posting message : ", payload);
    parent.postMessage({ payload: payload }, "*");
}
function onEventReleasedOutbound(message) {
    loggerSap.info("onEventReleasedOutbound : ", message);
    var payload = {
        Type: "CALL",
        EventType: "UPDATEACTIVITY",
        Action: "END",
        ExternalReferenceID: replaceAll(message.ConnectionID, "-", ""),
        ActivityUUID: message.attachdata.activity_uuid
    };
    if (message.Service == 'PureCloud') {
        payload.RecordingId = message.InteractionID;
    }
    loggerSap.info("*** posting message : ", payload);
    parent.postMessage({ payload: payload }, "*");
}
//==================================================================
// EMAIL
//==================================================================
function onEmailEventRingingInbound(message) {
    loggerSap.info("onEmailEventRingingInbound : ", message);
    if (message.attachdata.SAP_ID) {
        return;
    }
    var payload = {
        Type: "CHAT",
        Email: message.attachdata['context.email'] || message.EmailAddress || message.attachdata.EmailAddress,
        Action: "NOTIFY",
        ChatType: "text",
        EventType: "INBOUND",
        Name: message.attachdata['context.firstName'] || ''
    };
    loggerSap.info("*** posting message : ", payload);
    parent.postMessage({ payload: payload }, "*");
}
function onEmailEventEstablishedInbound(message) {
    loggerSap.info("onEmailEventEstablishedInbound : ", message);
    var payload;
    if (message.attachdata.sap_id) {
        payload = {
            Type: "NOTIFICATION",
            EventType: "PUSH",
            Action: "NOTIFY",
            ThingType: "COD_EMAIL",
            ObjectUUID: message.attachdata.sap_id
        };
    }
    else {
        payload = {
            Type: "CHAT",
            Action: "ACCEPT",
            Email: message.attachdata['context.email'] || message.EmailAddress || message.attachdata.EmailAddress || message.ANI,
            ChatType: "text",
            Name: message.attachdata['context.firstName'] || '',
            EventType: "INBOUND",
            Custom_1: message.ConnectionID,
            Custom_2: message.MediaType,
            ExternalReferenceID: replaceAll(message.ConnectionID, "-", "")
        };
    }
    loggerSap.info("*** posting message : ", payload);
    parent.postMessage({ payload: payload }, "*");
}
function onEmailEventReleasedInbound(message) {
    loggerSap.info("onEmailEventReleasedInbound : ", message);
    var payload = {
        Type: "CHAT",
        EventType: "UPDATEACTIVITY",
        ExternalReferenceID: replaceAll(message.ConnectionID, "-", ""),
        Action: "END"
    };
    loggerSap.info("*** posting message : ", payload);
    parent.postMessage({ payload: payload }, "*");
}
//==================================================================
//CHAT
//==================================================================
function onChatEventRingingInbound(message) {
    loggerSap.info("onChatEventRingingInbound : ", message);
    var payload = {
        Type: "CHAT",
        Action: "NOTIFY",
        Email: message.attachdata['context.email'] || message.EmailAddress || message.attachdata.EmailAddress
    };
    loggerSap.info("*** posting message : ", payload);
    parent.postMessage({ payload: payload }, "*");
}
function onChatEventEstablishedInbound(message) {
    loggerSap.info("onChatEventEstablishedInbound : ", message);
    var payload = {
        Type: "CHAT",
        Action: "ACCEPT",
        Email: message.attachdata['context.email'] || message.EmailAddress || message.attachdata.EmailAddress,
        ExternalReferenceID: replaceAll(message.ConnectionID, "-", ""),
        Custom_1: message.ConnectionID,
        Custom_2: message.MediaType
    };
    loggerSap.info("*** posting message : ", payload);
    parent.postMessage({ payload: payload }, "*");
}
function onChatEventReleasedInbound(message) {
    loggerSap.info("onChatEventReleasedInbound : ", message);
    if (message.Service == 'PureCloud') {
        iwscommand.getTranscriptPEF(message.InteractionID, "EventGetTranscriptPEF");
        return;
    }
    var payload = {
        Type: "CHAT",
        EventType: "UPDATEACTIVITY",
        ExternalReferenceID: replaceAll(message.ConnectionID, "-", ""),
        Action: "END"
    };
    loggerSap.info("*** posting message : ", payload);
    parent.postMessage({ payload: payload }, "*");
}
async function onEventGetTranscriptPEF(message) {
    loggerSap.info("onEventGetTranscriptPEF : ", message);
    var transcript = createTranscript(message);
    var payload = {
        Type: "CHAT",
        EventType: "UPDATEACTIVITY",
        ExternalReferenceID: replaceAll(message.data.id, "-", ""),
        Action: "END",
        Transcript: transcript
    };
    loggerSap.info("*** posting message : ", payload);
    parent.postMessage({ payload: payload }, "*");
}
//==================================================================
// MESSAGE
//==================================================================
function onMessageRinging(message, id) {
    var payload = {
        Type: "CHAT",
        EventType: "INBOUND",
        Action: "NOTIFY",
        ...id
    };
    loggerSap.info("*** posting message : ", payload);
    parent.postMessage({ payload: payload }, "*");
}
function onMessageEstablished(message, id) {
    var payload = {
        Type: "CHAT",
        Action: "ACCEPT",
        EventType: "INBOUND",
        ...id,
        Custom_1: message.ConnectionID,
        Custom_2: message.MediaType,
        ExternalReferenceID: replaceAll(message.ConnectionID, "-", "")
    };
    loggerSap.info("*** posting message : ", payload);
    parent.postMessage({ payload: payload }, "*");
}
function onMessageReleased(message) {
    if (message.Service == 'PureCloud') {
        iwscommand.getMessageTranscriptPEF(message.InteractionID, "EventGetTranscriptPEF");
        return;
    }
    var payload = {
        Type: "CHAT",
        EventType: "UPDATEACTIVITY",
        ExternalReferenceID: replaceAll(message.ConnectionID, "-", ""),
        Action: "END"
    };
    loggerSap.info("*** posting message : ", payload);
    parent.postMessage({ payload: payload }, "*");
}
//==================================================================
// SMS
//==================================================================
function onSMSEventRingingInbound(message) {
    loggerSap.info("onSMSEventRingingInbound : ", message);
    onMessageRinging(message, { ANI: buildANI(message.ANI) });
}
function onSMSEventEstablishedInbound(message) {
    loggerSap.info("onSMSEventEstablishedInbound : ", message);
    onMessageEstablished(message, { ANI: buildANI(message.ANI) });
}
function onSMSEventReleasedInbound(message) {
    loggerSap.info("onSMSEventReleasedInbound : ", message);
    onMessageReleased(message);
}
//==================================================================
// WHATSAPP
//==================================================================
function onWhatsappEventRingingInbound(message) {
    loggerSap.info("onWhatsappEventRingingInbound : ", message);
    onMessageRinging(message, { ANI: buildANI(message.ANI) });
}
function onWhatsappEventEstablishedInbound(message) {
    loggerSap.info("onWhatsappEventEstablishedInbound : ", message);
    onMessageEstablished(message, { ANI: buildANI(message.ANI) });
}
function onWhatsappEventReleasedInbound(message) {
    loggerSap.info("onWhatsappEventReleasedInbound : ", message);
    onMessageReleased(message);
}
//==================================================================
// FACEBOOK
//==================================================================
function onFacebookEventRingingInbound(message) {
    loggerSap.info("onFacebookEventRinging : ", message);
    onMessageRinging(message, { ANI: buildANI(message.ANI) });
}
function onFacebookEventEstablishedInbound(message) {
    loggerSap.info("onFacebookEventEstablished : ", message);
    onMessageEstablished(message, { ANI: buildANI(message.ANI) });
}
function onFacebookEventReleasedInbound(message) {
    loggerSap.info("onFacebookEventReleased : ", message);
    onMessageReleased(message);
}
//==================================================================
// WEBMESSAGING
//==================================================================
function onWebmessagingEventRingingInbound(message) {
    loggerSap.info("onWebmessagingEventRinging : ", message);
    onMessageRinging(message, { Email: message.attachdata["context.email"] });
}
function onWebmessagingEventEstablishedInbound(message) {
    loggerSap.info("onWebmessagingEventEstablished : ", message);
    onMessageEstablished(message, { Email: message.attachdata["context.email"] });
}
function onWebmessagingEventReleasedInbound(message) {
    loggerSap.info("onWebmessagingEventReleased : ", message);
    onMessageReleased(message);
}
