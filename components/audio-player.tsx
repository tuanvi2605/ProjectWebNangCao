"use client"

import { useEffect, useRef, useState } from "react"
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Shuffle, Heart, Share2 } from "lucide-react"
import * as RadixSlider from "@radix-ui/react-slider"
import { Howl } from "howler"

interface Song {
  _id: string
  title: string
  artist?: {
    name: string
    _id?: string
  }
  album?: {
    title?: string
    _id?: string
  }
  duration?: number
  isVip?: boolean
  play?: number
  like?: number
}

export const AudioPlayer = () => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(80)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [isRepeat, setIsRepeat] = useState(false)
  const [isShuffle, setIsShuffle] = useState(false)

  const howlRef = useRef<Howl | null>(null)

  // Check if song is liked when song changes
  useEffect(() => {
    if (currentSong) {
      checkIfSongIsLiked(currentSong._id)
      // Increment play count when song starts playing
      incrementPlayCount(currentSong._id)
    }
  }, [currentSong])

  // Init Howler.js and auto play when song changes
  useEffect(() => {
    if (currentSong) {
      if (howlRef.current) {
        howlRef.current.unload()
      }

      const howl = new Howl({
        src: [`/mp3/${currentSong._id}.mp3`],
        html5: true,
        autoplay: true,
        onplay: () => {
          setIsPlaying(true)
          setDuration(howl.duration())
        },
        onend: () => {
          if (isRepeat) {
            howl.seek(0)
            howl.play()
          } else {
            setIsPlaying(false)
          }
        },
        onpause: () => {
          setIsPlaying(false)
        },
        onload: () => {
          setDuration(howl.duration())
        },
        volume: volume / 100,
      })

      howlRef.current = howl

      const interval = setInterval(() => {
        if (howl.playing()) {
          setCurrentTime(howl.seek() as number)
        }
      }, 1000)

      return () => {
        clearInterval(interval)
        howl.unload()
      }
    }
  }, [currentSong, isRepeat])

  // Handle song change event
  useEffect(() => {
    const handleSongChange = (event: CustomEvent) => {
      const song = event.detail
      setCurrentSong(song)
    }

    window.addEventListener("playSong", handleSongChange as EventListener)

    return () => {
      window.removeEventListener("playSong", handleSongChange as EventListener)
    }
  }, [])

  // Update volume
  useEffect(() => {
    if (howlRef.current) {
      howlRef.current.volume(isMuted ? 0 : volume / 100)
    }
  }, [volume, isMuted])

  // Check if song is liked
  const checkIfSongIsLiked = async (songId: string) => {
    try {
      const token = sessionStorage.getItem("token")
      if (!token) return

      const response = await fetch(`/api/v1/song/like?songId=${songId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setIsLiked(data.liked)
      }
    } catch (error) {
      console.error("Error checking if song is liked:", error)
    }
  }

  // Increment play count
  const incrementPlayCount = async (songId: string) => {
    try {
      const token = sessionStorage.getItem("token")
      if (!token) return

      await fetch("/api/v1/song/play", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ songId }),
      })
    } catch (error) {
      console.error("Error incrementing play count:", error)
    }
  }

  // Toggle play/pause
  const togglePlay = () => {
    if (howlRef.current) {
      if (isPlaying) {
        howlRef.current.pause()
      } else {
        howlRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  // Toggle mute
  const toggleMute = () => setIsMuted(!isMuted)

  // Toggle repeat
  const toggleRepeat = () => setIsRepeat(!isRepeat)

  // Toggle shuffle
  const toggleShuffle = () => setIsShuffle(!isShuffle)

  // Toggle like
  const toggleLike = async () => {
    if (!currentSong) return

    try {
      const token = sessionStorage.getItem("token")
      if (!token) {
        return
      }

      const response = await fetch("/api/v1/song/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ songId: currentSong._id }),
      })

      if (response.ok) {
        const data = await response.json()
        setIsLiked(data.liked)

        // Update the like count without recreating the entire song object
        // This prevents the song from restarting
        if (currentSong) {
          currentSong.like = data.likeCount
        }
      }
    } catch (error) {
      console.error("Error toggling like:", error)
    }
  }

  // Handle time change
  const handleTimeChange = (newTime: number[]) => {
    const time = newTime[0]
    setCurrentTime(time)
    if (howlRef.current) {
      howlRef.current.seek(time)
    }
  }

  // Format time (mm:ss)
  const formatTime = (time: number) => {
    if (!time) return "0:00"
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  // If no currentSong, return null to hide completely
  if (!currentSong) {
    return null
  }

  // Only render player when there is a currentSong
  return (
    <>
      <div className="h-[12%] bg-gray-900 text-white flex items-center px-6 border-2 border-gray-800">
        {/* Song Info */}
        <div className="flex items-center w-1/4">
          <div className="w-16 h-16 bg-gray-700 rounded overflow-hidden mr-4">
            <img
              src={`/img/song/${currentSong._id}.jpg`}
              alt={currentSong.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                ;(e.target as HTMLImageElement).src = "/img/song/sample.jpg"
              }}
            />
          </div>
          <div>
            <h3 className="font-medium text-white truncate max-w-[180px]">{currentSong.title}</h3>
            <p className="text-gray-400 text-sm truncate max-w-[180px]">
              {currentSong.artist?.name || "Unknown Artist"}
            </p>
          </div>
          <button
            className={`ml-4 p-2 rounded-full ${isLiked ? "text-red-500" : "text-gray-400"} hover:bg-gray-700`}
            onClick={toggleLike}
            aria-label={isLiked ? "Unlike song" : "Like song"}
          >
            <Heart size={20} fill={isLiked ? "#ef4444" : "none"} />
          </button>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center justify-center flex-1">
          <div className="flex items-center space-x-4 mb-2">
            <button
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full"
              onClick={toggleShuffle}
              aria-label={isShuffle ? "Disable shuffle" : "Enable shuffle"}
            >
              <Shuffle size={18} className={isShuffle ? "text-green-500" : ""} />
            </button>
            <button
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full"
              onClick={() => {
                if (howlRef.current) {
                  howlRef.current.seek(0)
                }
              }}
              aria-label="Restart song"
            >
              <SkipBack size={20} />
            </button>
            <button
              className="p-3 bg-white text-gray-900 rounded-full hover:bg-gray-200"
              onClick={togglePlay}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <button
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full"
              disabled
              aria-label="Next song"
            >
              <SkipForward size={20} />
            </button>
            <button
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full"
              onClick={toggleRepeat}
              aria-label={isRepeat ? "Disable repeat" : "Enable repeat"}
            >
              <Repeat size={18} className={isRepeat ? "text-green-500" : ""} />
            </button>
          </div>

          <div className="w-full flex items-center space-x-3">
            <span className="text-xs text-gray-400 w-10 text-right">{formatTime(currentTime)}</span>
            <RadixSlider.Root
              value={[currentTime]}
              min={0}
              max={duration}
              step={1}
              onValueChange={handleTimeChange}
              className="relative flex items-center select-none touch-none w-full h-5"
            >
              <RadixSlider.Track className="bg-gray-600 relative grow rounded-full h-1">
                <RadixSlider.Range className="absolute bg-gray-400 rounded-full h-full" />
              </RadixSlider.Track>
              <RadixSlider.Thumb className="block w-4 h-4 bg-gray-100 rounded-full shadow hover:bg-gray-50 focus:outline-none" />
            </RadixSlider.Root>
            <span className="text-xs text-gray-400 w-10">{formatTime(duration)}</span>
          </div>
        </div>

        {/* Volume & Other Controls */}
        <div className="flex items-center space-x-4 w-1/4 justify-end mr-[5%]">
          <button
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full"
            onClick={toggleMute}
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <div className="w-24">
            <RadixSlider.Root
              value={[volume]}
              min={0}
              max={100}
              step={1}
              onValueChange={(value) => setVolume(value[0])}
              className="relative flex items-center select-none touch-none w-24 h-5"
            >
              <RadixSlider.Track className="bg-gray-600 relative grow rounded-full h-1">
                <RadixSlider.Range className="absolute bg-gray-400 rounded-full h-full" />
              </RadixSlider.Track>
              <RadixSlider.Thumb className="block w-4 h-4 bg-gray-100 rounded-full shadow hover:bg-gray-50 focus:outline-none" />
            </RadixSlider.Root>
          </div>
          <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full" aria-label="Share">
            <Share2 size={18} />
          </button>
        </div>
      </div>
    </>
  )
}
