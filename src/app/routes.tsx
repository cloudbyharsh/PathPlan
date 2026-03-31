import { createBrowserRouter } from "react-router";
import Landing from "./pages/Landing";
import Analyze from "./pages/Analyze";
import Results from "./pages/Results";
import PlanConfig from "./pages/PlanConfig";
import Plan from "./pages/Plan";
import CheckIn from "./pages/CheckIn";

export const router = createBrowserRouter([
  { path: "/",            element: <Landing /> },
  { path: "/analyze",     element: <Analyze /> },
  { path: "/results",     element: <Results /> },
  { path: "/plan-config", element: <PlanConfig /> },
  { path: "/plan",        element: <Plan /> },
  { path: "/checkin",     element: <CheckIn /> },
]);
