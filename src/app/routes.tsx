import { createBrowserRouter } from "react-router";
import Landing from "./pages/Landing";
import Analyze from "./pages/Analyze";
import Results from "./pages/Results";
import Plan from "./pages/Plan";

export const router = createBrowserRouter([
  { path: "/", element: <Landing /> },
  { path: "/analyze", element: <Analyze /> },
  { path: "/results", element: <Results /> },
  { path: "/plan", element: <Plan /> },
]);
