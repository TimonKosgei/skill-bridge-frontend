import React, { useState } from 'react';
import VideoPlayer from './VideoPlayer';

const LessonCard = ({ title, duration, description, video_url }) => {
  const [isCompleted, setIsCompleted] = useState(false);

  const handleVideoEnd = () => {
    setIsCompleted(true);
  };

  return (
    <div className="p-4 border rounded-lg shadow-lg w-full mb-4">
      <h3 className="text-base font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600 mb-2">Duration: {duration}</p>
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      <div className="video-container mb-4">
        <VideoPlayer
          url={video_url}
        />
      </div>
      {isCompleted && (
        <div className="bg-green-100 text-green-700 p-2 rounded text-sm">
          Congratulations! You have completed this lesson.
        </div>
      )}
    </div>
  );
};

export default LessonCard;
