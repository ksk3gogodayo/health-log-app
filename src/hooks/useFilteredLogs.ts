import { useMemo } from "react";
import { LogItem } from "../types";

const padDate = (date: string): string => {
  const parts = date.split(/[-/]/);
  const year = parts[0]?.padStart(4, "0") || "0000";
  const month = parts[1]?.padStart(2, "0") || "00";
  const day = parts[2]?.padStart(2, "0") || "00";
  return `${year}-${month}-${day}`;
};

export const useFilteredLogs = (logs: LogItem[], selectedDate: string | null) => {
  const todayDate = new Date().toISOString().split("T")[0];

  const filteredLogs = useMemo(() => {
    if (!selectedDate) return logs;
    return logs.filter((log) => {
      const logDate = padDate(log.date);
      return logDate === selectedDate;
    });
  }, [logs, selectedDate]);

  const pastLogs = useMemo(() => {
    return logs.filter((log) => {
      const logDate = padDate(log.date);
      return logDate < todayDate && logDate !== "日付未設定";
    });
  }, [logs]);

  return { filteredLogs, pastLogs };
};