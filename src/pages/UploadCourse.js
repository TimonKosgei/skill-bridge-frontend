import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const UploadCourse = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [course, setCourse] = useState({ 
    title: "", 
    description: "", 
    category: "", 
    image: null 
  });
  const [file, setFile] = useState(null);
  const [numLessons, setNumLessons] = useState(1);
  const [lessons, setLessons] = useState([]);
  const [courseId, setCourseId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleCourseChange = (e) => {
    const { name, value } = e.target;
    setCourse({ ...course, [name]: value });
  };

  const handleImageChange = (e) => {
    setFile(e.target.files[0]);
    setCourse({ ...course, image: URL.createObjectURL(e.target.files[0]) });
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
    if (!userId) {
      alert("User ID is missing. Please log in again.");
      return;
    }

    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("file", file);
    formData.append("title", course.title);
    formData.append("description", course.description);
    formData.append("category", course.category);

    setIsSubmitting(true);

    try {
      const response = await axios.post("http://127.0.0.1:5000/courses", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        
      });
      setCourseId(response.data.course_id);
    } catch (error) {
      alert("Course upload failed. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLessonSubmit = async (e) => {
    e.preventDefault();
    if (!courseId) return alert("Course ID is missing");

    try {
      for (const [lesson] of lessons.entries()) {
        const formData = new FormData();
        formData.append("title", lesson.title);
        formData.append("description", lesson.description);
        formData.append("file", lesson.video);
        formData.append("course_id", courseId);

        await axios.post("http://127.0.0.1:5000/lessons", formData, {
          headers: { "Content-Type": "multipart/form-data" },
       
        });
      }
      alert("Course and lessons submitted successfully!");
      navigate("/teacher-dashboard");
    } catch (error) {
      alert("Lesson submission failed. Please try again.");
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 p-6 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl lg:text-6xl">
            Upload New Course
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500">
            Create and publish your course to share with students
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
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        onChange={handleCourseChange}
                        required
                      />
                    ) : (
                      <input
                        type="text"
                        name={field}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        onChange={handleCourseChange}
                        required
                      />
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number of Lessons</label>
                  <select
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

                <button
                  type="submit"
                  className={`w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium ${
                    isSubmitting ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Uploading..." : "Upload Course"}
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
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Add Lessons</h2>

              <form onSubmit={handleLessonSubmit} className="space-y-6">
                {lessons.map((lesson, index) => (
                  <div
                    key={index}
                    className="p-6 bg-white rounded-lg border border-gray-200"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Lesson {index + 1}
                    </h3>

                    {["title", "description"].map((field) => (
                      <div key={field} className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Lesson {field.charAt(0).toUpperCase() + field.slice(1)}
                        </label>
                        {field === "description" ? (
                          <textarea
                            name={field}
                            rows="3"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            onChange={(e) => handleLessonChange(index, e)}
                            required
                          />
                        ) : (
                          <input
                            type="text"
                            name={field}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            onChange={(e) => handleLessonChange(index, e)}
                            required
                          />
                        )}
                      </div>
                    ))}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Lesson Video
                      </label>
                      <input
                        type="file"
                        accept="video/*"
                        className="w-full p-3 border border-gray-300 border-dashed rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        onChange={(e) => handleLessonVideoChange(index, e)}
                        required
                      />
                    </div>
                  </div>
                ))}

                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
                >
                  Submit All Lessons
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UploadCourse;