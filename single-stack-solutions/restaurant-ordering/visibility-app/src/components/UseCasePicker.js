import { useState, useEffect } from "react";
import axios from "axios";

import {
  VisualPickerRadioGroup,
  VisualPickerRadio,
  Button,
  Box,
  MediaOjbect,
  Avatar,
  MediaFigure,
  CodeIcon,
  Text,
  StatusBadge,
  AvatarGroup,
  CommunityIcon,
  MediaObject,
  MediaBody,
} from "@twilio-paste/core";
import { CallIcon } from "@twilio-paste/icons/esm/CallIcon";
import { CallFailedIcon } from "@twilio-paste/icons/esm/CallFailedIcon";

import UseCaseModal from "./UseCaseModal";
import setupCallEventHandlers from "../util/setupCallEventHandlers";
import audiovisualizer from "../templates/audiovisualizer";
import initialConfiguration from "../templates/initialConfiguration";

let activeCall;

export function UseCasePicker(props) {
  const [template, setTemplate] = useState("0");
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState(initialConfiguration.array);

  const websocketId = props.websocketId;
  const device = props.device;

  const [voice, setVoice] = useState([]);
  const voiceOptions = {
    google: [
      "en-US-Journey-D",
      "en-US-Journey-O",
      "fr-FR-Journey-F",
      "es-US-Journey-D",
    ],
    amazon: ["Amy-Generative", "Matthew-Generative"],
  };

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);
  const handleConfigure = (e) => {
    setIsOpen(true);
  };
  const handleConfigUpdate = (updatedConfig) => setConfig(updatedConfig);
  const handleVoiceUpdate = (updatedVoiceOptions) =>
    setVoice(updatedVoiceOptions);

  async function callTo() {
    console.log("template is", template);
    // we should have already registered
    if (device === undefined) {
      console.log("voice device not created yet");
      return;
    }
    console.log("websocketID is: " + websocketId);
    var params = {
      To: "test:conversationRelay",
      useCaseTitle: config[template].pk,
      uiwebsocketId: websocketId,
    };
    activeCall = await device.connect({ params });
    console.log(activeCall);
    setupCallEventHandlers(activeCall);
    audiovisualizer.analyze(activeCall);
  }

  const hangupCall = (e) => {
    e.preventDefault();
    if (activeCall === undefined) {
      console.log("call object not created yet");
      return;
    }
    activeCall.disconnect();
  };

  const useCaseURL =
    "https://8ldhh8emwh.execute-api.us-east-1.amazonaws.com/get-use-cases";

  const getConfig = async (e) => {
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

  const resetDemo = () => {
    console.log("init array", initialConfiguration.array);
    setConfig(initialConfiguration.array);
    // setTtsProvider(
    //   initialConfiguration.array[0].conversationRelayParams.ttsProvider
    // );
    // setVoice(
    //   voiceOptions[
    //     initialConfiguration.array[0].conversationRelayParams.ttsProvider
    //   ]
    // );
    console.log(config);
    // updateConfig();
  };

  useEffect(() => {
    getConfig();
  }, []);

  return (
    <div>
      <Button onClick={resetDemo} variant="secondary">
        Reset Configuration Values
      </Button>
      <UseCaseModal
        config={config}
        template={template}
        voice={voice}
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
              </Box>
            </Box>
          </VisualPickerRadio>
        ))}
      </VisualPickerRadioGroup>
    </div>
  );
}
export default UseCasePicker;
