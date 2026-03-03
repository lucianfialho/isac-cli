import { THEME_INIT_SCRIPT } from "./root-layout-snippet.js";

export const DESIGN_SYSTEM_LAYOUT_TEMPLATE = `export default function DesignSystemLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: '${THEME_INIT_SCRIPT}',
        }}
      />
      <div style={{ background: "var(--color-bg-primary)", color: "var(--color-text-primary)", minHeight: "100vh" }}>
        {children}
      </div>
    </>
  );
}
`;
