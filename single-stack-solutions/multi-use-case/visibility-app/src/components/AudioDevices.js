import React, { useState, useEffect } from "react";

import { Select, Option } from "@twilio-paste/core";

export function AudioDevices(props) {
  const [audioDevices, setAudioDevices] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getAudioDevices = async () => {
      try {
        // Request audio permissions
        await navigator.mediaDevices.getUserMedia({ audio: true });

        // Enumerate devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        const audioInputDevices = devices.filter(
          (device) => device.kind === "audioinput"
        );

        setAudioDevices(audioInputDevices);
      } catch (err) {
        setError(`Error accessing audio devices: ${err.message}`);
      }
    };
    getAudioDevices();
  }, []);

  return (
    <div>
      Available Audio Input Devices
      {error && <p style={{ color: "red" }}>{error}</p>}
      <Select value={audioDevices} onChange={(e) => {}}>
        {audioDevices.map((device) => (
          <Option key={device.deviceId} value={device.label}>
            {device.label || `Microphone ${device.deviceId}`}
          </Option>
        ))}
      </Select>
    </div>
  );
}
export default AudioDevices;
