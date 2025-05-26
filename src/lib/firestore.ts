import { useEffect, useState } from "react";
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
} from "firebase/firestore";
import { auth, db } from "../firebase";
import { LogItem, NewLogItem } from "../types";

// AdminPanel component has been removed from this file

// // 🔸 新規作成（id 自動生成）
// export const saveNewHealthLog = async (log: Omit<LogItem, "id">) => {
//   const uid = auth.currentUser?.uid;
//   if (!uid) throw new Error("未ログイン");

//   const id = Date.now().toString(); // ← ここで id を作る
//   const logWithUid = { ...log, id, uid };

//   const docRef = doc(db, "healthLogs", id);
//   await setDoc(docRef, logWithUid);
//   return id;
// };

// 新規ログを作成（idを生成）
export const saveNewHealthLog = async (log: NewLogItem) => {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("未ログイン");

  const id = Date.now().toString(); // ← ローカルでID生成
  const logWithUid = { ...log, uid };

  const docRef = doc(db, "healthLogs", id);
  await setDoc(docRef, logWithUid);
  return id;
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

export const fetchHealthLogs = async (uid: string) => {
  try {
    const q = query(
      collection(db, "healthLogs"),
      where("uid", "==", uid)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as LogItem[];
  } catch (error) {
    console.error("🔥 取得失敗", error);
    return [];
  }
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
    await deleteDoc(docRef);
    console.log("🗑 Firestore削除完了:", id);
  } catch (error) {
    console.error("🔥 Firestore削除エラー:", error);
    throw error;
  }
};