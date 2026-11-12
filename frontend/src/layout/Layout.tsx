import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";

/**
 * Layout component - Main application layout wrapper
 * 
 * Provides the base structure for all pages using React Router nested routes.
 * Pages render inside the <Outlet /> component.
 * 
 * Structure:
 * - Full viewport height (h-screen)
 * - Flex container for future sidebar/header support
 * - Scrollable main content area
 */
const Layout = () => {
  /* ?embed=1 renders a page bare (used by the Line device-preview frames) */
  const loc = useLocation();
  const embed = new URLSearchParams(loc.search).get("embed") === "1";
  /* Line is an app-style, single-screen page: no top bar */
  const bare = embed || loc.pathname.startsWith("/line");
  return (
    <div className="flex h-screen w-full overflow-hidden" data-da-source="src/layout/Layout.tsx:Layout">
      <div className="flex flex-col flex-1">
        {bare ? null : <Navbar />}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
