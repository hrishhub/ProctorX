import { useCallback, useEffect, useRef, useState } from "react";
import {
  FaceLandmarker,
  FilesetResolver,
} from "@mediapipe/tasks-vision";

const FACE_MODEL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

const EVENT_COOLDOWN = 5000;

export default function useProctoring({
  videoRef,
  attemptId,
  token,
  apiUrl,
}) {
  const landmarkerRef = useRef(null);
  const streamRef = useRef(null);
  const detectionTimerRef = useRef(null);

  const eventTimesRef = useRef({});
  const lastVideoTimeRef = useRef(-1);

  const noFaceStartRef = useRef(null);
  const multipleFaceStartRef = useRef(null);
  const lookingAwayStartRef = useRef(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [micActive, setMicActive] = useState(false);

  const [faceDetected, setFaceDetected] = useState(false);
  const [faceCount, setFaceCount] = useState(0);

  const [headPosition, setHeadPosition] = useState("Normal");

  const [proctorStatus, setProctorStatus] =
    useState("Initializing");

  const [violationCount, setViolationCount] = useState(0);

  const canSendEvent = useCallback((eventType) => {
    const now = Date.now();

    const previous =
      eventTimesRef.current[eventType] || 0;

    if (now - previous < EVENT_COOLDOWN) {
      return false;
    }

    eventTimesRef.current[eventType] = now;

    return true;
  }, []);

  const recordEvent = useCallback(
    async (
      eventType,
      eventData = "",
      severity = "medium"
    ) => {
      if (!attemptId || !token) {
        return;
      }

      if (!canSendEvent(eventType)) {
        return;
      }

      if (
        eventType !== "face_detected" &&
        eventType !== "monitoring"
      ) {
        setViolationCount((previous) => previous + 1);
      }

      try {
        await fetch(
          `${apiUrl}/attempts/${attemptId}/events`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              event_type: eventType,
              event_data: JSON.stringify({
                message: eventData,
                severity,
              }),
            }),
          }
        );
      } catch {
        return;
      }
    },
    [
      attemptId,
      token,
      apiUrl,
      canSendEvent,
    ]
  );

  const initializeLandmarker =
    useCallback(async () => {
      try {
        const vision =
          await FilesetResolver.forVisionTasks(
            "/wasm"
          );

        const landmarker =
          await FaceLandmarker.createFromOptions(
            vision,
            {
              baseOptions: {
                modelAssetPath: FACE_MODEL,
              },

              runningMode: "VIDEO",

              numFaces: 3,

              minFaceDetectionConfidence: 0.5,

              minFacePresenceConfidence: 0.5,

              minTrackingConfidence: 0.5,

              outputFaceBlendshapes: false,

              outputFacialTransformationMatrixes: true,
            }
          );

        landmarkerRef.current = landmarker;

        return true;
      } catch (error) {
        console.error(
          "MediaPipe Face Landmarker initialization failed:",
          error
        );

        return false;
      }
    }, []);

  const startCamera = useCallback(async () => {
    try {
      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: {
            width: {
              ideal: 1280,
            },

            height: {
              ideal: 720,
            },

            facingMode: "user",
          },

          audio: true,
        });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        await videoRef.current.play();
      }

      const videoTrack =
        stream.getVideoTracks()[0];

      const audioTrack =
        stream.getAudioTracks()[0];

      setCameraActive(
        videoTrack?.readyState === "live"
      );

      setMicActive(
        audioTrack?.readyState === "live"
      );

      if (videoTrack) {
        videoTrack.onended = () => {
          setCameraActive(false);

          setProctorStatus(
            "Camera Disconnected"
          );

          recordEvent(
            "camera_disconnected",
            "Camera track ended",
            "high"
          );
        };
      }

      if (audioTrack) {
        audioTrack.onended = () => {
          setMicActive(false);

          recordEvent(
            "microphone_disconnected",
            "Microphone track ended",
            "high"
          );
        };
      }

      return true;
    } catch (error) {
      console.error(
        "Camera initialization failed:",
        error
      );

      setCameraActive(false);
      setMicActive(false);

      setProctorStatus(
        "Camera Permission Required"
      );

      await recordEvent(
        "camera_permission_denied",
        "Unable to access camera or microphone",
        "high"
      );

      return false;
    }
  }, [
    videoRef,
    recordEvent,
  ]);

  const calculateHeadPosition = useCallback(
    (landmarks) => {
      if (!landmarks || landmarks.length === 0) {
        return "Unknown";
      }

      const nose = landmarks[1];

      const leftEye = landmarks[33];

      const rightEye = landmarks[263];

      const leftEar = landmarks[234];

      const rightEar = landmarks[454];

      if (
        !nose ||
        !leftEye ||
        !rightEye ||
        !leftEar ||
        !rightEar
      ) {
        return "Unknown";
      }

      const eyeCenterX =
        (leftEye.x + rightEye.x) / 2;

      const eyeDistance =
        Math.abs(
          rightEye.x - leftEye.x
        );

      if (eyeDistance < 0.01) {
        return "Unknown";
      }

      const horizontalOffset =
        (nose.x - eyeCenterX) /
        eyeDistance;

      const earDistance =
        Math.abs(
          rightEar.x - leftEar.x
        );

      const normalizedNoseY =
        nose.y /
        Math.max(
          earDistance,
          0.01
        );

      if (horizontalOffset > 0.45) {
        return "Looking Right";
      }

      if (horizontalOffset < -0.45) {
        return "Looking Left";
      }

      if (normalizedNoseY < 1.1) {
        return "Looking Up";
      }

      if (normalizedNoseY > 2.1) {
        return "Looking Down";
      }

      return "Normal";
    },
    []
  );

  const detect = useCallback(() => {
    const video = videoRef.current;

    const landmarker =
      landmarkerRef.current;

    if (!video || !landmarker) {
      return;
    }

    if (
      video.readyState <
      HTMLMediaElement.HAVE_CURRENT_DATA
    ) {
      return;
    }

    if (
      video.currentTime ===
      lastVideoTimeRef.current
    ) {
      return;
    }

    lastVideoTimeRef.current =
      video.currentTime;

    try {
      const result =
        landmarker.detectForVideo(
          video,
          performance.now()
        );

      const faces =
        result?.faceLandmarks || [];

      const count = faces.length;

      setFaceCount(count);

      /*
       * NO FACE
       */

      if (count === 0) {
        setFaceDetected(false);

        setHeadPosition("Unknown");

        if (!noFaceStartRef.current) {
          noFaceStartRef.current =
            Date.now();
        }

        setProctorStatus(
          "Face Not Detected"
        );

        const duration =
          Date.now() -
          noFaceStartRef.current;

        if (duration >= 3000) {
          recordEvent(
            "face_not_detected",
            "No face detected for more than 3 seconds",
            "high"
          );
        }

        return;
      }

      noFaceStartRef.current = null;

      /*
       * MULTIPLE FACES
       */

      if (count > 1) {
        setFaceDetected(false);

        setHeadPosition(
          "Multiple Faces"
        );

        if (
          !multipleFaceStartRef.current
        ) {
          multipleFaceStartRef.current =
            Date.now();
        }

        setProctorStatus(
          "Multiple Faces Detected"
        );

        const duration =
          Date.now() -
          multipleFaceStartRef.current;

        if (duration >= 2000) {
          recordEvent(
            "multiple_faces",
            `${count} faces detected`,
            "high"
          );
        }

        return;
      }

      multipleFaceStartRef.current =
        null;

      /*
       * SINGLE FACE
       */

      setFaceDetected(true);

      const position =
        calculateHeadPosition(
          faces[0]
        );

      setHeadPosition(position);

      if (position === "Normal") {
        lookingAwayStartRef.current =
          null;

        setProctorStatus(
          "Face Detected"
        );

        return;
      }

      /*
       * LOOKING AWAY
       */

      if (
        !lookingAwayStartRef.current
      ) {
        lookingAwayStartRef.current =
          Date.now();
      }

      setProctorStatus(
        position
      );

      const lookingAwayDuration =
        Date.now() -
        lookingAwayStartRef.current;

      if (
        lookingAwayDuration >= 3000
      ) {
        recordEvent(
          "looking_away",
          `Candidate detected as ${position}`,
          "medium"
        );
      }
    } catch (error) {
      console.error(
        "Face analysis error:",
        error
      );
    }
  }, [
    videoRef,
    calculateHeadPosition,
    recordEvent,
  ]);

  const startDetection =
    useCallback(async () => {
      const initialized =
        await initializeLandmarker();

      if (!initialized) {
        setProctorStatus(
          "Face Detection Unavailable"
        );

        await recordEvent(
          "face_detection_unavailable",
          "MediaPipe Face Landmarker initialization failed",
          "high"
        );

        return;
      }

      if (detectionTimerRef.current) {
        clearInterval(
          detectionTimerRef.current
        );
      }

      detectionTimerRef.current =
        setInterval(
          detect,
          250
        );

      setProctorStatus(
        "Monitoring"
      );

      await recordEvent(
        "monitoring",
        "Face monitoring started",
        "low"
      );
    }, [
      initializeLandmarker,
      detect,
      recordEvent,
    ]);

  const stopProctoring =
    useCallback(() => {
      if (detectionTimerRef.current) {
        clearInterval(
          detectionTimerRef.current
        );

        detectionTimerRef.current =
          null;
      }

      if (streamRef.current) {
        streamRef.current
          .getTracks()
          .forEach((track) => {
            track.stop();
          });

        streamRef.current = null;
      }

      if (videoRef.current) {
        videoRef.current.srcObject =
          null;
      }

      if (landmarkerRef.current) {
        if (
          typeof landmarkerRef.current
            .close === "function"
        ) {
          landmarkerRef.current.close();
        }

        landmarkerRef.current =
          null;
      }

      setCameraActive(false);

      setMicActive(false);

      setFaceDetected(false);

      setFaceCount(0);

      setHeadPosition("Unknown");

      setProctorStatus("Stopped");
    }, [videoRef]);

  useEffect(() => {
    return () => {
      stopProctoring();
    };
  }, [stopProctoring]);

  return {
    cameraActive,
    micActive,

    faceDetected,
    faceCount,

    headPosition,

    proctorStatus,

    violationCount,

    startCamera,
    startDetection,
    stopProctoring,

    recordEvent,
  };
}