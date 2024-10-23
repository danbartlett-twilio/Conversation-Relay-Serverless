exports.lambdaHandler = async function (event, context) {
    console.log("event received: " + JSON.stringify(event['Records']))
    event['Records'].forEach((rec) => {
        let newImage = rec['dynamodb']['NewImage'];
        //console.log("newImage: " + JSON.stringify(newImage));
        if (newImage && 'chat' in newImage) {
            let chat = newImage['chat']
            console.log(`%s said: %s`, chat.M.role.S, chat.M.content.S)
        }
        return true;
    });
};