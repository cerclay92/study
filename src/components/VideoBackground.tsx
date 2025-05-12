"use client";

import { useEffect, useRef, useState } from "react";

interface VideoBackgroundProps {
  videoSrc: string;
  fallbackImageSrc: string; // 비디오가 로드되지 않을 때 대체 이미지
  isMuted?: boolean;
  isLoop?: boolean;
  overlayOpacity?: number; // 0부터 100까지의 숫자
}

export default function VideoBackground({
  videoSrc,
  fallbackImageSrc,
  isMuted = true,
  isLoop = true,
  overlayOpacity = 50,
}: VideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleCanPlay = () => {
      setIsVideoLoaded(true);
    };

    const handleError = () => {
      setError(true);
      console.error("비디오 로드 중 오류가 발생했습니다.");
    };

    videoElement.addEventListener("canplay", handleCanPlay);
    videoElement.addEventListener("error", handleError);

    return () => {
      videoElement.removeEventListener("canplay", handleCanPlay);
      videoElement.removeEventListener("error", handleError);
    };
  }, []);

  // 투명도를 0~1 범위로 변환
  const normalizedOpacity = overlayOpacity / 100;

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      {/* 비디오가 로드되지 않았거나 오류가 발생했을 때 대체 이미지 표시 */}
      {(!isVideoLoaded || error) && (
        <div
          className="absolute inset-0 bg-cover bg-center z-0"
          style={{ backgroundImage: `url(${fallbackImageSrc})` }}
        />
      )}

      {/* 비디오 요소 */}
      {!error && (
        <video
          ref={videoRef}
          className={`absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-1000 filter blur-[2px] contrast-110 ${
            isVideoLoaded ? "opacity-100" : "opacity-0"
          }`}
          autoPlay
          playsInline
          muted={isMuted}
          loop={isLoop}
          onError={() => setError(true)}
        >
          <source src={videoSrc} type="video/mp4" />
          비디오를 지원하지 않는 브라우저입니다.
        </video>
      )}

      {/* 오버레이 */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-indigo-900/80 to-purple-900/80 z-10"
        style={{ opacity: 0.8 }}
      />
    </div>
  );
} 