import React, { useState } from 'react';
import ReactPlayer from 'react-player';


const LessonCard = ({ title, duration, description, video_url }) => {
  const [isCompleted, setIsCompleted] = useState(false);

  const handleVideoEnd = () => {
    setIsCompleted(true);
  };

  return (
    <div className="p-4 border rounded-lg shadow-lg w-full mb-4">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-700 mb-2">Duration: {duration}</p>
      <p className="text-gray-700 mb-4">{description}</p>
      <div className="video-container mb-4">
        <ReactPlayer
          url={video_url}
          width="100%"
          height="315px"
          controls
          onEnded={handleVideoEnd}
        />
      </div>
      {isCompleted && (
        <div className="bg-green-100 text-green-700 p-2 rounded">
          Congratulations! You have completed this lesson.
        </div>
      )}
    </div>
  );
};

export default LessonCard;
