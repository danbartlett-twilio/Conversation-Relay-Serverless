import React, { useEffect, useRef } from "react";
import { TextArea, Box, Label } from "@twilio-paste/core";

export function StatusArea(props) {
  const textLog = useRef();

  useEffect(() => {
    if (!textLog.current) {
    } else {
      textLog.current.scrollTop = textLog.current.scrollHeight;
    }
  });

  return (
    <Box>
      <Label htmlFor="statusArea">Status Area</Label>
      <TextArea
        id="statusArea"
        className="status-area"
        name="statusArea"
        value={props.status}
        ref={textLog}
        maxRows="15"
        readOnly
      />
    </Box>
  );
}
export default StatusArea;
