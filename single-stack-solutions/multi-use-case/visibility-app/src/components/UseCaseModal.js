// import React, { useState } from "react";
import axios from "axios";

import {
  Button,
  Card,
  Heading,
  Form,
  FormControl,
  Label,
  Modal,
  ModalHeader,
  ModalHeading,
  ModalFooter,
  ModalFooterActions,
  ModalBody,
  Select,
  Option,
  TextArea,
  HelpText,
} from "@twilio-paste/core";

import { useToaster, Toaster } from "@twilio-paste/core/dist/toast";

export function UseCaseModal(props) {
  const toaster = useToaster();

  const handleToast = (message, variant, dismissAfter, id) => {
    toaster.push({
      message: message,
      variant: variant,
      dismissAfter: dismissAfter,
      id: id,
    });
  };

  // Define voice options
  const voiceOptions = props.voiceOptions;
  const config = props.config;
  const template = props.template;
  const voice = props.voice;
  const isOpen = props.isOpen;
  const handleConfigUpdate = props.handleConfigUpdate;
  const handleVoiceUpdate = props.handleVoiceUpdate;
  const speechModelOptions = props.speechModelOptions;
  const transcriptionProvider = props.transcriptionProvider;
  const handleTranscriptionUpdate = props.handleTranscriptionUpdate;

  const handleUpdate = async (e) => {
    handleToast(
      "Your updates are currently being deployed.",
      "neutral",
      3000,
      "neutralId"
    );

    let data = config[template];
    const updateURL = process.env.REACT_APP_UPDATE_USE_CASE_URL;

    try {
      await axios.post(updateURL, data);
      toaster.pop("neutralId");
      handleToast(
        "Success! Your updates succeeded",
        "success",
        3000,
        "successId"
      );
      setTimeout(() => {
        props.handleClose();
      }, 800);
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

  return (
    <div>
      <Toaster {...toaster} />
      <Modal isOpen={isOpen} onDismiss={props.handleClose} size="default">
        <ModalHeader>
          <ModalHeading as="h3">Configure Use Case</ModalHeading>
        </ModalHeader>
        <ModalBody>
          <Card padding="space70">
            <Heading as="h4" variant="heading40">
              Conversation Relay Parameters
            </Heading>
            <Form maxWidth="size70">
              <FormControl>
                <Label htmlFor="welcomeGreeting" required>
                  Welcome Prompt
                </Label>
                <HelpText as="div" color="colorTextWeak">
                  The sentence to be automatically played to the caller after
                  the call is answered
                </HelpText>
                <TextArea
                  name="welcomeGreeting"
                  value={
                    config[template]?.conversationRelayParams.welcomeGreeting
                  }
                  onChange={(e) => {
                    const updatedConfig = [...config];
                    updatedConfig[
                      template
                    ].conversationRelayParams.welcomeGreeting = e.target.value;
                    handleConfigUpdate(updatedConfig);
                  }}
                  maxRows={5}
                  required
                />
              </FormControl>
              <FormControl>
                <Label htmlFor="language">Language</Label>
                <HelpText as="div" color="colorTextWeak">
                  The language code that applies to both Speech-to-Text and
                  Text-to-Speech
                </HelpText>
                <Select
                  value={config[template]?.conversationRelayParams.language}
                  onChange={(e) => {
                    const updatedConfig = [...config];
                    updatedConfig[template].conversationRelayParams.language =
                      e.target.value;
                    handleConfigUpdate(updatedConfig);
                  }}
                >
                  <Option value="en-US">en-US</Option>
                  <Option value="en-GB">en-GB</Option>
                  <Option value="fr-FR">fr-FR</Option>
                  <Option value="es-US">es-US</Option>
                  <Option value="ja-JP">ja-JP</Option>
                </Select>
              </FormControl>
              <FormControl>
                <Label htmlFor="ttsProvider">TTS Provider</Label>
                <HelpText as="div" color="colorTextWeak">
                  The provider for Text-to-Speech
                </HelpText>
                <Select
                  value={config[template]?.conversationRelayParams.ttsProvider}
                  onChange={(e) => {
                    const updatedConfig = [...config];
                    updatedConfig[
                      template
                    ].conversationRelayParams.ttsProvider = e.target.value;
                    updatedConfig[template].conversationRelayParams.voice =
                      voiceOptions[e.target.value][0];
                    handleConfigUpdate(updatedConfig);
                    handleVoiceUpdate(voiceOptions[e.target.value]);
                  }}
                >
                  <Option value="google">google</Option>
                  <Option value="amazon">amazon</Option>
                </Select>
              </FormControl>
              <FormControl>
                <Label htmlFor="voice">Voice</Label>
                <HelpText as="div" color="colorTextWeak">
                  Voice for Text-to-Speech, choices vary based on ttsProvider
                </HelpText>
                {config[template].conversationRelayParams.ttsProvider && (
                  <Select
                    value={config[template].conversationRelayParams.voice}
                    onChange={(e) => {
                      const updatedConfig = [...config];
                      updatedConfig[template].conversationRelayParams.voice =
                        e.target.value;
                      handleConfigUpdate(updatedConfig);
                    }}
                  >
                    {/* {console.log(voice)} */}
                    {/* Options are dependent on TTS provider & Language need to update */}
                    {voice.map((option, index) => (
                      <Option key={index} value={option}>
                        {option}
                      </Option>
                    ))}
                  </Select>
                )}
              </FormControl>
              <FormControl>
                <Label htmlFor="transcriptionProvider">
                  Transcription Provider
                </Label>
                <HelpText as="div" color="colorTextWeak">
                  The provider for Speech-to-Text
                </HelpText>
                <Select
                  value={
                    config[template]?.conversationRelayParams
                      .transcriptionProvider
                  }
                  onChange={(e) => {
                    const updatedConfig = [...config];
                    updatedConfig[
                      template
                    ].conversationRelayParams.transcriptionProvider =
                      e.target.value;

                    updatedConfig[
                      template
                    ].conversationRelayParams.speechModel =
                      speechModelOptions[e.target.value][0];

                    handleConfigUpdate(updatedConfig);
                    handleTranscriptionUpdate(
                      speechModelOptions[e.target.value]
                    );
                  }}
                >
                  <Option value="google">google</Option>
                  <Option value="deepgram">deepgram</Option>
                </Select>
              </FormControl>
              <FormControl>
                <Label htmlFor="speechModel">Speech Model</Label>
                <HelpText as="div" color="colorTextWeak">
                  The speech model used for Speech-to-Text. The choices vary
                  based on transcriptionProvider
                </HelpText>
                <Select
                  value={config[template]?.conversationRelayParams.speechModel}
                  onChange={(e) => {
                    const updatedConfig = [...config];
                    updatedConfig[
                      template
                    ].conversationRelayParams.speechModel = e.target.value;
                    handleConfigUpdate(updatedConfig);
                  }}
                >
                  {/* Options are dependent on transcriptionProvider  */}
                  {transcriptionProvider.map((option, index) => (
                    <Option key={index} value={option}>
                      {option}
                    </Option>
                  ))}
                  {/*
                  <Option value="telephony">google: telephony</Option>
                  <Option value="nova-2-general">
                    deepgram: nova-2-general
                  </Option> */}
                </Select>
              </FormControl>
              <FormControl>
                <Label htmlFor="profanityFilter">Profanity Filter</Label>
                <HelpText as="div" color="colorTextWeak">
                  Specifies if Twilio should filter profanities out of your
                  speech transcription
                </HelpText>
                <Select
                  value={
                    config[template]?.conversationRelayParams.profanityFilter
                  }
                  onChange={(e) => {
                    const updatedConfig = [...config];
                    e.target.value === "true"
                      ? (updatedConfig[
                          template
                        ].conversationRelayParams.profanityFilter = true)
                      : (updatedConfig[
                          template
                        ].conversationRelayParams.profanityFilter = false);
                    handleConfigUpdate(updatedConfig);
                  }}
                >
                  <Option value="true">on</Option>
                  <Option value="false">off</Option>
                </Select>
              </FormControl>
              <FormControl>
                <Label htmlFor="dtmfDetection">DTMF Detection</Label>
                <HelpText as="div" color="colorTextWeak">
                  Specifies if keypresses on the phone should be sent over the
                  websocket. Default is DTMF turned off
                </HelpText>
                <Select
                  value={
                    config[template]?.conversationRelayParams.dtmfDetection
                  }
                  onChange={(e) => {
                    const updatedConfig = [...config];
                    e.target.value === "true"
                      ? (updatedConfig[
                          template
                        ].conversationRelayParams.dtmfDetection = true)
                      : (updatedConfig[
                          template
                        ].conversationRelayParams.dtmfDetection = false);
                    handleConfigUpdate(updatedConfig);
                  }}
                >
                  <Option value="false">false</Option>
                  <Option value="true">true</Option>
                </Select>
              </FormControl>
              <FormControl>
                <Label htmlFor="interruptible">Allow Interruption</Label>
                <HelpText as="div" color="colorTextWeak">
                  Specifies if you can interrupt Text-to-Speech
                </HelpText>
                <Select
                  value={
                    config[template]?.conversationRelayParams.interruptible
                  }
                  onChange={(e) => {
                    const updatedConfig = [...config];
                    e.target.value === "true"
                      ? (updatedConfig[
                          template
                        ].conversationRelayParams.interruptible = true)
                      : (updatedConfig[
                          template
                        ].conversationRelayParams.interruptible = false);
                    handleConfigUpdate(updatedConfig);
                  }}
                >
                  <Option value="true">true</Option>
                  <Option value="false">false</Option>
                </Select>
              </FormControl>
              <FormControl>
                <Label htmlFor="interruptByDtmf">
                  Allow Interruption by DTMF
                </Label>
                <HelpText as="div" color="colorTextWeak">
                  Specifies if DTMF keys can interrupt Text-to-Speech
                </HelpText>
                <Select
                  value={
                    config[template]?.conversationRelayParams.interruptByDtmf
                  }
                  onChange={(e) => {
                    const updatedConfig = [...config];
                    e.target.value === "true"
                      ? (updatedConfig[
                          template
                        ].conversationRelayParams.interruptByDtmf = true)
                      : (updatedConfig[
                          template
                        ].conversationRelayParams.interruptByDtmf = false);
                    handleConfigUpdate(updatedConfig);
                  }}
                >
                  <Option value="true">true</Option>
                  <Option value="false">false</Option>
                </Select>
              </FormControl>
            </Form>
          </Card>
          <Card padding="space30">
            <Heading as="h4" variant="heading40">
              Customer
            </Heading>
            <Form maxWidth="size70">
              <FormControl>
                <Label htmlFor="prompt" required>
                  Agent Persona
                </Label>
                <HelpText as="div" color="colorTextWeak">
                  Provide agent prompt for the LLM
                </HelpText>
                <TextArea
                  name="prompt"
                  value={config[template]?.prompt}
                  onChange={(e) => {
                    const updatedConfig = [...config];
                    updatedConfig[template].prompt = e.target.value;
                    handleConfigUpdate(updatedConfig);
                  }}
                  required
                />
              </FormControl>
            </Form>
          </Card>
        </ModalBody>
        <ModalFooter>
          <ModalFooterActions>
            <Button variant="secondary" onClick={props.handleClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleUpdate}>
              Save Updates
            </Button>
          </ModalFooterActions>
        </ModalFooter>
      </Modal>
    </div>
  );
}
export default UseCaseModal;
