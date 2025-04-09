import React, { useState } from "react";
import Header from "../components/Header";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UploadCourse = () => {
  const navigate = useNavigate();
  const [course, setCourse] = useState({ title: "", description: "", category: "", image: null });
  const [file, setFile] = useState(null);
  const [numLessons, setNumLessons] = useState(1);
  const [lessons, setLessons] = useState([]);
  const [courseId, setCourseId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Common input styles
  const inputStyle = {
    width: "100%",
    padding: "12px",
    border: "1px solid #E2E8F0",
    borderRadius: "8px",
    fontSize: "14px",
    transition: "border-color 0.2s",
    ":focus": { outline: "none", borderColor: "#007BFF" }
  };

  // Common button styles
  const buttonStyle = (color) => ({
    width: "100%",
    padding: "14px",
    backgroundColor: color,
    color: "#FFFFFF",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s",
    ":hover": { backgroundColor: color === "#007BFF" ? "#0069D9" : "#2F855A" },
    ":disabled": { backgroundColor: "#CBD5E0", cursor: "not-allowed" }
  });

  // Progress bar styles
  const progressBarStyle = {
    width: "100%",
    height: "8px",
    backgroundColor: "#EDF2F7",
    borderRadius: "4px",
    overflow: "hidden",
    marginTop: "12px"
  };

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
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", course.title);
    formData.append("description", course.description);
    formData.append("category", course.category);

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      const response = await axios.post("http://127.0.0.1:5000/courses", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          setUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
        },
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
      for (const [index, lesson] of lessons.entries()) {
        const formData = new FormData();
        formData.append("title", lesson.title);
        formData.append("description", lesson.description);
        formData.append("file", lesson.video);
        formData.append("course_id", courseId);

        await axios.post("http://127.0.0.1:5000/lessons", formData, {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (progressEvent) => {
            setUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
          },
        });
      }
      alert("Course and lessons submitted successfully!");
      navigate("/my-courses");
    } catch (error) {
      alert("Lesson submission failed. Please try again.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F7FAFC" }}>
      <Header />
      
      <div style={{ maxWidth: "1200px", margin: "24px auto", padding: "32px", borderRadius: "12px", backgroundColor: "#FFFFFF", boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#2D3748", marginBottom: "24px" }}>Upload a New Course</h2>

        <div style={{ display: "flex", gap: "32px", "@media (max-width: 768px)": { flexDirection: "column" } }}>
          {/* Course Form */}
          <form onSubmit={handleCourseSubmit} style={{ flex: 1, display: "flex", flexDirection: "column", gap: "20px" }}>
            {["title", "description", "category"].map((field) => (
              <div key={field}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#4A5568", marginBottom: "8px" }}>
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                {field === "description" ? (
                  <textarea name={field} rows="4" style={inputStyle} onChange={handleCourseChange} required />
                ) : (
                  <input type={field === "title" ? "text" : "text"} name={field} style={inputStyle} onChange={handleCourseChange} required />
                )}
              </div>
            ))}

            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#4A5568", marginBottom: "8px" }}>Number of Lessons</label>
              <select style={inputStyle} onChange={handleNumLessonsChange} value={numLessons} required>
                {Array.from({ length: 10 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#4A5568", marginBottom: "8px" }}>Course Image</label>
              <input type="file" name="image" style={{ ...inputStyle, border: "1px dashed #E2E8F0" }} onChange={handleImageChange} required />
            </div>

            <button type="submit" style={buttonStyle("#007BFF")} disabled={isSubmitting}>
              {isSubmitting ? "Uploading..." : "Upload Course"}
            </button>

            {uploadProgress > 0 && (
              <div style={progressBarStyle}>
                <div style={{ width: `${uploadProgress}%`, height: "100%", backgroundColor: "#007BFF" }} />
                <div style={{ textAlign: "center", fontSize: "12px", color: "#4A5568", marginTop: "4px" }}>
                  {uploadProgress}% uploaded
                </div>
              </div>
            )}
          </form>

          {/* Course Preview */}
          <div style={{ width: "320px", borderRadius: "12px", overflow: "hidden", backgroundColor: "#FFFFFF", border: "1px solid #E2E8F0", "@media (max-width: 768px)": { width: "100%" } }}>
            {course.image ? (
              <img src={course.image} alt="Course Preview" style={{ width: "100%", height: "180px", objectFit: "cover" }} />
            ) : (
              <div style={{ width: "100%", height: "180px", backgroundColor: "#EDF2F7", display: "flex", alignItems: "center", justifyContent: "center", color: "#718096" }}>
                Image Preview
              </div>
            )}
            <div style={{ padding: "20px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#2D3748", marginBottom: "8px" }}>{course.title || "Course Title"}</h3>
              <p style={{ fontSize: "14px", color: "#4A5568", marginBottom: "12px" }}>{course.description || "Course description will appear here."}</p>
              <div style={{ display: "inline-block", backgroundColor: "#EBF8FF", color: "#007BFF", padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "600" }}>
                {course.category || "Category"}
              </div>
            </div>
          </div>
        </div>

        {/* Lesson Form */}
        {courseId && (
          <div style={{ marginTop: "40px", paddingTop: "32px", borderTop: "1px solid #E2E8F0" }}>
            <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#2D3748", marginBottom: "24px" }}>Add Lessons</h2>

            <form onSubmit={handleLessonSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {lessons.map((lesson, index) => (
                <div key={index} style={{ padding: "24px", backgroundColor: "#FFFFFF", borderRadius: "12px", border: "1px solid #E2E8F0" }}>
                  <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#2D3748", marginBottom: "20px" }}>Lesson {index + 1}</h3>
                  
                  {["title", "description"].map((field) => (
                    <div key={field} style={{ marginBottom: "20px" }}>
                      <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#4A5568", marginBottom: "8px" }}>
                        Lesson {field.charAt(0).toUpperCase() + field.slice(1)}
                      </label>
                      {field === "description" ? (
                        <textarea name={field} rows="3" style={inputStyle} onChange={(e) => handleLessonChange(index, e)} required />
                      ) : (
                        <input type="text" name={field} style={inputStyle} onChange={(e) => handleLessonChange(index, e)} required />
                      )}
                    </div>
                  ))}

                  <div>
                    <label style={{ display: "block", fontSize: "14px", fontWeight: "600", color: "#4A5568", marginBottom: "8px" }}>Lesson Video</label>
                    <input type="file" accept="video/*" style={{ ...inputStyle, border: "1px dashed #E2E8F0" }} onChange={(e) => handleLessonVideoChange(index, e)} required />
                  </div>
                </div>
              ))}

              <button type="submit" style={buttonStyle("#38A169")}>Submit All Lessons</button>

              {uploadProgress > 0 && (
                <div style={progressBarStyle}>
                  <div style={{ width: `${uploadProgress}%`, height: "100%", backgroundColor: "#38A169" }} />
                  <div style={{ textAlign: "center", fontSize: "12px", color: "#4A5568", marginTop: "4px" }}>
                    {uploadProgress}% uploaded
                  </div>
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