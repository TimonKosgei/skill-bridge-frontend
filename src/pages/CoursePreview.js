import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { useParams, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import ReactPlayer from 'react-player';

const CoursePreview = () => {
  const navigate = useNavigate();
  const { course_id } = useParams();
  const [course, setCourse] = useState({});
  const [lessons, setLessons] = useState([]);
  const [instructor, setInstructor] = useState({});
  const [user, setUser] = useState({});
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [discussions, setDiscussions] = useState([]);
  const [activeTab, setActiveTab] = useState('lessons');
  const [visibleReviews, setVisibleReviews] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUser({ user_id: decodedToken.user_id, username: decodedToken.username });
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem("token");
      }
    }

    fetch(`http://127.0.0.1:5000/courses/${course_id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setCourse(data);
        setLessons(data.lessons);
        setInstructor(data.instructor);
        setIsEnrolled(data.isEnrolled);
      })
      .catch((error) => console.error("Error fetching course data:", error));

    fetch(`http://127.0.0.1:5000/discussions?course_id=${course_id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    })
      .then((response) => response.json())
      .then((data) => setDiscussions(data))
      .catch((error) => console.error("Error fetching discussions:", error));
  }, [course_id]);

  const handleEnroll = async () => {
    try {
      const response = await fetch("http://127.0.0.1:5000/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          course_id: course_id,
          user_id: user.user_id,
          enrollment_date: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        alert("Successfully enrolled!");
        setIsEnrolled(true);
        navigate(`/courses/${course_id}`);
      } else {
        throw new Error("Failed to enroll.");
      }
    } catch (error) {
      console.error("Error enrolling:", error);
      alert("Failed to enroll. Please try again.");
    }
  };

  const handleLoadMoreReviews = (lessonId) => {
    setVisibleReviews((prev) => ({
      ...prev,
      [lessonId]: (prev[lessonId] || 3) + 3,
    }));
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateCourseRating = () => {
    const ratings = lessons.flatMap((lesson) => lesson.lesson_reviews?.map((review) => review.rating) || []);
    if (ratings.length === 0) return null;
    return ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    return (
      <>
        {'★'.repeat(fullStars)}
        {hasHalfStar && '½'}
        {'☆'.repeat(5 - fullStars - (hasHalfStar ? 1 : 0))}
      </>
    );
  };

  const calculateTotalDuration = () => {
    const totalSeconds = lessons.reduce((sum, lesson) => sum + (lesson.duration || 0), 0);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const courseRating = calculateCourseRating();

  return (
    <>
      <Header />
      <div style={{ 
        maxWidth: "1200px", 
        margin: "0 auto", 
        padding: "24px",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
      }}>
        {/* Course Header Section */}
        <div style={{ 
          display: "flex", 
          gap: "32px", 
          marginBottom: "40px",
          flexDirection: "column",
          "@media (min-width: 768px)": {
            flexDirection: "row"
          }
        }}>
          {/* Course Image */}
          <div style={{ 
            flex: "1",
            minWidth: "300px",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            height: "300px"
          }}>
            <img 
              src={course.course_image_url} 
              alt={course.title} 
              style={{ 
                width: "100%", 
                height: "100%", 
                objectFit: "cover" 
              }} 
            />
          </div>
          
          {/* Course Info */}
          <div style={{ flex: "1" }}>
            <div style={{ marginBottom: "24px" }}>
              <h1 style={{ 
                fontSize: "32px", 
                fontWeight: "700", 
                color: "#2D3748",
                marginBottom: "12px",
                lineHeight: "1.3"
              }}>
                {course.title}
              </h1>
              <p style={{ 
                fontSize: "16px", 
                color: "#4A5568", 
                lineHeight: "1.6",
                marginBottom: "20px"
              }}>
                {course.description}
              </p>
              
              <div style={{ 
                display: "flex", 
                gap: "16px",
                flexWrap: "wrap"
              }}>
                <div style={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "8px",
                  backgroundColor: "#F7FAFC",
                  padding: "8px 16px",
                  borderRadius: "20px"
                }}>
                  <span style={{ color: "#718096" }}>⏱️</span>
                  <span style={{ 
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#2D3748"
                  }}>
                    {calculateTotalDuration()}
                  </span>
                </div>
                
                {courseRating && (
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "8px",
                    backgroundColor: "#F7FAFC",
                    padding: "8px 16px",
                    borderRadius: "20px"
                  }}>
                    <span style={{ color: "#D69E2E" }}>★</span>
                    <span style={{ 
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#2D3748"
                    }}>
                      {courseRating.toFixed(1)} ({lessons.flatMap(l => l.lesson_reviews || []).length} reviews)
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Instructor Preview */}
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "16px",
              padding: "16px",
              backgroundColor: "#F7FAFC",
              borderRadius: "12px"
            }}>
              <img
                src={instructor.profile_picture_url}
                alt={instructor.name}
                style={{ 
                  width: "56px", 
                  height: "56px", 
                  borderRadius: "50%", 
                  objectFit: "cover",
                  border: "2px solid #E2E8F0"
                }}
              />
              <div>
                <p style={{ 
                  fontSize: "14px", 
                  color: "#718096", 
                  marginBottom: "4px"
                }}>
                  Instructor
                </p>
                <h3 style={{ 
                  fontSize: "16px", 
                  fontWeight: "600", 
                  color: "#2D3748"
                }}>
                  {instructor.first_name} {instructor.last_name}
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ 
          display: "flex", 
          gap: "8px", 
          marginBottom: "24px",
          borderBottom: "1px solid #E2E8F0",
          paddingBottom: "8px"
        }}>
          {['lessons', 'instructor', 'discussions'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{ 
                padding: "12px 24px", 
                cursor: "pointer", 
                background: activeTab === tab ? "#007BFF" : "transparent", 
                color: activeTab === tab ? "#fff" : "#4A5568", 
                border: "none", 
                borderRadius: "8px",
                fontSize: "15px",
                fontWeight: "600",
                transition: "all 0.2s ease",
                ":hover": {
                  background: activeTab === tab ? "#007BFF" : "#EDF2F7"
                }
              }}
            >
              {tab === "lessons" ? "📖 Lessons" : 
               tab === "instructor" ? "👨‍🏫 Instructor" : 
               "💬 Discussions"}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ 
          background: "#fff", 
          borderRadius: "12px", 
          padding: "24px", 
          boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
        }}>
          {activeTab === "lessons" && (
            <div>
              <h2 style={{ 
                fontSize: "24px", 
                fontWeight: "700", 
                color: "#2D3748", 
                marginBottom: "24px"
              }}>
                Course Lessons
              </h2>
              
              <div style={{ display: "grid", gap: "20px" }}>
                {lessons.map((lesson, index) => (
                  <div
                    key={index}
                    style={{
                      border: "1px solid #E2E8F0",
                      borderRadius: "12px",
                      overflow: "hidden",
                      boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                      transition: "all 0.3s ease",
                    }}
                  >
                    {/* Lesson Header */}
                    <div style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      padding: "20px",
                      backgroundColor: "#F8FAFC",
                      cursor: "pointer"
                    }}>
                      <div style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "8px",
                        backgroundColor: "#007BFF10",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#007BFF",
                        fontWeight: "600",
                        marginRight: "16px",
                        flexShrink: 0
                      }}>
                        {index + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ 
                          fontSize: "18px", 
                          fontWeight: "600", 
                          color: "#2D3748",
                          marginBottom: "4px"
                        }}>
                          {lesson.title}
                        </h4>
                        <div style={{ 
                          display: "flex", 
                          alignItems: "center", 
                          gap: "16px",
                          fontSize: "14px",
                          color: "#718096"
                        }}>
                          <span>{formatDuration(lesson.duration)}</span>
                          {lesson.lesson_reviews?.length > 0 && (
                            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                              <span style={{ color: "#D69E2E" }}>★</span>
                              {(lesson.lesson_reviews.reduce((sum, review) => sum + review.rating, 0) / lesson.lesson_reviews.length).toFixed(1)}
                              <span>({lesson.lesson_reviews.length})</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Lesson Content */}
                    <div style={{ padding: "20px" }}>
                      <p style={{ 
                        fontSize: "15px", 
                        color: "#4A5568", 
                        lineHeight: "1.6",
                        marginBottom: "20px"
                      }}>
                        {lesson.description}
                      </p>
                      
                      {/* Video Preview */}
                      <div style={{
                        width: "100%",
                        height: "400px",
                        borderRadius: "8px",
                        overflow: "hidden",
                        marginBottom: "20px",
                        backgroundColor: "#000"
                      }}>
                        <ReactPlayer
                          url={lesson.video_url}
                          controls={true}
                          width="100%"
                          height="100%"
                          style={{ borderRadius: "8px" }}
                        />
                      </div>
                      
                      {/* Lesson Reviews Section */}
                      {lesson.lesson_reviews?.length > 0 && (
                        <div>
                          <div style={{ 
                            display: "flex", 
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "16px"
                          }}>
                            <h5 style={{
                              fontSize: "18px",
                              fontWeight: "600",
                              color: "#2D3748"
                            }}>
                              Student Feedback
                            </h5>
                            <span style={{
                              fontSize: "14px",
                              color: "#718096"
                            }}>
                              {lesson.lesson_reviews.length} reviews
                            </span>
                          </div>
                          
                          <div style={{ 
                            display: "grid",
                            gap: "16px"
                          }}>
                            {lesson.lesson_reviews.slice(0, visibleReviews[lesson.lesson_id] || 3).map((review, idx) => (
                              <div 
                                key={idx} 
                                style={{ 
                                  padding: "16px",
                                  border: "1px solid #EDF2F7",
                                  borderRadius: "8px",
                                  backgroundColor: "#F8FAFC"
                                }}
                              >
                                <div style={{ 
                                  display: "flex", 
                                  justifyContent: "space-between", 
                                  marginBottom: "12px",
                                  alignItems: "center"
                                }}>
                                  <div style={{ 
                                    display: "flex", 
                                    alignItems: "center",
                                    gap: "12px"
                                  }}>
                                    <div style={{
                                      width: "36px",
                                      height: "36px",
                                      borderRadius: "50%",
                                      backgroundColor: "#E2E8F0",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      color: "#718096",
                                      fontWeight: "600",
                                      fontSize: "14px"
                                    }}>
                                      {review.user_username.charAt(0).toUpperCase()}
                                    </div>
                                    <span style={{ 
                                      fontSize: "15px",
                                      fontWeight: "600",
                                      color: "#2D3748"
                                    }}>
                                      {review.user_username}
                                    </span>
                                  </div>
                                  <span style={{ 
                                    color: "#D69E2E",
                                    fontSize: "15px"
                                  }}>
                                    {'★'.repeat(review.rating) + '☆'.repeat(5 - review.rating)}
                                  </span>
                                </div>
                                <p style={{ 
                                  fontSize: "15px", 
                                  color: "#4A5568",
                                  lineHeight: "1.6"
                                }}>
                                  {review.comment}
                                </p>
                              </div>
                            ))}
                          </div>
                          
                          {lesson.lesson_reviews.length > (visibleReviews[lesson.lesson_id] || 3) && (
                            <button
                              onClick={() => handleLoadMoreReviews(lesson.lesson_id)}
                              style={{
                                marginTop: "20px",
                                padding: "10px 20px",
                                backgroundColor: "transparent",
                                color: "#007BFF",
                                border: "1px solid #007BFF",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontSize: "14px",
                                fontWeight: "600",
                                transition: "all 0.2s ease",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                marginLeft: "auto",
                                marginRight: "auto",
                                ":hover": {
                                  backgroundColor: "#007BFF10"
                                }
                              }}
                            >
                              <span>Show More Reviews</span>
                              <span>↓</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "instructor" && (
            <div>
              <h2 style={{ 
                fontSize: "24px", 
                fontWeight: "700", 
                color: "#2D3748", 
                marginBottom: "24px"
              }}>
                About the Instructor
              </h2>
              <div style={{ 
                display: "flex", 
                gap: "32px",
                flexDirection: "column",
                "@media (min-width: 768px)": {
                  flexDirection: "row"
                }
              }}>
                <div style={{
                  flex: "0 0 240px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "16px"
                }}>
                  <img 
                    src={instructor.profile_picture_url} 
                    alt={instructor.name} 
                    style={{ 
                      width: "200px", 
                      height: "200px", 
                      borderRadius: "50%", 
                      objectFit: "cover",
                      border: "4px solid #E2E8F0"
                    }} 
                  />
                  <h3 style={{ 
                    fontSize: "20px", 
                    fontWeight: "600", 
                    color: "#2D3748",
                    textAlign: "center"
                  }}>
                    {instructor.first_name} {instructor.last_name}
                  </h3>
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ 
                    fontSize: "18px", 
                    fontWeight: "600", 
                    color: "#2D3748",
                    marginBottom: "12px"
                  }}>
                    Biography
                  </h4>
                  <p style={{ 
                    fontSize: "16px", 
                    color: "#4A5568", 
                    lineHeight: "1.7",
                    marginBottom: "24px"
                  }}>
                    {instructor.bio || "No biography available."}
                  </p>
                  
                  <h4 style={{ 
                    fontSize: "18px", 
                    fontWeight: "600", 
                    color: "#2D3748",
                    marginBottom: "12px"
                  }}>
                    Teaching Style
                  </h4>
                  <p style={{ 
                    fontSize: "16px", 
                    color: "#4A5568", 
                    lineHeight: "1.7"
                  }}>
                    {instructor.teaching_style || "No information about teaching style."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "discussions" && (
            <div>
              <h2 style={{ 
                fontSize: "24px", 
                fontWeight: "700", 
                color: "#2D3748", 
                marginBottom: "24px"
              }}>
                Course Discussions
              </h2>
              
              {discussions.length > 0 ? (
                <div style={{ 
                  display: "grid", 
                  gap: "16px"
                }}>
                  {discussions.map((discussion, index) => (
                    <div 
                      key={index} 
                      style={{ 
                        padding: "24px",
                        border: "1px solid #EDF2F7",
                        borderRadius: "12px",
                        backgroundColor: "#F8FAFC"
                      }}
                    >
                      <h4 style={{ 
                        fontSize: "18px", 
                        fontWeight: "600", 
                        color: "#2D3748", 
                        marginBottom: "12px"
                      }}>
                        {discussion.title}
                      </h4>
                      <p style={{ 
                        fontSize: "16px", 
                        color: "#4A5568", 
                        lineHeight: "1.6",
                        marginBottom: "16px"
                      }}>
                        {discussion.content}
                      </p>
                      <div style={{ 
                        display: "flex", 
                        alignItems: "center",
                        gap: "16px"
                      }}>
                        <div style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          backgroundColor: "#E2E8F0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#718096",
                          fontWeight: "600",
                          fontSize: "14px"
                        }}>
                          {discussion.user_username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p style={{ 
                            fontSize: "14px", 
                            color: "#718096",
                            lineHeight: "1.4"
                          }}>
                            Posted by <span style={{ fontWeight: "600", color: "#4A5568" }}>{discussion.user_username}</span>
                          </p>
                          <p style={{ 
                            fontSize: "13px", 
                            color: "#A0AEC0"
                          }}>
                            {new Date(discussion.discussion_date).toLocaleDateString('en-US', { 
                              year: 'numeric', 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ 
                  padding: "40px",
                  textAlign: "center",
                  border: "1px dashed #E2E8F0",
                  borderRadius: "12px",
                  backgroundColor: "#F8FAFC"
                }}>
                  <p style={{ 
                    fontSize: "16px", 
                    color: "#718096",
                    marginBottom: "16px"
                  }}>
                    No discussions yet for this course.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Enroll Section */}
        {!isEnrolled && (
          <div style={{ 
            marginTop: "48px", 
            textAlign: "center",
            padding: "40px",
            backgroundColor: "#F7FAFC",
            borderRadius: "12px",
            border: "1px dashed #CBD5E0"
          }}>
            <h3 style={{ 
              fontSize: "24px", 
              fontWeight: "600", 
              color: "#2D3748", 
              marginBottom: "16px"
            }}>
              Ready to start learning?
            </h3>
            <p style={{ 
              fontSize: "16px", 
              color: "#4A5568", 
              marginBottom: "24px",
              maxWidth: "600px",
              marginLeft: "auto",
              marginRight: "auto",
              lineHeight: "1.6"
            }}>
              Enroll now to get full access to all course materials, including video lessons, downloadable resources, and community discussions.
            </p>
            <button
              onClick={handleEnroll}
              style={{
                padding: "16px 40px",
                backgroundColor: "#007BFF",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "600",
                transition: "all 0.2s ease",
                boxShadow: "0 4px 12px rgba(0, 123, 255, 0.2)",
                ":hover": {
                  backgroundColor: "#0069d9",
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 16px rgba(0, 123, 255, 0.3)"
                }
              }}
            >
              Enroll Now
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CoursePreview;