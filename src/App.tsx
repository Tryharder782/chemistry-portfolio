import './App.css';
import { Navigate, Route, Routes } from 'react-router-dom';
import { routes } from './constants';
import { GuidedIntroScreen as AcidsIntroduction } from './pages/AcidsBases/intro/GuidedIntroScreen';
import { BufferScreen as AcidsBuffers } from './pages/AcidsBases/buffers/BufferScreen';
import { TitrationScreen as AcidsTitration } from './pages/AcidsBases/titration/TitrationScreen';
import AcidsIntroQuiz from './pages/AcidsBases/introQuiz';
import AcidsBuffersQuiz from './pages/AcidsBases/buffersQuiz';
import AcidsTitrationQuiz from './pages/AcidsBases/titrationQuiz';
import AcidsChaptersScreen from './pages/AcidsBases/chapters/AcidsChaptersScreen';
import AcidsIntroHistory from './pages/AcidsBases/introHistory';
import AcidsBuffersHistory from './pages/AcidsBases/buffersHistory';
import AcidsTitrationHistory from './pages/AcidsBases/titrationHistory';

function App() {
  return (
    <Routes>
      {/* AcidsBases portfolio routes */}
      <Route path="/" element={<Navigate to="/acids/chapters" replace />} />
      <Route path={routes.introduction.path} element={<AcidsIntroduction />} />
      <Route path={routes.buffers.path} element={<AcidsBuffers />} />
      <Route path={routes.titration.path} element={<AcidsTitration />} />
      <Route path="/acids/chapters" element={<AcidsChaptersScreen />} />
      <Route path="/acids/introduction/quiz" element={<AcidsIntroQuiz />} />
      <Route path="/acids/buffers/quiz" element={<AcidsBuffersQuiz />} />
      <Route path="/acids/titration/quiz" element={<AcidsTitrationQuiz />} />
      <Route path="/acids/introduction/history" element={<AcidsIntroHistory />} />
      <Route path="/acids/buffers/history" element={<AcidsBuffersHistory />} />
      <Route path="/acids/titration/history" element={<AcidsTitrationHistory />} />
      <Route path="*" element={<Navigate to="/acids/chapters" replace />} />
    </Routes>
  );
}

export default App;
