import React from "react";

const LessonForm = ({ index, handleLessonChange }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      <h3 className="text-lg font-semibold">Lesson {index + 1}</h3>

      <label className="block mt-2">
        <span className="text-gray-700">Lesson Title</span>
        <input
          type="text"
          name="title"
          className="mt-1 p-2 w-full border rounded-lg"
          onChange={(e) => handleLessonChange(index, e)}
          required
        />
      </label>

      <label className="block mt-2">
        <span className="text-gray-700">Lesson Description</span>
        <textarea
          name="description"
          className="mt-1 p-2 w-full border rounded-lg"
          onChange={(e) => handleLessonChange(index, e)}
          required
        ></textarea>
      </label>
    </div>
  );
};

export default LessonForm;
