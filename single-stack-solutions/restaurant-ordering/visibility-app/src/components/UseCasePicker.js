import { useState } from "react";

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

import UseCaseModal from "./UseCaseModal";

export function UseCasePicker(props) {
  const [template, setTemplate] = useState("0");
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  const handleConfigure = () => {
    setIsOpen(true);
  };

  async function callTo() {
    console.log("template is", template);
    // // we should have already registered
    // if (props.device === undefined) {
    //   console.log("voice device not created yet");
    //   return;
    // }
    // console.log("websocketID is: " + props.websocketId);
    // var params = {
    //   To: "test:conversationRelay",
    //   useCaseTitle: config[template].pk, //think this is accurate already confirm
    //   uiwebsocketId: props.websocketId,
    // }; //pass in pk from template
    // // var params = { To: "test:conversationRelay" }; //pass in pk from template - this is causing some issue for some reason
    // // we should handle this in function call to parent
    // // activeCall = await props.handleDeviceConnect({ params });
    // activeCall = await props.device.connect({ params });
    // console.log(activeCall);
    // setupCallEventHandlers(activeCall);
    // audiovisualizer.analyze(activeCall);
  }

  return (
    <div>
      <UseCaseModal
        config={props.config}
        template={template}
        voice={props.voice}
        isOpen={isOpen}
        handleOpen={handleOpen}
        handleClose={handleClose}
        handleConfigUpdate={props.handleConfigUpdate}
      />
      <VisualPickerRadioGroup
        legend="Select Use Case"
        name="visual-picker"
        value={template}
        onChange={(newTemplate) => {
          setTemplate(newTemplate);
        }}
      >
        {props.config.map((item, index) => (
          <VisualPickerRadio key={index} value={index.toString()}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <MediaObject verticalAlign="center">
                <MediaFigure spacing="space50">
                  {/* <Avatar
                    variant="entity"
                    icon={CodeIcon}
                    size="sizeIcon90"
                    name="code"
                    color="decorative20"
                  /> */}
                </MediaFigure>
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
                {template ? (
                  <StatusBadge as="span" variant="ConnectivityAvailable">
                    Enabled
                  </StatusBadge>
                ) : (
                  <StatusBadge as="span" variant="ConnectivityOffline">
                    Offline
                  </StatusBadge>
                )}
                <Button onClick={handleConfigure}>Configure</Button>
                <Button onClick={callTo} variant="primary">
                  Call <CallIcon decorative={false} title="make call" />
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
