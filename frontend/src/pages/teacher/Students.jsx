import { useEffect, useState } from "react";
import axios from "axios";

const API = "http://127.0.0.1:8000/api/";

function Students() {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [teacher, setTeacher] = useState(null);
  const [filterCourse, setFilterCourse] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    axios.get(`${API}courses/`).then((res) => setCourses(res.data));
  }, []);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("teacher") || "{}");
    if (!stored.teacher_id) return;
    axios
      .get(`${API}teachers/${stored.teacher_id}/`)
      .then((res) => {
        setTeacher(res.data);
        if (res.data.course) {
          setFilterCourse(String(res.data.course));
        } else {
          setFilterCourse("");
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!teacher) return;

    if (teacher.course) {
      axios
        .get(`${API}students/?course=${teacher.course}`)
        .then((res) => setStudents(res.data));
      return;
    }

    const url = filterCourse
      ? `${API}students/?course=${filterCourse}`
      : `${API}students/`;
    axios.get(url).then((res) => setStudents(res.data));
  }, [teacher, filterCourse]);

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  const assignedClassOnly = Boolean(teacher?.course);

  return (
    <div style={styles.container}>
      <h2>👨‍🎓 Students</h2>

      <div style={styles.top}>
        {!assignedClassOnly && (
          <select
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
          >
            <option value="">All Classes</option>
            {courses.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.name}
              </option>
            ))}
          </select>
        )}

        {assignedClassOnly && teacher && (
          <span style={styles.hint}>
            Your class:{" "}
            <strong>
              {courses.find((c) => String(c.id) === String(teacher.course))
                ?.name || "—"}
            </strong>
          </span>
        )}

        <input
          type="text"
          placeholder="Search student..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <p>Total Students: {filtered.length}</p>

      <table style={styles.table}>
        <thead>
          <tr>
            <th>Photo</th>
            <th>Name</th>
            <th>Admission</th>
            <th>Phone</th>
            <th>Email</th>
          </tr>
        </thead>

        <tbody>
          {filtered.map((s) => (
            <tr
              key={s.id}
              onClick={() => setSelected(s)}
              style={{ cursor: "pointer" }}
            >
              <td>
                {s.image_url && <img src={s.image_url} style={styles.img} alt="" />}
              </td>
              <td>{s.name}</td>
              <td>{s.admission_no}</td>
              <td>{s.phone}</td>
              <td>{s.email}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {selected && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h3>{selected.name}</h3>

            {selected.image_url && (
              <img src={selected.image_url} style={styles.bigImg} alt="" />
            )}

            <p>
              <b>Class:</b> {selected.course_name}
            </p>
            <p>
              <b>Admission:</b> {selected.admission_no}
            </p>

            <p>
              <b>Phone:</b> {selected.phone}
            </p>
            <p>
              <b>Email:</b> {selected.email}
            </p>

            <p>
              <b>DOB:</b> {selected.dob}
            </p>
            <p>
              <b>Blood:</b> {selected.blood_group}
            </p>
            <p>
              <b>Gender:</b> {selected.gender}
            </p>

            <p>
              <b>Parent:</b> {selected.parent_name}
            </p>
            <p>
              <b>Parent Phone:</b> {selected.parent_phone}
            </p>

            <p>
              <b>Address:</b> {selected.address}
            </p>
            <p>
              <b>Details:</b> {selected.details}
            </p>

            <button type="button" onClick={() => setSelected(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    padding: "20px",
  },
  top: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
    flexWrap: "wrap",
    alignItems: "center",
  },
  hint: {
    color: "#475569",
    fontSize: "14px",
  },
  table: {
    width: "100%",
    background: "#fff",
    borderRadius: "10px",
    overflow: "hidden",
  },
  img: {
    width: "40px",
    height: "40px",
    objectFit: "cover",
    borderRadius: "50%",
  },
  modal: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
    width: "350px",
  },
  bigImg: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    objectFit: "cover",
    marginBottom: "10px",
  },
};

export default Students;
