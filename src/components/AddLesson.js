import React, { useState, useRef } from "react";
import axios from "axios";

const MAX_TITLE_LENGTH = 80;
const MAX_DESCRIPTION_LENGTH = 300;
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];
const SPEED_WINDOW_SIZE = 5; // Number of samples to keep for speed calculation

const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const formatTime = (seconds) => {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes}m ${remainingSeconds}s`;
};

const AddLesson = ({ courseId, onSuccess, onError }) => {
  const [lessons, setLessons] = useState([{ title: "", description: "", video: null }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingLessons, setUploadingLessons] = useState({});
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState(null);
  
  // Refs for tracking upload progress
  const uploadStartTime = useRef({});
  const uploadStartBytes = useRef({});
  const speedSamples = useRef({});
  const lastUpdateTime = useRef({});
  const lastLoadedBytes = useRef({});

  const validateLesson = (lesson, index) => {
    const lessonErrors = {};
    
    if (!lesson.title.trim()) {
      lessonErrors.title = "Title is required";
    } else if (lesson.title.length > MAX_TITLE_LENGTH) {
      lessonErrors.title = `Title must be less than ${MAX_TITLE_LENGTH} characters`;
    }

    if (!lesson.description.trim()) {
      lessonErrors.description = "Description is required";
    } else if (lesson.description.length > MAX_DESCRIPTION_LENGTH) {
      lessonErrors.description = `Description must be less than ${MAX_DESCRIPTION_LENGTH} characters`;
    }

    if (!lesson.video) {
      lessonErrors.video = "Video is required";
    } else {
      if (lesson.video.size > MAX_FILE_SIZE) {
        lessonErrors.video = `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`;
      }
      if (!ALLOWED_VIDEO_TYPES.includes(lesson.video.type)) {
        lessonErrors.video = "Please upload a valid video file (MP4, WebM, or OGG)";
      }
    }

    return lessonErrors;
  };

  const handleLessonChange = (index, e) => {
    const { name, value } = e.target;
    const updatedLessons = [...lessons];
    updatedLessons[index] = { ...updatedLessons[index], [name]: value };
    setLessons(updatedLessons);
    
    // Clear error when user starts typing
    if (errors[`${index}-${name}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`${index}-${name}`];
        return newErrors;
      });
    }
  };

  const handleLessonVideoChange = (index, e) => {
    const file = e.target.files[0];
    const updatedLessons = [...lessons];
    updatedLessons[index].video = file;
    setLessons(updatedLessons);
    
    // Reset progress when new file is selected
    setUploadingLessons(prev => ({ ...prev, [index]: false }));
    
    // Clear error when new file is selected
    if (errors[`${index}-video`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`${index}-video`];
        return newErrors;
      });
    }
  };

  const handleAddLesson = () => {
    setLessons([...lessons, { title: "", description: "", video: null }]);
  };

  const handleDeleteLesson = (index) => {
    const updatedLessons = lessons.filter((_, i) => i !== index);
    setLessons(updatedLessons);
    
    // Clear errors for deleted lesson
    setErrors(prev => {
      const newErrors = { ...prev };
      Object.keys(newErrors).forEach(key => {
        if (key.startsWith(`${index}-`)) {
          delete newErrors[key];
        }
      });
      return newErrors;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError(null);
    
    // Validate all lessons
    const allErrors = {};
    lessons.forEach((lesson, index) => {
      const lessonErrors = validateLesson(lesson, index);
      Object.entries(lessonErrors).forEach(([key, value]) => {
        allErrors[`${index}-${key}`] = value;
      });
    });

    if (Object.keys(allErrors).length > 0) {
      setErrors(allErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      for (let i = 0; i < lessons.length; i++) {
        const lesson = lessons[i];
        const formData = new FormData();
        formData.append("title", lesson.title);
        formData.append("description", lesson.description);
        formData.append("file", lesson.video);
        formData.append("course_id", courseId);

        // Set uploading state for this lesson
        setUploadingLessons(prev => ({ ...prev, [i]: true }));

        await axios.post("http://127.0.0.1:5000/lessons", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        // Clear uploading state for this lesson
        setUploadingLessons(prev => ({ ...prev, [i]: false }));
      }
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error adding lessons:", error);
      const errorMessage = error.response?.data?.message || "Failed to upload lessons. Please try again.";
      setGlobalError(errorMessage);
      if (onError) onError(errorMessage);
    } finally {
      setIsSubmitting(false);
      setUploadingLessons({});
    }
  };

  const UploadStatus = ({ index }) => {
    if (!uploadingLessons[index]) return null;

    return (
      <div className="mt-4 text-sm text-blue-600">
        Uploading...
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {globalError && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {globalError}
        </div>
      )}

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
              {lessons.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleDeleteLesson(index)}
                  className="text-red-600 hover:text-red-800 font-medium"
                >
                  Delete
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lesson Title*
                </label>
                <input
                  type="text"
                  name="title"
                  maxLength={MAX_TITLE_LENGTH}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors[`${index}-title`] ? "border-red-500" : "border-gray-300"
                  }`}
                  onChange={(e) => handleLessonChange(index, e)}
                  required
                />
                {errors[`${index}-title`] && (
                  <p className="mt-1 text-sm text-red-600">{errors[`${index}-title`]}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description*
                </label>
                <textarea
                  name="description"
                  rows={4}
                  maxLength={MAX_DESCRIPTION_LENGTH}
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors[`${index}-description`] ? "border-red-500" : "border-gray-300"
                  }`}
                  onChange={(e) => handleLessonChange(index, e)}
                  required
                />
                {errors[`${index}-description`] && (
                  <p className="mt-1 text-sm text-red-600">{errors[`${index}-description`]}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Video File*
                </label>
                <div className="mt-1 flex items-center">
                  <label className={`cursor-pointer px-4 py-2 rounded-lg border ${
                    errors[`${index}-video`] 
                      ? "bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                      : "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                  }`}>
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
                {errors[`${index}-video`] && (
                  <p className="mt-1 text-sm text-red-600">{errors[`${index}-video`]}</p>
                )}
                <UploadStatus index={index} />
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
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </div>
            ) : "Submit All Lessons"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddLesson; 