import React, { useEffect, useRef, useState } from 'react';
import { Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { LaunchCountdown } from './LaunchCountdown';

const DEMO_VIDEO_SRC = '/demo/mofin-demo.mp4';

export const DemoVideo: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.play().catch(() => setIsPlaying(false));

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
    };
  }, []);

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  };

  return (
    <section id="demo" className="demo-hero reveal">
      <div className="demo-hero-media">
        <video
          ref={videoRef}
          className="demo-video-element"
          src={DEMO_VIDEO_SRC}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          disablePictureInPicture
          controlsList="nodownload nofullscreen noremoteplayback"
          aria-label="Mofin app demo video showing automatic transaction tracking"
        />

        <div className="demo-video-controls">
          <button
            type="button"
            className="demo-video-control"
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause video' : 'Play video'}
            aria-pressed={isPlaying}
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button
            type="button"
            className="demo-video-control"
            onClick={toggleMute}
            aria-label={isMuted ? 'Unmute video' : 'Mute video'}
            aria-pressed={!isMuted}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
        </div>
      </div>

      <div className="demo-hero-content">
        <div className="container demo-hero-copy">
          <span className="badge-green">Beta Launch Preview</span>
          <h1 className="heading demo-hero-title">See Mofin Track Your Spending</h1>
          <p className="body-lg text-steel">
            Watch Mofin turn everyday mobile money transactions into organized spending insights, automatically. Label
            expenses in seconds, stay on top of your budget, and see exactly where your money is going.
          </p>
        </div>

        <div className="container demo-hero-footer">
          <LaunchCountdown />
        </div>
      </div>
    </section>
  );
};
