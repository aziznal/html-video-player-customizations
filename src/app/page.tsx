"use client";

import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { Pause, Play, Volume, Volume2 } from "lucide-react";
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
  const [volume, setVolume] = useState(50);
  const [volumeBeforeMute, setVolumeBeforeMute] = useState(50);

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

    const volumeChangeEventListener = () => {
      setVolume(video.volume);
    };

    video.addEventListener("play", playEventListener);
    video.addEventListener("pause", pauseEventListener);
    video.addEventListener("timeupdate", timeUpdateEventListener);
    video.addEventListener("volumechange", volumeChangeEventListener);

    return () => {
      video.removeEventListener("play", playEventListener);
      video.removeEventListener("pause", pauseEventListener);
      video.addEventListener("timeupdate", timeUpdateEventListener);
      video.addEventListener("volumechange", volumeChangeEventListener);
    };
  }, []);

  const play = () => {
    console.log("playing");
    ref.current?.play();
  };

  const pause = () => {
    console.log("pausing");
    ref.current?.pause();
  };

  const togglePlayPause = () => {
    console.log("toggling play/pause");
    isPlaying ? pause() : play();
  };

  const toggleFullscreen = () => {
    ref.current?.requestFullscreen();
  };

  const toggleMute = () => {
    if (!ref.current) return;

    // if muting
    if (volume > 1) {
      console.log("muting");
      setVolumeBeforeMute(volume);
      setVolume(1);
      return;
    }

    // if already muted
    console.log("unmuting");
    setVolume(volumeBeforeMute);
  };

  return (
    <div
      className="relative text-white"
      onKeyDown={(e) => {
        if (e.key === " ") {
          togglePlayPause();
        }

        if (e.key === "f") {
          toggleFullscreen();
        }

        if (e.key === "m") {
          toggleMute();
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

        <div className="flex items-center mb-2">
          {/* Play/Pause Button */}
          <ControlButton onClick={togglePlayPause} className="mr-4">
            {isPlaying ? <Pause /> : <Play />}
          </ControlButton>

          {/* Time Display */}
          <div className="mr-4">
            {formattedCurrentTime} / {formattedVideoDuration}
          </div>

          {/* Volume Slider */}
          <div className="flex gap-2 items-center ml-2">
            <ControlButton onClick={toggleMute}>
              {volume > 1 ? <Volume2 /> : <Volume />}
            </ControlButton>

            <Slider
              className="w-20"
              value={[volume]}
              onValueChange={(value) => setVolume(value[0])}
            />
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
        {...props}
        onClick={(e) => {
          e.stopPropagation();
          props.onClick?.(e);
        }}
        onKeyDown={(e) => {
          e.stopPropagation();
          props.onKeyDown?.(e);
        }}
        className={cn(
          "bg-none rounded-full flex items-center justify-center text-white transition hover:bg-slate-800 p-2",
          props.className
        )}
        ref={ref}
      />
    );
  }
);

ControlButton.displayName = "ControlButton";
