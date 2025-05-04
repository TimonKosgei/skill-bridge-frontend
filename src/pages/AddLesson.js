import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";

const AddLesson = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState([{ title: "", description: "", video: null }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({}); // Track progress per lesson

  const handleLessonChange = (index, e) => {
    const { name, value } = e.target;
    const updatedLessons = [...lessons];
    updatedLessons[index] = { ...updatedLessons[index], [name]: value };
    setLessons(updatedLessons);
  };

  const handleLessonVideoChange = (index, e) => {
    const updatedLessons = [...lessons];
    updatedLessons[index].video = e.target.files[0];
    setLessons(updatedLessons);
    // Reset progress when new file is selected
    setUploadProgress(prev => ({ ...prev, [index]: 0 }));
  };

  const handleAddLesson = () => {
    setLessons([...lessons, { title: "", description: "", video: null }]);
  };

  const handleDeleteLesson = (index) => {
    const updatedLessons = lessons.filter((_, i) => i !== index);
    setLessons(updatedLessons);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      for (let i = 0; i < lessons.length; i++) {
        const lesson = lessons[i];
        const formData = new FormData();
        formData.append("title", lesson.title);
        formData.append("description", lesson.description);
        formData.append("file", lesson.video);
        formData.append("course_id", courseId);

        await axios.post("http://127.0.0.1:5000/lessons", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(prev => ({ ...prev, [i]: percentCompleted }));
          },
        });
      }
      alert("All lessons uploaded successfully!");
      navigate(`/teacher-dashboard`); 
    } catch (error) {
      console.error("Error adding lessons:", error);
      alert(`Failed to add lessons: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsSubmitting(false);
      setUploadProgress({});
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 p-6 max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl lg:text-6xl">
            Add Lessons
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500">
            Upload lessons for Course {courseId}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {lessons.map((lesson, index) => (
            <div 
              key={index} 
              className="bg-white rounded-lg shadow-md overflow-hidden p-6 hover:shadow-lg transition-shadow"
            >
              <div className="border-b border-gray-200 pb-4 mb-6 flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900">
                  Lesson {index + 1}
                </h3>
                <button
                  type="button"
                  onClick={() => handleDeleteLesson(index)}
                  className="text-red-600 hover:text-red-800 font-medium"
                >
                  Delete
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lesson Title*
                  </label>
                  <input
                    type="text"
                    name="title"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onChange={(e) => handleLessonChange(index, e)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description*
                  </label>
                  <textarea
                    name="description"
                    rows={4}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onChange={(e) => handleLessonChange(index, e)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Video File*
                  </label>
                  <div className="mt-1 flex items-center">
                    <label className="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg border border-blue-200">
                      <span className="font-medium">Choose Video</span>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => handleLessonVideoChange(index, e)}
                        className="hidden"
                        required
                      />
                    </label>
                    <span className="ml-2 text-sm text-gray-500">
                      {lesson.video ? lesson.video.name : "No file chosen"}
                    </span>
                  </div>
                  {/* Progress bar for each lesson */}
                  {uploadProgress[index] > 0 && (
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${uploadProgress[index]}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              type="button"
              onClick={handleAddLesson}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              disabled={isSubmitting}
            >
              + Add Another Lesson
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium flex-1"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </>
              ) : "Submit All Lessons"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AddLesson;