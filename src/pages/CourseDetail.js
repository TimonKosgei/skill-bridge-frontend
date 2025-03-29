import { useState, useEffect } from 'react';
import Header from '../components/Header';
import ReactPlayer from 'react-player';
import { useParams } from 'react-router-dom';

const CourseDetail = () => {
  const {course_id} = useParams();
  const [course, setCourse] = useState({});
  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [instructor, setInstructor] = useState({});
  const [reviews, setReviews] = useState([]);  
  const [user, setUser] = useState({ user_id: 1, first_name: "Timon", last_name: "Kosgei" });
  const [discussions, setDiscussions] = useState([]);
  const [comments, setComments] = useState([]); // State to store comments
  const [newDiscussion, setNewDiscussion] = useState({ title: "", content: "" });
  const [newComment, setNewComment] = useState({ discussion_id: null, content: "" }); // State for new comment

  useEffect(() => {
    if (currentLesson) {
      fetch(`http://localhost:5000/lessons/${currentLesson.lesson_id}`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          setReviews(data.lesson_reviews);
        })
        .catch(error => console.error("Fetch error:", error)); // Handle errors
    }
  }, [currentLesson, setReviews]);
  
  useEffect(() => {
    if (lessons.length > 0) {
      setCurrentLesson(lessons[0]);
    }
  }, [lessons]);

  useEffect(() => {
    fetch(`http://127.0.0.1:5000/courses/${course_id}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Http error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        setCourse(data);
        setLessons(data.lessons);
        setInstructor(data.instructor);
      })
  }, []);

  useEffect(() => {
    // Fetch all discussions
    fetch("http://localhost:5000/discussions")
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
  }, []);

  const [activeTab, setActiveTab] = useState('lesson');
  
  const [newReview, setNewReview] = useState({ comment: "", rating: 0 });

  const completedLessons = 2;
  const totalLessons = 4;

  return (
    <>
      <Header />
      <div style={{ display: "flex", justifyContent: "center", gap: "20px", padding: "20px" }}>
        {/* Sidebar */}
          <div style={{ width: "250px", padding: "15px", background: "#f4f4f4", borderRadius: "5px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "bold", color: "#333" }}>Course Progress</h3>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              {[...Array(totalLessons)].map((_, index) => (
                <div
            key={index}
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              background: index < completedLessons ? "#007BFF" : "#ddd"
            }}
                />
              ))}
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: "bold", color: "#333", marginTop: "15px" }}>Lessons</h3>
            <ol>
                {lessons.map((lesson, index) => (
                  <li 
                    key={index} 
                    onClick={() => setCurrentLesson(lesson)}
                    style={{ cursor: "pointer", color: "#007BFF", textDecoration: "underline" }}
                  >
                    {index + 1}. {lesson.title}
                  </li>
                ))}
            </ol>

          </div>
          
          {/* Main Content */}
        <div style={{ maxWidth: "900px", width: "100%" }}>
          <ReactPlayer url={currentLesson?.video_url || "Video"}  width="100%" height="450px" controls />
          
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
