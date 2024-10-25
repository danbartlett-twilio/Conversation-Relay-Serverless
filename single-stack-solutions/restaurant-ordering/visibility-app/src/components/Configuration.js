import React, { useState, useEffect } from "react";
import axios from "axios";

export function Configuration(props) {
  const [config, setConfig] = useState({
    useCase: "",
    pk: "",
    pk1: "",
    sk: "",
    sk1: "",
    useCase: "",
  });

  const getConfig = async (e) => {
    try {
      const url =
        "https://8ldhh8emwh.execute-api.us-east-1.amazonaws.com/get-use-cases";
      const config = await axios.get(url);
      console.log(config);
      //   setConfig(config.data.Item);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getConfig();
  }, []);

  return (
    <div>
      {config.useCase} {config.pk} {config.sk}
    </div>
  );
}
export default Configuration;
