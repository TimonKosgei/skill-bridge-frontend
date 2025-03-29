import React, { useState } from "react";
import Header from "../components/Header";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Add this import

const UploadCourse = () => {
  const navigate = useNavigate(); // Initialize navigate function
  const [course, setCourse] = useState({
    title: "",
    description: "",
    category: "",
    image: null,
  });

  const [file, setFile] = useState(null);
  const [numLessons, setNumLessons] = useState(1);
  const [lessons, setLessons] = useState([]);
  const [courseId, setCourseId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); // State for upload progress

  const handleCourseChange = (e) => {
    const { name, value } = e.target;
    setCourse({ ...course, [name]: value });
  };

  const handleImageChange = (e) => {
    setFile(e.target.files[0]);
    setCourse({ ...course, image: URL.createObjectURL(e.target.files[0]) }); // Live preview of the image
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
    const updatedLessons = [...lessons];
    updatedLessons[index].video = e.target.files[0];
    setLessons(updatedLessons);
  };

  const handleCourseSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", course.title);
    formData.append("description", course.description);
    formData.append("category", course.category);

    setIsSubmitting(true);
    setUploadProgress(0); // Reset progress

    try {
      const response = await axios.post("http://127.0.0.1:5000/courses", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress); // Update progress
        },
      });

      setCourseId(response.data.course_id);
      alert("Course uploaded successfully!");
    } catch (error) {
      alert("Course upload failed. Try again.");
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0); // Reset progress after completion
    }
  };

  const handleLessonSubmit = async (e) => {
    e.preventDefault();

    if (!courseId) {
      alert("Course ID is missing. Please upload the course first.");
      return;
    }

    try {
      for (const [index, lesson] of lessons.entries()) {
        const formData = new FormData();
        formData.append("title", lesson.title);
        formData.append("description", lesson.description);
        formData.append("video", lesson.video);
        formData.append("course_id", courseId);

        setUploadProgress(0); // Reset progress for each lesson

        await axios.post("http://127.0.0.1:5000/lessons", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress); // Update progress
          },
        });
      }

      alert("Lessons submitted successfully!");
      navigate("/course-preview"); // Redirect to CoursePreview.js
    } catch (error) {
      console.error("Lesson submission error:", error);
      alert("Lesson submission failed. Please try again.");
    } finally {
      setUploadProgress(0); // Reset progress after completion
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="p-6 rounded-lg shadow-md max-w-4xl mx-auto mt-6 bg-white">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Upload a Course</h2>

        <div className="flex gap-6">
          {/* Course Upload Form */}
          <form onSubmit={handleCourseSubmit} className="flex-1 space-y-4">
            <label className="block">
              <span className="text-gray-700">Course Title</span>
              <input
                type="text"
                name="title"
                className="mt-1 p-2 w-full border rounded-lg"
                onChange={handleCourseChange}
                required
              />
            </label>

            <label className="block">
              <span className="text-gray-700">Description</span>
              <textarea
                name="description"
                className="mt-1 p-2 w-full border rounded-lg"
                onChange={handleCourseChange}
                required
              ></textarea>
            </label>

            <label className="block">
              <span className="text-gray-700">Category</span>
              <input
                type="text"
                name="category"
                className="mt-1 p-2 w-full border rounded-lg"
                onChange={handleCourseChange}
                required
              />
            </label>

            <label className="block">
              <span className="text-gray-700">Number of Lessons</span>
              <select
                className="mt-1 p-2 w-full border rounded-lg"
                onChange={handleNumLessonsChange}
                value={numLessons}
                required
              >
                {Array.from({ length: 10 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-gray-700">Upload Image</span>
              <input
                type="file"
                name="image"
                className="mt-1 p-2 w-full border rounded-lg"
                onChange={handleImageChange}
                required
              />
            </label>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Course"}
            </button>
            {uploadProgress > 0 && (
              <div className="relative w-full bg-gray-200 rounded-full h-4 mt-4 overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-700 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
                <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
                  {uploadProgress}%
                </span>
              </div>
            )}
          </form>

          {/* Course Preview */}
          <div className="w-72 bg-white shadow-lg rounded-lg overflow-hidden">
            {course.image && (
              <img src={course.image} alt="Course Preview" className="w-full h-40 object-cover" />
            )}
            <div className="p-4">
              <h3 className="text-xl font-semibold">{course.title || "Course Title"}</h3>
              <p className="text-gray-600">{course.description || "Course description goes here."}</p>
              <span className="text-sm text-blue-600">{course.category || "Category"}</span>
            </div>
          </div>
        </div>

        {/* Lesson Form */}
        {courseId && (
          <div className="mt-6">
            <h2 className="text-xl font-bold">Add Lessons</h2>

            <form onSubmit={handleLessonSubmit} className="space-y-4 mt-4">
              {lessons.map((lesson, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow-md">
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

                  <label className="block mt-2">
                    <span className="text-gray-700">Upload Video</span>
                    <input
                      type="file"
                      accept="video/*"
                      className="mt-1 p-2 w-full border rounded-lg"
                      onChange={(e) => handleLessonVideoChange(index, e)}
                      required
                    />
                  </label>
                </div>
              ))}

              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition"
              >
                Submit Lessons
              </button>
              {uploadProgress > 0 && (
                <div className="relative w-full bg-gray-200 rounded-full h-4 mt-4 overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-700 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white">
                    {uploadProgress}%
                  </span>
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadCourse;
