import { useRef, useState, useEffect } from 'react';
import Header from '../components/Header';
import ReactPlayer from 'react-player';
import { useParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const CourseDetail = () => {
  const video = useRef(null);

  const handleProgress = (progress) => {
    const { playedSeconds } = progress; // Get the current played seconds
    fetch("http://localhost:5000/progress", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user.user_id,
        lesson_id: currentLesson.lesson_id,
        watched_duration: playedSeconds,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .catch((error) => console.error("Error updating progress:", error));
  };

  // Helper function to format duration (seconds) into MM:SS
  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  let user_id = null;
  let username = null;
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      user_id = decodedToken.user_id;
      username = decodedToken.username;
    } catch (error) {
      console.error("Invalid token:", error);
      localStorage.removeItem("token");
    }
  }

  const { course_id } = useParams();
  const [course, setCourse] = useState({});
  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [instructor, setInstructor] = useState({});
  const [reviews, setReviews] = useState([]);
  const [user, setUser] = useState({ user_id: user_id, username: username });
  const [discussions, setDiscussions] = useState([]);
  const [comments, setComments] = useState([]);
  const [newDiscussion, setNewDiscussion] = useState({ title: "", content: "" });
  const [newComment, setNewComment] = useState({ discussion_id: null, content: "" });
  const totalLessons = lessons.length;
  const [enrollmentDetails, setEnrollmentDetails] = useState(null);
  const [enrolled, setEnrolled] = useState(false); // Add this line

  useEffect(() => {
    if (currentLesson) {
      fetch(`http://localhost:5000/lessons/${currentLesson.lesson_id}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          setReviews(data.lesson_reviews);
        })
        .catch((error) => console.error("Fetch error:", error)); // Handle errors
    }
  }, [currentLesson]);

  useEffect(() => {
    if (lessons.length > 0) {
      setCurrentLesson(lessons[0]);
    }
  }, [lessons]);

  useEffect(() => {
    fetch(`http://127.0.0.1:5000/courses/${course_id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Http error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setCourse(data);
        setLessons(data.lessons);
        setInstructor(data.instructor);
      })
      .catch((error) => console.error("Error fetching course data:", error));
  }, [course_id]);

  useEffect(() => {
    // Fetch all discussions
    fetch(`http://localhost:5000/discussions?course_id=${course_id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setDiscussions(data); // Assume API returns a list of discussions
      })
      .catch((error) => console.error("Error fetching discussions:", error));

    // Fetch all comments
    fetch("http://localhost:5000/comments")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setComments(data); // Assume API returns a list of comments
      })
      .catch((error) => console.error("Error fetching comments:", error));
  }, [course_id]);

  useEffect(() => {
    const fetchEnrollmentStatus = async () => {
      try {
        const token = localStorage.getItem('token'); // Assuming the token is stored in localStorage
        const decodedToken = jwtDecode(token);
        const user_id = decodedToken.user_id; // Extract user_id from the decoded token

        const response = await fetch(`http://127.0.0.1:5000/users/${user_id}`);
        if (response.ok) {
          const user = await response.json();
          const enrollment = user.enrollments.find((e) => e.course.course_id == course_id);
          if (enrollment) {
            setEnrolled(true);
            setEnrollmentDetails(enrollment);
            console.log('Enrollment details:', enrollment);
          } else {
            setEnrolled(false);
          }
        } else {
          console.error('Failed to fetch user data:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching enrollment status:', error);
      }
    };

    fetchEnrollmentStatus();
  }, [course_id]);

  const [activeTab, setActiveTab] = useState('lesson');
  
  const [newReview, setNewReview] = useState({ comment: "", rating: 0 });

  const handleDeleteReview = async (reviewId) => {
    try {
      const response = await fetch("http://localhost:5000/lessonreviews", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ review_id: reviewId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      // Remove the deleted review from the state
      setReviews(reviews.filter((review) => review.review_id !== reviewId));
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("Failed to delete review. Please try again.");
    }
  };

  const updateLessonProgress = async (watchedDuration) => {
    if (!user.user_id || !currentLesson?.lesson_id) {
      console.error("User ID or Lesson ID is missing.");
      return;
    }

    const progressData = {
      user_id: user.user_id,
      lesson_id: currentLesson.lesson_id,
      watched_duration: watchedDuration,
    };

    try {
      const response = await fetch("http://localhost:5000/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(progressData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const updatedProgress = await response.json();
      console.log("Lesson progress updated:", updatedProgress);
    } catch (error) {
      console.error("Error updating lesson progress:", error);
    }
  };

  return (
    <>
      <Header />
      <div style={{ display: "flex", justifyContent: "center", gap: "20px", padding: "20px" }}>
      { /* Sidebar */}
        <div style={{ width: "250px", padding: "15px", background: "#f4f4f4", borderRadius: "5px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "bold", color: "#333" }}>Course Progress</h3>
          
          <div style={{ marginBottom: "20px", backgroundColor: "#EDF2F7", borderRadius: "8px", overflow: "hidden" }}>
            {enrollmentDetails && (
              <>
                <div
                  style={{
                    width: `${enrollmentDetails.progress}%`,
                    height: "6px",
                    backgroundColor: "#007BFF",
                    borderRadius: "8px",
                  }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8px" }}>
                  <span style={{ fontSize: "12px", color: "#4A5568" }}>
                    {enrollmentDetails.progress}% Complete
                  </span>
                </div>
              </>
            )}
          </div>
          <h3 style={{ fontSize: "18px", fontWeight: "bold", color: "#333", marginTop: "15px" }}>Lessons</h3>
          <ol style={{ listStyle: "none", padding: 0 }}>
            {lessons.map((lesson, index) => (
              <li
                key={index}
                onClick={() => setCurrentLesson(lesson)} // Set the clicked lesson as the current lesson
                style={{
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px",
                  color: lesson.completed ? "#007BFF" : "#555",
                  backgroundColor: currentLesson?.lesson_id === lesson.lesson_id ? "#E3F2FD" : "transparent", // Highlight current lesson
                  border: currentLesson?.lesson_id === lesson.lesson_id ? "1px solid #007BFF" : "1px solid transparent", // Add border for current lesson
                  borderRadius: "5px",
                  transition: "background-color 0.3s ease, border 0.3s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.border = "1px solid #007BFF")}
                onMouseLeave={(e) => {
                  if (currentLesson?.lesson_id !== lesson.lesson_id) {
                    e.currentTarget.style.border = "1px solid transparent";
                  }
                }}
              >
                <span style={{ flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {`${index + 1}. ${lesson.title}`}
                </span>
                <span style={{ marginLeft: "10px", color: "#555" }}>{formatDuration(lesson.duration)}</span>
              </li>
            ))}
          </ol>
        </div>
        {/* Main Content */}
        <div style={{ maxWidth: "900px", width: "100%" }}>
          <ReactPlayer 
            ref={video}
            onProgress={handleProgress}
            url={currentLesson?.video_url || "Video"}  
            width="100%" 
            height="450px" 
            controls 
          />
          
          <div style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
            {['lesson', 'teacher', 'reviews', 'discussions'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{ padding: "10px 15px", cursor: "pointer", background: activeTab === tab ? "#007BFF" : "#f0f0f0", color: activeTab === tab ? "#fff" : "#000", border: "none", borderRadius: "5px" }}>
                {tab === "lesson" ? "📖 About the Lesson" : tab === "teacher" ? "👨‍🏫 About the Teacher" : tab === "reviews" ? "⭐ Reviews" : "💬 Discussions"}
              </button>
            ))}
          </div>
          
          <div style={{ marginTop: "20px" }}>
            {activeTab === "lesson" && (
              <div>
                <h2 style={{ fontSize: "24px", fontWeight: "bold", color: "#007BFF" }}>{currentLesson?.title || "Loading..."}</h2>
                <p style={{ fontSize: "16px", color: "#555" }}>{currentLesson?.description || "Loading..."}</p>
              </div>
            )}
            {activeTab === "teacher" && (
              <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                <img src={instructor.profile_picture_url} alt={instructor.name} style={{ width: "100px", height: "100px", borderRadius: "50%", objectFit: "cover" }} />
                <div>
                  <h4 style={{ fontSize: "20px", fontWeight: "bold", color: "#333" }}>Name: {instructor.first_name} {instructor.last_name}</h4>
                  <p style={{ fontSize: "16px", color: "#555" }}>{instructor.bio}</p>
                </div>
              </div>
            )}
            {activeTab === "reviews" && (
              <div>
                <h3 style={{ fontSize: "20px", fontWeight: "bold", color: "#007BFF" }}>Reviews</h3>
                <ul>
                  {reviews.map((review, index) => (
                    <li key={index} style={{ marginBottom: "10px" }}>
                      <strong>{review.user_username}:</strong> {review.comment}{" "}
                      <span style={{ color: "#FFD700" }}>
                        {"★".repeat(review.rating) + "☆".repeat(5 - review.rating)}
                      </span>
                      <button
                        onClick={() => handleDeleteReview(review.review_id)}
                        style={{
                          marginLeft: "10px",
                          padding: "5px 10px",
                          backgroundColor: "#FF4D4D",
                          color: "#fff",
                          border: "none",
                          borderRadius: "5px",
                          cursor: "pointer",
                        }}
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>

                <div style={{ marginTop: "20px" }}>
                  <h4 style={{ fontSize: "18px", fontWeight: "bold", color: "#333" }}>Add Your Review</h4>
                  <textarea
                    placeholder="Your review"
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "10px",
                      marginBottom: "10px",
                      border: "1px solid #ccc",
                      borderRadius: "5px",
                    }}
                  ></textarea>
                  <div style={{ marginBottom: "10px" }}>
                    <span style={{ fontSize: "16px", fontWeight: "bold", color: "#333" }}>Rating:</span>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        onClick={() => setNewReview({ ...newReview, rating: star })}
                        style={{
                          cursor: "pointer",
                          color: newReview.rating >= star ? "#FFD700" : "#ccc",
                          fontSize: "20px",
                          marginLeft: "5px",
                        }}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={async () => {
                      if (newReview.comment && newReview.rating) {
                        const reviewData = {
                          user_id: user.user_id,
                          lesson_id: currentLesson.lesson_id,
                          rating: newReview.rating,
                          comment: newReview.comment,
                        };

                        try {
                          const response = await fetch("http://localhost:5000/lessonreviews", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(reviewData),
                          });

                          if (!response.ok) {
                            throw new Error(`HTTP error! Status: ${response.status}`);
                          }

                          const savedReview = await response.json();
                          setReviews([...reviews, { ...savedReview, user: user.first_name }]);
                          setNewReview({ comment: "", rating: 0 });
                        } catch (error) {
                          console.error("Error submitting review:", error);
                          alert("Failed to submit review. Please try again.");
                        }
                      } else {
                        alert("Please fill out all fields and select a rating.");
                      }
                    }}
                    style={{
                      padding: "10px 20px",
                      backgroundColor: "#007BFF",
                      color: "#fff",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                  >
                    Submit Review
                  </button>
                </div>
              </div>
            )}
            {activeTab === "discussions" && (
              <div>
                <h3 style={{ fontSize: "20px", fontWeight: "bold", color: "#007BFF" }}>Discussions</h3>
                <ul>
                  {discussions.length > 0 ? (
                    discussions.map((discussion, index) => (
                      <li key={index} style={{ marginBottom: "10px" }}>
                        <strong>{discussion.title}</strong> by {discussion.user_username} on{" "}
                        {new Date(discussion.discussion_date).toLocaleDateString()}
                        <p style={{ marginTop: "5px", color: "#555" }}>{discussion.content}</p>
                        <h5 style={{ marginTop: "10px", fontWeight: "bold" }}>Comments:</h5>
                        <ul>
                          {comments
                            .filter((comment) => comment.discussion_id === discussion.discussion_id)
                            .map((comment, commentIndex) => (
                              <li key={commentIndex} style={{ marginBottom: "5px" }}>
                                <strong>{comment.user_username}:</strong> {comment.content}
                              </li>
                            ))}
                        </ul>
                        <textarea
                          placeholder="Add a comment"
                          value={newComment.discussion_id === discussion.discussion_id ? newComment.content : ""}
                          onChange={(e) =>
                            setNewComment({ discussion_id: discussion.discussion_id, content: e.target.value })
                          }
                          style={{
                            display: "block",
                            width: "100%",
                            padding: "10px",
                            marginBottom: "10px",
                            border: "1px solid #ccc",
                            borderRadius: "5px",
                          }}
                        ></textarea>
                        <button
                          onClick={async () => {
                            if (newComment.content && newComment.discussion_id) {
                              const commentData = {
                                user_id: user.user_id,
                                discussion_id: newComment.discussion_id,
                                content: newComment.content,
                                comment_date: new Date().toISOString(),
                              };

                              try {
                                const response = await fetch("http://localhost:5000/comments", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify(commentData),
                                });

                                if (!response.ok) {
                                  throw new Error(`HTTP error! Status: ${response.status}`);
                                }

                                const savedComment = await response.json();
                                setComments([...comments, savedComment]);
                                setNewComment({ discussion_id: null, content: "" });
                              } catch (error) {
                                console.error("Error submitting comment:", error);
                                alert("Failed to submit comment. Please try again.");
                              }
                            } else {
                              alert("Please enter a comment.");
                            }
                          }}
                          style={{
                            padding: "5px 10px",
                            backgroundColor: "#007BFF",
                            color: "#fff",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                          }}
                        >
                          Add Comment
                        </button>
                      </li>
                    ))
                  ) : (
                    <p style={{ color: "#555" }}>No discussions available.</p>
                  )}
                </ul>

                <div style={{ marginTop: "20px" }}>
                  <h4 style={{ fontSize: "18px", fontWeight: "bold", color: "#333" }}>Start a New Discussion</h4>
                  <input
                    type="text"
                    placeholder="Discussion Title"
                    value={newDiscussion.title}
                    onChange={(e) => setNewDiscussion({ ...newDiscussion, title: e.target.value })}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "10px",
                      marginBottom: "10px",
                      border: "1px solid #ccc",
                      borderRadius: "5px",
                    }}
                  />
                  <textarea
                    placeholder="Discussion Content"
                    value={newDiscussion.content}
                    onChange={(e) => setNewDiscussion({ ...newDiscussion, content: e.target.value })}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "10px",
                      marginBottom: "10px",
                      border: "1px solid #ccc",
                      borderRadius: "5px",
                    }}
                  ></textarea>
                  <button
                    onClick={async () => {
                      if (newDiscussion.title && newDiscussion.content) {
                        const discussionData = {
                          user_id: user.user_id,
                          course_id: course_id,
                          title: newDiscussion.title,
                          content: newDiscussion.content,
                          discussion_date: new Date().toISOString(),
                        };

                        try {
                          const response = await fetch("http://localhost:5000/discussions", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(discussionData),
                          });

                          if (!response.ok) {
                            throw new Error(`HTTP error! Status: ${response.status}`);
                          }

                          const savedDiscussion = await response.json();
                          setDiscussions([...discussions, savedDiscussion]);
                          setNewDiscussion({ title: "", content: "" });
                        } catch (error) {
                          console.error("Error submitting discussion:", error);
                          alert("Failed to submit discussion. Please try again.");
                        }
                      } else {
                        alert("Please fill out both the title and content.");
                      }
                    }}
                    style={{
                      padding: "10px 20px",
                      backgroundColor: "#007BFF",
                      color: "#fff",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                    }}
                  >
                    Start Discussion
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default CourseDetail;
