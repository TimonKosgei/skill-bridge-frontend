import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import AddLesson from "../components/AddLesson";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { getAuthHeader } from '../utils/authUtils';

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 10MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];
const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;
const MAX_LESSON_TITLE_LENGTH = 80;
const MAX_LESSON_DESCRIPTION_LENGTH = 300;


const UploadCourse = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [course, setCourse] = useState({ 
    title: "", 
    description: "", 
    category: "", 
    image: null,
    is_published: false 
  });
  const [file, setFile] = useState(null);
  const [numLessons, setNumLessons] = useState(1);
  const [lessons, setLessons] = useState([]);
  const [courseId, setCourseId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserId(decoded.user_id);
      } catch (err) {
        console.error("Error decoding token:", err);
        alert("Invalid token. Please log in again.");
      }
    } else {
      alert("No token found. Please log in.");
    }
  }, []);

  const validateForm = () => {
    const errors = {};
    
    if (!course.title.trim()) {
      errors.title = "Title is required";
    } else if (course.title.length > MAX_TITLE_LENGTH) {
      errors.title = `Title must be less than ${MAX_TITLE_LENGTH} characters`;
    }

    if (!course.description.trim()) {
      errors.description = "Description is required";
    } else if (course.description.length > MAX_DESCRIPTION_LENGTH) {
      errors.description = `Description must be less than ${MAX_DESCRIPTION_LENGTH} characters`;
    }

    if (!course.category) {
      errors.category = "Category is required";
    }

    if (!file) {
      errors.image = "Course image is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCourseChange = (e) => {
    const { name, value } = e.target;
    setCourse({ ...course, [name]: value });
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: null });
    }
  };

  const validateFile = (file, type) => {
    if (!file) return false;
    if (file.size > MAX_FILE_SIZE) {
      setError(`File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
      return false;
    }
    if (type === 'image' && !ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError('Please upload a valid image file (JPEG, PNG, or GIF)');
      return false;
    }
    if (type === 'video' && !ALLOWED_VIDEO_TYPES.includes(file.type)) {
      setError('Please upload a valid video file (MP4, WebM, or OGG)');
      return false;
    }
    return true;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!validateFile(file, 'image')) return;
    
    setFile(file);
    setCourse({ ...course, image: URL.createObjectURL(file) });
    setError(null);
  };

  const handleNumLessonsChange = (e) => {
    const count = Math.max(1, parseInt(e.target.value) || 1);
    setNumLessons(count);
    setLessons(Array(count).fill({ title: "", description: "", video: null }));
  };

  const handleLessonChange = (index, e) => {
    const { name, value } = e.target;
    const updatedLessons = [...lessons];
    updatedLessons[index] = { ...updatedLessons[index], [name]: value };
    setLessons(updatedLessons);
  };

  const handleLessonVideoChange = (index, e) => {
    const file = e.target.files[0];
    if (!validateFile(file, 'video')) return;

    const updatedLessons = [...lessons];
    updatedLessons[index].video = file;
    setLessons(updatedLessons);
    setError(null);
  };

  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (!userId) {
      setError("User ID is missing. Please log in again.");
      return;
    }

    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("file", file);
    formData.append("title", course.title);
    formData.append("description", course.description);
    formData.append("category", course.category);
    formData.append("is_published", course.is_published);

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await axios.post("http://127.0.0.1:5000/courses", formData, {
        headers: { 
          ...getAuthHeader(),
          "Content-Type": "multipart/form-data" 
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      });
      setCourseId(response.data.course_id);
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Course upload failed. Please try again.";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const validateLesson = (lesson, index) => {
    const errors = {};
    
    if (!lesson.title.trim()) {
      errors[`lesson${index}Title`] = "Title is required";
    } else if (lesson.title.length > MAX_LESSON_TITLE_LENGTH) {
      errors[`lesson${index}Title`] = `Title must be less than ${MAX_LESSON_TITLE_LENGTH} characters`;
    }

    if (!lesson.description.trim()) {
      errors[`lesson${index}Description`] = "Description is required";
    } else if (lesson.description.length > MAX_LESSON_DESCRIPTION_LENGTH) {
      errors[`lesson${index}Description`] = `Description must be less than ${MAX_LESSON_DESCRIPTION_LENGTH} characters`;
    }

    if (!lesson.video) {
      errors[`lesson${index}Video`] = "Video is required";
    }

    return errors;
  };

  const handleLessonSubmit = async (e) => {
    e.preventDefault();
    if (!courseId) {
      setError("Course ID is missing");
      return;
    }

    const lessonErrors = {};
    lessons.forEach((lesson, index) => {
      const errors = validateLesson(lesson, index);
      Object.assign(lessonErrors, errors);
    });

    if (Object.keys(lessonErrors).length > 0) {
      setFormErrors(lessonErrors);
      return;
    }

    try {
      for (const [index, lesson] of lessons.entries()) {
        const formData = new FormData();
        formData.append("title", lesson.title);
        formData.append("description", lesson.description);
        formData.append("file", lesson.video);
        formData.append("course_id", courseId);

        await axios.post("http://127.0.0.1:5000/lessons", formData, {
          headers: { 
            ...getAuthHeader(),
            "Content-Type": "multipart/form-data" 
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        });
      }
      alert("Course and lessons submitted successfully!");
      navigate("/teacher-dashboard");
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Lesson submission failed. Please try again.";
      setError(errorMessage);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 p-6 max-w-7xl mx-auto">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        {/* Header Section */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Upload New Course
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-lg text-gray-500">
            Create and upload your course content to share with students
          </p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Conditionally render the course form */}
            {!courseId && (
              <form onSubmit={handleCourseSubmit} className="flex-1 space-y-6">
                {["title", "description"].map((field) => (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.charAt(0).toUpperCase() + field.slice(1)}
                    </label>
                    {field === "description" ? (
                      <textarea
                        name={field}
                        rows="4"
                        placeholder="Enter course description"
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          formErrors[field] ? "border-red-500" : "border-gray-300"
                        }`}
                        onChange={handleCourseChange}
                        maxLength={field === "title" ? MAX_TITLE_LENGTH : MAX_DESCRIPTION_LENGTH}
                        required
                      />
                    ) : (
                      <input
                        type="text"
                        name={field}
                        className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          formErrors[field] ? "border-red-500" : "border-gray-300"
                        }`}
                        onChange={handleCourseChange}
                        maxLength={field === "title" ? MAX_TITLE_LENGTH : MAX_DESCRIPTION_LENGTH}
                        required
                      />
                    )}
                    {formErrors[field] && (
                      <p className="mt-1 text-sm text-red-600">{formErrors[field]}</p>
                    )}
                  </div>
                ))}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    name="category"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onChange={handleCourseChange}
                    value={course.category}
                    required
                  >
                    <option value="" disabled>Select a category</option>
                    <option value="Academic subjects">Academic subjects</option>
                    <option value="Technical and vocational skills">Technical and vocational skills</option>
                    <option value="Professional and career skills">Professional and career skills</option>
                    <option value="Creative and artistic skill">Creative and artistic skill</option>
                    <option value="Digital skills and Tech">Digital skills and Tech</option>
                    <option value="Languages">Languages</option>
                    <option value="Entrepreneurship">Entrepreneurship</option>
                    <option value="Soft skills">Soft skills</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course Image</label>
                  <input
                    type="file"
                    name="image"
                    className="w-full p-3 border border-gray-300 border-dashed rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    onChange={handleImageChange}
                    required
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_published"
                    checked={course.is_published}
                    onChange={(e) => setCourse({ ...course, is_published: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Publish Course
                  </label>
                </div>

                <button
                  type="submit"
                  className={`w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium ${
                    isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Uploading... {uploadProgress}%
                    </div>
                  ) : (
                    "Upload Course"
                  )}
                </button>
              </form>
            )}

            {/* Always show the course preview */}
            <div className="w-full md:w-80 flex-shrink-0 bg-white rounded-lg overflow-hidden border border-gray-200">
              {course.image ? (
                <img
                  src={course.image}
                  alt="Course Preview"
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-500">
                  Image Preview
                </div>
              )}
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {course.title || "Course Title"}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {course.description || "Course description will appear here."}
                </p>
                <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-semibold">
                  {course.category || "Category"}
                </span>
              </div>
            </div>
          </div>

          {/* Lesson Form */}
          {courseId && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Course Lessons
              </h2>
              <AddLesson
                courseId={courseId}
                onSuccess={() => {
                  alert("Course and lessons submitted successfully!");
                  navigate("/teacher-dashboard");
                }}
                onError={(errorMessage) => setError(errorMessage)}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UploadCourse;