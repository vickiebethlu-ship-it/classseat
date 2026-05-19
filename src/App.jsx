import React, { useState, useEffect, useMemo, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, doc, setDoc, getDoc, getDocs,
  onSnapshot, updateDoc, deleteDoc, writeBatch 
} from 'firebase/firestore';
import { 
  getAuth, signInAnonymously, onAuthStateChanged 
} from 'firebase/auth';
import { 
  Users, UserPlus, Trash2, RotateCcw, HelpCircle, 
  Dices, FileSpreadsheet, Save, X, Check, Laptop, Sparkles, Upload, User, UserCheck, PlayCircle, Printer, Settings2, Ban, Sliders, AlertTriangle, Calendar, Eye
} from 'lucide-react';

// === 修改為透過環境變數讀取 Firebase 設定 ===
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'seat-mgmt-app'; // 固定 App ID

const CHINESE_FONT_STACK = '"PingFang TC", "Heiti TC", "Microsoft JhengHei", "微軟正黑體", "Noto Sans TC", sans-serif';

export default function App() {
  const [user, setUser] = useState(null);
  const [students, setStudents] = useState([]);
  const [seats, setSeats] = useState({}); // { seatId: studentId }
  const [disabledSeats, setDisabledSeats] = useState([]); // 被老師標記為「不可用」的座位
  const [grid, setGrid] = useState({ rows: 4, cols: 6 }); // 座位表維度
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importText, setImportText] = useState('');
  const [isLotteryRunning, setIsLotteryRunning] = useState(false);
  const [alertMsg, setAlertMsg] = useState('');
  const [confirmDialog, setConfirmDialog] = useState(null);
  
  // 歷史紀錄相關狀態
  const [historyRecords, setHistoryRecords] = useState([]); // [{ id, name, seats, grid, createdAt }]
  const [isSaveHistoryModalOpen, setIsSaveHistoryModalOpen] = useState(false);
  const [newHistoryName, setNewHistoryName] = useState('');
  const [viewingHistory, setViewingHistory] = useState(null); // 正在查看的歷史紀錄

  // 手動安排座位時的衝突提示狀態
  const [manualAssignWarning, setManualAssignWarning] = useState(null); // { seatId, studentId, violations: [] }
  
  // 特殊條件設定狀態
  const [isConditionsModalOpen, setIsConditionsModalOpen] = useState(false);
  const [conditionsTab, setConditionsTab] = useState('together'); // 'together' | 'rows' | 'history'
  const [selectedGroupStudents, setSelectedGroupStudents] = useState([]); // 已選擇的互斥群組名單
  const [togetherSearch, setTogetherSearch] = useState(''); // 互斥學生搜尋欄
  const [constraintsSearch, setConstraintsSearch] = useState('');
  const [constraints, setConstraints] = useState({
    avoidTogether: [],     // [[studentId1, studentId2, studentId3...], ...]
    rowRestrictions: {},   // { [studentId]: [rowIndices] }
    avoidLastRow: []       // [studentId, ...]
  });

  const [isDownloading, setIsDownloading] = useState(false);
  const pdfRef = useRef(null);