"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Slider, VideoSlider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import {
  FastForward,
  Forward,
  Fullscreen,
  Pause,
  Play,
  Rewind,
  Settings,
  Volume2,
  VolumeXIcon,
} from "lucide-react";
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
  const videoPlayerContainerRef = useRef<HTMLDivElement>(null);

  const [showControls, setShowControls] = useState(false);

  const [mousePosition, setMousePosition] = useState({
    x: 0,
    y: 0,
  });

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
    // note: don't remove `ref.current.duration` from deps because
    // otherwise this useMemo is not called once the ref is ready
    // and the video duration stays at 00:00
  }, [ref.current?.duration]);

  const isMouseWithinVideoPlayer = useMemo(() => {
    if (!videoPlayerContainerRef.current) return false;

    const videoPlayerContainer = videoPlayerContainerRef.current;

    const rect = videoPlayerContainer.getBoundingClientRect();

    const isMouseWithinVideoPlayer =
      mousePosition.x >= rect.left &&
      mousePosition.x <= rect.right &&
      mousePosition.y >= rect.top &&
      mousePosition.y <= rect.bottom;

    return isMouseWithinVideoPlayer;
  }, [mousePosition]);

  // track mouse position
  useEffect(() => {
    const mouseMoveEventListener = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY,
      });
    };

    window.addEventListener("mousemove", mouseMoveEventListener);

    return () => {
      window.removeEventListener("mousemove", mouseMoveEventListener);
    };
  }, []);

  // setting many event listeners
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

  const showControlsTimeout = useRef<NodeJS.Timeout | null>(null);

  // hide controls after 3 seconds
  useEffect(() => {
    // clear previous timeout
    if (showControlsTimeout.current) {
      clearTimeout(showControlsTimeout.current);
    }

    showControlsTimeout.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);

    return () => {
      if (showControlsTimeout.current) {
        clearTimeout(showControlsTimeout.current);
      }
    };
  }, [showControls]);

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

  const seek = (timeAsPercentage: number) => {
    if (!ref.current) return;

    const video = ref.current;

    const time = (timeAsPercentage / 100) * video.duration;

    video.currentTime = time;
  };

  const skipForwardInSeconds = (seconds: number) => {
    if (!ref.current) return;

    const video = ref.current;

    video.currentTime += seconds;

    if (video.currentTime > video.duration) {
      video.currentTime = video.duration;
    }
  };

  const skipBackwardInSeconds = (seconds: number) => {
    if (!ref.current) return;

    const video = ref.current;

    video.currentTime -= seconds;

    if (video.currentTime < 0) {
      video.currentTime = 0;
    }
  };

  return (
    <div
      className="relative text-white"
      onMouseMove={() => setShowControls(true)}
      tabIndex={0}
      ref={videoPlayerContainerRef}
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

        if (e.key === "ArrowLeft") {
          skipBackwardInSeconds(2);
        }

        if (e.key === "ArrowRight") {
          skipForwardInSeconds(2);
        }
      }}
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

      <div
        className="transition duration-[400ms] bottom-0 absolute w-full px-4 flex flex-col gap-2"
        style={{
          opacity:
            showControls || !isPlaying || isMouseWithinVideoPlayer ? 1 : 0,
        }}
      >
        <div>
          <VideoSlider
            className="w-full"
            value={[(100 * currentTime) / (ref.current?.duration ?? 1)]}
            onValueChange={(value) => seek(value[0])}
          />
        </div>

        <div className="flex items-center mb-2 justify-between">
          <div className="flex items-center">
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
                {volume > 1 ? <Volume2 /> : <VolumeXIcon />}
              </ControlButton>

              <Slider
                className="w-20"
                value={[volume]}
                onValueChange={(value) => setVolume(value[0])}
              />
            </div>
          </div>

          <div className="flex items-center">
            {/* Seek Forward Button */}
            <ControlButton
              onClick={() => skipBackwardInSeconds(10)}
              className="mr-2"
            >
              <span className="mr-1">-10s</span> <Rewind />
            </ControlButton>

            <ControlButton
              onClick={() => skipForwardInSeconds(10)}
              className="mr-2"
            >
              <FastForward className="mr-1" /> <span>+10s</span>
            </ControlButton>

            {/* Settings Button */}
            <DropdownMenu>
              <ControlButton asChild>
                <DropdownMenuTrigger>
                  <Settings />
                </DropdownMenuTrigger>
              </ControlButton>

              <DropdownMenuContent side="top">
                {/* Playback Speed */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <DropdownMenuItem>Playback Speed</DropdownMenuItem>
                  </DropdownMenuSubTrigger>

                  <DropdownMenuContent side="right">
                    <DropdownMenuItem>0.25x</DropdownMenuItem>
                    <DropdownMenuItem>0.5x</DropdownMenuItem>
                    <DropdownMenuItem>0.75x</DropdownMenuItem>
                    <DropdownMenuItem>1x</DropdownMenuItem>
                    <DropdownMenuItem>1.25x</DropdownMenuItem>
                    <DropdownMenuItem>1.5x</DropdownMenuItem>
                    <DropdownMenuItem>1.75x</DropdownMenuItem>
                    <DropdownMenuItem>2x</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenuSub>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Fullscreen Button */}
            <ControlButton onClick={toggleFullscreen} className="mr-2">
              <Fullscreen />
            </ControlButton>
          </div>
        </div>
      </div>
    </div>
  );
};

type ControlButtonProps = HTMLAttributes<HTMLButtonElement> & {
  asChild?: boolean;
};

const ControlButton = forwardRef<HTMLButtonElement, ControlButtonProps>(
  (props, ref) => {
    return (
      <Button
        {...props}
        variant="icon"
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
