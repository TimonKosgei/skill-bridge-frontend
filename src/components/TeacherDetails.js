const TeacherDetails = ({ instructor }) => {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
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
