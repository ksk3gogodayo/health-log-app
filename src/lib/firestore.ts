import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  setDoc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { LogItem, NewLogItem } from "../types";

export const subscribeHealthLogs = (
  uid: string,
  onUpdate: (logs: LogItem[]) => void,
) => {
  const q = query(collection(db, "healthLogs"), where("uid", "==", uid));
  return onSnapshot(q, (snapshot) => {
    console.log("📦 サブスクライブで受け取った snapshot:", snapshot.docs);
    const logs = snapshot.docs.map((doc) => {
      console.log("📘 raw doc:", doc.data()); // ←これ入れて
      return {
        id: doc.id,
        ...doc.data(),
      };
    }) as LogItem[];
    onUpdate(logs);
  });
};

export const fetchHealthLogs = async (uid: string) => {
  try {
    const q = query(collection(db, "healthLogs"), where("uid", "==", uid));
    const snapshot = await getDocs(q); // ← getDocsFromServer → getDocs に修正
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as LogItem[];
  } catch (error) {
    console.error("🔥 取得失敗", error);
    return [];
  }
};

// 新規ログを作成（idを生成）
export const saveNewHealthLog = async (log: NewLogItem) => {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("未ログイン");

  const logWithUid = { ...log, uid };

  const docRef = await addDoc(collection(db, "healthLogs"), logWithUid); // ← 自動ID採用！
  return docRef.id;
};

// 既存ログを上書き保存（編集）
export const saveHealthLog = async (log: LogItem) => {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("未ログイン");

  const logWithUid = { ...log, uid };

  const docRef = doc(db, "healthLogs", log.id);
  await setDoc(docRef, logWithUid);

  return log.id;
};

export const updateHealthLog = async (id: string, data: any) => {
  try {
    const docRef = doc(db, "healthLogs", id);
    await updateDoc(docRef, data);
    console.log("📝 Firestore更新完了:", id);
  } catch (error) {
    console.error("🔥 Firestore更新エラー:", error);
    throw error;
  }
};

export const deleteHealthLog = async (id: string) => {
  try {
    const docRef = doc(db, "healthLogs", id);

    // 🔍 一旦読み込んで uid 確認
    const snap = await getDoc(docRef);
    const data = snap.data();
    console.log("📦 削除対象ログの中身:", data);
    console.log("🧑‍💻 現在のユーザーuid:", auth.currentUser?.uid);

    await deleteDoc(docRef);
    console.log("🗑 Firestore削除完了:", id);
  } catch (error) {
    console.error("🔥 Firestore削除エラー:", error);
    throw error;
  }
};
