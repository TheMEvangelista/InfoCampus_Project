import { useState } from "react";

let persistedMobileOpen = false;
let persistedCollapsed = false;

export function useSidebarControls(isDesktop: boolean) {
  const [mobileOpen, setMobileOpen] = useState(persistedMobileOpen);
  const [collapsed, setCollapsed] = useState(persistedCollapsed);

  function toggleSidebar() {
    if (isDesktop) {
      setCollapsed((current) => {
        persistedCollapsed = !current;
        return persistedCollapsed;
      });
      return;
    }

    setMobileOpen((current) => {
      persistedMobileOpen = !current;
      return persistedMobileOpen;
    });
  }

  function closeMobileSidebar() {
    persistedMobileOpen = false;
    setMobileOpen(false);
  }

  function collapseSidebar() {
    persistedCollapsed = true;
    setCollapsed(true);
    closeMobileSidebar();
  }

  return { mobileOpen, collapsed, toggleSidebar, closeMobileSidebar, collapseSidebar };
}
