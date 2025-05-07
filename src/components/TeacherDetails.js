const TeacherDetails = ({ instructor }) => {
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
      {instructor.profile_picture_url ? (
        <img
          src={instructor.profile_picture_url}
          alt={instructor.name}
          style={{
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
      ) : (
        <div
          style={{
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            backgroundColor: "#2563eb",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "2rem",
            fontWeight: "600",
          }}
        >
          {getInitials(`${instructor.first_name} ${instructor.last_name}`)}
        </div>
      )}
      <div>
        <h4 style={{ fontSize: "20px", fontWeight: "bold", color: "#333" }}>
          Name: {instructor.first_name} {instructor.last_name}
        </h4>
        <p style={{ fontSize: "16px", color: "#555" }}>{instructor.bio}</p>
      </div>
    </div>
  );
};

export default TeacherDetails;
