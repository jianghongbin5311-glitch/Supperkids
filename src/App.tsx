import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Home from "./pages/Home";
import Training from "./pages/Training";
import Rewards from "./pages/Rewards";
import ParentSettings from "./pages/ParentSettings";
import Stories from "./pages/Stories";
import Rhymes from "./pages/Rhymes";
import NotFound from "./pages/NotFound";
import { initializeSpeechSynthesis } from "@/utils/audio";

const queryClient = new QueryClient();

const App = () => {
  // Initialize speech synthesis on app start
  useEffect(() => {
    initializeSpeechSynthesis();
  }, []);

  // Auto-request microphone permission on app start
  useEffect(() => {
    const requestMicrophonePermission = async () => {
      try {
        // Check if permission API is available
        if (navigator.permissions) {
          const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          
          // If permission is not granted, request it
          if (permissionStatus.state === 'prompt') {
            try {
              const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
              // Immediately stop the stream since we only need permission
              stream.getTracks().forEach(track => track.stop());
            } catch (error) {
              // User denied permission or error occurred
              console.log('Microphone permission request:', error);
            }
          }
        } else {
          // Fallback for browsers that don't support Permissions API
          // Try to request permission directly
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
          } catch (error) {
            // Permission denied or not available
            console.log('Microphone permission request:', error);
          }
        }
      } catch (error) {
        // Permissions API not supported or other error
        console.log('Permission check not available:', error);
      }
    };

    // Request permission after a short delay to ensure page is loaded
    const timer = setTimeout(() => {
      requestMicrophonePermission();
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/training" element={<Training />} />
            <Route path="/rewards" element={<Rewards />} />
            <Route path="/parent" element={<ParentSettings />} />
            <Route path="/stories" element={<Stories />} />
            <Route path="/rhymes" element={<Rhymes />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
