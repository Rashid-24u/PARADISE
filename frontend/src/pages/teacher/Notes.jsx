import { useEffect, useState } from "react";
import axios from "axios";

function Notes() {
  const [courses, setCourses] = useState([]);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [course, setCourse] = useState("");
  const [notes, setNotes] = useState([]);

  // Load courses
  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/courses/")
      .then(res => setCourses(res.data));
  }, []);

  // Load notes
  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/notes/")
      .then(res => setNotes(res.data));
  }, []);

  const handleUpload = () => {
    const formData = new FormData();
    formData.append("title", title);
    formData.append("file", file);
    formData.append("course", course);

    axios.post("http://127.0.0.1:8000/api/notes/", formData)
      .then(() => {
        alert("Note Uploaded ✅");
        window.location.reload();
      })
      .catch(err => console.log(err));
  };

  return (
    <div>
      <h2>Notes Upload 📄</h2>

      <div style={styles.form}>
        <input
          type="text"
          placeholder="Title"
          onChange={e => setTitle(e.target.value)}
        />

        <select onChange={e => setCourse(e.target.value)}>
          <option>Select Class</option>
          {courses.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <input type="file" onChange={e => setFile(e.target.files[0])} />

        <button onClick={handleUpload}>Upload</button>
      </div>

      <h3>All Notes 📥</h3>

      <ul>
        {notes.map(n => (
          <li key={n.id}>
            {n.title} - 
            <a href={`http://127.0.0.1:8000${n.file}`} target="_blank">
              Download
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

const styles = {
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    width: "300px",
    marginBottom: "20px",
  },
};

export default Notes;