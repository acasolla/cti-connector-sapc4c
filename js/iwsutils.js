function appendHTML(content) {
    $("#content").append(content);
}
function loadScript(src) {
    var script = document.createElement('script');
    script.src = src;
    script.async = false;
    document.head.appendChild(script);
}
function updateConnectionLed(clazz, msg) {
    $("#led").removeClass();
    $("#led").addClass(clazz);
    $(".led-msg p").text(msg);
}
/*
InteractionId
:
"5E6F89C472D74699889E134E2098CC72"
RecordingId
:
"5e6f89c4-72d7-4699-889e-134e2098cc72"
type
:
"RECORDINGPLAYBACK"
*/
function receiveMessage(msg) {
    loggerSap.info("receivedPostMessage : ", msg?.data);
    if (msg?.data?.Direction == 'OUT' && msg?.data?.PhoneNumber) {
        var phone = msg.data.PhoneNumber.replace(" ", "");
        if (pcEnvironment) {
            let call = {
                number: phone,
                type: "call",
                autoPlace: true,
                attributes: {
                    activity_uuid: msg.data.ActivityUUID || msg.data.ObjectUUID
                }
            };
            iwscommand.clickToDialPEF(call);
        }
        else {
            iwscommand.MakeCall(phone, { activity_uuid: msg.data.ActivityUUID });
        }
    }
    else if (msg?.data?.RecordingId) {
        loggerSap.info("opening recording id : ", msg?.data?.RecordingId);
        window.open(`https://apps.${pcEnvironment}/directory/#/engage/admin/interactions/${msg?.data?.RecordingId}`, '_blank', 'location=yes,height=800,width=1280,scrollbars=yes,status=yes');
    }
}
function replaceAll(string, search, replace) {
    return string.split(search).join(replace).toUpperCase();
}
function buildANI(num) {
    if (num.indexOf("tel:") > -1) {
        return num.replace("tel:", "");
    }
    if (num.indexOf("sip:") > -1) {
        let app = num.replace("sip:", "");
        return app.substr(0, app.indexOf("@"));
    }
    return num;
}
function createTranscript(message) {
    var genesysUrl = 'https://apps.' + pcEnvironment + '/directory/#/engage/admin/interactions/' + message.data.id;
    var transcript = 'Genesys Media Type: Chat\nGenesys Interaction Id: ' + message.data.id;
    transcript += '\nGenesys Interaction URL: ' + genesysUrl + "\n";
    transcript += '\nTranscript\n';
    if (message && message.data && message.data.messages) {
        message.data.messages.forEach(msg => {
            transcript += "\n" + msg.role + ": " + msg.body;
        });
    }
    console.log('createTranscript: ', transcript);
    return transcript;
}
async function getMessages(interactioId) {
    var conv = await await pClient.conversationApi.getConversationsMessage(interactioId);
    var messagesId = [];
    conv.participants.forEach(data => {
        if (data.purpose && (data.purpose == 'customer' || data.purpose == 'agent')) {
            if (data.messages && data.messages.length > 0) {
                messagesId.push(data.messages[0].messageId);
            }
        }
    });
    console.log('getMessages, messagesId: ', messagesId);
    var msgs = [];
    if (messagesId) {
        for (const id of messagesId) {
            var msg = await pClient.conversationApi.getConversationsMessageMessage(interactioId, id);
            msgs.push(msg);
        }
    }
    console.log('getMessages, msgs: ', msgs);
    var messages = this.normalizeMessages(msgs);
    return messages;
}
function normalizeMessages(messages) {
    var msgs = { data: { messages: [] } };
    messages.forEach(data => {
        var m = {
            role: data.fromAddress || '',
            to: data.toAddress || '',
            body: data.textBody || '',
            time: data.timestamp || '',
            direction: data.direction || '',
            type: data.messengerType || ''
        };
        msgs.data.messages.push(m);
    });
    msgs.data.messages.sort(function (a, b) {
        var dateA = new Date(a.time);
        var dateB = new Date(b.time);
        return dateA - dateB;
    });
    console.log('normalizeMessages: ', msgs);
    return msgs;
}
function customParseURL(skey, sdefault) {
    var queryString = window.location.search;
    var urlParams = new URLSearchParams(queryString);
    let param = urlParams.get(skey);
    return (param ? param : sdefault);
}
