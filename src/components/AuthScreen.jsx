import { useState } from "react";
import {
  ArrowRight,
  CircleCheck,
  LockKeyhole,
  Mail,
  UserRound,
} from "lucide-react";
import { isSupabaseConfigured } from "../lib/supabase.js";

function AuthScreen({ auth }) {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const isRegistering = mode === "register";

  async function handleSubmit(event) {
    event.preventDefault();
    const credentials = { email: email.trim(), password };
    if (isRegistering) credentials.username = username.trim();
    await auth[isRegistering ? "register" : "login"](credentials);
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setPassword("");
  }

  return (
    <main className="auth-screen">
      <section className="auth-panel" aria-labelledby="auth-heading">
        <a className="brand auth-brand" href="#home" aria-label="Startseite von daymark">
          <span className="brand-mark">
            <CircleCheck size={21} strokeWidth={2.4} />
          </span>
          <span>
            daymark<span className="brand-period">.</span>
          </span>
        </a>
        <div className="auth-eyebrow">
          <span className="eyebrow-line" />EIN KLEINER START FÜR DICH
        </div>
        <h1 id="auth-heading">
          {isRegistering ? "Mach es dir zu eigen" : "Willkommen zurück"}
          <span className="heading-period">.</span>
        </h1>
        <p className="auth-copy">
          {isRegistering
            ? "Erstelle ein Konto und mach Platz für das, was zählt."
            : "Melde dich an und setze dort fort, wo du aufgehört hast."}
        </p>

        <div className="auth-tabs" role="tablist" aria-label="Kontozugang">
          <button
            type="button"
            role="tab"
            aria-selected={!isRegistering}
            className={!isRegistering ? "active" : ""}
            onClick={() => switchMode("login")}
          >
            Anmelden
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={isRegistering}
            className={isRegistering ? "active" : ""}
            onClick={() => switchMode("register")}
          >
            Konto erstellen
          </button>
        </div>

        {!isSupabaseConfigured && (
          <div className="auth-notice" role="status">
            Füge deinen Supabase-Anon-Key zu `.env.local` hinzu, damit der Konto-Zugang aktiviert wird.
          </div>
        )}
        {auth.error && (
          <div className="auth-message error" role="alert">
            {auth.error}
          </div>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <fieldset disabled={!isSupabaseConfigured || auth.busy}>
            {isRegistering && (
              <label className="auth-field">
                <span>Benutzername</span>
                <span className="auth-input-wrap">
                  <UserRound size={17} />
                  <input
                    autoComplete="username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="Wie möchten wir dich nennen?"
                    required
                    minLength={2}
                    maxLength={40}
                  />
                </span>
              </label>
            )}
            <label className="auth-field">
              <span>E-Mail-Adresse</span>
              <span className="auth-input-wrap">
                <Mail size={17} />
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="du@beispiel.de"
                  required
                />
              </span>
            </label>
            <label className="auth-field">
              <span>Passwort</span>
              <span className="auth-input-wrap">
                <LockKeyhole size={17} />
                <input
                  type="password"
                  autoComplete={
                    isRegistering ? "new-password" : "current-password"
                  }
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder={
                    isRegistering ? "Mindestens 8 Zeichen" : "Dein Passwort"
                  }
                  required
                  minLength={isRegistering ? 8 : 1}
                />
              </span>
            </label>
            <button className="auth-submit" type="submit">
              {auth.busy
                ? "Einen Moment…"
                : isRegistering
                  ? "Konto erstellen"
                  : "Anmelden"}
              {!auth.busy && <ArrowRight size={17} />}
            </button>
          </fieldset>
        </form>
        <p className="auth-footnote">
          <LockKeyhole size={13} /> Deine Aufgaben bleiben privat in deinem Konto.
        </p>
      </section>
      <div className="auth-side-note">
        <span>MAK PLATZ FÜR DAS, WAS ZÄHLT</span>
        <i />
      </div>
    </main>
  );
}

export default AuthScreen;
