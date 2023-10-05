"use client";

import { cn } from "@/lib/utils";
import { Pause, Play } from "lucide-react";
import {
  HTMLAttributes,
  PropsWithChildren,
  forwardRef,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export default function Home() {
  return (
    <div className="h-full flex flex-col items-center justify-center">
      <CustomVideoPlayer>
        <source src="/video.mp4" type="video/mp4" />
      </CustomVideoPlayer>
    </div>
  );
}

const CustomVideoPlayer = ({ children }: PropsWithChildren) => {
  const ref = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const formattedCurrentTime = useMemo(() => {
    const hours = Math.floor(currentTime / 3600);
    const minutes = Math.floor(currentTime / 60);
    const seconds = currentTime - minutes * 60;

    let formattedSeconds = `${seconds}`;

    if (seconds < 10) {
      formattedSeconds = `0${seconds}`;
    }

    return hours
      ? `${hours}:${minutes}:${formattedSeconds}`
      : `${minutes}:${formattedSeconds}`;
  }, [currentTime]);

  const formattedVideoDuration = useMemo(() => {
    if (!ref.current) return "00:00";

    const video = ref.current;

    const minutes = Math.floor(video.duration / 60);
    const seconds = Math.round(video.duration - minutes * 60);

    return `${minutes}:${seconds}`;
  }, [ref]);

  useEffect(() => {
    if (!ref.current) return;

    const video = ref.current;

    const playEventListener = () => {
      setIsPlaying(true);
    };

    const pauseEventListener = () => {
      setIsPlaying(false);
    };

    const timeUpdateEventListener = () => {
      setCurrentTime(Math.round(video.currentTime));
    };

    video.addEventListener("play", playEventListener);
    video.addEventListener("pause", pauseEventListener);
    video.addEventListener("timeupdate", timeUpdateEventListener);

    return () => {
      video.removeEventListener("play", playEventListener);
      video.removeEventListener("pause", pauseEventListener);
      video.addEventListener("timeupdate", timeUpdateEventListener);
    };
  }, []);

  const play = () => {
    console.info("playing");
    ref.current?.play();
  };

  const pause = () => {
    console.info("pausing");
    ref.current?.pause();
  };

  const togglePlayPause = () => {
    console.info("toggling play/pause");
    isPlaying ? pause() : play();
  };

  const toggleFullscreen = () => {
    ref.current?.requestFullscreen({
      navigationUI: "hide",
    });
  };

  return (
    <div
      className="relative text-white"
      onKeyDown={(e) => {
        if (e.key === " ") {
          togglePlayPause();
        }
      }}
      tabIndex={0}
    >
      <video
        className="w-[800px] h-[500px] object-cover"
        onClick={togglePlayPause}
        onDoubleClick={toggleFullscreen}
        loop
        ref={ref}
      >
        {children}
      </video>

      <div className="bottom-0 absolute w-full px-4 flex flex-col gap-2">
        <progress
          className="w-full h-1 bg-slate-800 rounded-full mt-2"
          value={0}
          max={100}
        ></progress>

        <div className="flex items-center gap-2 mb-2">
          {/* Play/Pause Button */}
          <ControlButton onClick={togglePlayPause}>
            {isPlaying ? <Pause /> : <Play />}
          </ControlButton>

          <div>
            {formattedCurrentTime} / {formattedVideoDuration}
          </div>
        </div>
      </div>
    </div>
  );
};

type ControlButtonProps = HTMLAttributes<HTMLButtonElement> & {};

const ControlButton = forwardRef<HTMLButtonElement, ControlButtonProps>(
  (props, ref) => {
    return (
      <button
        className={cn(
          "bg-none rounded-full flex items-center justify-center text-white transition hover:bg-slate-800 p-2"
        )}
        {...props}
        ref={ref}
      />
    );
  }
);

ControlButton.displayName = "ControlButton";
