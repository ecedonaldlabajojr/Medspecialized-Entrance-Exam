// This function checks the message type (success or danger) in <request.session.messageType> attribute
// and passes the returned value as a parameter to EJS template

function checkMessageType(requestObject) {
    switch (requestObject.session.messageType) {
        case "danger":
            return "danger";

        default:
            return "success";
    }
}

module.exports = checkMessageType;