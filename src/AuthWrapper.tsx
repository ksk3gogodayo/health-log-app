// src/AuthWrapper.tsx
import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "./firebase";
import Login from "./Login";
import HealthLogApp from "./components/HealthLogApp";
const AuthWrapper = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      if (err instanceof Error) {
        alert("ログアウト失敗：" + err.message);
      } else {
        alert("ログアウト失敗：不明なエラーです");
      }
    }
  };

  if (!user) return <Login />;

  return (
    <div>
      <button
        onClick={handleLogout}
        style={{
          backgroundColor: "#dc3545",
          color: "white",
          border: "none",
          padding: "8px 12px",
          borderRadius: "6px",
          cursor: "pointer",
          margin: "10px",
        }}
      >
        ログアウト
      </button>
      <HealthLogApp />
    </div>
  );
};

export default AuthWrapper;
