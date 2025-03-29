import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const CoursePreview = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const courseResponse = await axios.get(`http://127.0.0.1:5000/courses/${courseId}`);
        const lessonsResponse = await axios.get(`http://127.0.0.1:5000/lessons?course_id=${courseId}`);
        setCourse(courseResponse.data);
        setLessons(lessonsResponse.data);
      } catch (error) {
        console.error("Error fetching course details", error);
      }
    };
    fetchCourse();
  }, [courseId]);

  const handleCourseChange = (e) => {
    const { name, value } = e.target;
    setCourse({ ...course, [name]: value });
  };

  const handleLessonChange = (index, e) => {
    const { name, value } = e.target;
    const updatedLessons = [...lessons];
    updatedLessons[index] = { ...updatedLessons[index], [name]: value };
    setLessons(updatedLessons);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await axios.put(`http://127.0.0.1:5000/courses/${courseId}`, course);
      for (const lesson of lessons) {
        await axios.put(`http://127.0.0.1:5000/lessons/${lesson.id}`, lesson);
      }
      alert("Course and lessons saved successfully!");
    } catch (error) {
      alert("Failed to save changes. Try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!course) return <p>Loading course details...</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Edit Course</h2>
      <label className="block mb-2">
        <span>Title:</span>
        <input type="text" name="title" value={course.title} onChange={handleCourseChange} className="w-full p-2 border rounded" />
      </label>
      <label className="block mb-2">
        <span>Description:</span>
        <textarea name="description" value={course.description} onChange={handleCourseChange} className="w-full p-2 border rounded" />
      </label>
      <label className="block mb-4">
        <span>Category:</span>
        <input type="text" name="category" value={course.category} onChange={handleCourseChange} className="w-full p-2 border rounded" />
      </label>
      
      <h3 className="text-xl font-bold mb-2">Lessons</h3>
      {lessons.map((lesson, index) => (
        <div key={lesson.id} className="mb-4 p-4 border rounded">
          <label className="block mb-2">
            <span>Lesson Title:</span>
            <input type="text" name="title" value={lesson.title} onChange={(e) => handleLessonChange(index, e)} className="w-full p-2 border rounded" />
          </label>
          <label className="block mb-2">
            <span>Lesson Description:</span>
            <textarea name="description" value={lesson.description} onChange={(e) => handleLessonChange(index, e)} className="w-full p-2 border rounded" />
          </label>
        </div>
      ))}
      
      <button onClick={handleSave} className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition" disabled={isSaving}>
        {isSaving ? "Saving..." : "Save Changes"}
      </button>
    </div>
  );
};

export default CoursePreview;
