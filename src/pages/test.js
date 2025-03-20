import React, { useState } from "react";
import axios from "axios";
import "./test.css";

const FileUpload = () => {
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
    // After successful submission, prompt for number of lessons
  };

  const handleLessonsSubmit = (e) => {
    e.preventDefault();
    // Handle lessons submission
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
    <div>
      <form onSubmit={handleCourseSubmit}>
        <input type="text" name="title" placeholder="Course Title" onChange={handleCourseChange} />
        <textarea name="description" placeholder="Course Description" onChange={handleCourseChange}></textarea>
        <input type="text" name="category" placeholder="Course Category" onChange={handleCourseChange} />
        <input type="file" name="image" onChange={handleImageChange} />
        <button type="submit">Submit Course</button>
      </form>

      <input type="number" placeholder="Number of Lessons" onChange={handleNumLessonsChange} />
      
      {Array.from({ length: numLessons }).map((_, index) => (
        <form key={index} onSubmit={handleLessonsSubmit}>
          <input type="text" name="title" placeholder="Lesson Title" onChange={(e) => handleLessonChange(index, e)} />
          <textarea name="description" placeholder="Lesson Description" onChange={(e) => handleLessonChange(index, e)}></textarea>
          <input type="text" name="video_url" placeholder="Video URL" onChange={(e) => handleLessonChange(index, e)} />
          <input type="number" name="lesson_order" placeholder="Lesson Order" onChange={(e) => handleLessonChange(index, e)} />
        </form>
      ))}

      <input type="file" onChange={handleFileChange} />
      <button className="upload-button" onClick={handleUpload} disabled={loading}>
        {loading ? "Uploading..." : "Upload"}
      </button>
      {error && <p className="error-message">{error}</p>}
      {fileUrl && <a href={fileUrl} target="_blank" rel="noopener noreferrer">View Uploaded File</a>}
      {fileUrl && <img src={fileUrl} alt="uploaded file" />}
    </div>
  );
};

export default FileUpload;
