import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css"; // スタイル読み込み
import { fetchHealthLogs, saveHealthLog, deleteHealthLog, updateHealthLog } from "../lib/firestore.ts";

import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";


// 花粉レベルの型
type PollenLevel = "弱" | "中" | "強";

// 薬チェック用の型
const messages = [
  "🌿 今日もおつかれさま",
  "😊 記録しててえらいね",
  "🍵 無理せんと、ゆるっといこう",
  "🌸 深呼吸、忘れてない？",
  "💪 小さな一歩でも前進やで",
  "☁️ 曇ってても、心は晴れるよ"
];
type Meds = {
    asacol: boolean;
    clearmin: boolean;
    ebios: boolean;
};

// 体調ログの型（1件分）
type LogItem = {
    id?: string; // ← これ追加！（Firestore用ID）
    date: string;
    time: string;
    memo: string;
    meds: Meds;
    pollenLevel: PollenLevel | "";
    uid: string; // ← 追加！
};

const HealthLogApp = () => {
    
    // ステート管理
    const [memo, setMemo] = useState<string>("");
    const [meds, setMeds] = useState<Meds>({
        asacol: false,
        clearmin: false,
        ebios: false,
    });
    const [pollenLevel, setPollenLevel] = useState<PollenLevel | "">("");
    const [editIndex, setEditIndex] = useState<number | null>(null); // 👈 追加  
    const [logList, setLogList] = useState<LogItem[]>(() => {
        const storedLogs = localStorage.getItem("healthLog");
        return storedLogs ? JSON.parse(storedLogs) : [];
    });
    const [todayMessage, setTodayMessage] = useState("");

    // 追加
const [user, setUser] = useState(null);

useEffect(() => {
  const unsub = onAuthStateChanged(auth, (firebaseUser) => {
    setUser(firebaseUser);
  });
  return () => unsub();
}, []);

    useEffect(() => {
      const random = Math.floor(Math.random() * messages.length);
      setTodayMessage(messages[random]);
    }, []);


    useEffect(() => {
        const loadLogs = async () => {
            const fetchedLogs = await fetchHealthLogs();
            setLogList(fetchedLogs as LogItem[]);
        };
        loadLogs();
    }, []);

    // Firestoreからログ取得（初回だけ実行）
    useEffect(() => {
        const loadLogs = async () => {
            const fetchedLogs = await fetchHealthLogs();
            setLogList(fetchedLogs as LogItem[]);
        };
        loadLogs();
    }, []);

    useEffect(() => {
        localStorage.setItem("healthLog", JSON.stringify(logList));
    }, [logList]);

    // 日付ステートを追加
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    // 1件のログをMarkdown形式に変換
    const formatToMarkdown = (log: LogItem) => {
        return `## ${log.date}｜体調記録

- 🕒 ${log.time}
- 📝 ${log.memo}
- 💊 アサコール ${log.meds.asacol ? "✔️" : "❌"} / クリアミン ${log.meds.clearmin ? "✔️" : "❌"} / エビオス ${log.meds.ebios ? "✔️" : "❌"}
- 🍃 花粉レベル：${log.pollenLevel || "未入力"}
`;
    };

    // 全件ログをMarkdownでコピー
    const copyAllLogsMarkdown = () => {
        if (logList.length === 0) {
            alert("記録がありません");
            return;
        }
        const allMarkdown = logList.map(formatToMarkdown).join("\n---\n\n");
        navigator.clipboard.writeText(allMarkdown);
        alert("すべての記録をMarkdownでコピーしました！");
    };

    // チェックボックス処理
    const handleMedsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setMeds((prev) => ({
            ...prev,
            [name]: checked,
        }));
    };

    // 記録処理
    const handleSubmit = async () => {
        const now = new Date();
        const newLog: LogItem = {
          date: now.toLocaleDateString(),
          time: now.toLocaleTimeString(),
          memo,
          meds,
          pollenLevel,
          uid: user?.uid || "",
        };
      
        if (editIndex !== null) {
          const editedLog = { ...newLog, id: logList[editIndex].id };
      
          setLogList((prev) => {
            const updated = [...prev];
            updated[editIndex] = editedLog;
            return updated;
          });
          setEditIndex(null);
      
          if (editedLog.id) {
            await updateHealthLog(editedLog.id, editedLog);
            const updatedLogs = await fetchHealthLogs();
            setLogList(updatedLogs as LogItem[]);
          }
        } else {
          const id = await saveHealthLog(newLog); // ← id を受け取る
          if (id) {
            setLogList((prev) => [...prev, { ...newLog, id }]); // ← id付きで保存
          }
        }
      
        setMemo("");
        setMeds({ asacol: false, clearmin: false, ebios: false });
        setPollenLevel("");
        alert("記録されました！");
      };

    // 編集処理
    const handleEdit = (index: number) => {
        const log = logList[index];
        setMemo(log.memo);
        setMeds(log.meds);
        setPollenLevel(log.pollenLevel);
        setEditIndex(index); // ← これで「編集中」にする！
    };

    // 削除処理
    const handleDelete = (index: number) => {
        const log = logList[index];
        console.log("🧾 削除対象ログ:", log);

        if (!window.confirm("この記録を削除しますか？")) return;

        if (log.id) {
            console.log("🗑 Firestore削除実行:", log.id);
            deleteHealthLog(log.id)
                .then(() => {
                    console.log("✅ Firestore削除成功:", log.id);
                    alert("Firestoreから削除されました！");
                })
                .catch((e) => {
                    console.error("🔥 Firestore削除失敗:", e);
                    alert("Firestoreの削除に失敗しました！");
                });
        } else {
            console.warn("❗ log.id が undefined なのでFirestore削除できない");
        }

        setLogList((prev) => prev.filter((_, i) => i !== index));
        if (editIndex === index) setEditIndex(null);
    };

    // カレンダーで選んだ日付に合わせてログを絞る
    const filteredLogs = selectedDate
        ? logList.filter((log) => log.date === selectedDate.toLocaleDateString())
        : logList;

    return (
        <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
            <style>
{`
  textarea {
    font-size: 16px;
    padding: 12px;
    border-radius: 6px;
    box-shadow: 0 0 3px rgba(0,0,0,0.1);
    width: 100%;
    margin-bottom: 12px;
  }

  button {
    font-size: 16px;
    padding: 10px 16px;
    margin-bottom: 8px;
    border-radius: 6px;
    min-height: 44px;
  }

  @media (max-width: 600px) {
    .calendar {
      font-size: 14px;
    }
  }

  @media (prefers-color-scheme: dark) {
    body {
      background-color: #121212;
      color: #eeeeee;
    }

    textarea,
    button {
      background-color: #1e1e1e;
      color: #f0f0f0;
      border: 1px solid #444;
    }

    .calendar {
      background-color: #1e1e1e;
      color: #fff;
    }

    .calendar abbr {
      color: #f0f0f0;
    }

    div {
      background-color: #1a1a1a;
    }

    .log-entry {
      background-color: #1e1e1e !important;
      color: #f0f0f0;
      border: 1px solid #444;
    }
    
    label {
      color: #f0f0f0;
    }
    
    button:hover {
      opacity: 0.85;
      transition: 0.2s;
    }
  }
`}
</style>
            <h2>体調記録アプリ</h2>
            <p style={{ fontSize: "18px", color: "#666", marginBottom: "10px" }}>{todayMessage}</p>

            {/* ✅ カレンダーをここに追加 */}
            <Calendar
                className="calendar"
                onChange={setSelectedDate}
                value={selectedDate}
                style={{ marginBottom: "20px" }}
            />

            {filteredLogs.length > 0 ? (
                filteredLogs.map((log, index) => (
                    <div
                        key={index}
                        className="log-entry"
                        style={{
                            border: "1px solid #ccc",
                            borderRadius: "8px",
                            padding: "15px",
                            marginBottom: "15px",
                            backgroundColor: "#fff",
                            boxShadow: "0 2px 5px rgba(0,0,0,0.05)",
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <strong>
                                {log.date} / {log.time}
                            </strong>
                            <div style={{ display: "flex", gap: "10px" }}>
                                <button
                                    onClick={() => handleEdit(index)}
                                    style={{
                                        backgroundColor: "#007bff",
                                        color: "white",
                                        border: "none",
                                        padding: "5px 10px",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                    }}
                                >
                                    編集
                                </button>
                                <button
                                    onClick={() => handleDelete(index)}
                                    style={{
                                        backgroundColor: "#dc3545",
                                        color: "white",
                                        border: "none",
                                        padding: "5px 10px",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                    }}
                                >
                                    削除
                                </button>
                                <button
                                    onClick={() => {
                                        const markdown = formatToMarkdown(log);
                                        navigator.clipboard.writeText(markdown);
                                        alert("Markdownをコピーしました！");
                                    }}
                                    style={{
                                        backgroundColor: "#28a745",
                                        color: "white",
                                        border: "none",
                                        padding: "5px 10px",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                    }}
                                >
                                    Markdownコピー
                                </button>
                            </div>
                        </div>

                        <p>{log.memo}</p>
                        <ul>
                            <li>アサコール: {log.meds.asacol ? "✔️" : "❌"}</li>
                            <li>クリアミン: {log.meds.clearmin ? "✔️" : "❌"}</li>
                            <li>エビオス: {log.meds.ebios ? "✔️" : "❌"}</li>
                            <li>花粉レベル: {log.pollenLevel || "未入力"}</li>
                        </ul>
                    </div>
                ))
            ) : (
                <p>まだ記録はありません。</p>
            )}

            {editIndex !== null && (
                <div style={{ marginBottom: "10px", color: "green" }}>
                    編集モード：{logList[editIndex].date} / {logList[editIndex].time} の記録を編集中
                </div>
            )}

            {/* 体調メモ */}
            <textarea
                rows={3}
                placeholder="今日の体調をひとことで..."
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                style={{ marginBottom: "0px" }}
            />

            {/* 薬チェック */}
            <div style={{ marginTop: "10px" }}>
                <label>
                    <input
                        type="checkbox"
                        name="asacol"
                        checked={meds.asacol}
                        onChange={handleMedsChange}
                    />
                    アサコール
                </label>
                <label>
                    <input
                        type="checkbox"
                        name="clearmin"
                        checked={meds.clearmin}
                        onChange={handleMedsChange}
                    />
                    クリアミン
                </label>
                <label>
                    <input
                        type="checkbox"
                        name="ebios"
                        checked={meds.ebios}
                        onChange={handleMedsChange}
                    />
                    エビオス
                </label>
            </div>

            {/* 花粉レベル */}
            <div style={{ marginTop: "10px" }}>
                <label>
                    花粉レベル：
                    <select
                        value={pollenLevel}
                        onChange={(e) => setPollenLevel(e.target.value as PollenLevel)}
                    >
                        <option value="">選択してください</option>
                        <option value="弱">弱</option>
                        <option value="中">中</option>
                        <option value="強">強</option>
                    </select>
                </label>
            </div>

            {/* 記録ボタン */}
            <button style={{ marginTop: "10px" }} onClick={handleSubmit}>
                記録する
            </button>
            <button
                onClick={copyAllLogsMarkdown}
                style={{
                    marginBottom: "10px",
                    backgroundColor: "#6c757d",
                    color: "white",
                    border: "none",
                    padding: "8px 12px",
                    borderRadius: "4px",
                    cursor: "pointer",
                }}
            >
                すべての記録をMarkdownでコピー
            </button>

            <hr />

            {/* ログ表示 */}
            <h3>過去の記録一覧</h3>
            {logList.length > 0 ? (

                <p>まだ記録はありません。</p>
            ) : null}
        </div>
    );
};

export default HealthLogApp;
