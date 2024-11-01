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

import Loading from "./Loading";
import setupCallEventHandlers from "../util/setupCallEventHandlers";
import audiovisualizer from "../templates/audiovisualizer";
import initialConfiguration from "../templates/initialConfiguration";

let activeCall;

export function Configuration(props) {
  // const myDevice = props.device;
  const websocketId = props.websocketId;
  const device = props.device;
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState(initialConfiguration.array);

  async function callTo() {
    // we should have already registered
    if (props.device === undefined) {
      console.log("voice device not created yet");
      return;
    }

    console.log("websocketID is: " + websocketId);
    var params = {
      To: "test:conversationRelay",
      useCaseTitle: config[template].pk, //this needs to return selected index - or we move call
      uiwebsocketId: websocketId,
    }; //pass in pk from template
    // var params = { To: "test:conversationRelay" }; //pass in pk from template - this is causing some issue for some reason

    // we should handle this in function call to parent
    // activeCall = await props.handleDeviceConnect({ params });
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
  const [showAgentSettings, setShowAgentSettings] = useState(false);
  const [language, setLanguage] = useState("en-US");
  const [ttsProvider, setTtsProvider] = useState("amazon");
  const [voice, setVoice] = useState([]);
  const voiceOptions = {
    google: ["en-US-Journey-D", "en-US-Journey-O"],
    amazon: ["Amy-Generative", "Matthew-Generative"],
  };
  const [transcriptionProvider, setTranscriptionProvider] = useState("");
  const [speechModel, setSpeechModel] = useState("telephony");
  const [profanityFilter, setProfanityFilter] = useState("true");
  const [dtmfDetection, setDtmfDetection] = useState("true");
  const [interruptible, setInterruptible] = useState("true");
  const [aiModel, setAimodel] = useState("gpt-4o");

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
      setLoading(false);
    } catch (e) {
      console.log(e);
    }
  };

  const handleConfigUpdate = (updatedConfig) => {
    setConfig(updatedConfig);
  };

  const handleTemplateChange = (e) => {
    setShowAgentSettings(true);
    setTemplate(e.target.value);
    console.log(config);
    setVoice(
      voiceOptions[config[e.target.value].conversationRelayParams.ttsProvider]
    );
  };

  const showOrHideAgentSettings = (e) => {
    showAgentSettings
      ? setShowAgentSettings(false)
      : setShowAgentSettings(true);
  };

  const updateConfig = async (e) => {
    setIsOpen(true);
    setLoading(true);
    e.preventDefault();
    console.log(config[template]);

    let data = config[template];
    const headers = {
      "Content-Type": "application/json",
    };

    const updateURL =
      "https://96r3z8mzvc.execute-api.us-east-1.amazonaws.com/update-use-cases";

    try {
      const res = await axios.post(updateURL, data, headers);
      console.log(res);
      setLoading(false);
      // setIsOpen(false);
    } catch (e) {
      console.log("Error", e);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const resetDemo = () => {
    console.log("init array", initialConfiguration.array);
    setConfig(initialConfiguration.array);
    setTtsProvider(
      initialConfiguration.array[0].conversationRelayParams.ttsProvider
    );
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
      {loading ? (
        <div>
          <Spinner size="sizeIcon110" decorative={false} title="Loading" />
        </div>
      ) : (
        <div></div>
      )}
      <Paragraph>
        <Button onClick={resetDemo} variant="secondary">
          Reset Configuration Values
        </Button>
      </Paragraph>

      <Loading
        isOpen={isOpen}
        isLoading={loading}
        handleClose={handleClose}
        loadingMessage={"Loading"}
        successMessage={"Updated!"}
      />

      <UseCasePicker
        config={config}
        voice={voice}
        handleConfigUpdate={handleConfigUpdate}
        // websocketId={websocketId}
        // device={device}
      />
      {/* <Select
        id={"template"}
        value={template}
        onChange={(e) => handleTemplateChange(e)}
      >
        {config.map((item, index) => (
          <Option key={index} value={index}>
            {item.title}
          </Option>
        ))}
      </Select> */}

      <Grid gutter="space30" vertical>
        <Column>
          <Form>
            {/* <Button onClick={showOrHideAgentSettings} variant="secondary">
              Show/Hide
              <ChevronExpandIcon
                decorative={false}
                title="Description of icon"
              />
              {loading ? (
                <div>
                  <Stack orientation="horizontal" spacing="space30">
                    <Spinner
                      size="sizeIcon110"
                      decorative={false}
                      title="Loading"
                    />
                  </Stack>
                </div>
              ) : (
                <div></div>
              )}
            </Button> */}
          </Form>
          <Button onClick={callTo} variant="primary">
            Call <CallIcon decorative={false} title="make call" />
          </Button>
          <Button onClick={hangupCall} variant="destructive">
            Disconnect
            <CallFailedIcon decorative={false} title="Description of icon" />
          </Button>
        </Column>
        <Column>
          <Grid gutter="space30">
            <Column>
              {showAgentSettings ? (
                <div></div>
              ) : (
                // <Card padding="space70">
                //   <Heading as="h4" variant="heading40">
                //     Conversation Relay
                //   </Heading>
                //   <Form maxWidth="size70">
                //     <FormControl>
                //       <Label htmlFor="language" required>
                //         Language
                //       </Label>
                //       <Select
                //         id={"language"}
                //         value={language}
                //         onChange={(e) => setLanguage(e.target.value)}
                //       >
                //         <Option value="en-US">en-US</Option>
                //       </Select>
                //     </FormControl>
                //     <FormControl>
                //       <Label htmlFor="ttsProvider" required>
                //         TTS Provider
                //       </Label>
                //       <Select
                //         id={"ttsProvider"}
                //         value={
                //           config[template].conversationRelayParams.ttsProvider
                //         }
                //         // onChange={(e) => setTtsProvider(e.target.value)}
                //         onChange={(e) => {
                //           const updatedConfig = [...config];
                //           updatedConfig[
                //             template
                //           ].conversationRelayParams.ttsProvider =
                //             e.target.value;
                //           updatedConfig[
                //             template
                //           ].conversationRelayParams.voice =
                //             voiceOptions[e.target.value][0];
                //           setConfig(updatedConfig);
                //           setTtsProvider(e.target.value);
                //           setVoice(voiceOptions[e.target.value]);
                //         }}
                //       >
                //         <Option value="google">google</Option>
                //         <Option value="amazon">amazon</Option>
                //       </Select>
                //     </FormControl>
                //     <FormControl>
                //       <Label htmlFor="voice" required>
                //         Voice
                //       </Label>
                //       {ttsProvider && (
                //         <Select
                //           id={"voice"}
                //           value={config[template].conversationRelayParams.voice}
                //           // onChange={(e) => setVoice(e.target.value)}
                //           onChange={(e) => {
                //             const updatedConfig = [...config];
                //             updatedConfig[
                //               template
                //             ].conversationRelayParams.voice = e.target.value;
                //             setConfig(updatedConfig);
                //           }}
                //         >
                //           {/* <Option
                //             value={
                //               config[template].conversationRelayParams.voice
                //             }
                //           >
                //             {
                //               config[template].conversationRelayParams
                //                 .ttsProvider
                //             }
                //             : {config[template].conversationRelayParams.voice}
                //           </Option> */}

                //           {voice.map((option, index) => (
                //             <Option key={index} value={option}>
                //               {option}
                //             </Option>
                //           ))}
                //         </Select>
                //       )}
                //       {/* <Select
                //         id={"voice"}
                //         value={config[template].conversationRelayParams.voice}
                //         // onChange={(e) => setVoice(e.target.value)}
                //         onChange={(e) => {
                //           const updatedConfig = [...config];
                //           updatedConfig[
                //             template
                //           ].conversationRelayParams.voice = e.target.value;
                //           setConfig(updatedConfig);
                //         }}
                //       > */}
                //       {/* <Option
                //           value={config[template].conversationRelayParams.voice}
                //         >
                //           {config[template].conversationRelayParams.ttsProvider}
                //           : {config[template].conversationRelayParams.voice}
                //         </Option> */}

                //       {/* <Option value="en-US-Neural2-F">
                //           google: en-US-Neural2-F
                //         </Option>
                //         <Option value="en-US-Neural2-A">
                //           google: en-US-Neural2-A
                //         </Option>
                //         <Option value="en-US-Journey-O">
                //           google: en-US-Journey-O
                //         </Option>
                //         <Option value="Amy-Generative">
                //           amazon: Amy-Generative
                //         </Option>
                //         <Option value="Matthew-Generative">
                //           amazon: Matthew-Generative
                //         </Option> */}
                //       {/* </Select> */}
                //     </FormControl>
                //     <FormControl>
                //       <Label htmlFor="transcriptionProvider" required>
                //         Transcription Provider
                //       </Label>
                //       <Select
                //         id={"transcriptionProvider"}
                //         value={transcriptionProvider}
                //         onChange={(e) =>
                //           setTranscriptionProvider(e.target.value)
                //         }
                //       >
                //         <Option value="google">google</Option>
                //       </Select>
                //     </FormControl>
                //     <FormControl>
                //       <Label htmlFor="speechModel" required>
                //         Speech Model
                //       </Label>
                //       <Select
                //         id={"speechModel"}
                //         value={speechModel}
                //         onChange={(e) => setSpeechModel(e.target.value)}
                //       >
                //         <Option value="telephony">telephony</Option>
                //       </Select>
                //     </FormControl>
                //     <FormControl>
                //       <Label htmlFor="profanityFilter" required>
                //         Profanity Filter
                //       </Label>
                //       <Select
                //         id={"profanityFilter"}
                //         value={profanityFilter}
                //         onChange={(e) => setProfanityFilter(e.target.value)}
                //       >
                //         <Option value="true">on</Option>
                //         <Option value="false">off</Option>
                //       </Select>
                //     </FormControl>
                //     <FormControl>
                //       <Label htmlFor="dtmfDetection" required>
                //         DTMF Detection
                //       </Label>
                //       <Select
                //         id={"dtmfDetection"}
                //         value={dtmfDetection}
                //         onChange={(e) => setDtmfDetection(e.target.value)}
                //       >
                //         {/* <Option
                //       value={
                //         config[template].conversationRelayParams.dtmfDetection
                //       }
                //     >
                //       {config[template].conversationRelayParams.dtmfDetection}
                //     </Option> */}
                //         <Option value="false">false</Option>
                //         <Option value="true">true</Option>
                //       </Select>
                //     </FormControl>
                //     <FormControl>
                //       <Label htmlFor="interruptible" required>
                //         Allow Interruption
                //       </Label>
                //       <Select
                //         id={"interruptible"}
                //         value={interruptible}
                //         onChange={(e) => setInterruptible(e.target.value)}
                //       >
                //         <Option value="true">true</Option>
                //         <Option value="false">false</Option>
                //       </Select>
                //     </FormControl>
                //   </Form>
                // </Card>
                <div></div>
              )}
            </Column>
            <Column>
              {showAgentSettings ? (
                <div></div>
              ) : (
                // <Card padding="space30">
                //   <Heading as="h4" variant="heading40">
                //     Customer
                //   </Heading>
                //   <Form maxWidth="size70">
                //     <FormControl>
                //       <Label htmlFor="author" required>
                //         Select a use case
                //       </Label>
                //       <Select
                //         id={"template"}
                //         value={template}
                //         onChange={(e) => handleTemplateChange(e)}
                //       >
                //         {config.map((item, index) => (
                //           <Option key={index} value={index}>
                //             {item.title}
                //           </Option>
                //         ))}
                //       </Select>
                //     </FormControl>
                //     {/* <FormControl>
                //       <Label htmlFor="aiModel" required>
                //         AI Model
                //       </Label>

                //       <Select
                //         id={"aiModel"}
                //         value={aiModel}
                //         onChange={(e) => setAimodel(e.target.value)}
                //       >
                //         <Option value="gpt-4o">gpt-4o</Option>
                //       </Select>
                //     </FormControl> */}
                //     <FormControl>
                //       <Label htmlFor="prompt" required>
                //         Agent Persona
                //       </Label>
                //       <TextArea
                //         id="prompt"
                //         name="prompt"
                //         value={config[template]?.prompt}
                //         // onChange={(e) => systemContext(e.target.value)}
                //         onChange={(e) => {
                //           const updatedConfig = [...config];
                //           updatedConfig[template].prompt = e.target.value;
                //           setConfig(updatedConfig);
                //         }}
                //         required
                //       />
                //       <HelpText id="aiPrompt_help_text">
                //         Describe your agent in detail
                //       </HelpText>
                //     </FormControl>
                //     <FormControl>
                //       <Label htmlFor="welcomeGreeting" required>
                //         Welcome Prompt
                //       </Label>
                //       <TextArea
                //         id="welcomeGreeting"
                //         name="welcomeGreeting"
                //         value={
                //           config[template]?.conversationRelayParams
                //             .welcomeGreeting
                //         }
                //         onChange={(e) => {
                //           const updatedConfig = [...config];
                //           updatedConfig[
                //             template
                //           ].conversationRelayParams.welcomeGreeting =
                //             e.target.value;
                //           setConfig(updatedConfig);
                //         }}
                //         // onChange={(e) => handleFormChange(e)}
                //         maxRows={5}
                //         required
                //       />
                //     </FormControl>
                //     <Button onClick={updateConfig} variant="primary">
                //       Save Updates
                //     </Button>
                //   </Form>
                // </Card>
                <div></div>
              )}
            </Column>
          </Grid>
        </Column>
      </Grid>
    </div>
  );
}
export default Configuration;
