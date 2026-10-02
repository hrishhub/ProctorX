import Exam from "./Exam";
import Admin from "./Admin";

function App() {
  const path = window.location.pathname;

  if (path === "/admin") {
    return <Admin />;
  }

  return <Exam />;
}

export default App;