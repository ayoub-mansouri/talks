import TalksPage from "./pages/talks_page/talks_page";
import TalkPage from "./pages/talk_page/talk_page";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./components/navbar/navbar";
import { useAppContext } from "./context";
import NewTalkModal from "./components/new_talk_modal/new_talk_modal";
import JoinPage from "./pages/join_page/join_page";
import NotFountPage from "./pages/notfound_page/notfound_page";

function App() {
  const { showNewTalkModal } = useAppContext();
  return (
    <>
      <main style={{ maxWidth: "1000px", margin: "auto" }}>
        <BrowserRouter>
          {/* <Navbar /> */}
          <Routes>
            <Route exact path="/" element={<TalksPage />} />
            <Route path="/talk/:title" element={<TalkPage />} />
            <Route path="/join" element={<JoinPage />} />
            <Route path="/notfound" element={<NotFountPage />} />
            <Route path="*" element={<NotFountPage />} />
          </Routes>
        </BrowserRouter>
      </main>
      <NewTalkModal show={showNewTalkModal} />
    </>
  );
}

export default App;
