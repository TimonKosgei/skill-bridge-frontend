import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const Header = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      try {
        const decoded = jwtDecode(token);
        setUser({
          username: decoded.username,
          profile_picture: decoded.profile_picture_url
        });
      } catch (error) {
        console.error("Invalid token:", error);
        logout();
      }
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setUser(null);
    navigate("/login");
  };

  return (
    <header style={{
      backgroundColor: "#FFFFFF",
      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.08)",
      position: "sticky",
      top: 0,
      zIndex: 50,
      borderBottom: "1px solid #E2E8F0"
    }}>
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "16px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        {/* Logo */}
        <Link to="/" style={{
          display: "flex",
          alignItems: "center",
          textDecoration: "none"
        }}>
          <h1 style={{
            fontSize: "24px",
            fontWeight: "700",
            color: "#007BFF",
            margin: 0
          }}>
            Skill Bridge
          </h1>
        </Link>

        {/* Navigation */}
        <nav>
          <ul style={{
            display: "flex",
            listStyle: "none",
            margin: 0,
            padding: 0,
            gap: "24px",
            alignItems: "center"
          }}>
            <li>
              <Link to="/home" style={{
                textDecoration: "none",
                color: "#4A5568",
                fontWeight: "600",
                fontSize: "15px",
                transition: "color 0.2s",
                ":hover": {
                  color: "#007BFF"
                }
              }}>
                Home
              </Link>
            </li>
            {isLoggedIn && (
              <li>
                <Link to="/upload-course" style={{
                  textDecoration: "none",
                  color: "#4A5568",
                  fontWeight: "600",
                  fontSize: "15px",
                  transition: "color 0.2s",
                  ":hover": {
                    color: "#007BFF"
                  }
                }}>
                  Upload Course
                </Link>
              </li>
            )}

            {isLoggedIn ? (
              <>
                <li>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px"
                  }}>
                    {user?.profile_picture ? (
                      <img 
                        src={user.profile_picture} 
                        alt={user.username}
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          objectFit: "cover"
                        }}
                      />
                    ) : (
                      <div style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        backgroundColor: "#E2E8F0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#718096",
                        fontWeight: "600"
                      }}>
                        {user?.username?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <Link to="/profile" style={{
                      textDecoration: "none",
                      color: "#2D3748",
                      fontWeight: "600",
                      fontSize: "15px"
                    }}>
                      {user?.username}
                    </Link>
                  </div>
                </li>
                <li>
                  <button
                    onClick={logout}
                    style={{
                      backgroundColor: "transparent",
                      color: "#E53E3E",
                      border: "1px solid #E53E3E",
                      borderRadius: "6px",
                      padding: "8px 16px",
                      fontWeight: "600",
                      fontSize: "14px",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      ":hover": {
                        backgroundColor: "#FEEBEB"
                      }
                    }}
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login" style={{
                    textDecoration: "none",
                    color: "#4A5568",
                    fontWeight: "600",
                    fontSize: "15px",
                    transition: "color 0.2s",
                    ":hover": {
                      color: "#007BFF"
                    }
                  }}>
                    Login
                  </Link>
                </li>
                <li>
                  <Link to="/signup" style={{
                    textDecoration: "none",
                    backgroundColor: "#007BFF",
                    color: "white",
                    padding: "8px 16px",
                    borderRadius: "6px",
                    fontWeight: "600",
                    fontSize: "15px",
                    transition: "all 0.2s",
                    ":hover": {
                      backgroundColor: "#0069D9"
                    }
                  }}>
                    Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;