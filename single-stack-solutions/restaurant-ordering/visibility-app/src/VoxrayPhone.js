import React, { useState, useEffect } from "react";
import axios from "axios";
import { Device } from "@twilio/voice-sdk";
import "./styles/VoxrayPhone.css";
import StatusArea from "./StatusArea";
// import Visualizer from "./Visualizer";
// import Profile from "./components/DBProfile";
import Configuration from "./components/Configuration";
import audiovisualizer from "./templates/audiovisualizer";
import Visualizer from "./Visualizer";
import ReactAudioVisualizer from "./ReactAudioVisualizer";

// Twilio Paste
import { Theme } from "@twilio-paste/core/theme";
import { Stack, Box, Heading, Button, Label } from "@twilio-paste/core";

let myDevice;
let activeCall;
let voicetoken;
let environment;
let clientRole;
// let callType;
let controlsocket;
let messageString = "";

export const VoxrayPhone = () => {
  const [messages, setMessages] = useState("");
  const [registered, setRegistered] = useState(false);

  // const [showAgentSettings, setShowAgentSettings] = useState(false);

  async function runOnLoad() {
    myDevice = undefined;
    activeCall = undefined;
    registerVoiceClient();
    audiovisualizer.setupAudioVisualizerCanvas();
  }

  function getFromUrl(url) {
    return new Promise((resolve) => {
      const xmlhttp = new XMLHttpRequest();
      xmlhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
          resolve(this.responseText);
        }
      };
      xmlhttp.open("GET", url, true);
      xmlhttp.send();
    });
  }

  function sendEventOverControlSocket(event) {
    if (controlsocket === undefined) {
      return;
    }

    var message = {
      event: event,
    };

    console.log(">>> sending message: " + JSON.stringify(message));
    controlsocket.send(JSON.stringify(message));
  }

  // function sendConfigOverControlSocket(id, value) {
  //   if (controlsocket === undefined) {
  //     return;
  //   }

  //   var config = {};
  //   config[id] = value;

  //   var message = {
  //     config: config,
  //   };

  //   console.log(">>> sending message: " + JSON.stringify(message));
  //   controlsocket.send(JSON.stringify(message));
  // }

  // function setupWebsockToController() {
  //   var socket = new WebSocket(
  //     "wss://hc70rsykdc.execute-api.us-east-1.amazonaws.com/prod/"
  //   ); //issue is this is on port 3000 dev we need to set port
  //   // const socket = new WebSocket("ws://localhost:3001/controlsocket"); //for dev we need to set up websocket

  //   socket.onopen = function (event) {
  //     console.log("WebSocket call opened:", event);
  //     controlsocket = socket;
  //     sendEventOverControlSocket(clientRole + "-phone-connected");
  //   };

  //   socket.onmessage = function (event) {
  //     console.log("=== received event:", event);
  //     var data = JSON.parse(event.data);
  //     console.log("=== received data:", data);
  //     status(JSON.stringify(data));
  //     var command = data.control;
  //     var config = data.config;

  //     if (command !== undefined) {
  //       if (command === "do-register") {
  //         customerRegistration();
  //       } else if (command.startsWith("make-call")) {
  //         if (clientRole === "customer") {
  //           // "make-call-flex:test
  //           callTo(command.substring(10));
  //           //   makeCall(command.substring(10));
  //         } else {
  //           console.log("unexpected command from agent:", command);
  //         }
  //       } else if (command === "answer-call") {
  //         answer();
  //       } else if (command === "end-call") {
  //         disconnect();
  //       }
  //       // else if (command.startsWith("call-type-")) {
  //       //   callType = command.substring(10);
  //       //   updateCallType(callType);
  //       // }
  //       else if (command.startsWith("customer-type-")) {
  //         // updateCustomerType(command.substring(14));
  //       } else if (command.startsWith("set-marker-")) {
  //         audiovisualizer.addMarkerToVisualizer(command.substring(11));
  //       }
  //     }

  //     if (config !== undefined) {
  //       for (var key in config) {
  //         console.log("key: " + key + ", value: " + config[key]);
  //         //   updateConfigInGUI(key, config[key]);
  //       }
  //     }
  //   };

  //   socket.onerror = function (event) {
  //     console.log("WebSocket error:", event);
  //     status("------ Error connecting to test-controller ------\n", false);
  //     controlsocket = undefined;
  //   };

  //   socket.onclose = function (event) {
  //     console.log("WebSocket call closed:", event);
  //     status("", false);
  //     status("------ Connection to test-controller closed ------\n", false);
  //     controlsocket = undefined;
  //     updateCallButton("Call", true);
  //     if (activeCall === undefined) {
  //       // we are done with the device
  //       console.log("destroying device ...");
  //       myDevice.destroy();
  //       myDevice = undefined;
  //     }
  //   };
  // }

  //   function reportTextInput(text) {
  //     sendEventOverControlSocket("input: " + text);
  //   }

  // function reportConfigUpdate(id, value) {
  //   sendConfigOverControlSocket(id, value);
  // }

  function setState(state) {
    console.log("Set state: " + state);
  }

  function reportCallEvent(callEvent) {
    sendEventOverControlSocket(clientRole + "-" + callEvent);
  }

  /*
     All valid {@link Device} event names.
      export enum EventName {
        Error = 'error',
        Incoming = 'incoming',
        Destroyed = 'destroyed',
        Unregistered = 'unregistered',
        Registering = 'registering',
        Registered = 'registered',
        TokenWillExpire = 'tokenWillExpire',
      }
     */
  function registerTwilioDeviceHandlers(device) {
    device.on("incoming", function (conn) {
      status(
        "Call incoming: " +
          conn.parameters.From +
          ", Call SID: " +
          conn.parameters.CallSid +
          ""
      );
      setState("incoming");
      activeCall = conn;

      setupCallEventHandlers(activeCall);

      // updateCallButton("Answer", false);
      // updateDisconnectButton("Reject", false);

      reportCallEvent("call-incoming");
    });

    device.on("registered", (dev) => {
      status("Device ready to receive incoming calls\n");
      // updateRegistrationButton(true);
      // updateCallButton("Call", false);
      // updateDisconnectButton("Disconnect", true);
      if (controlsocket !== undefined) {
        reportCallEvent("registered:" + environment);
      }
    });

    device.on("unregistered", (dev) => {
      status("Device unregistered\n");
      updateRegistrationButton(false);
      updateCallButton("Call", true);
      updateDisconnectButton("Disconnect", false);
      if (controlsocket !== undefined) {
        reportCallEvent("unregistered:" + environment);
      }
    });

    device.on("tokenWillExpire", (dev) => {
      status("Device token is expiring\n");
      getFromUrl(
        "/voice/client_token?identity=" + clientRole + "&env=" + environment
      ).then((token) => dev.updateToken(token));
    });

    device.on("error", (dev) => {
      status("Device encountered error\n");
      updateRegistrationButton(false);
      updateCallButton("Call", true);
      updateDisconnectButton("Disconnect", false);
      if (controlsocket !== undefined) {
        reportCallEvent("errored:" + environment);
      }
    });

    device.on("destroyed", (dev) => {
      status("Device destroyed\n");
      updateRegistrationButton(true);
      updateCallButton("Call", true);
      updateDisconnectButton("Disconnect", true);
      if (controlsocket !== undefined) {
        reportCallEvent("destroyed:" + environment);
      }
    });
  }

  async function registerVoiceClient() {
    if (voicetoken === undefined) {
      let url =
        "https://90u5oq4e5j.execute-api.us-east-1.amazonaws.com/register-voice-client";
      let res = await axios.get(url);
      voicetoken = res.data;
      console.log(voicetoken);
    }
    createVoiceDevice();

    myDevice.register();
  }

  //   async function agentRegistration() {
  //     await registerVoiceClient();
  //   }

  // async function customerRegistration() {
  //   await registerVoiceClient();
  // }

  function setupCallEventHandlers(call) {
    if (!call) {
      console.error("undefined call object");
      return;
    }

    call.on("ringing", function (hasEarlyMedia) {
      status("Call ringing");
      if (hasEarlyMedia) {
        status("Has early media");
      }
      reportCallEvent("call-ringing");
      updateCallButton("Call", true);
      updateDisconnectButton("Cancel", false);
    });

    call.on("cancel", function (conn) {
      status("Call cancel");
      activeCall = undefined;
      setState("ready");
      updateCallButton("Call", false);
      if (controlsocket !== undefined) {
        // reportCallEvent('call-cancelled');
        reportCallEvent("call-ended");
      }
    });

    call.on("reject", function (conn) {
      status("Call reject");
      activeCall = undefined;
      setState("ready");
      updateCallButton("Call", false);
      if (controlsocket !== undefined) {
        // reportCallEvent('call-cancelled');
        reportCallEvent("call-ended");
      }
    });

    call.on("accept", function (conn) {
      // Happens in both incoming and outgoing calls
      console.log("Call direction:", conn.direction);
      if (conn.direction === "INCOMING") {
        status("Call accepted");
        updateCallButton("Call", true);
        updateDisconnectButton("Disconnect", false);
      } else {
        let to = conn.parameters.To || "test:conversationRelay";
        status(
          "Call accepted: " + to + ", Call SID: " + conn.parameters.CallSid + ""
        );
        updateCallButton("Call", true);
        updateDisconnectButton("Disconnect", false);
      }
      if (controlsocket !== undefined) {
        // reportCallEvent('call-answered');
        reportCallEvent("call-connected:" + conn.parameters.CallSid);
      }
    });

    call.on("disconnect", function (conn) {
      status("Call disconnected\n");
      activeCall = undefined;
      updateCallButton("Call", false);
      updateDisconnectButton("Disconnect", true);
      if (controlsocket !== undefined) {
        reportCallEvent("call-ended");
      }
    });

    call.on("transportClose", function (conn) {
      status("Call transportClose.\n");
      activeCall = undefined;
      updateCallButton("Call", false);
      updateDisconnectButton("Disconnect", true);
      if (controlsocket !== undefined) {
        reportCallEvent("call-ended");
      }
    });

    call.on("error", function (error) {
      status("Call error: " + error.message + " (" + error.code + ")\n");
      activeCall = undefined;
      updateCallButton("Call", false);
      updateDisconnectButton("Disconnect", true);
      if (controlsocket !== undefined) {
        reportCallEvent("call-errored");
      }
    });

    call.on("warning", function (name) {
      console.log("Network warning: " + name + "\n");
    });

    call.on("warning-cleared", function (name) {
      console.log("Network warning cleared: " + name + "\n");
    });
  }

  //   async function requestMeeting() {
  //     console.log("triggering test meeting through test server");
  //     reportCallEvent("meeting-request");
  //   }

  //   async function toggleCallType() {
  //     console.log("toggle call type on test server");
  //     reportCallEvent("toggle-call-type");
  //   }

  //   async function toggleCustomerType() {
  //     console.log("toggle customer type on test server");
  //     reportCallEvent("toggle-customer-type");
  //   }

  // async function sendText(value) {
  //   console.log("sending text to server: " + value);
  //   reportCallEvent("request-run-" + numberOfCalls);
  // }

  async function callTo(destination = undefined) {
    // we should have already registered
    if (myDevice === undefined) {
      console.log("voice device not created yet");
      return;
    }

    if (destination !== undefined) {
      console.log("calling " + destination + " ...");
      // params = {'To': destination, 'agent': 'client:' + clientRole};
      var params = { To: destination };
      activeCall = await myDevice.connect({ params });
    } else {
      console.log("calling ...");
      activeCall = await myDevice.connect();
    }

    setupCallEventHandlers(activeCall);
    audiovisualizer.analyze(activeCall);
  }

  // function answer() {
  //   if (activeCall === undefined) {
  //     console.log("call object not created yet");
  //     return;
  //   }
  //   activeCall.accept();
  // }

  function disconnect() {
    if (activeCall === undefined) {
      console.log("call object not created yet");
      return;
    }
    activeCall.disconnect();
  }

  function createVoiceDevice() {
    myDevice = new Device(voicetoken, {
      logLevel: 1,
      codecPreferences: ["opus", "pcmu"],
    });
    registerTwilioDeviceHandlers(myDevice);
  }

  function status(msg, log = true) {
    let message;
    if (log) {
      console.log("message is ", msg);
      if (msg.startsWith(`{"config"`) || msg.startsWith(`{"control":"set`)) {
        return;
      }
    }

    if (msg !== "") {
      message = "[" + new Date().toLocaleTimeString() + "] " + msg + "\n";
    } else {
      // just add a blank line
      message = "\n";
    }
    messageString += message;
    setMessages(messageString);
  }

  function updateCallButton(newText, disabled) {
    //   const callButton = document.getElementById("call-button");
    //   if (newText) {
    //     callButton.textContent = newText;
    //   }
    //   callButton.disabled = disabled;
  }

  function updateDisconnectButton(newText, disabled) {
    //   const disconnectButton = document.getElementById("disconnect-button");
    //   if (newText) {
    //     disconnectButton.textContent = newText;
    //   }
    //   disconnectButton.disabled = disabled;
  }

  function updateRegistrationButton(disabled) {
    //   const registrationButton = document.getElementById("registration-button");
    //   registrationButton.disabled = disabled;
  }

  useEffect(() => {
    // runOnLoad();
    // setRegistered(true);
  }, []);

  const register = async (e) => {
    e.preventDefault();
    runOnLoad(); //this is when socket is setup so we need to start setmessages here
    setRegistered(true);
  };

  const makeCall = (e) => {
    e.preventDefault();
    callTo("test:conversationRelay");
  };

  const hangupCall = (e) => {
    e.preventDefault();
    disconnect();
  };

  return (
    <Theme.Provider theme="Twilio">
      <Box paddingX="space100"></Box>
      <Box paddingX="space100">
        <Theme.Provider theme="Twilio">
          <Box display="flex" flexDirection="column">
            <Box padding="space50">
              <Heading as="h2" variant="heading20">
                ConversationRelay Test Client
              </Heading>
              <Stack orientation="horizontal" spacing="space60">
                {!registered ? (
                  <Button onClick={register} variant="primary">
                    Register
                  </Button>
                ) : (
                  <Button onClick={register} variant="secondary">
                    Registered
                  </Button>
                )}
                {!registered ? (
                  <Button onClick={makeCall} variant="secondary">
                    Call
                  </Button>
                ) : (
                  <Button onClick={makeCall} variant="primary">
                    Call
                  </Button>
                )}
                {!registered ? (
                  <Button onClick={hangupCall} variant="destructive_secondary">
                    Cancel
                  </Button>
                ) : (
                  <Button onClick={hangupCall} variant="destructive_secondary">
                    Disconnect
                  </Button>
                )}
              </Stack>
            </Box>

            <Box padding="space50">
              {/* Would only be important if calling in from PSTN? - how does client know which use case / configuration to use when calling */}
              {/* <Label>Profile</Label>
              <Profile /> */}
              <Label>Configuration</Label>
              <Configuration />
              <Label htmlFor="audio-visualizer">Audio Visualizer</Label>
              <canvas id="audio-visualizer"></canvas>
              <StatusArea status={messages} />
              <ReactAudioVisualizer />
              <Visualizer status={messages} />
            </Box>
          </Box>
        </Theme.Provider>
      </Box>
    </Theme.Provider>
  );
};

export default VoxrayPhone;
