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
} from "@twilio-paste/core";

export function Configuration(props) {
  const [config, setConfig] = useState([
    {
      pk: "",
      pk1: "",
      sk: "",
      sk1: "",
      conversationRelayParams: {
        dtmfDetection: "",
        interruptByDtmf: "",
        ttsProvider: "",
        voice: "",
        welcomeGreeting: "",
      },
      dtmfHandlers: "",
      prompt: "",
      title: "",
      description: "",
      tools: "",
    },
  ]);

  // Agent Settings
  const [systemContext, setSystemContext] = useState();
  const [welcomeGreeting, setWelcomeGreeting] = useState("Hello!");
  const [template, setTemplate] = useState(0);
  const [registered, setRegistered] = useState(false);
  const [showAgentSettings, setShowAgentSettings] = useState(false);
  const [language, setLanguage] = useState("en-US");
  const [ttsProvider, setTtsProvider] = useState("");
  const [voice, setVoice] = useState("");
  const [transcriptionProvider, setTranscriptionProvider] = useState("");
  const [speechModel, setSpeechModel] = useState("telephony");
  const [profanityFilter, setProfanityFilter] = useState("true");
  const [dtmfDetection, setDtmfDetection] = useState("false");
  const [interruptible, setInterruptible] = useState("true");
  const [aiModel, setAimodel] = useState("gpt-4o");

  const useCaseURL =
    "https://8ldhh8emwh.execute-api.us-east-1.amazonaws.com/get-use-cases";

  const getConfig = async (e) => {
    try {
      const config = await axios.get(useCaseURL);
      console.log(config?.data?.Items);
      setConfig(config.data.Items);
    } catch (e) {
      console.log(e);
    }
  };

  const handleTemplateChange = (e) => {
    setTemplate(e.target.value);
  };

  // Handle configuration changes in the GUI
  //   const handleElementBlur = (e) => {
  //     const element = e.target;
  //     // consider if we want to make any updates or we have a button instead to update
  //     // reportConfigUpdate(element.id, element.value);
  //   };

  const showOrHideAgentSettings = (e) => {
    showAgentSettings
      ? setShowAgentSettings(false)
      : setShowAgentSettings(true);
  };

  const updateConfig = async (e) => {
    // alert("To Do: update the new config to DB");
    e.preventDefault();
    console.log(config[template]);

    let data = config[template];
    // let data = {
    //   pk: "apartmentSearchUseCase",
    //   prompt: "prompt",
    //   conversationRelayParams: {
    //     welcomeGreeting: "hola",
    //   },
    // };

    const headers = {
      "Content-Type": "application/json",
    };

    const updateURL =
      "https://96r3z8mzvc.execute-api.us-east-1.amazonaws.com/update-use-cases";

    try {
      const res = await axios.post(updateURL, data, headers);
      console.log(res);
      getConfig();
    } catch (e) {
      console.log("Error", e);
    }
  };

  const handleFormChange = (e) => {
    console.log(e.target.id);
    const updatedConfig = [...config];
    updatedConfig[template].conversationRelayParams.welcomeGreeting =
      e.target.value;
    setConfig(updatedConfig);
  };

  useEffect(() => {
    getConfig();
  }, []);

  return (
    <div>
      <Button onClick={showOrHideAgentSettings} variant="secondary">
        Show/Hide
      </Button>
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
                    // onChange={(e) => setTtsProvider(e.target.value)}
                    onChange={(e) => {
                      const updatedConfig = [...config];
                      updatedConfig[
                        template
                      ].conversationRelayParams.ttsProvider = e.target.value;
                      setConfig(updatedConfig);
                    }}
                  >
                    <Option
                      value={
                        config[template].conversationRelayParams.ttsProvider
                      }
                    >
                      {config[template].conversationRelayParams.ttsProvider}
                    </Option>
                    <Option value="google">google</Option>
                    <Option value="amazon">amazon</Option>
                  </Select>
                </FormControl>
                <FormControl>
                  <Label htmlFor="voice" required>
                    Voice
                  </Label>
                  <Select
                    id={"voice"}
                    value={voice}
                    // onChange={(e) => setVoice(e.target.value)}
                    onChange={(e) => {
                      const updatedConfig = [...config];
                      updatedConfig[template].conversationRelayParams.voice =
                        e.target.value;
                      setConfig(updatedConfig);
                    }}
                  >
                    <Option
                      value={config[template].conversationRelayParams.voice}
                    >
                      {config[template].conversationRelayParams.ttsProvider}:{" "}
                      {config[template].conversationRelayParams.voice}
                    </Option>
                    <Option value="en-US-Neural2-F">
                      google: en-US-Neural2-F
                    </Option>
                    <Option value="en-US-Neural2-A">
                      google: en-US-Neural2-A
                    </Option>
                    <Option value="en-US-Journey-0">
                      google: en-US-Journey-0
                    </Option>
                    <Option value="en-US-Neural2-A">
                      amazon: Amy-Generative
                    </Option>
                    <Option value="en-US-Neural2-A">
                      amazon: Matthew-Generative
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
                    onChange={(e) => setTranscriptionProvider(e.target.value)}
                  >
                    <Option value="google">google</Option>
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
                  >
                    <Option value="telephony">telephony</Option>
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
                  >
                    <Option value="true">on</Option>
                    <Option value="false">off</Option>
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
                  >
                    {/* <Option
                      value={
                        config[template].conversationRelayParams.dtmfDetection
                      }
                    >
                      {config[template].conversationRelayParams.dtmfDetection}
                    </Option> */}
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
                    Select a use case
                  </Label>
                  <Select
                    id={"template"}
                    value={template}
                    onChange={(e) => handleTemplateChange(e)}
                  >
                    {config.map((item, index) => (
                      <Option key={index} value={index}>
                        {item.title}
                      </Option>
                    ))}
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
                  >
                    <Option value="gpt-4o">gpt-4o</Option>
                  </Select>
                </FormControl>
                <FormControl>
                  <Label htmlFor="prompt" required>
                    Agent Persona
                  </Label>
                  <TextArea
                    id="prompt"
                    name="prompt"
                    value={config[template]?.prompt}
                    // onChange={(e) => systemContext(e.target.value)}
                    onChange={(e) => {
                      const updatedConfig = [...config];
                      updatedConfig[template].prompt = e.target.value;
                      setConfig(updatedConfig);
                    }}
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
                    value={
                      config[template]?.conversationRelayParams.welcomeGreeting
                    }
                    onChange={(e) => {
                      const updatedConfig = [...config];
                      updatedConfig[
                        template
                      ].conversationRelayParams.welcomeGreeting =
                        e.target.value;
                      setConfig(updatedConfig);
                    }}
                    // onChange={(e) => handleFormChange(e)}
                    maxRows={5}
                    required
                  />
                </FormControl>
                <Button onClick={updateConfig} variant="primary">
                  Save Updates
                </Button>
              </Form>
            </Card>
          ) : (
            <div></div>
          )}
        </Column>
      </Grid>
    </div>
  );
}
export default Configuration;
