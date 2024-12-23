
import { getCallLogs } from "@/api/api";
import { CallLogsTypes } from "@/types/user";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const useCallLogController = () => {
  const { userId } = useParams();
  const [callLogs, setCallLogs] = useState<CallLogsTypes[] | []>([]);
  const [page, setPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const noOfFetchRecords = 20;

  const fetchCallLogs = useCallback(async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      const startRecord = callLogs?.length
      const endRecord = page * noOfFetchRecords;
      if (userId) {
        const response = await getCallLogs(userId, endRecord, startRecord);
        if (response.data) {
          setCallLogs((prevLogs) => [...prevLogs, ...response.data]);
        }
      }
    } catch (error) {
      console.error("Error fetching call logs:", error);
    } finally {
      setIsLoading(false);
    }
  }, [callLogs?.length, isLoading, page, userId]);

  useEffect(() => {
    if (userId) {
      fetchCallLogs();
    }
  }, [userId, page]);


  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const handleScroll = (e: React.UIEvent<HTMLElement>) => {
    const bottom = e.currentTarget.scrollHeight === e.currentTarget.scrollTop + e.currentTarget.clientHeight;
    if (bottom && !isLoading) {
      setPage((prev) => prev + 1);
    }
  };

  function formatDateWithLabels(dateString: string) {
    const now = new Date();
    const date = new Date(dateString);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (date >= today) {
      return `Today, ${date.toLocaleString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })}`;
    } else if (date >= yesterday) {
      return "Yesterday";
    } else {
      return date.toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    }
  }

  return {
    callLogs,
    formatTime,
    handleScroll,
    formatDateWithLabels,
  }
}

export default useCallLogController;

// click then one dive open above 
// display profile, call , message, , last call duration, time