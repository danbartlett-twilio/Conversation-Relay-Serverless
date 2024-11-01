import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Button,
  Grid,
  Column,
  Card,
  Heading,
  Form,
  FormControl,
  Label,
  Select,
  Option,
  TextArea,
  HelpText,
  Spinner,
  Stack,
  Paragraph,
  VisualPickerRadio,
  Toast,
} from "@twilio-paste/core";

import { CallIcon } from "@twilio-paste/icons/esm/CallIcon";
import { CallFailedIcon } from "@twilio-paste/icons/esm/CallFailedIcon";
import { CloseIcon } from "@twilio-paste/icons/esm/CloseIcon";
import { ChevronExpandIcon } from "@twilio-paste/icons/esm/ChevronExpandIcon";

import UseCaseModal from "./UseCaseModal";
import UseCasePicker from "./UseCasePicker";

// import Loading from "./Loading";
import setupCallEventHandlers from "../util/setupCallEventHandlers";
import audiovisualizer from "../templates/audiovisualizer";
import initialConfiguration from "../templates/initialConfiguration";

let activeCall;

export function Configuration(props) {
  // const myDevice = props.device;
  const websocketId = props.websocketId;
  const device = props.device;
  // const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState(initialConfiguration.array);

  async function callTo() {
    if (props.device === undefined) {
      console.log("voice device not created yet");
      return;
    }

    console.log("websocketID is: " + websocketId);
    var params = {
      To: "test:conversationRelay",
      useCaseTitle: config[template].pk,
      uiwebsocketId: websocketId,
    };

    activeCall = await props.device.connect({ params });

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

  // Agent Settings
  const [template, setTemplate] = useState(0);
  const [voice, setVoice] = useState([]);
  const voiceOptions = {
    google: ["en-US-Journey-D", "en-US-Journey-O"],
    amazon: ["Amy-Generative", "Matthew-Generative"],
  };

  // Data modal
  const [isOpen, setIsOpen] = useState(false);

  const useCaseURL =
    "https://8ldhh8emwh.execute-api.us-east-1.amazonaws.com/get-use-cases";

  const getConfig = async (e) => {
    try {
      const config = await axios.get(useCaseURL);
      setConfig(config.data.Items);
      setVoice(
        voiceOptions[config.data.Items[0].conversationRelayParams.ttsProvider]
      );
    } catch (e) {
      console.log(e);
    }
  };

  const handleConfigUpdate = (updatedConfig) => {
    setConfig(updatedConfig);
  };

  const handleVoiceUpdate = (updateVoiceOptions) => {
    setVoice(updateVoiceOptions);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const resetDemo = () => {
    console.log("init array", initialConfiguration.array);
    setConfig(initialConfiguration.array);
    // setTtsProvider(
    //   initialConfiguration.array[0].conversationRelayParams.ttsProvider
    // );
    setVoice(
      voiceOptions[
        initialConfiguration.array[0].conversationRelayParams.ttsProvider
      ]
    );
    console.log(config);
    // updateConfig();
  };

  useEffect(() => {
    getConfig();
  }, []);

  return (
    <div>
      <Paragraph>
        <Button onClick={resetDemo} variant="secondary">
          Reset Configuration Values
        </Button>
      </Paragraph>

      <UseCasePicker
        config={config}
        voice={voice}
        handleConfigUpdate={handleConfigUpdate}
        handleVoiceUpdate={handleVoiceUpdate}
        // websocketId={websocketId}
        // device={device}
      />

      <Grid gutter="space30" vertical>
        <Column>
          <Form></Form>
          <Button onClick={callTo} variant="primary">
            Call <CallIcon decorative={false} title="make call" />
          </Button>
          <Button onClick={hangupCall} variant="destructive">
            Disconnect
            <CallFailedIcon decorative={false} title="Description of icon" />
          </Button>
        </Column>
      </Grid>
    </div>
  );
}
export default Configuration;
