import React from "react";
import ReactPlayer from "react-player";

const VideoPlayer = ({ url }) => {
  return (
    <div className="bg-black p-4 rounded-lg shadow-lg">
      <ReactPlayer
        url={url}
        controls
        width="100%"
        height="100%"
        className="rounded-lg overflow-hidden"
      />
    </div>
  );
};

export default VideoPlayer;