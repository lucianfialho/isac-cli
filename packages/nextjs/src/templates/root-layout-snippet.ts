/**
 * Inline script that reads the persisted theme from localStorage and applies
 * it to <html data-theme="…"> BEFORE React hydrates, preventing FOUC.
 *
 * Shared between the design-system layout template and the page-builder prompt
 * so the storage key ("ds-theme") stays in sync everywhere.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("ds-theme")||"light";if(t==="system")t=matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light";document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;
