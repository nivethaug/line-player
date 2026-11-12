import { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./layout/Layout";
import Home from "./pages/Home";
import Player from "./pages/Player";
import Flipbook from "./pages/Flipbook";
import Line from "./pages/Line";
import Showcase from "./pages/Showcase";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<div className="p-6">Loading...</div>}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/line" replace />} />
              <Route path="/home" element={<Home />} />
              <Route path="/player" element={<Player />} />
              <Route path="/flipbook" element={<Flipbook />} />
              <Route path="/line" element={<Line />} />
              <Route path="/showcase" element={<Showcase />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;