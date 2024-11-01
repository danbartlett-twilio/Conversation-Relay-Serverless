import React, { useState } from "react";
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
  Modal,
  ModalHeader,
  ModalHeading,
  ModalFooter,
  ModalFooterActions,
  ModalBody,
  Paragraph,
  Select,
  Option,
  TextArea,
  HelpText,
  Stack,
  Spinner,
} from "@twilio-paste/core";

export function UseCaseModal(props) {
  // Define voice options
  const voiceOptions = {
    google: ["en-US-Journey-D", "en-US-Journey-O"],
    amazon: ["Amy-Generative", "Matthew-Generative"],
  };

  const config = props.config;
  const template = props.template;
  const voice = props.voice;
  const isOpen = props.isOpen;
  const handleConfigUpdate = props.handleConfigUpdate;

  const handleUpdate = async (e) => {
    // setIsOpen(true);
    // setLoading(true);
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
      // setLoading(false);
      // setIsOpen(false);
    } catch (e) {
      console.log("Error", e);
    }
  };

  return (
    <div>
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
                  <Option value="fr">fr</Option>
                  <Option value="es">es</Option>
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
                    // setConfig(updatedConfig);
                    // setTtsProvider(e.target.value);
                    // setVoice(voiceOptions[e.target.value]);
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
                      updatedConfig[
                        template
                      ].conversationRelayParams.ttsProvider = e.target.value;
                      handleConfigUpdate(updatedConfig);
                    }}
                  >
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
                  The provider for speech recognition
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
                    handleConfigUpdate(updatedConfig);
                  }}
                >
                  <Option value="google">google</Option>
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
                  <Option value="telephony">telephony</Option>
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
                    updatedConfig[
                      template
                    ].conversationRelayParams.profanityFilter = e.target.value;
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
                    updatedConfig[
                      template
                    ].conversationRelayParams.dtmfDetection = e.target.value;
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
                  Specifies if DTMF keys can interrupt Text-to-Speech
                </HelpText>
                <Select
                  value={
                    config[template]?.conversationRelayParams.interruptible
                  }
                  onChange={(e) => {
                    const updatedConfig = [...config];
                    updatedConfig[
                      template
                    ].conversationRelayParams.interruptible = e.target.value;
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
