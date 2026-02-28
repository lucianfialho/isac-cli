export default function DesignSystemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "var(--color-bg-primary)",
        color: "var(--color-text-primary)",
        minHeight: "100vh",
      }}
    >
      {children}
    </div>
  );
}
