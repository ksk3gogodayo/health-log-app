// src/Login.tsx
import { useState, useEffect } from "react";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "./firebase";
import SignUp from "./SignUp";
import { getSeason } from "./lib/getSeason";
import { seasonThemes } from "./lib/theme";

const guestEmail = "guest@example.com";
const guestPassword = "guest1234";

const Login = () => {
  const season = getSeason();
  const theme = seasonThemes[season];

  const [mode, setMode] = useState<"light" | "dark">("light");

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = (e: MediaQueryListEvent) =>
      setMode(e.matches ? "dark" : "light");

    setMode(mq.matches ? "dark" : "light");
    mq.addEventListener("change", listener);

    return () => mq.removeEventListener("change", listener);
  }, []);

  const fontColor = mode === "dark" ? theme.darkColor : theme.lightColor;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showSignUp, setShowSignUp] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError("ログインに失敗しました！");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Googleログイン失敗:", error);
    }
  };

  const handleGuestLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, guestEmail, guestPassword);
      // ログイン後の遷移（既存のままでOK）
    } catch (error) {
      alert("ゲストログインに失敗しました");
    }
  };

  if (showSignUp) {
    return (
      <div
        style={{
          background: theme.background,
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "100vh",
          padding: "2rem",
          color: fontColor,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h1
          style={{
            textShadow: "0 0 8px rgba(0,0,0,0.5)",
            marginBottom: "1rem",
          }}
        >
          新規登録
        </h1>
        <SignUp setShowLogin={() => setShowSignUp(false)} />
        <p style={{ marginTop: "1rem", textShadow: "0 0 6px rgba(0,0,0,0.4)" }}>
          すでにアカウントをお持ちの方は{" "}
          <button
            onClick={() => setShowSignUp(false)}
            style={{
              background: "none",
              border: "none",
              color: "#0077cc",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            ログインへ戻る
          </button>
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        background: theme.background,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        color: fontColor,
        padding: "2rem",
      }}
    >
      <h1
        style={{
          marginBottom: "0.5rem",
          textShadow: "0 0 8px rgba(0,0,0,0.5)",
        }}
      >
        体調記録アプリへようこそ
      </h1>

      <p
        style={{
          marginBottom: "2rem",
          fontWeight: "bold",
          textShadow: "0 0 8px rgba(0,0,0,0.5)",
        }}
      >
        {theme.message}
      </p>

      <form
        onSubmit={handleLogin}
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.85)",
          padding: "2rem",
          borderRadius: "12px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
          color: "#000",
          minWidth: "280px",
        }}
      >
        <h2>ログイン</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <input
          type="email"
          placeholder="メールアドレス"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem" }}
        />
        <input
          type="password"
          placeholder="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: "100%", marginBottom: "0.5rem", padding: "0.5rem" }}
        />
        <button type="submit" style={{ width: "100%", padding: "0.5rem" }}>
          ログイン
        </button>

        <button
          type="button"
          onClick={handleGoogleLogin}
          style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
        >
          Googleでログイン
        </button>

        <p style={{ marginTop: "1rem", textAlign: "center" }}>
          アカウントをお持ちでない方は{" "}
          <button
            type="button"
            onClick={() => setShowSignUp(true)}
            style={{
              background: "none",
              border: "none",
              color: "#0077cc",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            新規登録
          </button>
          {/* ...既存のログインUI */}
          <button
            type="button"
            onClick={handleGuestLogin}
            style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
          >
            ゲストログイン
          </button>
        </p>
      </form>
    </div>
  );
};

export default Login;
