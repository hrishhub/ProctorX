import { useEffect, useState } from "react";
import "./Admin.css";

const API_URL = import.meta.env.VITE_API_URL;

function Admin() {
  const [token, setToken] = useState(
    localStorage.getItem("adminToken") || ""
  );

  const [login, setLogin] = useState({
    email: "",
    password: "",
  });

  const [activeSection, setActiveSection] = useState("builder");
  const [message, setMessage] = useState("");

  const [exam, setExam] = useState({
    title: "Computer Science Test",
    duration: 30,
    description: "",
  });

  const [question, setQuestion] = useState({
    text: "",
    image_url: "",
    options: ["", "", "", ""],
    correct: 0,
    marks: 1,
  });

  const [imageUploading, setImageUploading] = useState(false);

  const [questions, setQuestions] = useState([]);
  const [examId, setExamId] = useState(null);

  const [events, setEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventsError, setEventsError] = useState("");

  const [attempts, setAttempts] = useState([]);
  const [attemptsLoading, setAttemptsLoading] = useState(false);
  const [attemptsError, setAttemptsError] = useState("");

  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState("");
  const [studentSearch, setStudentSearch] = useState("");

  const logout = () => {
    localStorage.removeItem("adminToken");
    setToken("");
  };

  const loginAdmin = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(login),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Login failed");
      }

      localStorage.setItem("adminToken", data.access_token);
      setToken(data.access_token);
      setMessage("Login successful");
    } catch (error) {
      setMessage(error.message);
    }
  };

  const uploadQuestionImage = async (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setMessage("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage("Image must be smaller than 5 MB.");
      return;
    }

    if (!token) {
      setMessage("Please login as admin first.");
      return;
    }

    try {
      setImageUploading(true);
      setMessage("");

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(
        `${API_URL}/exams/upload-image`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Image upload failed"
        );
      }

      setQuestion((previous) => ({
        ...previous,
        image_url: data.image_url,
      }));

      setMessage("Question image uploaded.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setImageUploading(false);
    }
  };

  const addQuestion = () => {
    if (!question.text.trim() && !question.image_url) {
      setMessage(
        "Enter question text or upload a question image."
      );
      return;
    }

    if (question.options.some((item) => !item.trim())) {
      setMessage("Fill all four options.");
      return;
    }

    setQuestions((previous) => [
      ...previous,
      {
        id: Date.now(),
        text: question.text.trim(),
        image_url: question.image_url,
        options: [...question.options],
        correct: Number(question.correct),
        marks: Number(question.marks),
      },
    ]);

    setQuestion({
      text: "",
      image_url: "",
      options: ["", "", "", ""],
      correct: 0,
      marks: 1,
    });

    setMessage("Question added.");
  };

  const updateOption = (index, value) => {
    setQuestion((previous) => {
      const options = [...previous.options];
      options[index] = value;

      return {
        ...previous,
        options,
      };
    });
  };

  const deleteQuestion = (id) => {
    setQuestions((previous) =>
      previous.filter((item) => item.id !== id)
    );
  };

  const createExam = async () => {
    if (!token) {
      setMessage("Please login as admin first.");
      return;
    }

    if (!exam.title.trim()) {
      setMessage("Enter an exam title.");
      return;
    }

    if (Number(exam.duration) <= 0) {
      setMessage("Enter a valid duration.");
      return;
    }

    if (!questions.length) {
      setMessage("Add at least one question.");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/exams/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: exam.title,
          description: exam.description,
          duration: Number(exam.duration),
          questions: questions.map((item) => ({
            text: item.text,
            image_url: item.image_url || null,
            options: item.options,
            correct: Number(item.correct),
            marks: Number(item.marks),
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to create exam"
        );
      }

      setExamId(data.id);
      setMessage(
        `Exam created successfully. Exam ID: ${data.id}`
      );
    } catch (error) {
      setMessage(error.message);
    }
  };

  const publishExam = async () => {
    if (!examId) {
      setMessage("Create the exam before publishing it.");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/exams/${examId}/publish`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to publish exam"
        );
      }

      setMessage("Exam published successfully.");
    } catch (error) {
      setMessage(error.message);
    }
  };

  const fetchEvents = async () => {
    if (!token) return;

    setEventsLoading(true);
    setEventsError("");

    try {
      const response = await fetch(
        `${API_URL}/attempts/admin/events`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to fetch events"
        );
      }

      setEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      setEventsError(error.message);
    } finally {
      setEventsLoading(false);
    }
  };

  const fetchAttempts = async () => {
    if (!token) return;

    setAttemptsLoading(true);
    setAttemptsError("");

    try {
      const response = await fetch(
        `${API_URL}/attempts/admin`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to fetch attempts"
        );
      }

      setAttempts(Array.isArray(data) ? data : []);
    } catch (error) {
      setAttemptsError(error.message);
    } finally {
      setAttemptsLoading(false);
    }
  };

  const fetchStudents = async () => {
    if (!token) return;

    setStudentsLoading(true);
    setStudentsError("");

    try {
      const response = await fetch(
        `${API_URL}/users/admin/students`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Failed to fetch students"
        );
      }

      setStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      setStudentsError(error.message);
    } finally {
      setStudentsLoading(false);
    }
  };

  useEffect(() => {
    if (!token || activeSection !== "events") {
      return;
    }

    fetchEvents();

    const interval = setInterval(
      fetchEvents,
      5000
    );

    return () => clearInterval(interval);
  }, [token, activeSection]);

  useEffect(() => {
    if (!token || activeSection !== "attempts") {
      return;
    }

    fetchAttempts();

    const interval = setInterval(
      fetchAttempts,
      5000
    );

    return () => clearInterval(interval);
  }, [token, activeSection]);

  useEffect(() => {
    if (!token || activeSection !== "students") {
      return;
    }

    fetchStudents();
  }, [token, activeSection]);

  const getEventData = (value) => {
    if (!value) return {};

    try {
      return JSON.parse(value);
    } catch {
      return {
        message: value,
      };
    }
  };

  const getSeverity = (event) => {
    const data = getEventData(event.event_data);

    if (data.severity) {
      return String(data.severity).toLowerCase();
    }

    if (
      event.event_type === "face_not_detected" ||
      event.event_type === "multiple_faces"
    ) {
      return "high";
    }

    if (
      event.event_type === "looking_away" ||
      event.event_type === "fullscreen_exit" ||
      event.event_type === "tab_switch" ||
      event.event_type === "window_blur"
    ) {
      return "medium";
    }

    return "low";
  };

  const formatEvent = (value) =>
    String(value || "Unknown")
      .replaceAll("_", " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );

  const formatTime = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString();
  };

  const formatStatus = (status) => {
    if (!status) return "UNKNOWN";

    return String(status)
      .replaceAll("_", " ")
      .toUpperCase();
  };

  const renderBuilder = () => (
    <div className="page-content">
      <div className="page-title-row">
        <div>
          <span className="eyebrow">
            EXAM MANAGEMENT
          </span>

          <h1>Exam Builder</h1>

          <p>
            Create, configure and publish your
            examination.
          </p>
        </div>

        <div className="title-actions">
          <button
            className="secondary-button"
            onClick={() =>
              setActiveSection("exams")
            }
          >
            View Exams
          </button>

          <button
            className="primary-button"
            onClick={createExam}
            disabled={!!examId}
          >
            {examId
              ? `Created #${examId}`
              : "Create Exam"}
          </button>

          <button
            className="publish-button"
            onClick={publishExam}
            disabled={!examId}
          >
            Publish Exam
          </button>
        </div>
      </div>

      {message && (
        <div className="notice">
          {message}
        </div>
      )}

      <div className="builder-grid">
        <div className="builder-main">
          <section className="panel">
            <div className="panel-heading">
              <div>
                <h2>Exam Details</h2>

                <p>
                  Basic information students will
                  see before starting.
                </p>
              </div>
            </div>

            <div className="field-grid">
              <label className="field">
                <span>Exam Title</span>

                <input
                  value={exam.title}
                  onChange={(event) =>
                    setExam({
                      ...exam,
                      title:
                        event.target.value,
                    })
                  }
                  placeholder="e.g. Computer Science Test"
                />
              </label>

              <label className="field">
                <span>Duration</span>

                <div className="input-suffix">
                  <input
                    type="number"
                    min="1"
                    value={exam.duration}
                    onChange={(event) =>
                      setExam({
                        ...exam,
                        duration:
                          event.target.value,
                      })
                    }
                  />

                  <span>min</span>
                </div>
              </label>
            </div>

            <label className="field">
              <span>Description</span>

              <textarea
                rows="4"
                value={exam.description}
                onChange={(event) =>
                  setExam({
                    ...exam,
                    description:
                      event.target.value,
                  })
                }
                placeholder="Add instructions or a short description for students."
              />
            </label>
          </section>

          <section className="panel">
            <div className="panel-heading">
              <div>
                <h2>Add Question</h2>

                <p>
                  Create a multiple-choice question
                  with one correct answer.
                </p>
              </div>

              <span className="panel-count">
                {questions.length} added
              </span>
            </div>

            <label className="field">
              <span>Question</span>

              <textarea
                rows="3"
                value={question.text}
                onChange={(event) =>
                  setQuestion({
                    ...question,
                    text: event.target.value,
                  })
                }
                placeholder="Enter your question..."
              />
            </label>

            <div className="field image-upload-field">
              <span>
                Question Image (Optional)
              </span>

              <input
                type="file"
                accept="image/*"
                onChange={(event) =>
                  uploadQuestionImage(
                    event.target.files?.[0]
                  )
                }
                disabled={imageUploading}
              />

              <small className="image-help">
                Maximum size: 5 MB. JPG, PNG,
                WEBP or GIF.
              </small>

              {question.image_url && (
                <div className="question-image-preview">
                  <img
                    src={`${API_URL}${question.image_url}`}
                    alt="Question preview"
                  />

                  <button
                    type="button"
                    className="remove-image-button"
                    onClick={() =>
                      setQuestion(
                        (previous) => ({
                          ...previous,
                          image_url: "",
                        })
                      )
                    }
                  >
                    Remove Image
                  </button>
                </div>
              )}
            </div>

            <div className="option-grid">
              {question.options.map(
                (option, index) => (
                  <label
                    className="field"
                    key={index}
                  >
                    <span>
                      Option{" "}
                      {String.fromCharCode(
                        65 + index
                      )}
                    </span>

                    <input
                      value={option}
                      onChange={(event) =>
                        updateOption(
                          index,
                          event.target.value
                        )
                      }
                      placeholder={`Enter option ${String.fromCharCode(
                        65 + index
                      )}`}
                    />
                  </label>
                )
              )}
            </div>

            <div className="field-grid compact-grid">
              <label className="field">
                <span>Correct Option</span>

                <select
                  value={question.correct}
                  onChange={(event) =>
                    setQuestion({
                      ...question,
                      correct: Number(
                        event.target.value
                      ),
                    })
                  }
                >
                  <option value={0}>
                    Option A
                  </option>

                  <option value={1}>
                    Option B
                  </option>

                  <option value={2}>
                    Option C
                  </option>

                  <option value={3}>
                    Option D
                  </option>
                </select>
              </label>

              <label className="field">
                <span>Marks</span>

                <input
                  type="number"
                  min="1"
                  value={question.marks}
                  onChange={(event) =>
                    setQuestion({
                      ...question,
                      marks: Number(
                        event.target.value
                      ),
                    })
                  }
                />
              </label>
            </div>

            <button
              className="outline-button"
              onClick={addQuestion}
            >
              + Add Question
            </button>
          </section>

          <section className="panel">
            <div className="panel-heading">
              <div>
                <h2>Questions</h2>

                <p>
                  Review the questions before
                  creating the exam.
                </p>
              </div>

              <span className="panel-count">
                {questions.length} Questions
              </span>
            </div>

            {!questions.length ? (
              <div className="empty-box">
                <div className="empty-icon">
                  ?
                </div>

                <strong>
                  No questions added yet
                </strong>

                <span>
                  Add your first question above.
                </span>
              </div>
            ) : (
              <div className="question-list">
                {questions.map(
                  (item, index) => (
                    <div
                      className="question-card"
                      key={item.id}
                    >
                      <div className="question-top">
                        <div>
                          <span className="question-number">
                            Q{index + 1}
                          </span>

                          {item.text && (
                            <strong>
                              {item.text}
                            </strong>
                          )}
                        </div>

                        <button
                          className="delete-button"
                          onClick={() =>
                            deleteQuestion(
                              item.id
                            )
                          }
                        >
                          Delete
                        </button>
                      </div>

                      {item.image_url && (
                        <img
                          className="question-list-image"
                          src={`${API_URL}${item.image_url}`}
                          alt="Question"
                        />
                      )}

                      <div className="review-options">
                        {item.options.map(
                          (
                            option,
                            optionIndex
                          ) => (
                            <div
                              key={optionIndex}
                              className={
                                optionIndex ===
                                item.correct
                                  ? "review-option correct"
                                  : "review-option"
                              }
                            >
                              <span>
                                {String.fromCharCode(
                                  65 +
                                    optionIndex
                                )}
                              </span>

                              {option}

                              {optionIndex ===
                                item.correct && (
                                <b>
                                  Correct
                                </b>
                              )}
                            </div>
                          )
                        )}
                      </div>

                      <div className="question-footer">
                        Marks: {item.marks}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </section>
        </div>

        <aside className="builder-side">
          <section className="publish-panel">
            <span className="eyebrow light">
              PUBLISH
            </span>

            <h2>Ready to publish?</h2>

            <p>
              Create the exam first, then make it
              available to students.
            </p>

            <div className="publish-status">
              <span
                className={
                  examId
                    ? "status-dot ready"
                    : "status-dot"
                }
              />

              {examId
                ? `Exam #${examId} created`
                : "Exam not created"}
            </div>

            <button
              className="side-primary"
              onClick={createExam}
              disabled={!!examId}
            >
              {examId
                ? "Exam Created"
                : "Create Exam"}
            </button>

            <button
              className="side-publish"
              onClick={publishExam}
              disabled={!examId}
            >
              Publish Exam
            </button>
          </section>

          <section className="quick-panel">
            <h3>Exam Summary</h3>

            <div className="summary-row">
              <span>Questions</span>

              <strong>
                {questions.length}
              </strong>
            </div>

            <div className="summary-row">
              <span>Duration</span>

              <strong>
                {exam.duration} min
              </strong>
            </div>

            <div className="summary-row">
              <span>Status</span>

              <strong>
                {examId ? "Created" : "Draft"}
              </strong>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );

  const renderAttempts = () => {
    const total = attempts.length;

    const completed = attempts.filter(
      (attempt) =>
        attempt.status === "submitted" ||
        attempt.status === "expired"
    ).length;

    const inProgress = attempts.filter(
      (attempt) =>
        attempt.status === "in_progress"
    ).length;

    const violations = attempts.reduce(
      (sum, attempt) =>
        sum +
        Number(
          attempt.violation_count || 0
        ),
      0
    );

    const completedAttempts =
      attempts.filter(
        (attempt) =>
          attempt.status === "submitted" ||
          attempt.status === "expired"
      );

    const averageScore =
      completedAttempts.length > 0
        ? (
            completedAttempts.reduce(
              (sum, attempt) =>
                sum +
                Number(
                  attempt.percentage || 0
                ),
              0
            ) / completedAttempts.length
          ).toFixed(1)
        : "0.0";

    return (
      <div className="page-content">
        <div className="page-title-row">
          <div>
            <span className="eyebrow">
              MONITORING
            </span>

            <h1>Attempts</h1>

            <p>
              Track student examination attempts
              and performance.
            </p>
          </div>

          <button
            className="secondary-button"
            onClick={fetchAttempts}
            disabled={attemptsLoading}
          >
            {attemptsLoading
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>

        {attemptsError && (
          <div className="error-notice">
            {attemptsError}
          </div>
        )}

        <div className="stats-grid attempts-stats">
          <div className="stat-card">
            <span>Total Attempts</span>

            <strong>{total}</strong>
          </div>

          <div className="stat-card">
            <span>Completed</span>

            <strong>{completed}</strong>
          </div>

          <div className="stat-card medium">
            <span>In Progress</span>

            <strong>{inProgress}</strong>
          </div>

          <div className="stat-card high">
            <span>Violations</span>

            <strong>{violations}</strong>
          </div>

          <div className="stat-card">
            <span>Average Score</span>

            <strong>
              {averageScore}%
            </strong>
          </div>
        </div>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Student Attempts</h2>

              <p>
                Latest examination attempts from
                your organization.
              </p>
            </div>

            <span className="panel-count">
              {attempts.length} Attempts
            </span>
          </div>

          {!attempts.length ? (
            <div className="empty-box">
              <div className="empty-icon">
                ◷
              </div>

              <strong>
                No attempts yet
              </strong>

              <span>
                Student attempts will appear here
                when an examination is started.
              </span>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="attempts-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Exam</th>
                    <th>Status</th>
                    <th>Score</th>
                    <th>Progress</th>
                    <th>Violations</th>
                    <th>Started</th>
                    <th>Submitted</th>
                  </tr>
                </thead>

                <tbody>
                  {attempts.map(
                    (attempt) => (
                      <tr key={attempt.id}>
                        <td>
                          <strong>
                            {attempt.student_name ||
                              "Unknown Student"}
                          </strong>

                          <small>
                            {attempt.student_email ||
                              "-"}
                          </small>
                        </td>

                        <td>
                          <strong>
                            {attempt.exam_title ||
                              "Unknown Exam"}
                          </strong>

                          <small>
                            Attempt #{attempt.id}
                          </small>
                        </td>

                        <td>
                          <span
                            className={`attempt-status ${attempt.status}`}
                          >
                            {formatStatus(
                              attempt.status
                            )}
                          </span>
                        </td>

                        <td>
                          {attempt.status ===
                          "in_progress" ? (
                            "-"
                          ) : (
                            <>
                              <strong>
                                {attempt.score} /{" "}
                                {attempt.total_marks}
                              </strong>

                              <small>
                                {
                                  attempt.percentage
                                }
                                %
                              </small>
                            </>
                          )}
                        </td>

                        <td>
                          {attempt.answered_count}{" "}
                          /{" "}
                          {
                            attempt.question_count
                          }
                        </td>

                        <td>
                          <span
                            className={
                              Number(
                                attempt.violation_count
                              ) > 0
                                ? "violation-count danger"
                                : "violation-count"
                            }
                          >
                            {
                              attempt.violation_count
                            }
                          </span>
                        </td>

                        <td>
                          {formatTime(
                            attempt.started_at
                          )}
                        </td>

                        <td>
                          {formatTime(
                            attempt.submitted_at
                          )}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    );
  };

  const renderStudents = () => {
    const search =
      studentSearch.trim().toLowerCase();

    const filteredStudents =
      students.filter(
        (student) =>
          !search ||
          String(student.name || "")
            .toLowerCase()
            .includes(search) ||
          String(student.email || "")
            .toLowerCase()
            .includes(search)
      );

    const activeStudents =
      students.filter(
        (student) =>
          String(
            student.status || "active"
          ).toLowerCase() === "active"
      ).length;

    return (
      <div className="page-content">
        <div className="page-title-row">
          <div>
            <span className="eyebrow">
              USER MANAGEMENT
            </span>

            <h1>Students</h1>

            <p>
              View and manage students registered
              in your organization.
            </p>
          </div>

          <button
            className="secondary-button"
            onClick={fetchStudents}
            disabled={studentsLoading}
          >
            {studentsLoading
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>

        {studentsError && (
          <div className="error-notice">
            {studentsError}
          </div>
        )}

        <div className="stats-grid student-stats">
          <div className="stat-card">
            <span>Total Students</span>
            <strong>
              {students.length}
            </strong>
          </div>

          <div className="stat-card">
            <span>Active Students</span>
            <strong>
              {activeStudents}
            </strong>
          </div>

          <div className="stat-card">
            <span>Search Results</span>
            <strong>
              {filteredStudents.length}
            </strong>
          </div>
        </div>

        <section className="panel">
          <div className="panel-heading students-heading">
            <div>
              <h2>
                Registered Students
              </h2>

              <p>
                Students created through the
                examination registration system.
              </p>
            </div>

            <span className="panel-count">
              {students.length} Students
            </span>
          </div>

          <div className="student-toolbar">
            <div className="student-search">
              <span>⌕</span>

              <input
                type="text"
                value={studentSearch}
                onChange={(event) =>
                  setStudentSearch(
                    event.target.value
                  )
                }
                placeholder="Search by name or email..."
              />
            </div>
          </div>

          {!students.length ? (
            <div className="empty-box">
              <div className="empty-icon">
                ◎
              </div>

              <strong>
                No students registered yet
              </strong>

              <span>
                New student registrations will
                appear here.
              </span>
            </div>
          ) : !filteredStudents.length ? (
            <div className="empty-box">
              <div className="empty-icon">
                ⌕
              </div>

              <strong>
                No matching students
              </strong>

              <span>
                Try a different name or email.
              </span>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="students-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Organization</th>
                    <th>Registered</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredStudents.map(
                    (student) => (
                      <tr key={student.id}>
                        <td>
                          <div className="student-cell">
                            <div className="student-avatar">
                              {String(
                                student.name || "S"
                              )
                                .trim()
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div>
                              <strong>
                                {student.name ||
                                  "Unknown Student"}
                              </strong>

                              <small>
                                Student #
                                {student.id}
                              </small>
                            </div>
                          </div>
                        </td>

                        <td>
                          {student.email || "-"}
                        </td>

                        <td>
                          <span className="role-badge">
                            {student.role ||
                              "student"}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`student-status ${String(
                              student.status ||
                                "active"
                            ).toLowerCase()}`}
                          >
                            {String(
                              student.status ||
                                "active"
                            ).toUpperCase()}
                          </span>
                        </td>

                        <td>
                          {student.organization_name ||
                            "-"}
                        </td>

                        <td>
                          {formatTime(
                            student.created_at
                          )}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    );
  };

  const renderEvents = () => {
    const high = events.filter(
      (event) =>
        getSeverity(event) === "high"
    ).length;

    const medium = events.filter(
      (event) =>
        getSeverity(event) === "medium"
    ).length;

    return (
      <div className="page-content">
        <div className="page-title-row">
          <div>
            <span className="eyebrow">
              MONITORING
            </span>

            <h1>Proctoring Events</h1>

            <p>
              Review events reported during
              student examinations.
            </p>
          </div>

          <button
            className="secondary-button"
            onClick={fetchEvents}
            disabled={eventsLoading}
          >
            {eventsLoading
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>

        {eventsError && (
          <div className="error-notice">
            {eventsError}
          </div>
        )}

        <div className="stats-grid">
          <div className="stat-card">
            <span>Total Events</span>

            <strong>
              {events.length}
            </strong>
          </div>

          <div className="stat-card high">
            <span>High Severity</span>

            <strong>{high}</strong>
          </div>

          <div className="stat-card medium">
            <span>Medium Severity</span>

            <strong>{medium}</strong>
          </div>
        </div>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Recent Events</h2>

              <p>
                Latest events from student
                attempts.
              </p>
            </div>
          </div>

          {!events.length ? (
            <div className="empty-box">
              <div className="empty-icon">
                ✓
              </div>

              <strong>
                No proctoring events
              </strong>

              <span>
                No events have been recorded yet.
              </span>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Event</th>
                    <th>Severity</th>
                    <th>Details</th>
                    <th>Attempt</th>
                    <th>Time</th>
                  </tr>
                </thead>

                <tbody>
                  {events.map((event) => {
                    const data =
                      getEventData(
                        event.event_data
                      );

                    const severity =
                      getSeverity(event);

                    return (
                      <tr key={event.id}>
                        <td>
                          <strong>
                            {event.student_name ||
                              "Unknown"}
                          </strong>

                          <small>
                            {event.student_email ||
                              "-"}
                          </small>
                        </td>

                        <td>
                          {formatEvent(
                            event.event_type
                          )}
                        </td>

                        <td>
                          <span
                            className={`severity ${severity}`}
                          >
                            {severity.toUpperCase()}
                          </span>
                        </td>

                        <td>
                          {data.message ||
                            event.event_data ||
                            "-"}
                        </td>

                        <td>
                          #{event.attempt_id}
                        </td>

                        <td>
                          {formatTime(
                            event.timestamp
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    );
  };

  if (!token) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="brand-mark">
            P
          </div>

          <span className="eyebrow">
            ADMIN CONSOLE
          </span>

          <h1>Welcome back</h1>

          <p>
            Sign in to manage exams and monitor
            proctoring.
          </p>

          <label className="field">
            <span>Email</span>

            <input
              type="email"
              value={login.email}
              onChange={(event) =>
                setLogin({
                  ...login,
                  email:
                    event.target.value,
                })
              }
              placeholder="admin@proctoring.com"
            />
          </label>

          <label className="field">
            <span>Password</span>

            <input
              type="password"
              value={login.password}
              onChange={(event) =>
                setLogin({
                  ...login,
                  password:
                    event.target.value,
                })
              }
              placeholder="Password"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  loginAdmin();
                }
              }}
            />
          </label>

          <button
            className="login-button"
            onClick={loginAdmin}
          >
            Sign In
          </button>

          {message && (
            <div className="login-message">
              {message}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-app">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark small">
            P
          </div>

          <div>
            <strong>
              Proctor Admin
            </strong>

            <span>
              Management Console
            </span>
          </div>
        </div>

        <div className="nav-label">
          WORKSPACE
        </div>

        <button
          className={
            activeSection === "builder"
              ? "nav-item active"
              : "nav-item"
          }
          onClick={() =>
            setActiveSection("builder")
          }
        >
          <span>▣</span>
          Exam Builder
        </button>

        <button
          className={
            activeSection === "exams"
              ? "nav-item active"
              : "nav-item"
          }
          onClick={() =>
            setActiveSection("exams")
          }
        >
          <span>▤</span>
          Exams
        </button>

        <button
          className={
            activeSection === "students"
              ? "nav-item active"
              : "nav-item"
          }
          onClick={() =>
            setActiveSection("students")
          }
        >
          <span>◎</span>
          Students
        </button>

        <button
          className={
            activeSection === "attempts"
              ? "nav-item active"
              : "nav-item"
          }
          onClick={() =>
            setActiveSection("attempts")
          }
        >
          <span>◷</span>
          Attempts
        </button>

        <button
          className={
            activeSection === "events"
              ? "nav-item active"
              : "nav-item"
          }
          onClick={() =>
            setActiveSection("events")
          }
        >
          <span>◉</span>
          Proctoring Events
        </button>

        <div className="sidebar-bottom">
          <div className="admin-user">
            <div className="avatar">
              A
            </div>

            <div>
              <strong>
                Administrator
              </strong>

              <span>Admin</span>
            </div>
          </div>

          <button
            className="logout-button"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="main-area">
        {activeSection === "builder" &&
          renderBuilder()}

        {activeSection === "students" &&
          renderStudents()}

        {activeSection === "attempts" &&
          renderAttempts()}

        {activeSection === "events" &&
          renderEvents()}

        {activeSection === "exams" && (
          <div className="page-content">
            <div className="page-title-row">
              <div>
                <span className="eyebrow">
                  MANAGEMENT
                </span>

                <h1>Exams</h1>

                <p>
                  Manage examinations created
                  in the system.
                </p>
              </div>

              <button
                className="primary-button"
                onClick={() =>
                  setActiveSection(
                    "builder"
                  )
                }
              >
                + Create Exam
              </button>
            </div>

            <section className="panel">
              <div className="empty-box">
                <div className="empty-icon">
                  ▤
                </div>

                <strong>
                  Exam management
                </strong>

                <span>
                  Use Exam Builder to create
                  and publish a new examination.
                </span>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

export default Admin;
