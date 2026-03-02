export const DESIGN_SYSTEM_LAYOUT_TEMPLATE = `export default function DesignSystemLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: '(function(){try{var t=localStorage.getItem("ds-theme")||"light";if(t==="system")t=matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light";document.documentElement.setAttribute("data-theme",t)}catch(e){}})()',
        }}
      />
      <div style={{ background: "var(--color-bg-primary)", color: "var(--color-text-primary)", minHeight: "100vh" }}>
        {children}
      </div>
    </>
  );
}
`;
