import React, { useRef, useEffect, useState } from "react";
import ReactPlayer from "react-player";
import axios from "axios";
import { getAuthHeader } from '../utils/authUtils';

const VideoPlayer = ({ url }) => {
  const playerRef = useRef(null);
  const [signedUrl, setSignedUrl] = useState(null);

  // Fetch signed URL when component mounts or URL changes
  useEffect(() => {
    const fetchSignedUrl = async () => {
      try {
        const response = await axios.post(
          "http://localhost:5000/video-access",
          { video_url: url },
          { headers: getAuthHeader() }
        );
        setSignedUrl(response.data.signed_url);
      } catch (error) {
        console.error("Error fetching signed URL:", error);
      }
    };

    if (url) {
      fetchSignedUrl();
    }
  }, [url]);

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

  if (!signedUrl) {
    return <div className="bg-black p-4 rounded-lg shadow-lg">Loading video...</div>;
  }

  return (
    <div 
      className="bg-black p-4 rounded-lg shadow-lg"
      onContextMenu={(e) => e.preventDefault()}
    >
      <ReactPlayer
        ref={playerRef}
        url={signedUrl}
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
        onError={(e) => console.error('Video player error:', e)}
      />
    </div>
  );
};

export default VideoPlayer;