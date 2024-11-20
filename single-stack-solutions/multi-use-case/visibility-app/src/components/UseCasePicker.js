import { useState, useEffect, useRef } from "react";
import axios from "axios";

import {
  VisualPickerRadioGroup,
  VisualPickerRadio,
  Button,
  Box,
  MediaFigure,
  Text,
  StatusBadge,
  MediaObject,
  MediaBody,
  Stack,
} from "@twilio-paste/core";
import { useToaster, Toaster } from "@twilio-paste/core/dist/toast";

import { CallIcon } from "@twilio-paste/icons/esm/CallIcon";
import { CallFailedIcon } from "@twilio-paste/icons/esm/CallFailedIcon";

import UseCaseModal from "./UseCaseModal";
import Visualizer from "./Visualizer";
import audiovisualizer from "../templates/audiovisualizer";
import { initialConfiguration } from "../templates/initialConfiguration";

const UseCasePicker = (props) => {
  const visualizerRef = useRef();

  const useCaseURL = process.env.REACT_APP_GET_USE_CASE_URL;
  const updateURL = process.env.REACT_APP_UPDATE_USE_CASE_URL;
  const refreshApartmentsURL = process.env.REACT_APP_REFRESH_APARTMENTS_URL;

  const [template, setTemplate] = useState("0");
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState(initialConfiguration);

  let activeCall;
  let websocketId;

  const device = props.device;
  const loading = props.loading;

  const toaster = useToaster();

  const handleToast = (message, variant, dismissAfter, id) => {
    toaster.push({
      message: message,
      variant: variant,
      dismissAfter: dismissAfter,
      id: id,
    });
  };

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);
  const handleConfigure = (e) => {
    setIsOpen(true);
  };
  const handleConfigUpdate = (updatedConfig) => setConfig(updatedConfig);

  const updateWebsocketId = (newId) => {
    console.log("updating websocket ID to: " + newId);
    websocketId = newId;
    callTo();
  };

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
      activeCall = undefined;
    });

    call.on("reject", function (conn) {
      console.log("Call reject");
      activeCall = undefined;
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
      activeCall = undefined;
    });

    call.on("transportClose", function (conn) {
      console.log("Call transportClose.\n");
      activeCall = undefined;
    });

    call.on("error", function (error) {
      console.log("Call error: " + error.message + " (" + error.code + ")\n");
      activeCall = undefined;
    });

    call.on("warning", function (name) {
      console.log("Network warning: " + name + "\n");
    });

    call.on("warning-cleared", function (name) {
      console.log("Network warning cleared: " + name + "\n");
    });
  }

  const callTo = async () => {
    // Setup Websocket
    if (activeCall) {
      return;
    } else {
      // We also need to check if websocket connection exists
      if (visualizerRef.current && !websocketId) {
        console.log("Initializing websocket connection");
        visualizerRef.current.invokeSetupWebsockToController();
      } else {
        if (!device) {
          handleToast(
            "Please refresh the page, voice device not created",
            "error",
            3000,
            "deviceErrorToast"
          );
          console.log("voice device not created yet");
          return;
        }
        console.log("websocketId is: " + websocketId);
        // Place call
        var params = {
          To: "test:conversationRelay",
          useCaseTitle: config[template].pk,
          uiwebsocketId: websocketId,
        };

        activeCall = await device.connect({ params });
        setupCallEventHandlers(activeCall);
        audiovisualizer.analyze(activeCall);
      }
    }
  };

  const hangupCall = () => {
    if (!activeCall) {
      console.log("Call object not created yet");
      return;
    } else {
      // Disconnect call
      activeCall.disconnect();
      // Close websocket connection
      websocketId = null;
      if (visualizerRef.current) {
        visualizerRef.current.invokeCloseWebsockToController();
      }
    }
  };

  const handleUpdate = async (data) => {
    try {
      const res = await axios.post(updateURL, data);
      console.log(res);
    } catch (e) {
      console.log("Error", e);
    }
  };

  const resetDemo = async () => {
    handleToast(
      "Refreshing apartment data and resetting use case configuration",
      "neutral",
      3000,
      "resetDemo"
    );
    setConfig(initialConfiguration);
    initialConfiguration.forEach((item) => {
      handleUpdate(item);
    });
    try {
      const refreshApartments = await axios.post(refreshApartmentsURL);
      console.log(refreshApartments);
      toaster.pop("resetDemo");
      handleToast("Refreshed data!", "success", 3000, "resetDemoSuccess");
    } catch (e) {
      console.log(e);
      toaster.pop("resetDemo");
      handleToast(
        "There was an error refreshing data",
        "error",
        3000,
        "resetDemoError"
      );
    }
  };

  useEffect(() => {
    const getConfig = async () => {
      try {
        const config = await axios.get(useCaseURL);
        setConfig(config.data.Items);
      } catch (e) {
        console.log(e);
      }
    };
    getConfig();
  }, [useCaseURL]);

  return (
    <div>
      <Toaster {...toaster} />
      <Stack orientation="horizontal" spacing="space60">
        <Button onClick={resetDemo} variant="secondary" loading={loading}>
          Reset Demo
        </Button>
        <Button onClick={callTo} variant="primary" loading={loading}>
          Call <CallIcon decorative={false} title="make call" />
        </Button>
        <Button onClick={hangupCall} variant="destructive" loading={loading}>
          Disconnect
          <CallFailedIcon decorative={false} title="Description of icon" />
        </Button>
      </Stack>
      <UseCaseModal
        config={config}
        template={template}
        isOpen={isOpen}
        handleOpen={handleOpen}
        handleClose={handleClose}
        handleConfigUpdate={handleConfigUpdate}
      />
      <VisualPickerRadioGroup
        legend="Select Use Case"
        name="visual-picker"
        value={template}
        onChange={(newTemplate) => {
          setTemplate(newTemplate);
        }}
      >
        {config.map((item, index) => (
          <VisualPickerRadio key={index} value={index.toString()}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <MediaObject verticalAlign="center">
                <MediaFigure spacing="space50"></MediaFigure>
                <MediaBody>
                  <Text as="div" fontWeight="fontWeightSemibold">
                    {item.title}
                  </Text>
                  <Text as="div" color="colorTextWeak">
                    TTS Provider: {item.conversationRelayParams.ttsProvider}{" "}
                    Voice: {item.conversationRelayParams.voice}
                  </Text>
                </MediaBody>
              </MediaObject>
              <Box>
                <MediaObject verticalAlign="center">
                  <MediaFigure spacing="space50"></MediaFigure>
                  <MediaBody>
                    <Text as="div" fontWeight="fontWeightSemibold">
                      Welcome:
                    </Text>
                    <Text as="div" color="colorTextWeak">
                      {item.conversationRelayParams.welcomeGreeting}
                    </Text>
                  </MediaBody>
                </MediaObject>
              </Box>
              <Box display="flex" columnGap="space50">
                {template === index.toString() ? (
                  <StatusBadge as="span" variant="ConnectivityAvailable">
                    Enabled
                  </StatusBadge>
                ) : (
                  <StatusBadge as="span" variant="ConnectivityOffline">
                    Disabled
                  </StatusBadge>
                )}
                <Button onClick={handleConfigure} variant="secondary">
                  Configure
                </Button>
              </Box>
            </Box>
          </VisualPickerRadio>
        ))}
      </VisualPickerRadioGroup>
      <Visualizer
        updateWebsocketId={updateWebsocketId}
        ref={visualizerRef}
        welcomeGreeting={
          config[template].conversationRelayParams.welcomeGreeting
        }
      />
    </div>
  );
};

export default UseCasePicker;
