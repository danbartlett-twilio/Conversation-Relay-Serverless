import React, { useState } from "react";
import { AudioVisualizer, LiveAudioVisualizer } from "react-audio-visualize";
import { AudioRecorder, useAudioRecorder } from "react-audio-voice-recorder";

export function ReactAudioVisualizer(props) {
  const [blob, setBlob] = useState();
  const recorder = useAudioRecorder(); // this is only taking input (not output from mediastream - we woud want to represent both perhaps separately)

  return (
    <div>
      <div>Live Audio Visualizer</div>
      <AudioRecorder
        onRecordingComplete={setBlob}
        recorderControls={recorder}
      />
      <div>
        {recorder.mediaRecorder && (
          <LiveAudioVisualizer
            mediaRecorder={recorder.mediaRecorder}
            width={800}
            height={75}
            barWidth={1}
            gap={1}
            barColor={"#f76565"}
          />
        )}
      </div>
      <div>
        {blob && (
          <AudioVisualizer
            blob={blob}
            width={800}
            height={75}
            barWidth={1}
            gap={1}
            barColor={"#f76565"}
          />
        )}
      </div>
      <div>
        {blob && (
          <AudioVisualizer
            blob={blob}
            width={800}
            height={75}
            barWidth={1}
            gap={1}
            barColor={"lightblue"}
          />
        )}
      </div>
    </div>
  );
}
export default ReactAudioVisualizer;
