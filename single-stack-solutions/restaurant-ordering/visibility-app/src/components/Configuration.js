import React, { useState, useEffect } from "react";
import axios from "axios";

export function Configuration(props) {
  const [config, setConfig] = useState({
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
  });

  const getConfig = async (e) => {
    try {
      const url =
        "https://8ldhh8emwh.execute-api.us-east-1.amazonaws.com/get-use-cases";
      const config = await axios.get(url);
      console.log(config?.data?.Item);
      setConfig(config.data.Item);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getConfig();
  }, []);

  return (
    <div>
      {config.sk} {config.pk} {config.pk1}
      <div>
        Welcome Greeting:
        {config.conversationRelayParams.welcomeGreeting}
      </div>
    </div>
  );
}
export default Configuration;
