"use client";

const MONO =
  'var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
const SERIF = 'var(--font-source-serif), Georgia, "Times New Roman", serif';

export function CameraSection() {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
@keyframes camera-blink {
  0% { opacity: 1; }
  50% { opacity: 0; }
  100% { opacity: 1; }
}
@keyframes marquee-scroll {
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
`,
        }}
      />

      <div
        style={{
          width: "100%",
          position: "relative",
          background: "var(--sf-black)",
        }}
      >
        {/* Main camera frame */}
        <div
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "16 / 10",
            overflow: "hidden",
            background:
              "linear-gradient(135deg, #3d2a1a 0%, #2a1c12 20%, #4a3020 40%, #352518 60%, #2e1f14 80%, #3d2a1a 100%)",
          }}
        >
          {/* Simulated Mars terrain photo - rocky surface with varied tones */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse at 50% 80%, #8b5e3c 0%, #6b3a1a 20%, #4a2810 45%, #2e1a0e 70%, #1a0f08 100%)",
              opacity: 0.8,
            }}
          />
          {/* Scattered rock detail */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 25% 65%, rgba(139, 94, 60, 0.4) 0%, transparent 12%), radial-gradient(circle at 70% 55%, rgba(107, 58, 26, 0.35) 0%, transparent 10%), radial-gradient(circle at 40% 75%, rgba(74, 40, 16, 0.5) 0%, transparent 8%), radial-gradient(circle at 80% 70%, rgba(139, 94, 60, 0.3) 0%, transparent 15%), radial-gradient(circle at 15% 50%, rgba(90, 55, 30, 0.4) 0%, transparent 9%)",
            }}
          />

          {/* Crosshair overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
            }}
          >
            {/* Vertical line */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: 0,
                bottom: 0,
                width: 1,
                background: "var(--sf-warm-400)",
                opacity: 0.5,
              }}
            />
            {/* Horizontal line */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: 0,
                right: 0,
                height: 1,
                background: "var(--sf-warm-400)",
                opacity: 0.5,
              }}
            />
            {/* Center dot */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "var(--sf-warm-100)",
                transform: "translate(-50%, -50%)",
              }}
            />
          </div>

          {/* Camera label top */}
          <div
            style={{
              position: "absolute",
              top: 24,
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "center",
              gap: 8,
              alignItems: "center",
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--sf-warm-100)",
            }}
          >
            <span>FRONT HAZCAM</span>
          </div>

          {/* Camera labels bottom corners */}
          <div
            style={{
              position: "absolute",
              bottom: 24,
              left: 24,
              fontFamily: MONO,
              fontSize: 10,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--sf-warm-400)",
            }}
          >
            LEFT HAZCAM
          </div>
          <div
            style={{
              position: "absolute",
              bottom: 24,
              right: 24,
              fontFamily: MONO,
              fontSize: 10,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--sf-warm-400)",
            }}
          >
            RIGHT HAZCAM
          </div>

          {/* REC indicator */}
          <div
            style={{
              position: "absolute",
              top: 24,
              right: 24,
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontFamily: MONO,
              fontSize: 10,
              letterSpacing: "0.08em",
              color: "var(--sf-warm-100)",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: "var(--sf-mars-rust)",
                animation: "camera-blink 1s steps(1) infinite",
              }}
            />
            REC
          </div>
        </div>

        {/* Camera info bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 24px",
            borderTop: "1px solid var(--sf-warm-800)",
          }}
        >
          <div
            style={{
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: "0.06em",
              color: "var(--sf-warm-400)",
              textTransform: "uppercase",
            }}
          >
            DEC. 8, 2025 (SOL 1707)
          </div>
        </div>

        {/* Audio bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "10px 24px",
            borderTop: "1px solid var(--sf-warm-800)",
            gap: 12,
            overflow: "hidden",
          }}
        >
          {/* Play icon */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="var(--sf-warm-400)"
          >
            <polygon points="3,1 13,8 3,15" />
          </svg>

          {/* Audio waveform bars */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              height: 20,
            }}
          >
            {[3, 8, 5, 12, 7, 15, 10, 6, 14, 9, 4, 11, 8, 13, 6, 10, 7, 15, 5, 12].map(
              (h, i) => (
                <div
                  key={i}
                  style={{
                    width: 2,
                    height: h,
                    background: "var(--sf-warm-500)",
                    borderRadius: 1,
                  }}
                />
              )
            )}
          </div>

          {/* Marquee text */}
          <div
            style={{
              flex: 1,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <div
              style={{
                display: "flex",
                whiteSpace: "nowrap",
                animation: "marquee-scroll 12s linear infinite",
                fontFamily: SERIF,
                fontSize: 13,
                color: "var(--sf-warm-400)",
              }}
            >
              <span style={{ paddingRight: 48 }}>
                Sounds of Perseverance Mars rover driving
              </span>
              <span style={{ paddingRight: 48 }}>
                Sounds of Perseverance Mars rover driving
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
