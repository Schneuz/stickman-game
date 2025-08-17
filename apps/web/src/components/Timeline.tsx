interface TimelineProps {
  currentFrame: number;
  totalFrames: number;
  onFrameSelect: (frame: number) => void;
}

function Timeline({ currentFrame, totalFrames, onFrameSelect }: TimelineProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <h3 className="text-sm font-semibold mb-2 text-gray-300">Timeline</h3>
      <div className="grid grid-cols-12 gap-1">
        {Array.from({ length: totalFrames }, (_, i) => (
          <button
            key={i}
            onClick={() => onFrameSelect(i)}
            className={`
              aspect-square rounded text-xs font-medium transition-all
              ${
                i === currentFrame
                  ? "bg-blue-500 text-white shadow-lg scale-110"
                  : "bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white"
              }
            `}
            title={`Frame ${i}`}
          >
            {i}
          </button>
        ))}
      </div>
      <div className="mt-2 text-sm text-gray-400">
        Frame: {currentFrame} / {totalFrames - 1}
      </div>
    </div>
  );
}

export default Timeline;