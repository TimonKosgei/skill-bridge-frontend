import React, { useState } from "react";
import axios from "axios";
import LessonForm from "./LessonForm";

const CourseForm = () => {
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [courseDetails, setCourseDetails] = useState({
    title: "",
    description: "",
    category: "",
    image: null,
  });
  const [numLessons, setNumLessons] = useState(0);
  const [lessons, setLessons] = useState([]);
  const [courseSubmitted, setCourseSubmitted] = useState(false);

  const handleCourseChange = (e) => {
    const { name, value } = e.target;
    setCourseDetails({ ...courseDetails, [name]: value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError("");
  };

  const handleImageChange = (e) => {
    setCourseDetails({ ...courseDetails, image: e.target.files[0] });
  };

  const handleUpload = async () => {
    if (!file) return alert("Select a file first!");

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setError("");

    try {
      const response = await axios.post("http://127.0.0.1:5000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setFileUrl(response.data.file_url);
    } catch (error) {
      setError("Upload failed. Please try again.");
      console.error("Upload error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCourseSubmit = (e) => {
    e.preventDefault();
    // Handle course details submission
    setCourseSubmitted(true);
  };

  const handleNumLessonsChange = (e) => {
    const num = parseInt(e.target.value, 10);
    setNumLessons(num);
    setLessons(Array.from({ length: num }, () => ({ title: "", description: "", video_url: "", lesson_order: "" })));
  };

  const handleLessonChange = (index, e) => {
    const { name, value } = e.target;
    const newLessons = [...lessons];
    newLessons[index][name] = value;
    setLessons(newLessons);
  };

  return (
    <div className="p-4">
      {!courseSubmitted ? (
        <form onSubmit={handleCourseSubmit} className="space-y-4">
          <input type="text" name="title" placeholder="Course Title" onChange={handleCourseChange} className="w-full p-2 border border-gray-300 rounded" required />
          <textarea name="description" placeholder="Course Description" onChange={handleCourseChange} className="w-full p-2 border border-gray-300 rounded" required></textarea>
          <input type="text" name="category" placeholder="Course Category" onChange={handleCourseChange} className="w-full p-2 border border-gray-300 rounded" required />
          <input type="file" name="image" onChange={handleImageChange} className="w-full p-2 border border-gray-300 rounded" required />
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">Submit Course</button>
        </form>
      ) : (
        <>
          <input type="number" placeholder="Number of Lessons" onChange={handleNumLessonsChange} className="w-full p-2 border border-gray-300 rounded my-4" required />
          
          {Array.from({ length: numLessons }).map((_, index) => (
            <LessonForm key={index} index={index} handleLessonChange={handleLessonChange} />
          ))}
        </>
      )}

      <input type="file" onChange={handleFileChange} className="w-full p-2 border border-gray-300 rounded my-4" required />
      <button className="upload-button px-4 py-2 bg-blue-500 text-white rounded" onClick={handleUpload} disabled={loading}>
        {loading ? "Uploading..." : "Upload"}
      </button>
      {error && <p className="error-message text-red-500">{error}</p>}
      {fileUrl && <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">View Uploaded File</a>}
      {fileUrl && <img src={fileUrl} alt="uploaded file" className="mt-4" />}
    </div>
  );
};

export default CourseForm;
