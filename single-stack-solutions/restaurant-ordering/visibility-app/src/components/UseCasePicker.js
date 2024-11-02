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
  Paragraph,
} from "@twilio-paste/core";
import { useToaster, Toaster } from "@twilio-paste/core/toast";

import { CallIcon } from "@twilio-paste/icons/esm/CallIcon";
import { CallFailedIcon } from "@twilio-paste/icons/esm/CallFailedIcon";

import UseCaseModal from "./UseCaseModal";
import Visualizer from "./Visualizer";
import setupCallEventHandlers from "../util/setupCallEventHandlers";
import audiovisualizer from "../templates/audiovisualizer";
import { initialConfiguration } from "../templates/initialConfiguration";

let activeCall;

const UseCasePicker = (props) => {
  const visualizerRef = useRef();

  const [template, setTemplate] = useState("0");
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState(initialConfiguration);
  // const [openWs, setOpenWs] = useState(false);
  const [websocketId, setWebsocketId] = useState("");

  // const updateWebsocketId = props.updateWebsocketId; //confirm if need both
  // const websocketId = props.websocketId;
  const device = props.device;

  const [voice, setVoice] = useState([]);
  const voiceOptions = {
    google: [
      "en-US-Journey-D",
      "en-US-Journey-O",
      "en-GB-Journey-D",
      "fr-FR-Neural2-C",
      "es-ES-Neural2-C",
      "ja-JP-Neural2-B",
    ],
    amazon: ["Amy-Generative", "Matthew-Generative"],
  };

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
  const handleVoiceUpdate = (updatedVoiceOptions) =>
    setVoice(updatedVoiceOptions);

  const updateWebsocketId = (newId) => {
    console.log("updating websocket ID to: " + newId);
    setWebsocketId(newId);
  };

  // const testOpenWs = async () => {
  //   if (visualizerRef.current) {
  //     visualizerRef.current.invokeSetupWebsockToController();
  //   }
  // };

  // const testCloseWs = async () => {
  //   if (visualizerRef.current) {
  //     visualizerRef.current.invokeCloseWebsockToController();
  //   }
  // };

  const callTo = async () => {
    // we need to open Websocket connection here and close on disconnect
    console.log("websocketID is: " + websocketId);

    if (visualizerRef.current && !websocketId) {
      visualizerRef.current.invokeSetupWebsockToController();
    }

    // we should have already registered
    if (!device) {
      console.log("voice device not created yet");
      return;
    }

    var params = {
      To: "test:conversationRelay",
      useCaseTitle: config[template].pk,
      uiwebsocketId: websocketId,
    };
    activeCall = await device.connect({ params });
    console.log(activeCall);
    setupCallEventHandlers(activeCall);
    audiovisualizer.analyze(activeCall);
  };

  const hangupCall = () => {
    if (visualizerRef.current) {
      visualizerRef.current.invokeCloseWebsockToController();
    }
    if (!activeCall) {
      console.log("call object not created yet");
      return;
    }
    activeCall.disconnect();
  };

  const useCaseURL =
    "https://8ldhh8emwh.execute-api.us-east-1.amazonaws.com/get-use-cases";

  const getConfig = async () => {
    try {
      const config = await axios.get(useCaseURL);
      setConfig(config.data.Items);
      setVoice(
        voiceOptions[
          config.data.Items[template].conversationRelayParams.ttsProvider
        ]
      );
    } catch (e) {
      console.log(e);
    }
  };

  const handleUpdate = async (data) => {
    handleToast(
      "Your updates are currently being deployed.",
      "neutral",
      3000,
      "neutralId"
    );
    const updateURL =
      "https://96r3z8mzvc.execute-api.us-east-1.amazonaws.com/update-use-cases";

    try {
      await axios.post(updateURL, data);
      toaster.pop("neutralId");
      handleToast(
        "Success! Your updates succeeded",
        "success",
        3000,
        "successId"
      );
    } catch (e) {
      console.log("Error", e);
      handleToast(
        "Unfortunately we ran into an error",
        "error",
        3000,
        "errorId"
      );
    }
  };

  const resetDemo = async () => {
    setConfig(initialConfiguration);
    initialConfiguration.forEach((item) => {
      console.log(item);
      setVoice(voiceOptions[item.conversationRelayParams.ttsProvider]); //voiceOptions(google or amazon)
      handleUpdate(item);
    });
  };

  useEffect(() => {
    getConfig();
  }, []);

  return (
    <div>
      <Toaster {...toaster} />
      <Paragraph>
        <Button onClick={resetDemo} variant="secondary">
          Reset Initial Configuration
        </Button>
      </Paragraph>
      <UseCaseModal
        config={config}
        template={template}
        voice={voice}
        voiceOptions={voiceOptions}
        isOpen={isOpen}
        handleOpen={handleOpen}
        handleClose={handleClose}
        handleConfigUpdate={handleConfigUpdate}
        handleVoiceUpdate={handleVoiceUpdate}
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
                <Button onClick={callTo} variant="primary">
                  Call <CallIcon decorative={false} title="make call" />
                </Button>
                <Button onClick={hangupCall} variant="destructive">
                  Disconnect
                  <CallFailedIcon
                    decorative={false}
                    title="Description of icon"
                  />
                </Button>
                {/* <Button onClick={testOpenWs}>OpenWs</Button>
                <Button onClick={testCloseWs}>CloseWs</Button> */}
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
