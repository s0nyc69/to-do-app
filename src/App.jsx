import AuthScreen from "./components/AuthScreen.jsx";
import TaskApp from "./components/TaskApp.jsx";
import { useAuth } from "./hooks/useAuth.js";

function App() {
  const auth = useAuth();

  if (auth.loading) {
    return (
      <main className="auth-loading">
        <span className="brand-mark">
          <svg viewBox="0 0 24 24" width="21" height="21" aria-hidden="true">
            <path d="M7 12.5 10.5 16 17 9.5" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span>Dein Bereich wird geladen…</span>
      </main>
    );
  }

  if (!auth.user) return <AuthScreen auth={auth} />;

  return <TaskApp user={auth.user} onLogout={auth.logout} />;
}

export default App;
