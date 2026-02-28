"use client";

export function MarsSignal() {
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
@keyframes pulsate-signal {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}
`,
        }}
      />
      <svg
        width="100%"
        height="24"
        viewBox="0 0 540 24"
        fill="none"
        style={{ display: "block", margin: "0 auto", maxWidth: 540 }}
      >
        {/* Large outer circles */}
        <circle
          cx="16"
          cy="12"
          r="5"
          fill="var(--sf-warm-100)"
          style={{
            animation:
              "pulsate-signal 4s cubic-bezier(0.895, 0.03, 0.685, 0.22) 1.5s infinite",
            transformOrigin: "16px 12px",
          }}
        />
        <circle
          cx="70"
          cy="12"
          r="5"
          fill="var(--sf-warm-100)"
          style={{
            animation:
              "pulsate-signal 4s cubic-bezier(0.895, 0.03, 0.685, 0.22) 1.65s infinite",
            transformOrigin: "70px 12px",
          }}
        />
        {/* Inner smaller circles with different delays */}
        <circle
          cx="124"
          cy="12"
          r="4"
          fill="var(--sf-warm-300)"
          style={{
            animation:
              "pulsate-signal 4s cubic-bezier(0.895, 0.03, 0.685, 0.22) 0s infinite",
            transformOrigin: "124px 12px",
          }}
        />
        <circle
          cx="178"
          cy="12"
          r="4"
          fill="var(--sf-warm-300)"
          style={{
            animation:
              "pulsate-signal 4s cubic-bezier(0.895, 0.03, 0.685, 0.22) 0.8s infinite",
            transformOrigin: "178px 12px",
          }}
        />
        {/* Smaller dots */}
        <circle cx="232" cy="12" r="3" fill="var(--sf-warm-400)" />
        <circle cx="270" cy="12" r="3" fill="var(--sf-warm-400)" />
        <circle
          cx="308"
          cy="12"
          r="3"
          fill="var(--sf-warm-400)"
          style={{
            animation:
              "pulsate-signal 4s cubic-bezier(0.895, 0.03, 0.685, 0.22) 0.4s infinite",
            transformOrigin: "308px 12px",
          }}
        />
        <circle cx="346" cy="12" r="2.5" fill="var(--sf-warm-500)" />
        <circle cx="378" cy="12" r="2.5" fill="var(--sf-warm-500)" />
        <circle
          cx="410"
          cy="12"
          r="2"
          fill="var(--sf-warm-600)"
          style={{
            animation:
              "pulsate-signal 4s cubic-bezier(0.895, 0.03, 0.685, 0.22) 1.2s infinite",
            transformOrigin: "410px 12px",
          }}
        />
        <circle cx="438" cy="12" r="2" fill="var(--sf-warm-600)" />
        <circle cx="462" cy="12" r="1.5" fill="var(--sf-warm-700)" />
        <circle cx="484" cy="12" r="1.5" fill="var(--sf-warm-700)" />
        <circle
          cx="506"
          cy="12"
          r="1.5"
          fill="var(--sf-warm-700)"
          style={{
            animation:
              "pulsate-signal 4s cubic-bezier(0.895, 0.03, 0.685, 0.22) 0.6s infinite",
            transformOrigin: "506px 12px",
          }}
        />
        <circle cx="524" cy="12" r="1" fill="var(--sf-warm-700)" />
      </svg>
    </>
  );
}
