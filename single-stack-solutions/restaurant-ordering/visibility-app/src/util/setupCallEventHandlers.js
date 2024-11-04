function setupCallEventHandlers(call) {
  if (!call) {
    console.error("undefined call object");
    return;
  }

  call.on("ringing", function (hasEarlyMedia) {
    console.log("Call ringing now");
    if (hasEarlyMedia) {
      console.log("Has early media");
    }
  });

  call.on("cancel", function (conn) {
    console.log("Call cancel");
    // activeCall = undefined;
  });

  call.on("reject", function (conn) {
    console.log("Call reject");
    // activeCall = undefined;
  });

  call.on("accept", function (conn) {
    // Happens in both incoming and outgoing calls
    console.log("Call direction:", conn.direction);
    if (conn.direction === "INCOMING") {
      console.log("Call accepted");
    } else {
      let to = conn.parameters.To || "test:conversationRelay";
      console.log(
        "Call accepted: " + to + ", Call SID: " + conn.parameters.CallSid + ""
      );
    }
  });

  call.on("disconnect", function (conn) {
    console.log("Call disconnected\n");
    // activeCall = undefined;
  });

  call.on("transportClose", function (conn) {
    console.log("Call transportClose.\n");
    // activeCall = undefined;
  });

  call.on("error", function (error) {
    console.log("Call error: " + error.message + " (" + error.code + ")\n");
    // activeCall = undefined;
  });

  call.on("warning", function (name) {
    console.log("Network warning: " + name + "\n");
  });

  call.on("warning-cleared", function (name) {
    console.log("Network warning cleared: " + name + "\n");
  });
}

module.exports = setupCallEventHandlers;
