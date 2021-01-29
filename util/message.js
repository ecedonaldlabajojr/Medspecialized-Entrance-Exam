function checkMessageType(requestObject) {
    switch (requestObject.session.messageType) {
        case "danger":
            return "danger";

        default:
            return "success";
    }
}

module.exports = checkMessageType;