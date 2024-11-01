import React, { useEffect, useRef, useState } from "react";
import { TextArea, Box, Label } from "@twilio-paste/core";

export function Visualizer({ updateWebsocketId }) {
  const [ws, setWs] = useState(null);
  const [messages, setMessages] = useState("");
  const textLog = useRef(null);
  let controlsocket;

  function setupWebsockToController() {
    const socket = new WebSocket(
      " wss://8bs3g9ns29.execute-api.us-east-1.amazonaws.com/prod"
    );
    setWs(socket);

    socket.onopen = function (event) {
      console.log("WebSocket call opened:", event);
      socket.send(JSON.stringify({ type: "setup" }));
    };

    socket.onmessage = function (event) {
      let message;
      const data = JSON.parse(event.data);
      console.log(data);

      if (data.type === "setup") {
        updateWebsocketId(data.token);
        message = "";
      }
      if (data.type === "error") {
        message = data.description;
      }
      if (data.type === "info") {
        message = JSON.stringify(data) + "\n";
      }
      if (data.type === "interrupt") {
        message = JSON.stringify(data) + "\n";
      }
      if (data.type === "prompt" && data.voicePrompt !== "undefined") {
        // User
        message = data.voicePrompt;
      }
      if (data.type === "text" && data.token !== "undefined") {
        // Agent
        if (data.last === true) {
          message = "\n";
        } else {
          message = data.token;
        }
      }
      if (data.type === "functionCall") {
        message = "\n";
      }

      setMessages((prev) => prev + message);
      // setMessageArr((prev) => [...messageArr, prev + message]);
    };

    socket.onerror = function (event) {
      console.log("WebSocket error:", event);
      controlsocket = undefined;
      // setWs(undefined);
    };
    setWs(socket);

    // Clean up on unmount
    return () => {
      socket.close();
    };
  }

  useEffect(() => {
    setupWebsockToController();
    if (!textLog.current) {
    } else {
      textLog.current.scrollTop = textLog.current.scrollHeight;
    }
  }, [messages]);

  return (
    <Box>
      <Label htmlFor="statusArea">
        ConversationRelay Websocket Status Area
      </Label>
      <TextArea
        id="statusArea"
        className="status-area"
        name="statusArea"
        value={messages}
        ref={textLog}
        maxRows="5"
        readOnly
        style={{
          overflowY: "auto", // Enable vertical scrolling
        }}
      />

      {/* <div>
        <span style={{ color: "blue" }}>{messageArr}</span>
        <span style={{ color: "green" }}>{messageArr}</span>.
      </div> */}
      {/* <ul>
        {messageArr.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul> */}
      {/* consider adding ability to color different lines, cannot do this with textarea
       also need to add scrolling and function calling */}
      {/* <div>{messages}</div> */}
    </Box>
  );
}
export default Visualizer;
