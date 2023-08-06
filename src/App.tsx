import { useOutlet } from "react-router-dom";
import "./App.scss";
import Navbar from "./components/navbar/Navbar";
import Home from "./components/home/Home";

function App() {
  const outlet = useOutlet();

  return (
    <>
      <Navbar />
      <div>{outlet || <Home />}</div>
    </>
  );
}

export default App;
