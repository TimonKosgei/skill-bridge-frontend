import { useState, useEffect } from 'react';
import { getAuthHeader, getAuthHeaderWithContentType } from '../utils/authUtils';

const DiscussionSection = ({ courseId, userId, userUsername }) => {
  const [discussions, setDiscussions] = useState([]);
  const [comments, setComments] = useState([]);
  const [newDiscussion, setNewDiscussion] = useState({ title: "", content: "" });
  const [newComment, setNewComment] = useState({ discussion_id: null, content: "" });

  // Fetch discussions and comments
  useEffect(() => {
    // Fetch discussions
    fetch(`http://localhost:5000/discussions?course_id=${courseId}`, {
      headers: getAuthHeader()
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => setDiscussions(data))
      .catch(error => {
        console.error("Error fetching discussions:", error);
        alert("Failed to fetch discussions. Please try again.");
      });

    // Fetch comments
    fetch("http://localhost:5000/comments", {
      headers: getAuthHeader()
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => setComments(data))
      .catch(error => {
        console.error("Error fetching comments:", error);
        alert("Failed to fetch comments. Please try again.");
      });
  }, [courseId]);

  // Helper function to generate initials from name
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Helper function to get background color based on initials
  const getInitialsColor = (initials) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500',
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ];
    const index = initials.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  const handleStartDiscussion = async () => {
    if (!newDiscussion.title || !newDiscussion.content) {
      alert('Please fill out both the title and content.');
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/discussions", {
        method: "POST",
        headers: getAuthHeaderWithContentType(),
        body: JSON.stringify({
          user_id: userId,
          course_id: courseId,
          title: newDiscussion.title,
          content: newDiscussion.content,
          discussion_date: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error('Failed to start discussion');
      
      const newDiscussionData = await response.json();
      setDiscussions([...discussions, newDiscussionData]);
      setNewDiscussion({ title: "", content: "" });
    } catch (error) {
      console.error("Error starting discussion:", error);
      alert("Failed to start discussion. Please try again.");
    }
  };

  const handlePostComment = async (discussionId) => {
    if (!newComment.content || !discussionId) {
      alert("Please write a comment before posting.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/comments", {
        method: "POST",
        headers: getAuthHeaderWithContentType(),
        body: JSON.stringify({
          user_id: userId,
          discussion_id: discussionId,
          content: newComment.content,
          comment_date: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error('Failed to post comment');
      
      const newCommentData = await response.json();
      setComments([...comments, newCommentData]);
      setNewComment({ discussion_id: null, content: '' });
    } catch (error) {
      console.error("Error posting comment:", error);
      alert("Failed to post comment. Please try again.");
    }
  };

  const handleDeleteDiscussion = async (discussionId) => {
    if (!window.confirm('Are you sure you want to delete this discussion? This will also delete all comments.')) {
      return;
    }

    try {
      // First, delete all comments associated with this discussion
      const commentsToDelete = comments.filter(c => c.discussion_id === discussionId);
      for (const comment of commentsToDelete) {
        const commentResponse = await fetch("http://localhost:5000/comments", {
          method: "DELETE",
          headers: getAuthHeaderWithContentType(),
          body: JSON.stringify({ comment_id: comment.comment_id }),
        });

        if (!commentResponse.ok) {
          throw new Error('Failed to delete associated comments');
        }
      }

      // Then delete the discussion
      const response = await fetch(`http://localhost:5000/discussions/${discussionId}`, {
        method: "DELETE",
        headers: getAuthHeaderWithContentType(),
        body: JSON.stringify({ user_id: userId }),
      });

      if (!response.ok) throw new Error('Failed to delete discussion');
      
      // Update state after successful deletion
      setDiscussions(discussions.filter(d => d.discussion_id !== discussionId));
      setComments(comments.filter(c => c.discussion_id !== discussionId));
    } catch (error) {
      console.error("Error deleting discussion:", error);
      alert("Failed to delete discussion. Please try again.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/comments", {
        method: "DELETE",
        headers: getAuthHeaderWithContentType(),
        body: JSON.stringify({ comment_id: commentId }),
      });

      if (!response.ok) throw new Error('Failed to delete comment');
      
      setComments(comments.filter(c => c.comment_id !== commentId));
    } catch (error) {
      console.error("Error deleting comment:", error);
      alert("Failed to delete comment. Please try again.");
    }
  };

  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-4">Discussions</h3>
      
      {discussions.length > 0 ? (
        <div className="space-y-6">
          {discussions.map((discussion) => (
            <div key={discussion.discussion_id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600 font-medium">
                    {discussion.user_username?.charAt(0)}
                  </span>
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="text-lg font-medium text-gray-900">{discussion.title}</h4>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {new Date(discussion.discussion_date).toLocaleDateString()}
                      </span>
                      {discussion.user_id === userId && (
                        <button
                          onClick={() => handleDeleteDiscussion(discussion.discussion_id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="mt-1 text-gray-600">{discussion.content}</p>
                  
                  {/* Comments */}
                  <div className="mt-4 space-y-3">
                    {comments
                      .filter(comment => comment.discussion_id === discussion.discussion_id)
                      .map(comment => (
                        <div key={comment.comment_id} className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                <img src={comment.user_profile_picture_url} alt={comment.user_username} className="h-8 w-8 rounded-full" />
                              </div>
                              <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900">{comment.user_username}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500">
                                {new Date(comment.comment_date).toLocaleDateString()}
                              </span>
                              {comment.user_id === userId && (
                                <button
                                  onClick={() => handleDeleteComment(comment.comment_id)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="mt-2 text-sm text-gray-600">{comment.content}</p>
                        </div>
                      ))}
                  </div>

                  {/* Add Comment */}
                  <div className="mt-4">
                    <textarea
                      placeholder="Write a comment..."
                      value={newComment.discussion_id === discussion.discussion_id ? newComment.content : ''}
                      onChange={(e) => setNewComment({ 
                        discussion_id: discussion.discussion_id, 
                        content: e.target.value 
                      })}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={2}
                    />
                    <button
                      onClick={() => handlePostComment(discussion.discussion_id)}
                      className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                    >
                      Post Comment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No discussions available.</p>
      )}

      {/* New Discussion Form */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h4 className="text-lg font-semibold text-gray-900 mb-3">Start New Discussion</h4>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              placeholder="Discussion title"
              value={newDiscussion.title}
              onChange={(e) => setNewDiscussion({ ...newDiscussion, title: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea
              placeholder="What would you like to discuss?"
              value={newDiscussion.content}
              onChange={(e) => setNewDiscussion({ ...newDiscussion, content: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
            />
          </div>
          <button
            onClick={handleStartDiscussion}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Discussion
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiscussionSection; 