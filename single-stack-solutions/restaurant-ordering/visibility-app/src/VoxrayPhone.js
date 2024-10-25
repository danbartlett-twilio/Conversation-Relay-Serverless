import React, { useState, useEffect } from "react";
import axios from "axios";
import { Device } from "@twilio/voice-sdk";
import "./styles/VoxrayPhone.css";
import StatusArea from "./StatusArea";
// import Visualizer from "./Visualizer";
import Profile from "./components/DBProfile";
import Configuration from "./components/Configuration";
import audiovisualizer from "./templates/audiovisualizer";
import Visualizer from "./Visualizer";
import ReactAudioVisualizer from "./ReactAudioVisualizer";

// Twilio Paste
import { Theme } from "@twilio-paste/core/theme";
import {
  Stack,
  Card,
  Box,
  Grid,
  Column,
  TextArea,
  Select,
  Option,
  // PageHeader,
  // PageHeaderDetails,
  // PageHeaderHeading,
  // PageHeaderSetting,
  Heading,
  Button,
  Form,
  FormControl,
  Label,
  HelpText,
  // Paragraph,
} from "@twilio-paste/core";

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
  // Agent Settings
  const [systemContext, setSystemContext] = useState(`## Objective
        You are a voice AI agent assisting users with apartment leasing inquiries. Your primary tasks include scheduling tours, checking availability, providing apartment listings, and answering common questions about the properties. The current date is {{currentDate}}, so all date-related operations should assume this.
        
        ## Guidelines
        Voice AI Priority: This is a Voice AI system. Responses must be concise, direct, and conversational. Avoid any messaging-style elements like numbered lists, special characters, or emojis, as these will disrupt the voice experience.
        Critical Instruction: Ensure all responses are optimized for voice interaction, focusing on brevity and clarity. Long or complex responses will degrade the user experience, so keep it simple and to the point.
        Avoid repetition: Rephrase information if needed but avoid repeating exact phrases.
        Be conversational: Use friendly, everyday language as if you are speaking to a friend.
        Use emotions: Engage users by incorporating tone, humor, or empathy into your responses.
        Always Validate: When a user makes a claim about apartment details (e.g., square footage, fees), always verify the information against the actual data in the system before responding. Politely correct the user if their claim is incorrect, and provide the accurate information.
        DTMF Capabilities: Inform users that they can press '1' to list available apartments or '2' to check all currently scheduled appointments. This should be communicated subtly within the flow of the conversation, such as after the user asks for information or when there is a natural pause.
        Avoid Assumptions: Difficult or sensitive questions that cannot be confidently answered authoritatively should result in a handoff to a live agent for further assistance.
        Use Tools Frequently: Avoid implying that you will verify, research, or check something unless you are confident that a tool call will be triggered to perform that action. If uncertain about the next step or the action needed, ask a clarifying question instead of making assumptions about verification or research.
        
        ## Context
        Parkview Apartments is located in Missoula, Montana. All inquiries, listings, and availability pertain to this location. Ensure this geographical context is understood and avoid referencing other cities or locations unless explicitly asked by the user.
        
        ## Function Call Guidelines
        Order of Operations:
          - Always check availability before scheduling a tour.
          - Ensure all required information is collected before proceeding with a function call.
        
        ### Schedule Tour:
          - This function should only run as a single tool call, never with other tools
          - This function can only be called after confirming availability, but it should NEVER be called when the user asks for or confirms they'd like an SMS Confirmation. 
          - Required data includes date, time, tour type (in-person or self-guided), and apartment type.
          - If any required details are missing, prompt the user to provide them.
        
        ### Check Availability:
          - This function requires date, tour type, and apartment type.
          - If any of these details are missing, ask the user for them before proceeding.
          - If the user insists to hear availability, use the 'listAvailableApartments' function.
          - If the requested time slot is unavailable, suggest alternatives and confirm with the user.
        
        ### List Available Apartments: 
          - Trigger this function if the user asks for a list of available apartments or does not want to provide specific criteria.
          - Also use this function when the user inquires about general availability without specifying detailed criteria.
          - If criteria like move-in date, budget, or apartment layout are provided, filter results accordingly.
          - Provide concise, brief, summarized responses.
        
        ### Check Existing Appointments: 
          - Trigger this function if the user asks for details about their current appointments
          - Provide concise, brief, summarized responses.
        
        ### Common Inquiries:
          - Use this function to handle questions related to pet policy, fees, parking, specials, location, address, and other property details.
          - For any location or address inquiries, the system should always call the 'commonInquiries' function using the 'location' field.
          - If the user provides an apartment type, retrieve the specific address associated with that type from the database.
          - If no apartment type is specified, provide general location details.
        
        ### Live Agent Handoff:
          - Trigger the 'liveAgentHandoff' tool call if the user requests to speak to a live agent, mentions legal or liability topics, or any other sensitive subject where the AI cannot provide a definitive answer.
          - Required data includes a reason code ("legal", "liability", "financial", or "user-requested") and a brief summary of the user query.
          - If any of these situations arise, automatically trigger the liveAgentHandoff tool call.
        
        ### SMS Confirmations: 
          - SMS confirmations should NEVER be coupled with function calls to 'scheduleTour'.
          - Only offer to send an SMS confirmation if the user has successfully scheduled a tour, and the user agrees to receive one. 
          - If the user agrees, trigger the tool call 'sendAppointmentConfirmationSms' with the appointment details and the user's phone number, but do not trigger another 'scheduleTour' function call.
          - Do not ask for the user's phone number if you've already been referencing them by name during the conversation. Assume the phone number is already available to the function.
        
        ## Important Notes
        - Always ensure the user's input is fully understood before making any function calls.
        - If required details are missing, prompt the user to provide them before proceeding.
        `);
  const [welcomeGreeting, setWelcomeGreeting] = useState(
    "Hello, how can I help you with your apartment hunting needs?"
  );
  const [template, setTemplate] = useState("Real Estate");
  const [registered, setRegistered] = useState(false);
  const [showAgentSettings, setShowAgentSettings] = useState(false);
  const [language, setLanguage] = useState("en-US");
  const [ttsProvider, setTtsProvider] = useState("Google");
  const [voice, setVoice] = useState("en-US-Neural2-F");
  const [transcriptionProvider, setTranscriptionProvider] = useState("Google");
  const [speechModel, setSpeechModel] = useState("telephony");
  const [profanityFilter, setProfanityFilter] = useState("on");
  const [dtmfDetection, setDtmfDetection] = useState("false");
  const [interruptible, setInterruptible] = useState("true");
  const [aiModel, setAimodel] = useState("gpt-4o");

  async function runOnLoad() {
    // Access the global variable defined in the HTML page
    // console.log(pageData);

    // hide the option container on load
    //   setOptionContainerDisplay("none");
    // show the option container on load
    // setOptionContainerDisplay('flex');

    clientRole = extractClientRole(window.location.href);
    environment = extractEnvironment(window.location.search);
    myDevice = undefined;
    activeCall = undefined;
    // callType = "non-flex";

    console.log(
      "Loaded client: " + clientRole + " in environment: " + environment
    );

    registerVoiceClient();
    // customerRegistration();
    // setupWebsockToController();
    audiovisualizer.setupAudioVisualizerCanvas();
  }

  function extractEnvironment(queryString) {
    var params = new URLSearchParams(queryString);

    if (params.has("env")) {
      return params.get("env");
    }
    return "stage";
  }

  function extractClientRole(url) {
    // eslint-disable-next-line
    var regex = /\/([^\/?]+)\?/;

    var matchResult = url.match(regex);
    if (matchResult) {
      // The first element in the matchResult array contains the full matched portion
      var extractedPortion = matchResult[1];
      // console.log("Extracted Portion:", extractedPortion);
      // we might get .html at the end of the page url. Remove it
      return extractedPortion.replace(".html", "");
    }
    return "caller";
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

  function sendConfigOverControlSocket(id, value) {
    if (controlsocket === undefined) {
      return;
    }

    var config = {};
    config[id] = value;

    var message = {
      config: config,
    };

    console.log(">>> sending message: " + JSON.stringify(message));
    controlsocket.send(JSON.stringify(message));
  }

  function setupWebsockToController() {
    var socket = new WebSocket(
      "wss://hc70rsykdc.execute-api.us-east-1.amazonaws.com/prod/"
    ); //issue is this is on port 3000 dev we need to set port
    // const socket = new WebSocket("ws://localhost:3001/controlsocket"); //for dev we need to set up websocket

    socket.onopen = function (event) {
      console.log("WebSocket call opened:", event);
      controlsocket = socket;
      sendEventOverControlSocket(clientRole + "-phone-connected");
      // Get default config from GUI
      reportConfigUpdate("systemPrompt", systemContext);
      reportConfigUpdate("welcomeGreeting", welcomeGreeting);
    };

    socket.onmessage = function (event) {
      console.log("=== received event:", event);
      var data = JSON.parse(event.data);
      console.log("=== received data:", data);
      status(JSON.stringify(data));
      var command = data.control;
      var config = data.config;

      if (command !== undefined) {
        if (command === "do-register") {
          customerRegistration();
        } else if (command.startsWith("make-call")) {
          if (clientRole === "customer") {
            // "make-call-flex:test
            callTo(command.substring(10));
            //   makeCall(command.substring(10));
          } else {
            console.log("unexpected command from agent:", command);
          }
        } else if (command === "answer-call") {
          answer();
        } else if (command === "end-call") {
          disconnect();
        }
        // else if (command.startsWith("call-type-")) {
        //   callType = command.substring(10);
        //   updateCallType(callType);
        // }
        else if (command.startsWith("customer-type-")) {
          // updateCustomerType(command.substring(14));
        } else if (command.startsWith("set-marker-")) {
          audiovisualizer.addMarkerToVisualizer(command.substring(11));
        }
      }

      if (config !== undefined) {
        for (var key in config) {
          console.log("key: " + key + ", value: " + config[key]);
          //   updateConfigInGUI(key, config[key]);
        }
      }
    };

    socket.onerror = function (event) {
      console.log("WebSocket error:", event);
      status("------ Error connecting to test-controller ------\n", false);
      controlsocket = undefined;
    };

    socket.onclose = function (event) {
      console.log("WebSocket call closed:", event);
      status("", false);
      status("------ Connection to test-controller closed ------\n", false);
      controlsocket = undefined;
      updateCallButton("Call", true);
      if (activeCall === undefined) {
        // we are done with the device
        console.log("destroying device ...");
        myDevice.destroy();
        myDevice = undefined;
      }
    };
  }

  //   function reportTextInput(text) {
  //     sendEventOverControlSocket("input: " + text);
  //   }

  function reportConfigUpdate(id, value) {
    sendConfigOverControlSocket(id, value);
  }

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

  async function customerRegistration() {
    await registerVoiceClient();
  }

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

  function answer() {
    if (activeCall === undefined) {
      console.log("call object not created yet");
      return;
    }
    activeCall.accept();
  }

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

  // Handle configuration changes in the GUI
  const handleElementBlur = (e) => {
    const element = e.target;
    reportConfigUpdate(element.id, element.value);
  };

  const makeCall = (e) => {
    e.preventDefault();
    callTo("test:conversationRelay");
  };

  const hangupCall = (e) => {
    e.preventDefault();
    disconnect();
  };

  const handleTemplateChange = (e) => {
    setTemplate(e.target.value);
    let context;
    let greeting;
    if (e.target.value === "Real Estate") {
      context = `## Objective
        You are a voice AI agent assisting users with apartment leasing inquiries. Your primary tasks include scheduling tours, checking availability, providing apartment listings, and answering common questions about the properties. The current date is {{currentDate}}, so all date-related operations should assume this.
        
        ## Guidelines
        Voice AI Priority: This is a Voice AI system. Responses must be concise, direct, and conversational. Avoid any messaging-style elements like numbered lists, special characters, or emojis, as these will disrupt the voice experience.
        Critical Instruction: Ensure all responses are optimized for voice interaction, focusing on brevity and clarity. Long or complex responses will degrade the user experience, so keep it simple and to the point.
        Avoid repetition: Rephrase information if needed but avoid repeating exact phrases.
        Be conversational: Use friendly, everyday language as if you are speaking to a friend.
        Use emotions: Engage users by incorporating tone, humor, or empathy into your responses.
        Always Validate: When a user makes a claim about apartment details (e.g., square footage, fees), always verify the information against the actual data in the system before responding. Politely correct the user if their claim is incorrect, and provide the accurate information.
        DTMF Capabilities: Inform users that they can press '1' to list available apartments or '2' to check all currently scheduled appointments. This should be communicated subtly within the flow of the conversation, such as after the user asks for information or when there is a natural pause.
        Avoid Assumptions: Difficult or sensitive questions that cannot be confidently answered authoritatively should result in a handoff to a live agent for further assistance.
        Use Tools Frequently: Avoid implying that you will verify, research, or check something unless you are confident that a tool call will be triggered to perform that action. If uncertain about the next step or the action needed, ask a clarifying question instead of making assumptions about verification or research.
        
        ## Context
        Parkview Apartments is located in Missoula, Montana. All inquiries, listings, and availability pertain to this location. Ensure this geographical context is understood and avoid referencing other cities or locations unless explicitly asked by the user.
        
        ## Function Call Guidelines
        Order of Operations:
          - Always check availability before scheduling a tour.
          - Ensure all required information is collected before proceeding with a function call.
        
        ### Schedule Tour:
          - This function should only run as a single tool call, never with other tools
          - This function can only be called after confirming availability, but it should NEVER be called when the user asks for or confirms they'd like an SMS Confirmation. 
          - Required data includes date, time, tour type (in-person or self-guided), and apartment type.
          - If any required details are missing, prompt the user to provide them.
        
        ### Check Availability:
          - This function requires date, tour type, and apartment type.
          - If any of these details are missing, ask the user for them before proceeding.
          - If the user insists to hear availability, use the 'listAvailableApartments' function.
          - If the requested time slot is unavailable, suggest alternatives and confirm with the user.
        
        ### List Available Apartments: 
          - Trigger this function if the user asks for a list of available apartments or does not want to provide specific criteria.
          - Also use this function when the user inquires about general availability without specifying detailed criteria.
          - If criteria like move-in date, budget, or apartment layout are provided, filter results accordingly.
          - Provide concise, brief, summarized responses.
        
        ### Check Existing Appointments: 
          - Trigger this function if the user asks for details about their current appointments
          - Provide concise, brief, summarized responses.
        
        ### Common Inquiries:
          - Use this function to handle questions related to pet policy, fees, parking, specials, location, address, and other property details.
          - For any location or address inquiries, the system should always call the 'commonInquiries' function using the 'location' field.
          - If the user provides an apartment type, retrieve the specific address associated with that type from the database.
          - If no apartment type is specified, provide general location details.
        
        ### Live Agent Handoff:
          - Trigger the 'liveAgentHandoff' tool call if the user requests to speak to a live agent, mentions legal or liability topics, or any other sensitive subject where the AI cannot provide a definitive answer.
          - Required data includes a reason code ("legal", "liability", "financial", or "user-requested") and a brief summary of the user query.
          - If any of these situations arise, automatically trigger the liveAgentHandoff tool call.
        
        ### SMS Confirmations: 
          - SMS confirmations should NEVER be coupled with function calls to 'scheduleTour'.
          - Only offer to send an SMS confirmation if the user has successfully scheduled a tour, and the user agrees to receive one. 
          - If the user agrees, trigger the tool call 'sendAppointmentConfirmationSms' with the appointment details and the user's phone number, but do not trigger another 'scheduleTour' function call.
          - Do not ask for the user's phone number if you've already been referencing them by name during the conversation. Assume the phone number is already available to the function.
        
        ## Important Notes
        - Always ensure the user's input is fully understood before making any function calls.
        - If required details are missing, prompt the user to provide them before proceeding.
        `;
      greeting = "Hello, how can I help you with your apartment hunting needs?";
      setSystemContext(context);
      setWelcomeGreeting(greeting);
    } else if (e.target.value === "Apple Airpods") {
      context =
        "You are an outbound sales representative selling Apple Airpods. You have a youthful and cheery personality. Keep your responses short and try to get them to purchase apple airpods.";
      greeting = "Hello! How can I help?";
      setSystemContext(context);
      setWelcomeGreeting(greeting);
    } else if (e.target.value === "Nike Shoes") {
      context =
        "You are a customer support representative for Nike. You have a youthful and cheery personality. Keep your responses as brief as possible but make every attempt to keep the caller on the phone without being rude. Don't ask more than 1 question at a time. Don't make assumptions about what values to plug into functions. Ask for clarification if a user request is ambiguous. Speak out all prices to include the currency. Please help them decide between the Vaporfly, Air Max and Pegasus by asking questions like 'Do you prefer shoes that are for racing or for training?'. If they are trying to choose between the vaporfly and pegasus try asking them if they need a high mileage shoe. Once you know which shoe they would like ask them what size they would like to purchase and try to get them to place an order.";
      greeting = "Hi there!";
      setSystemContext(context);
      setWelcomeGreeting(greeting);
    } else {
      setSystemContext("");
      setWelcomeGreeting("");
    }
    reportConfigUpdate("systemPrompt", context);
    reportConfigUpdate("welcomeGreeting", greeting);
  };

  const showOrHideAgentSettings = (e) => {
    showAgentSettings
      ? setShowAgentSettings(false)
      : setShowAgentSettings(true);
  };

  return (
    <Theme.Provider theme="Twilio">
      <Box paddingX="space100">
        {/* <PageHeader size="default">
          <PageHeaderSetting></PageHeaderSetting>
          <PageHeaderDetails>
            <PageHeaderHeading>Voxray Tester</PageHeaderHeading>
          </PageHeaderDetails>
        </PageHeader> */}
      </Box>
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

                <Button onClick={showOrHideAgentSettings} variant="secondary">
                  Show/Hide
                </Button>
              </Stack>
            </Box>

            <Grid gutter="space30">
              <Column>
                {showAgentSettings ? (
                  <Card padding="space70">
                    <Heading as="h4" variant="heading40">
                      Voxray
                    </Heading>
                    <Form maxWidth="size70">
                      <FormControl>
                        <Label htmlFor="language" required>
                          Language
                        </Label>
                        <Select
                          id={"language"}
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          onBlur={(e) => handleElementBlur(e)}
                        >
                          <Option value="en-US">en-US</Option>
                        </Select>
                      </FormControl>
                      <FormControl>
                        <Label htmlFor="ttsProvider" required>
                          TTS Provider
                        </Label>
                        <Select
                          id={"ttsProvider"}
                          value={ttsProvider}
                          onChange={(e) => setTtsProvider(e.target.value)}
                          onBlur={(e) => handleElementBlur(e)}
                        >
                          <Option value="Google">Google</Option>
                        </Select>
                      </FormControl>
                      <FormControl>
                        <Label htmlFor="voice" required>
                          Voice
                        </Label>
                        <Select
                          id={"voice"}
                          value={voice}
                          onChange={(e) => setVoice(e.target.value)}
                          onBlur={(e) => handleElementBlur(e)}
                        >
                          <Option value="en-US-Neural2-F">
                            en-US-Neural2-F
                          </Option>
                          <Option value="en-US-Neural2-A">
                            en-US-Neural2-A
                          </Option>
                        </Select>
                      </FormControl>
                      <FormControl>
                        <Label htmlFor="transcriptionProvider" required>
                          Transcription Provider
                        </Label>
                        <Select
                          id={"transcriptionProvider"}
                          value={transcriptionProvider}
                          onChange={(e) =>
                            setTranscriptionProvider(e.target.value)
                          }
                          onBlur={(e) => handleElementBlur(e)}
                        >
                          <Option value="Google">Google</Option>
                        </Select>
                      </FormControl>
                      <FormControl>
                        <Label htmlFor="speechModel" required>
                          Speech Model
                        </Label>
                        <Select
                          id={"speechModel"}
                          value={speechModel}
                          onChange={(e) => setSpeechModel(e.target.value)}
                          onBlur={(e) => handleElementBlur(e)}
                        >
                          <Option value="telephony">Telephony</Option>
                        </Select>
                      </FormControl>
                      <FormControl>
                        <Label htmlFor="profanityFilter" required>
                          Profanity Filter
                        </Label>
                        <Select
                          id={"profanityFilter"}
                          value={profanityFilter}
                          onChange={(e) => setProfanityFilter(e.target.value)}
                          onBlur={(e) => handleElementBlur(e)}
                        >
                          <Option value="on">on</Option>
                        </Select>
                      </FormControl>
                      <FormControl>
                        <Label htmlFor="dtmfDetection" required>
                          DTMF Detection
                        </Label>
                        <Select
                          id={"dtmfDetection"}
                          value={dtmfDetection}
                          onChange={(e) => setDtmfDetection(e.target.value)}
                          onBlur={(e) => handleElementBlur(e)}
                        >
                          <Option value="false">false</Option>
                          <Option value="true">true</Option>
                        </Select>
                      </FormControl>
                      <FormControl>
                        <Label htmlFor="interruptible" required>
                          Allow Interruption
                        </Label>
                        <Select
                          id={"interruptible"}
                          value={interruptible}
                          onChange={(e) => setInterruptible(e.target.value)}
                          onBlur={(e) => handleElementBlur(e)}
                        >
                          <Option value="true">true</Option>
                          <Option value="false">false</Option>
                        </Select>
                      </FormControl>
                    </Form>
                  </Card>
                ) : (
                  <div></div>
                )}
              </Column>
              <Column>
                {showAgentSettings ? (
                  <Card padding="space70">
                    <Heading as="h4" variant="heading40">
                      Customer
                    </Heading>
                    <Form maxWidth="size70">
                      <FormControl>
                        <Label htmlFor="author" required>
                          Select an Agent Template
                        </Label>
                        <Select
                          id={"template"}
                          value={template}
                          onChange={(e) => handleTemplateChange(e)}
                        >
                          <Option value="Real Estate">Real Estate</Option>
                          <Option value="Apple Airpods">Apple Airpods</Option>
                          <Option value="Nike Shoes">Nike Shoes</Option>
                          <Option value="Custom">Custom</Option>
                        </Select>
                      </FormControl>
                      <FormControl>
                        <Label htmlFor="aiModel" required>
                          AI Model
                        </Label>

                        <Select
                          id={"aiModel"}
                          value={aiModel}
                          onChange={(e) => setAimodel(e.target.value)}
                          onBlur={(e) => handleElementBlur(e)}
                        >
                          <Option value="gpt-4o">gpt-4o</Option>
                        </Select>
                      </FormControl>
                      <FormControl>
                        <Label htmlFor="systemContext" required>
                          Agent Persona
                        </Label>
                        <TextArea
                          id="systemContext"
                          name="systemContext"
                          value={systemContext}
                          onChange={(e) => systemContext(e.target.value)}
                          onBlur={(e) => handleElementBlur(e)}
                          required
                        />
                        <HelpText id="aiPrompt_help_text">
                          Describe your agent in detail
                        </HelpText>
                      </FormControl>
                      <FormControl>
                        <Label htmlFor="welcomeGreeting" required>
                          Welcome Prompt
                        </Label>
                        <TextArea
                          id="welcomeGreeting"
                          name="welcomeGreeting"
                          value={welcomeGreeting}
                          onChange={(e) => setWelcomeGreeting(e.target.value)}
                          onBlur={(e) => handleElementBlur(e)}
                          maxRows={5}
                          required
                        />
                      </FormControl>
                    </Form>
                  </Card>
                ) : (
                  <div></div>
                )}
              </Column>
            </Grid>

            <Box padding="space50">
              <Label>Profile</Label>
              <Profile />
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
