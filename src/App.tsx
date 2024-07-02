import { useOutlet } from "react-router-dom";
import "./App.scss";
import Navbar from "./components/navbar/Navbar";
import Home from "./components/home/Home";
import ErrorBoundary from "./components/error/ErrorBoundary";

function App() {
  const outlet = useOutlet();

  return (
    <ErrorBoundary>
      <Navbar />
      <div className="main-container">{outlet || <Home />}</div>
    </ErrorBoundary>
  );
}

export default App;
