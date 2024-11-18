import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { TextArea, Box, Label } from "@twilio-paste/core";

const Visualizer = forwardRef((props, ref) => {
  const [ws, setWs] = useState(null);
  const [messages, setMessages] = useState("");
  const textLog = useRef(null);

  const updateWebsocketId = props.updateWebsocketId;

  // Invoke Websocket from UseCasePicker
  useImperativeHandle(ref, () => ({
    invokeSetupWebsockToController() {
      setupWebsockToController();
    },
    invokeCloseWebsockToController() {
      closeWebsockToController();
      console.log("Websocket connection closed");
    },
  }));

  const setupWebsockToController = () => {
    const socket = new WebSocket(process.env.REACT_APP_UI_WEB_SOCKET_URL);
    setWs(socket);

    socket.onopen = function (event) {
      console.log("WebSocket call opened:", event);
      socket.send(JSON.stringify({ type: "setup" }));
      setMessages(" --- Connected to ConversationRelay ---\n");
      setMessages((prev) => prev + props.welcomeGreeting + "\n");
    };

    socket.onmessage = function (event) {
      let message;
      const data = JSON.parse(event.data);
      console.log(data);

      if (data.type === "setup" && data.token) {
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
        message = JSON.stringify(data);
      }
      if (data.type === "prompt" && data.voicePrompt) {
        // User
        message = "\n" + data.voicePrompt + "\n";
      }
      if (data.type === "text" && data.token) {
        // Agent
        if (data.last === true) {
          message = "\n";
        } else {
          message = data.token;
        }
      }
      if (data.type === "functionCall") {
        message = data.token + "\n";
      }

      setMessages((prev) => {
        if (message) {
          return prev + message;
        } else {
          return prev;
        }
      });
    };

    socket.onerror = function (event) {
      console.log("WebSocket error:", event);
      setWs(undefined);
    };

    // Clean up on unmount
    return () => {
      socket.close();
    };
  };

  const closeWebsockToController = () => {
    if (ws) {
      ws.close();
      setWs(null);
      setMessages(
        (prev) => prev + "\n --- Disconnected from ConversationRelay ---"
      );
    }
  };

  useEffect(() => {
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
        ref={textLog} // Used to autoscroll
        row="10"
        maxRows="10"
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
});
export default Visualizer;
