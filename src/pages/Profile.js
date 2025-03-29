import { useState } from 'react';
import Header from '../components/Header';

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState('achievements');

  const userProfile = {
    name: "John Doe",
    email: "john.doe@example.com",
    bio: "Web Developer | Tech Enthusiast | Lifelong Learner",
    profilePicture: "https://via.placeholder.com/150", // Placeholder image
    achievements: [
      "Completed 10 courses",
      "Top 5% in coding challenges",
      "Contributed to open-source projects"
    ]
  };

  return (
    <>
      <Header />
      <div style={{ display: "flex", justifyContent: "center", padding: "20px" }}>
        
        {/* Profile Section */}
        <div style={{ maxWidth: "600px", width: "100%", padding: "20px", textAlign: "center" }}>
          <img 
            src={userProfile.profilePicture} 
            alt="Profile" 
            style={{ width: "120px", height: "120px", borderRadius: "50%", objectFit: "cover" }}
          />
          <h2>{userProfile.name}</h2>
          <p style={{ color: "#555" }}>{userProfile.email}</p>
          <p>{userProfile.bio}</p>

          {/* Toggle Buttons */}
          <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "20px" }}>
            <button
              onClick={() => setActiveTab('achievements')}
              style={{
                padding: "10px 15px",
                cursor: "pointer",
                background: activeTab === 'achievements' ? "#007BFF" : "#f0f0f0",
                color: activeTab === 'achievements' ? "#fff" : "#000",
                border: "none",
                borderRadius: "5px"
              }}>
              🏆 Achievements
            </button>
            <button
              onClick={() => setActiveTab('editProfile')}
              style={{
                padding: "10px 15px",
                cursor: "pointer",
                background: activeTab === 'editProfile' ? "#007BFF" : "#f0f0f0",
                color: activeTab === 'editProfile' ? "#fff" : "#000",
                border: "none",
                borderRadius: "5px"
              }}>
              ✏️ Edit Profile
            </button>
          </div>

          {/* Tab Content */}
          <div style={{ marginTop: "20px", textAlign: "left" }}>
            {activeTab === "achievements" && (
              <div>
                <h3>Achievements</h3>
                <ul>
                  {userProfile.achievements.map((achievement, index) => (
                    <li key={index}>✅ {achievement}</li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === "editProfile" && (
              <div>
                <h3>Edit Profile</h3>
                <form>
                  <label>
                    Name: <br />
                    <input type="text" defaultValue={userProfile.name} style={{ width: "100%", padding: "8px" }} />
                  </label>
                  <br /><br />
                  <label>
                    Email: <br />
                    <input type="email" defaultValue={userProfile.email} style={{ width: "100%", padding: "8px" }} />
                  </label>
                  <br /><br />
                  <label>
                    Bio: <br />
                    <textarea defaultValue={userProfile.bio} style={{ width: "100%", padding: "8px" }} />
                  </label>
                  <br /><br />
                  <button 
                    type="submit" 
                    style={{
                      padding: "10px 15px",
                      background: "#007BFF",
                      color: "#fff",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer"
                    }}>
                    Save Changes
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
