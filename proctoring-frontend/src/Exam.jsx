import { useEffect, useRef, useState } from "react";
import useProctoring from "./useProctoring";
import "./Exam.css";

const API_URL = "http://127.0.0.1:8000";

function Exam() {
  const [email, setEmail] = useState(
    "student@proctoring.com"
  );

  const [password, setPassword] = useState(
    "student123"
  );

  const [token, setToken] = useState(
    localStorage.getItem("studentToken")
  );

  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [attempt, setAttempt] = useState(null);

  const [attemptId, setAttemptId] = useState(
    localStorage.getItem("currentAttemptId")
  );

  const [answers, setAnswers] = useState({});
  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  const [remainingSeconds, setRemainingSeconds] =
    useState(null);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const [precheckOpen, setPrecheckOpen] = useState(false);
  const [precheckExam, setPrecheckExam] = useState(null);
  const [precheckRunning, setPrecheckRunning] = useState(false);
  const [precheckReady, setPrecheckReady] = useState(false);
  const [precheck, setPrecheck] = useState({
    camera: { status: "pending", detail: "Not checked" },
    microphone: { status: "pending", detail: "Not checked" },
    internet: { status: "pending", detail: "Not checked" },
  });

  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");

  const [isFullscreen, setIsFullscreen] =
    useState(window.proctorx?.isDesktop === true);

  const [securityWarning, setSecurityWarning] =
    useState("");

  const videoRef = useRef(null);
  const securityTimeoutRef = useRef(null);
  const submittingRef = useRef(false);

  const {
    cameraActive,
    micActive,
    faceDetected,
    faceCount,
    proctorStatus,
    startCamera,
    startDetection,
    stopProctoring,
    recordEvent,
  } = useProctoring({
    videoRef,
    attemptId,
    token,
    apiUrl: API_URL,
  });

  const login = async () => {
    try {
      setMessage("");

      const response = await fetch(
        `${API_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.detail || "Login failed"
        );
        return;
      }

      if (
        data.role &&
        data.role !== "student"
      ) {
        setMessage(
          "Please use a student account."
        );
        return;
      }

      localStorage.setItem(
        "studentToken",
        data.access_token
      );

      setToken(data.access_token);
      setMessage("");
    } catch {
      setMessage(
        "Backend is not running."
      );
    }
  };

  const logout = () => {
    stopProctoring();

    localStorage.removeItem(
      "studentToken"
    );

    localStorage.removeItem(
      "currentAttemptId"
    );

    localStorage.removeItem(
      "currentExamId"
    );

    setToken(null);
    setAttemptId(null);
    setAttempt(null);
    setSelectedExam(null);
    setResult(null);
    setShowFeedback(false);
    setFeedbackRating(0);
    setFeedbackText("");
    setAnswers({});
    setMessage("");
  };

  const fetchExams = async () => {
    if (!token) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/exams/`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem(
            "studentToken"
          );

          setToken(null);
          return;
        }

        setMessage(
          data.detail ||
            "Failed to fetch exams"
        );

        return;
      }

      setExams(
        Array.isArray(data)
          ? data
          : []
      );
    } catch {
      setMessage(
        "Failed to connect to backend."
      );
    }
  };

  const loadExam = async (examId) => {
    try {
      const response = await fetch(
        `${API_URL}/exams/${examId}`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(
          data.detail ||
            "Failed to load exam"
        );

        return false;
      }

      setSelectedExam(data);

      return true;
    } catch {
      setMessage(
        "Failed to load exam."
      );

      return false;
    }
  };

  const enterFullscreen = async () => {
    if (window.proctorx?.isDesktop) {
      setIsFullscreen(true);
      return;
    }

    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }

      setIsFullscreen(true);
    } catch {
      setSecurityWarning(
        "Fullscreen permission is required for this examination."
      );
    }
  };

  const exitFullscreen = async () => {
    if (window.proctorx?.isDesktop) {
      setIsFullscreen(false);
      return;
    }

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }

      setIsFullscreen(false);
    } catch {
      return;
    }
  };

  const showSecurityWarning = (text, duration = 4000) => {
    setSecurityWarning(text);

    if (securityTimeoutRef.current) {
      clearTimeout(
        securityTimeoutRef.current
      );
    }

    securityTimeoutRef.current =
      setTimeout(() => {
        setSecurityWarning("");
      }, duration);
  };

  const runPrecheck = async () => {
    setPrecheckRunning(true);
    setPrecheckReady(false);
    setPrecheck({
      camera: { status: "checking", detail: "Requesting camera access..." },
      microphone: { status: "checking", detail: "Requesting microphone access..." },
      internet: { status: "checking", detail: "Measuring connection..." },
    });

    let cameraResult = {
      status: "fail",
      detail: "Camera access is required.",
    };

    let microphoneResult = {
      status: "fail",
      detail: "Microphone access is required.",
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];

      cameraResult = videoTrack
        ? {
            status: "pass",
            detail: "Camera detected and permission granted.",
          }
        : {
            status: "fail",
            detail: "No camera was detected.",
          };

      microphoneResult = audioTrack
        ? {
            status: "pass",
            detail: "Microphone detected and permission granted.",
          }
        : {
            status: "fail",
            detail: "No microphone was detected.",
          };

      stream.getTracks().forEach((track) => track.stop());
    } catch (error) {
      const message =
        error?.name === "NotAllowedError"
          ? "Camera/microphone permission was denied."
          : error?.name === "NotFoundError"
          ? "Camera or microphone was not found."
          : "Camera and microphone could not be accessed.";

      cameraResult = {
        status: "fail",
        detail: message,
      };

      microphoneResult = {
        status: "fail",
        detail: message,
      };
    }

    setPrecheck((previous) => ({
      ...previous,
      camera: cameraResult,
      microphone: microphoneResult,
    }));

    let internetResult = {
      status: "fail",
      detail: "Unable to measure internet speed.",
    };

    try {
      if (!navigator.onLine) {
        throw new Error("offline");
      }

      const startedAt = performance.now();
      const response = await fetch(
        "https://speed.cloudflare.com/__down?bytes=1000000",
        {
          cache: "no-store",
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error("speed test failed");
      }

      const buffer = await response.arrayBuffer();
      const elapsedSeconds = Math.max(
        (performance.now() - startedAt) / 1000,
        0.05
      );
      const megabits = (buffer.byteLength * 8) / 1000000;
      const speedMbps = megabits / elapsedSeconds;
      const browserEstimate = Number(
        navigator.connection?.downlink
      );
      const effectiveSpeed = Number.isFinite(browserEstimate) && browserEstimate > 0
        ? Math.max(speedMbps, browserEstimate)
        : speedMbps;

      if (effectiveSpeed < 2) {
        internetResult = {
          status: "fail",
          detail: `${effectiveSpeed.toFixed(1)} Mbps detected. Minimum required: 2 Mbps.`,
        };
      } else {
        internetResult = {
          status: "pass",
          detail: `${effectiveSpeed.toFixed(1)} Mbps download speed detected.`,
        };
      }
    } catch {
      internetResult = {
        status: "fail",
        detail: "Internet speed test failed. Check your connection and try again.",
      };
    }

    const allPassed =
      cameraResult.status === "pass" &&
      microphoneResult.status === "pass" &&
      internetResult.status === "pass";

    setPrecheck((previous) => ({
      ...previous,
      internet: internetResult,
    }));
    setPrecheckReady(allPassed);
    setPrecheckRunning(false);
  };

  const openPrecheck = (exam) => {
    setMessage("");
    setPrecheckExam(exam);
    setPrecheckOpen(true);
    setPrecheckReady(false);
    setPrecheck({
      camera: { status: "pending", detail: "Not checked" },
      microphone: { status: "pending", detail: "Not checked" },
      internet: { status: "pending", detail: "Not checked" },
    });
    runPrecheck();
  };

  const closePrecheck = () => {
    if (precheckRunning || loading) {
      return;
    }

    setPrecheckOpen(false);
    setPrecheckExam(null);
  };

  const startCheckedExam = async () => {
    if (!precheckReady || !precheckExam) {
      return;
    }

    setPrecheckOpen(false);
    const examId = precheckExam.id;
    setPrecheckExam(null);
    await startExam(examId);
  };

  const startExam = async (examId) => {
    if (loading) {
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `${API_URL}/attempts/`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization:
              `Bearer ${token}`,
          },
          body: JSON.stringify({
            exam_id: examId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem(
            "studentToken"
          );

          setToken(null);
          setLoading(false);
          return;
        }

        setMessage(
          data.detail ||
            "Failed to start exam"
        );

        setLoading(false);
        return;
      }

      localStorage.setItem(
        "currentAttemptId",
        data.id
      );

      localStorage.setItem(
        "currentExamId",
        examId
      );

      setAttemptId(data.id);
      setAttempt(data);

      setAnswers({});
      setCurrentQuestion(0);

      const loaded =
        await loadExam(examId);

      if (loaded) {
        await startCamera();
        await startDetection();
        await enterFullscreen();

        try {
          await recordEvent(
            "exam_started",
            "Candidate started examination"
          );
        } catch (error) {
          console.error(
            "Failed to record exam start:",
            error
          );
        }
      }

      setLoading(false);
    } catch {
      setMessage(
        "Failed to connect to backend."
      );

      setLoading(false);
    }
  };

  const resumeAttempt = async () => {
    const savedAttemptId =
      localStorage.getItem(
        "currentAttemptId"
      );

    const savedExamId =
      localStorage.getItem(
        "currentExamId"
      );

    if (
      !savedAttemptId ||
      !savedExamId ||
      !token
    ) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/attempts/${savedAttemptId}`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        localStorage.removeItem(
          "currentAttemptId"
        );

        localStorage.removeItem(
          "currentExamId"
        );

        return;
      }

      const data = await response.json();

      if (
        data.status !==
        "in_progress"
      ) {
        localStorage.removeItem(
          "currentAttemptId"
        );

        localStorage.removeItem(
          "currentExamId"
        );

        return;
      }

      setAttemptId(
        savedAttemptId
      );

      setAttempt(data);

      const loaded =
        await loadExam(
          Number(savedExamId)
        );

      if (loaded) {
        await startCamera();
        await startDetection();
        await enterFullscreen();
      }
    } catch {
      setMessage(
        "Failed to resume exam."
      );
    }
  };

  const saveAnswer = async (
    questionId,
    selectedOption
  ) => {
    if (!attemptId) {
      return;
    }

    setAnswers((previous) => ({
      ...previous,
      [questionId]:
        selectedOption,
    }));

    try {
      const response = await fetch(
        `${API_URL}/attempts/${attemptId}/answers`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
            Authorization:
              `Bearer ${token}`,
          },
          body: JSON.stringify({
            question_id:
              questionId,
            selected_option:
              selectedOption,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setMessage(
          data.detail ||
            "Failed to save answer"
        );

        return;
      }

      setMessage(
        "Answer saved"
      );

      setTimeout(() => {
        setMessage("");
      }, 1000);
    } catch {
      setMessage(
        "Failed to save answer"
      );
    }
  };

  const submitExam = async (
    automatic = false
  ) => {
    if (
      !attemptId ||
      loading ||
      submittingRef.current
    ) {
      return;
    }

    if (!automatic) {
      const unanswered =
        selectedExam.questions.filter(
          (question) =>
            answers[
              question.id
            ] === undefined
        ).length;

      const confirmed =
        window.confirm(
          unanswered > 0
            ? `You have ${unanswered} unanswered question${
                unanswered > 1
                  ? "s"
                  : ""
              }. Submit the exam?`
            : "Are you sure you want to submit the exam?"
        );

      if (!confirmed) {
        return;
      }
    }

    submittingRef.current = true;

    setLoading(true);
    setMessage("");

    try {
      try {
        await recordEvent(
          "exam_submitted",
          automatic
            ? "Timer expired"
            : "Candidate submitted examination"
        );
      } catch (error) {
        console.error(
          "Failed to record submit event:",
          error
        );
      }

      const response =
        await fetch(
          `${API_URL}/attempts/${attemptId}/submit`,
          {
            method: "POST",
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      let data;

      try {
        data =
          await response.json();
      } catch {
        data = {};
      }

      console.log(
        "SUBMIT RESPONSE:",
        response.status,
        data
      );

      if (!response.ok) {
        setMessage(
          data.detail ||
            `Failed to submit exam (${response.status})`
        );

        submittingRef.current =
          false;

        setLoading(false);

        return;
      }

      stopProctoring();

      setResult(data);

      setFeedbackRating(0);
      setFeedbackText("");
      setShowFeedback(false);

      setSelectedExam(null);
      setAttempt(null);
      setAttemptId(null);
      setRemainingSeconds(null);

      localStorage.removeItem(
        "currentAttemptId"
      );

      localStorage.removeItem(
        "currentExamId"
      );

      submittingRef.current =
        false;

      setLoading(false);
    } catch (error) {
      console.error(
        "SUBMIT EXAM ERROR:",
        error
      );

      setMessage(
        error.message ||
          "Failed to submit exam"
      );

      submittingRef.current =
        false;

      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      return;
    }

    fetchExams();
    resumeAttempt();

    return () => {
      stopProctoring();

      if (
        securityTimeoutRef.current
      ) {
        clearTimeout(
          securityTimeoutRef.current
        );
      }
    };
  }, [token]);

  useEffect(() => {
    if (!selectedExam) {
      return;
    }

    const disableContextMenu =
      (event) => {
        event.preventDefault();

        showSecurityWarning(
          "Right click is disabled during the examination."
        );

        try {
          recordEvent(
            "right_click_attempt",
            "Candidate attempted right click"
          );
        } catch {}
      };

    const disableCopy =
      (event) => {
        event.preventDefault();

        showSecurityWarning(
          "Copying is disabled."
        );

        try {
          recordEvent(
            "copy_attempt",
            "Candidate attempted copy"
          );
        } catch {}
      };

    const disableCut =
      (event) => {
        event.preventDefault();

        showSecurityWarning(
          "Cutting is disabled."
        );

        try {
          recordEvent(
            "cut_attempt",
            "Candidate attempted cut"
          );
        } catch {}
      };

    const disablePaste =
      (event) => {
        event.preventDefault();

        showSecurityWarning(
          "Pasting is disabled."
        );

        try {
          recordEvent(
            "paste_attempt",
            "Candidate attempted paste"
          );
        } catch {}
      };

    const disableSelection =
      (event) => {
        event.preventDefault();
      };

    const disableKeyboard =
      (event) => {
        const key =
          event.key.toLowerCase();

        const blocked =
          event.key === "F12" ||
          (event.ctrlKey &&
            [
              "c",
              "v",
              "x",
              "u",
              "s",
              "p",
            ].includes(key)) ||
          (event.ctrlKey &&
            event.shiftKey &&
            [
              "i",
              "j",
              "c",
            ].includes(key));

        if (blocked) {
          event.preventDefault();

          showSecurityWarning(
            "This keyboard operation is disabled during the examination."
          );

          try {
            recordEvent(
              "keyboard_violation",
              event.key
            );
          } catch {}
        }
      };

    const disableDrag =
      (event) => {
        event.preventDefault();
      };

    document.addEventListener(
      "contextmenu",
      disableContextMenu
    );

    document.addEventListener(
      "copy",
      disableCopy
    );

    document.addEventListener(
      "cut",
      disableCut
    );

    document.addEventListener(
      "paste",
      disablePaste
    );

    document.addEventListener(
      "selectstart",
      disableSelection
    );

    document.addEventListener(
      "keydown",
      disableKeyboard
    );

    document.addEventListener(
      "dragstart",
      disableDrag
    );

    return () => {
      document.removeEventListener(
        "contextmenu",
        disableContextMenu
      );

      document.removeEventListener(
        "copy",
        disableCopy
      );

      document.removeEventListener(
        "cut",
        disableCut
      );

      document.removeEventListener(
        "paste",
        disablePaste
      );

      document.removeEventListener(
        "selectstart",
        disableSelection
      );

      document.removeEventListener(
        "keydown",
        disableKeyboard
      );

      document.removeEventListener(
        "dragstart",
        disableDrag
      );
    };
  }, [
    selectedExam,
    attemptId,
    token,
  ]);

  useEffect(() => {
    if (!selectedExam) {
      return;
    }

    const handleFullscreen =
      () => {
        const active =
          Boolean(
            document.fullscreenElement
          );

        setIsFullscreen(active);

        if (!active) {
          showSecurityWarning(
            "Fullscreen exited. Please return to fullscreen mode."
          );

          try {
            recordEvent(
              "fullscreen_exit",
              "Candidate exited fullscreen"
            );
          } catch {}
        } else {
          try {
            recordEvent(
              "fullscreen_enter",
              "Candidate entered fullscreen"
            );
          } catch {}
        }
      };

    document.addEventListener(
      "fullscreenchange",
      handleFullscreen
    );

    return () => {
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreen
      );
    };
  }, [
    selectedExam,
    attemptId,
  ]);

  useEffect(() => {
    if (!selectedExam || !window.proctorx?.isDesktop) {
      return;
    }

    if (typeof window.proctorx.onWindowEvent !== "function") {
      return;
    }

    const removeListener =
      window.proctorx.onWindowEvent((event) => {
        if (event.type === "minimized") {
          showSecurityWarning(
            "SECURITY VIOLATION: Examination window was minimized. This event has been recorded. Return to the examination immediately.",
            10000
          );

          try {
            recordEvent(
              "window_minimized",
              "Candidate minimized the examination window"
            );
          } catch {}

          return;
        }

        if (event.type === "restored") {
          showSecurityWarning(
            "SECURITY WARNING: The examination window was minimized and has now been restored. This event has been recorded.",
            10000
          );

          try {
            recordEvent(
              "window_restored",
              "Candidate restored the examination window"
            );
          } catch {}

          return;
        }

        if (event.type === "blur") {
          showSecurityWarning(
            "Warning: Examination window lost focus. This activity has been recorded."
          );

          try {
            recordEvent(
              "window_blur",
              "Exam window lost focus"
            );
          } catch {}
        }
      });

    return () => {
      removeListener?.();
    };
  }, [selectedExam, attemptId]);

  useEffect(() => {
    if (!selectedExam) {
      return;
    }

    const handleVisibility =
      () => {
        if (document.hidden) {
          showSecurityWarning(
            "Exam window changed. This activity has been recorded."
          );

          try {
            recordEvent(
              "tab_switch",
              "Candidate changed browser tab or window"
            );
          } catch {}
        }
      };

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
    };
  }, [
    selectedExam,
    attemptId,
  ]);

  useEffect(() => {
    if (!selectedExam) {
      return;
    }

    const handleBlur = () => {
      showSecurityWarning(
        "Exam window lost focus. This activity has been recorded."
      );

      try {
        recordEvent(
          "window_blur",
          "Exam window lost focus"
        );
      } catch {}
    };

    window.addEventListener(
      "blur",
      handleBlur
    );

    return () => {
      window.removeEventListener(
        "blur",
        handleBlur
      );
    };
  }, [
    selectedExam,
    attemptId,
  ]);

  useEffect(() => {
    if (
      !attempt ||
      !selectedExam ||
      attempt.status !==
        "in_progress" ||
      !attempt.started_at
    ) {
      return;
    }

    const parseServerDate = (value) => {
      if (!value) {
        return NaN;
      }

      const text = String(value);

      if (/[zZ]|[+-]\d{2}:?\d{2}$/.test(text)) {
        return new Date(text).getTime();
      }

      return new Date(`${text}Z`).getTime();
    };

    const updateTimer = () => {
      const startedAt =
        parseServerDate(
          attempt.started_at
        );

      const durationMinutes = Number(
        selectedExam.duration
      );

      if (
        !Number.isFinite(startedAt) ||
        !Number.isFinite(durationMinutes) ||
        durationMinutes <= 0
      ) {
        setRemainingSeconds(null);
        return;
      }

      const duration =
        Number(
          selectedExam.duration
        ) *
        60 *
        1000;

      const expiry =
        startedAt + duration;

      const difference =
        expiry - Date.now();

      const seconds =
        Math.max(
          0,
          Math.floor(
            difference / 1000
          )
        );

      setRemainingSeconds(
        seconds
      );

      if (
        seconds <= 0 &&
        !submittingRef.current
      ) {
        submitExam(true);
      }
    };

    updateTimer();

    const interval =
      setInterval(
        updateTimer,
        1000
      );

    return () => {
      clearInterval(
        interval
      );
    };
  }, [
    attempt,
    selectedExam,
  ]);

  const formatTime = (
    seconds
  ) => {
    if (
      seconds === null ||
      seconds === undefined
    ) {
      return "--:--";
    }

    const hours =
      Math.floor(
        seconds / 3600
      );

    const minutes =
      Math.floor(
        (seconds % 3600) / 60
      );

    const remaining =
      seconds % 60;

    if (hours > 0) {
      return `${String(
        hours
      ).padStart(
        2,
        "0"
      )}:${String(
        minutes
      ).padStart(
        2,
        "0"
      )}:${String(
        remaining
      ).padStart(
        2,
        "0"
      )}`;
    }

    return `${String(
      minutes
    ).padStart(
      2,
      "0"
    )}:${String(
      remaining
    ).padStart(
      2,
      "0"
    )}`;
  };

  const timerClass =
    remainingSeconds !== null &&
    remainingSeconds <= 60
      ? "timer-danger"
      : remainingSeconds !== null &&
        remainingSeconds <= 300
      ? "timer-warning"
      : "";

  if (!token) {
    return (
      <div className="login-page">
        <div className="login-card">
          <div className="brand-logo">
            P
          </div>

          <h1>
            Candidate Login
          </h1>

          <p>
            Sign in to your examination
            portal
          </p>

          <label>
            Email
          </label>

          <input
            type="email"
            value={email}
            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }
          />

          <label>
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
          />

          <button
            type="button"
            className="login-button"
            onClick={login}
          >
            Login
          </button>

          {message && (
            <div className="login-error">
              {message}
            </div>
          )}
        </div>
      </div>
    );
  }

  const returnToExamNames = () => {
    setResult(null);
    setSelectedExam(null);
    setAttempt(null);
    setAttemptId(null);
    setRemainingSeconds(null);
    setShowFeedback(false);
    setFeedbackRating(0);
    setFeedbackText("");
    setMessage("");
    setAnswers({});
    setCurrentQuestion(0);
    fetchExams();
  };

  if (result) {
    return (
      <div className="result-page">
        <div className={`result-card ${showFeedback ? "feedback-card" : ""}`}>
          {!showFeedback ? (
            <>
              <div className="result-check">✓</div>

              <div className="result-eyebrow">
                Examination Completed
              </div>

              <h1>Examination Submitted</h1>

              <p>
                Your examination has been submitted successfully.
              </p>

              <div className="result-score">
                <span>Score</span>
                <strong>{result.score}</strong>
              </div>

              <div className="result-row">
                <span>Attempt ID</span>
                <strong>#{result.id}</strong>
              </div>

              <div className="result-row">
                <span>Status</span>
                <strong>{result.status}</strong>
              </div>

              <div className="result-actions">
                <button
                  type="button"
                  className="login-button"
                  onClick={() => setShowFeedback(true)}
                >
                  Give Feedback
                </button>

                <button
                  type="button"
                  className="feedback-skip"
                  onClick={returnToExamNames}
                >
                  Return to Exam Names
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="feedback-icon">★</div>

              <div className="result-eyebrow">
                Your Experience
              </div>

              <h1>Share Your Feedback</h1>

              <p>
                Your feedback helps us improve the examination experience.
              </p>

              <div className="feedback-panel">
                <div className="feedback-label">
                  How was your examination experience?
                </div>

                <div className="feedback-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`feedback-star ${
                        feedbackRating >= star ? "active" : ""
                      }`}
                      onClick={() => setFeedbackRating(star)}
                      aria-label={`Rate ${star} out of 5`}
                    >
                      ★
                    </button>
                  ))}
                </div>

                <div className="feedback-rating-text">
                  {feedbackRating === 0 && "Select a rating"}
                  {feedbackRating === 1 && "Very poor"}
                  {feedbackRating === 2 && "Poor"}
                  {feedbackRating === 3 && "Average"}
                  {feedbackRating === 4 && "Good"}
                  {feedbackRating === 5 && "Excellent"}
                </div>
              </div>

              <div className="feedback-field">
                <label htmlFor="exam-feedback">
                  Additional comments <span>Optional</span>
                </label>

                <textarea
                  id="exam-feedback"
                  className="feedback-textarea"
                  rows={5}
                  placeholder="Tell us what went well or what could be improved..."
                  value={feedbackText}
                  onChange={(event) => setFeedbackText(event.target.value)}
                />
              </div>

              <div className="feedback-actions">
                <button
                  type="button"
                  className="feedback-secondary-button"
                  onClick={returnToExamNames}
                >
                  Skip & Return
                </button>

                <button
                  type="button"
                  className="feedback-primary-button"
                  disabled={feedbackRating === 0}
                  onClick={returnToExamNames}
                >
                  Submit Feedback
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  if (selectedExam) {
    const question =
      selectedExam.questions[
        currentQuestion
      ];

    const answeredCount =
      selectedExam.questions.filter(
        (item) =>
          answers[item.id] !==
          undefined
      ).length;

    return (
      <div className="proctor-page">
        {!isFullscreen && (
          <div className="fullscreen-overlay">
            <div className="fullscreen-card">
              <div className="fullscreen-icon">
                ⛶
              </div>

              <h2>
                Fullscreen Required
              </h2>

              <p>
                This examination must
                be completed in fullscreen
                mode.
              </p>

              <button
                type="button"
                onClick={
                  enterFullscreen
                }
              >
                Enter Fullscreen
              </button>
            </div>
          </div>
        )}

        {securityWarning && (
          <div className="security-warning">
            <span>!</span>
            {securityWarning}
          </div>
        )}

        <div className="exam-watermark">
          {Array.from(
            { length: 24 },
            (_, index) => (
              <div
                className="watermark-cell"
                key={index}
              >
                <strong>
                  PROCTORX
                </strong>

                <span>
                  {selectedExam.title}
                </span>

                <span>
                  Hrishabh Raj
                </span>
              </div>
            )
          )}
        </div>

        <header className="proctor-header">
          <div className="header-brand">
            <div className="brand-logo header-logo">
              P
            </div>

            <div>
              <strong>
                PROCTORX
              </strong>

              <span>
                Secure Examination
              </span>
            </div>
          </div>

          <div className="header-exam-title">
            {selectedExam.title}
          </div>

          <div className="header-candidate">
            <div className="candidate-mini-avatar">
              H
            </div>

            <div>
              <strong>
                Hrishabh Raj
              </strong>

              <span>
                Candidate
              </span>
            </div>

            <div
              className={`header-timer ${timerClass}`}
            >
              <small>
                TIME LEFT
              </small>

              <strong>
                {formatTime(
                  remainingSeconds
                )}
              </strong>
            </div>
          </div>
        </header>

        <div className="exam-body">
          <main className="question-panel">
            <div className="question-panel-header">
              <div>
                <span>
                  QUESTION
                </span>

                <strong>
                  {currentQuestion + 1}

                  <small>
                    {" "}
                    /{" "}
                    {
                      selectedExam
                        .questions
                        .length
                    }
                  </small>
                </strong>
              </div>

              <div className="question-marks">
                {question.marks} Mark
                {question.marks !==
                1
                  ? "s"
                  : ""}
              </div>
            </div>

            <div className="question-content">
              <div className="question-number-label">
                Q
                {currentQuestion + 1}
              </div>

              <h1>
                {question.text}
              </h1>

              {question.image_url && (
                <div className="exam-question-image">
                  <img
                    src={`${API_URL}${question.image_url}`}
                    alt="Question"
                  />
                </div>
              )}

              <div className="options">
                {question.options.map(
                  (
                    option,
                    optionIndex
                  ) => {
                    const selected =
                      answers[
                        question.id
                      ] ===
                      optionIndex;

                    return (
                      <button
                        type="button"
                        key={
                          optionIndex
                        }
                        className={`answer-option ${
                          selected
                            ? "selected"
                            : ""
                        }`}
                        onClick={() =>
                          saveAnswer(
                            question.id,
                            optionIndex
                          )
                        }
                      >
                        <span className="option-letter">
                          {String.fromCharCode(
                            65 +
                              optionIndex
                          )}
                        </span>

                        <span>
                          {option}
                        </span>

                        {selected && (
                          <span className="selected-check">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {message && (
              <div className="answer-status">
                <span>
                  ✓
                </span>

                {message}
              </div>
            )}

            <div className="question-footer">
              <button
                type="button"
                className="secondary-exam-button"
                disabled={
                  currentQuestion ===
                  0
                }
                onClick={() =>
                  setCurrentQuestion(
                    (value) =>
                      value - 1
                  )
                }
              >
                ← Previous
              </button>

              <div className="footer-center">
                Question{" "}
                {currentQuestion + 1}{" "}
                of{" "}
                {
                  selectedExam
                    .questions
                    .length
                }
              </div>

              {currentQuestion <
              selectedExam.questions
                .length -
                1 ? (
                <button
                  type="button"
                  className="next-button"
                  onClick={() =>
                    setCurrentQuestion(
                      (value) =>
                        value + 1
                    )
                  }
                >
                  Save & Next →
                </button>
              ) : (
                <button
                  type="button"
                  className="submit-exam-button"
                  onClick={() =>
                    submitExam(false)
                  }
                  disabled={
                    loading ||
                    submittingRef.current
                  }
                >
                  {loading
                    ? "Submitting..."
                    : "Submit Exam"}
                </button>
              )}
            </div>
          </main>

          <aside className="right-panel">
            <section className="candidate-section">
              <div className="section-title">
                <strong>
                  CANDIDATE
                </strong>

                <span className="live-badge">
                  ● LIVE
                </span>
              </div>

              <div className="video-container">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                />

                {!cameraActive && (
                  <div className="camera-placeholder">
                    <div className="camera-icon">
                      ◉
                    </div>

                    <span>
                      Camera unavailable
                    </span>
                  </div>
                )}

                <div className="video-name">
                  Hrishabh Raj
                </div>
              </div>

              <div className="candidate-name">
                <div className="candidate-avatar">
                  H
                </div>

                <div>
                  <strong>
                    Hrishabh Raj
                  </strong>

                  <span>
                    Candidate
                  </span>
                </div>
              </div>

              <div className="proctor-status-list">
                <div>
                  <span
                    className={
                      cameraActive
                        ? "active-dot"
                        : "inactive-dot"
                    }
                  />

                  Camera

                  <strong>
                    {cameraActive
                      ? "Active"
                      : "Inactive"}
                  </strong>
                </div>

                <div>
                  <span
                    className={
                      micActive
                        ? "active-dot"
                        : "inactive-dot"
                    }
                  />

                  Microphone

                  <strong>
                    {micActive
                      ? "Active"
                      : "Inactive"}
                  </strong>
                </div>

                <div>
                  <span
                    className={
                      faceDetected
                        ? "active-dot"
                        : "inactive-dot"
                    }
                  />

                  Face

                  <strong>
                    {faceDetected
                      ? "Detected"
                      : "Not Detected"}
                  </strong>
                </div>

                <div>
                  <span
                    className={
                      faceCount === 1
                        ? "active-dot"
                        : "inactive-dot"
                    }
                  />

                  Faces

                  <strong>
                    {faceCount}
                  </strong>
                </div>

                <div>
                  <span
                    className={
                      proctorStatus ===
                      "Monitoring"
                        ? "active-dot"
                        : "inactive-dot"
                    }
                  />

                  Proctoring

                  <strong>
                    {proctorStatus}
                  </strong>
                </div>

                <div>
                  <span
                    className={
                      isFullscreen
                        ? "active-dot"
                        : "inactive-dot"
                    }
                  />

                  Fullscreen

                  <strong>
                    {isFullscreen
                      ? "Active"
                      : "Required"}
                  </strong>
                </div>
              </div>
            </section>

            <section className="palette-section">
              <div className="section-title">
                <strong>
                  QUESTION PALETTE
                </strong>

                <span>
                  {answeredCount}/
                  {
                    selectedExam
                      .questions
                      .length
                  }
                </span>
              </div>

              <div className="palette-grid">
                {selectedExam.questions.map(
                  (
                    item,
                    index
                  ) => {
                    const answered =
                      answers[
                        item.id
                      ] !==
                      undefined;

                    const current =
                      index ===
                      currentQuestion;

                    return (
                      <button
                        type="button"
                        key={
                          item.id
                        }
                        className={`palette-button ${
                          answered
                            ? "answered"
                            : ""
                        } ${
                          current
                            ? "current"
                            : ""
                        }`}
                        onClick={() =>
                          setCurrentQuestion(
                            index
                          )
                        }
                      >
                        {String(
                          index + 1
                        ).padStart(
                          2,
                          "0"
                        )}
                      </button>
                    );
                  }
                )}
              </div>

              <div className="palette-legend">
                <div>
                  <span className="legend-box answered" />
                  Answered
                </div>

                <div>
                  <span className="legend-box unanswered" />
                  Not Answered
                </div>

                <div>
                  <span className="legend-box current" />
                  Current
                </div>
              </div>
            </section>
          </aside>
        </div>

        <footer className="proctor-footer">
          <span>
            PROCTORX Secure Examination
          </span>

          <span>
            {selectedExam.title}
          </span>

          <span>
            Attempt #{attemptId}
          </span>
        </footer>
      </div>
    );
  }

  return (
    <>
      {precheckOpen && (
        <div className="precheck-overlay">
          <div className="precheck-card">
            <div className="precheck-header">
              <div>
                <span className="precheck-eyebrow">SYSTEM CHECK</span>
                <h2>Before You Start</h2>
                <p>{precheckExam?.title}</p>
              </div>
              <button
                type="button"
                className="precheck-close"
                onClick={closePrecheck}
                disabled={precheckRunning || loading}
              >
                ×
              </button>
            </div>

            <div className="precheck-list">
              {[
                ["camera", "Camera", "Video access is required for proctoring."],
                ["microphone", "Microphone", "Audio access is required for proctoring."],
                ["internet", "Internet Speed", "Minimum download speed: 2 Mbps."],
              ].map(([key, title, description]) => {
                const item = precheck[key];
                const icon =
                  item.status === "pass"
                    ? "✓"
                    : item.status === "fail"
                    ? "!"
                    : item.status === "checking"
                    ? "…"
                    : "—";

                return (
                  <div className={`precheck-item ${item.status}`} key={key}>
                    <div className="precheck-status-icon">{icon}</div>
                    <div className="precheck-item-content">
                      <strong>{title}</strong>
                      <span>{item.status === "pending" ? description : item.detail}</span>
                    </div>
                    <div className="precheck-state">
                      {item.status === "checking"
                        ? "Checking"
                        : item.status === "pass"
                        ? "Ready"
                        : item.status === "fail"
                        ? "Failed"
                        : "Pending"}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="precheck-note">
              Your camera and microphone are checked before the attempt begins. The test starts only after all checks pass.
            </div>

            <div className="precheck-actions">
              <button
                type="button"
                className="precheck-secondary"
                onClick={runPrecheck}
                disabled={precheckRunning || loading}
              >
                {precheckRunning ? "Checking..." : "Run Checks Again"}
              </button>
              <button
                type="button"
                className="precheck-primary"
                onClick={startCheckedExam}
                disabled={!precheckReady || precheckRunning || loading}
              >
                Start Examination
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="exam-dashboard">
      <header className="dashboard-topbar">
        <div className="header-brand">
          <div className="brand-logo">
            P
          </div>

          <div>
            <strong>
              PROCTORX
            </strong>

            <span>
              Examination Portal
            </span>
          </div>
        </div>

        <div className="dashboard-user">
          <div className="candidate-mini-avatar">
            H
          </div>

          <div>
            <strong>
              Hrishabh Raj
            </strong>

            <span>
              Candidate
            </span>
          </div>

          <button
            type="button"
            className="logout-button"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-heading">
          <span>
            EXAMINATION PORTAL
          </span>

          <h1>
            Available Examinations
          </h1>

          <p>
            Select an examination to begin.
          </p>
        </div>

        {message && (
          <div className="dashboard-error">
            {message}
          </div>
        )}

        {exams.length === 0 ? (
          <div className="no-exams">
            No published examinations
            available.
          </div>
        ) : (
          <div className="dashboard-exams">
            {exams.map((exam) => (
              <div
                className="dashboard-exam-card"
                key={exam.id}
              >
                <div className="exam-card-code">
                  EXAM {exam.id}
                </div>

                <h2>
                  {exam.title}
                </h2>

                <p>
                  {exam.description ||
                    "Online examination"}
                </p>

                <div className="card-details">
                  <span>
                    Duration{" "}
                    <strong>
                      {exam.duration} min
                    </strong>
                  </span>

                  <span>
                    Marks{" "}
                    <strong>
                      {exam.total_marks}
                    </strong>
                  </span>
                </div>

                <button
                  type="button"
                  className="start-exam-button"
                  onClick={() =>
                    openPrecheck(exam)
                  }
                  disabled={loading}
                >
                  {loading
                    ? "Starting..."
                    : "Start Examination →"}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
      </div>
    </>
  );
}

export default Exam;