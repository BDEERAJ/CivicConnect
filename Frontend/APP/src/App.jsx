import { BrowserRouter as Router ,Routes,Route} from "react-router-dom";
import Auth from "./AUTH/auth";
import MainPage from "./navbar/navbar";
import Problems from "./ProblemPage/problem";
import Chat from "./chatLog/Chatlog";
import ChatWindow from "./ChatOne-One/chat";
import Singleproblempage from "./SingleProblemPage/singleproblem";
import Feedback from "./feedback/feedback";
import AddProblem from "./problemUpload/problemupload";
import Profile from "./Profile/profile";
import ResolveProblemContent from "./problemsolution/solution";
import Homepage from "./homepage/homepage";
export default function App() {
  return (
    <div className="App ">
      <Router>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<Homepage />} />
          <Route path="/problems" element={<Problems />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/problems/:id" element={<Singleproblempage />} />
          <Route path="/chat/:contactId" element={<ChatWindow />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/add-problem" element={<AddProblem />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/resolve/:id" element={<ResolveProblemContent />} />
        </Routes>
      </Router>
    </div>
  );
}