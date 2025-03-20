import React from "react";

const LessonForm = ({ index, handleLessonChange }) => {
  return (
    <form className="space-y-4">
      <input type="text" name="title" placeholder="Lesson Title" onChange={(e) => handleLessonChange(index, e)} className="w-full p-2 border border-gray-300 rounded" required />
      <textarea name="description" placeholder="Lesson Description" onChange={(e) => handleLessonChange(index, e)} className="w-full p-2 border border-gray-300 rounded" required></textarea>
      <input type="text" name="video_url" placeholder="Video URL" onChange={(e) => handleLessonChange(index, e)} className="w-full p-2 border border-gray-300 rounded" required />
      <input type="number" name="lesson_order" placeholder="Lesson Order" onChange={(e) => handleLessonChange(index, e)} className="w-full p-2 border border-gray-300 rounded" required />
    </form>
  );
};

export default LessonForm;
