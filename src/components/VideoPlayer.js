import React, { useRef, useEffect } from "react";
import ReactPlayer from "react-player";

const VideoPlayer = ({ url }) => {
  const playerRef = useRef(null);

  // Disable right-click
  useEffect(() => {
    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    document.addEventListener('contextmenu', handleContextMenu);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  // Disable keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Prevent common keyboard shortcuts
      if (
        (e.ctrlKey || e.metaKey) && (
          e.key === 's' || // Save
          e.key === 'c' || // Copy
          e.key === 'u' || // View source
          e.key === 'p'    // Print
        )
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  if (!url) {
    return <div className="bg-black p-4 rounded-lg shadow-lg text-white">No video URL provided</div>;
  }

  return (
    <div 
      className="bg-black p-4 rounded-lg shadow-lg"
      onContextMenu={(e) => e.preventDefault()}
    >
      <ReactPlayer
        ref={playerRef}
        url={url}
        controls
        width="100%"
        height="100%"
        className="rounded-lg overflow-hidden"
        config={{
          file: {
            attributes: {
              controlsList: 'nodownload', // Disable download button
              disablePictureInPicture: true, // Disable picture-in-picture
              disableRemotePlayback: true, // Disable remote playback
            },
          },
        }}
      />
    </div>
  );
};

export default VideoPlayer;