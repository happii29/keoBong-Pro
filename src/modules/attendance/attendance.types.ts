export type AttendanceStatus = "going" | "absent" | "late" | "goalkeeper" | "pending";

export type AttendancePlayer = {
  id: string;
  name: string;
  position: string;
  shirtNumber: number;
  status: AttendanceStatus;
  note?: string;
};

export type AttendanceCounts = {
  going: number;
  absent: number;
  late: number;
  goalkeeper: number;
  pending: number;
  total: number;
};
