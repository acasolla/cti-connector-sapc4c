var pcEnvironment = customParseURL("pcEnv", "mypurecloud.com");
var pcLanguage = customParseURL("language", "en-US");
var params = {
    customInteractionAttributes: ["context.email", "activity_uuid", "sap_id"],
    settings: {
        sso: false,
        embedWebRTCByDefault: true,
        hideWebRTCPopUpOption: false,
        enableCallLogs: false,
        hideCallLogSubject: false,
        hideCallLogContact: false,
        hideCallLogRelation: false,
        dedicatedLoginWindow: false,
        embeddedInteractionWindow: false,
        enableConfigurableCallerId: false,
        enableServerSideLogging: false,
        enableCallHistory: false,
        theme: {
            primary: "#HHH",
            text: "#FFF"
        }
    },
    clientIds: {
        "mypurecloud.com": "1e196c67-3f97-4500-9f29-ee69f469f208",
        "mypurecloud.de": "5216616d-4d6d-48ae-a991-b3e24de3350b",
        "mypurecloud.ie": "13bbabc4-9b16-4a73-8151-4ec43aa04300",
        "mypurecloud.jp": "6774a00d-ac79-4f5d-869e-b4f4000b0f58",
        "mypurecloud.com.au": "4c931ad3-41a0-41a5-b634-3462cbb5e8e6",
        "usw2.pure.cloud": "93e1a516-f4ca-4c2a-8582-ed2bcbc24b69"
    },
    helpLinks: {}
};
loggerSap.info("params : ", params);
var url = "https://apps." + pcEnvironment + "/crm/softphoneSAPC4C/index.html?request_configuration=true&full_PEF=true&language=" + pcLanguage + "&crm_domain=" + window.location.origin;
loggerSap.info("url : ", url);
$(() => {
    loggerSap.info("document ready!");
    iwscore.initCTI({
        context: window,
        layoutType: "smart-ui",
        integrationType: "pure-embeddable",
        url: url,
        auth: { environment: pcEnvironment },
        pefParams: params,
        smartUi: {
            mainJSpath: "lib/softphone-connector-smart-ui.min.js",
            showConnectionLed: true,
            globalViews: []
        }
    });
    iwscore.enableCTI();
});
