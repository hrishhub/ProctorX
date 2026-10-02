import { useEffect, useRef, useState } from "react";

function Camera() {
  const videoRef = useRef(null);

  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let stream;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        setCameraActive(true);
      } catch (err) {
        console.error(err);
        setError("Camera/Microphone permission denied.");
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  return (
    <div className="camera-card">

      <div className="camera-header">
        <span>Camera</span>

        <span
          className={`camera-status ${
            cameraActive ? "active" : "inactive"
          }`}
        >
          ● {cameraActive ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="video-container">

        {error ? (
          <div className="camera-error">
            <span>⚠️</span>
            <p>{error}</p>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
          />
        )}

        {cameraActive && (
          <div className="recording-indicator">
            <span>●</span> LIVE
          </div>
        )}

      </div>

    </div>
  );
}

export default Camera;