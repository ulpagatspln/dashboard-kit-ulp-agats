import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Activity, Battery, Server, AlertCircle, Download, Search, Check,
  Clock, Sun, Zap, Edit, Trash2, X, Save, ArrowUp, ArrowDown,
  ArrowUpDown, Plus, FileSpreadsheet, Cpu, ClipboardList, Calendar,
  Copy, Database, Gauge, Droplet, UserCheck, MapPin
} from 'lucide-react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid
} from 'recharts';

import { db } from './firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function App() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loginUsername, setLoginUsername] = useState('');
  const [loginError, setLoginError] = useState('');

  // STATE MEMBACA FIREBASE
  const [pltsAssets, setPltsAssets] = useState<any[]>([]);
  const [pltdAssets, setPltdAssets] = useState<any[]>([]);
  const [mesinPltd, setMesinPltd] = useState<any[]>([]);
  const [tangkiPltd, setTangkiPltd] = useState<any[]>([]);
  const [pltsLogs, setPltsLogs] = useState<any[]>([]);
  const [pltdLogs, setPltdLogs] = useState<any[]>([]);
  const [mesinLogs, setMesinLogs] = useState<any[]>([]);
  const [produksiLogs, setProduksiLogs] = useState<any[]>([]);
  const [bbmLogs, setBbmLogs] = useState<any[]>([]);

  // SISTEM RADAR REAL-TIME FIREBASE
  useEffect(() => {
    const unsubPlts = onSnapshot(collection(db, "assets_plts"), (snapshot) => {
      setPltsAssets(snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() })));
    });
    const unsubPltd = onSnapshot(collection(db, "assets_pltd"), (snapshot) => {
      setPltdAssets(snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() })));
    });
    const unsubMesin = onSnapshot(collection(db, 'mesin_pltd'), (snapshot) => {
      setMesinPltd(snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() })));
    });
    const unsubTangki = onSnapshot(collection(db, 'tangki_pltd'), (snapshot) => {
      setTangkiPltd(snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() })));
    });
    const unsubPltsLog = onSnapshot(collection(db, 'log_plts'), (snapshot) => {
      setPltsLogs(snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() })));
    });
    const unsubPltdLog = onSnapshot(collection(db, 'log_pltd'), (snapshot) => {
      setPltdLogs(snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() })));
    });
    const unsubMesinLog = onSnapshot(collection(db, 'log_mesin'), (snapshot) => {
      setMesinLogs(snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() })));
    });
    const unsubProdLog = onSnapshot(collection(db, 'log_produksi'), (snapshot) => {
      setProduksiLogs(snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() })));
    });
    const unsubBbmLog = onSnapshot(collection(db, 'log_bbm'), (snapshot) => {
      setBbmLogs(snapshot.docs.map(doc => ({ _id: doc.id, ...doc.data() })));
    });

    return () => {
      unsubPlts(); unsubPltd(); unsubMesin(); unsubTangki();
      unsubPltsLog(); unsubPltdLog(); unsubMesinLog(); unsubProdLog(); unsubBbmLog();
    };
  }, []);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingAsset, setEditingAsset] = useState(null);
  const [deletingAsset, setDeletingAsset] = useState(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [isAddingAsset, setIsAddingAsset] = useState(false);
  const [addFormData, setAddFormData] = useState<any>({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [dashboardSortConfig, setDashboardSortConfig] = useState({ key: 'Status', direction: 'asc' });
  const [dashboardPltdSortConfig, setDashboardPltdSortConfig] = useState({ key: 'nama_pltd', direction: 'asc' });

  const [viewingMesin, setViewingMesin] = useState<any>(null);
  const [viewingPltsSpec, setViewingPltsSpec] = useState<any>(null);
  const mapRef = useRef(null);
  const mapInstance = useRef<any>(null);
  const [isEditingSpec, setIsEditingSpec] = useState(false);
  const [specFormData, setSpecFormData] = useState<any>({});

  const [isAddingMesin, setIsAddingMesin] = useState(false);
  const [mesinAddFormData, setMesinAddFormData] = useState<any>({});
  const [editingMesinId, setEditingMesinId] = useState<any>(null);
  const [mesinEditFormData, setMesinEditFormData] = useState<any>({});
  const [deletingMesin, setDeletingMesin] = useState<any>(null);

  const [viewingTangki, setViewingTangki] = useState<any>(null);
  const [isAddingTangki, setIsAddingTangki] = useState(false);
  const [tangkiAddFormData, setTangkiAddFormData] = useState<any>({});
  const [editingTangkiId, setEditingTangkiId] = useState<any>(null);
  const [tangkiEditFormData, setTangkiEditFormData] = useState<any>({});
  const [deletingTangki, setDeletingTangki] = useState<any>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const [selectedPltsForLog, setSelectedPltsForLog] = useState('');
  const [isAddingLog, setIsAddingLog] = useState(false);
  const [editingLogId, setEditingLogId] = useState<any>(null);
  const [deletingLogId, setDeletingLogId] = useState<any>(null);
  const [logFilterMode, setLogFilterMode] = useState('daily');
  const [logFilterDate, setLogFilterDate] = useState(todayStr);
  const [logFilterMonth, setLogFilterMonth] = useState(new Date().toISOString().substring(0, 7));
  const [logFormData, setLogFormData] = useState<any>({ tanggal: todayStr, jam: '12:00', beban_puncak: '', status: 'Operasi', petugas: [], keterangan: '' });

  const [selectedPltdForLog, setSelectedPltdForLog] = useState('');
  const [isAddingLogPltd, setIsAddingLogPltd] = useState(false);
  const [editingLogPltdId, setEditingLogPltdId] = useState<any>(null);
  const [deletingLogPltdId, setDeletingLogPltdId] = useState<any>(null);
  const [logFilterModePltd, setLogFilterModePltd] = useState('daily');
  const [logFilterDatePltd, setLogFilterDatePltd] = useState(todayStr);
  const [logFilterMonthPltd, setLogFilterMonthPltd] = useState(new Date().toISOString().substring(0, 7));
  const [logPltdFormData, setLogPltdFormData] = useState<any>({ tanggal: todayStr, jam: '12:00', petugas: [], beban_aktif: '', beban_reaktif: '', arus_r: '', arus_s: '', arus_t: '', tegangan_rs: '', tegangan_st: '', tegangan_tr: '', frekuensi: '50.0' });

  const [selectedPltdForMesinLog, setSelectedPltdForMesinLog] = useState('');
  const [isAddingMesinLog, setIsAddingMesinLog] = useState(false);
  const [mesinLogFilterMode, setMesinLogFilterMode] = useState('daily');
  const [mesinLogFilterDate, setMesinLogFilterDate] = useState(todayStr);
  const [mesinLogFilterMonth, setMesinLogFilterMonth] = useState(new Date().toISOString().substring(0, 7));
  const [mesinLogFormData, setMesinLogFormData] = useState<any>({ tanggal: todayStr, jam: '10:00', petugas: [], mesin_data: [] });
  const [viewingMesinLogDetail, setViewingMesinLogDetail] = useState(null);
  const [editingMesinLog, setEditingMesinLog] = useState<any>(null);
  const [deletingMesinLog, setDeletingMesinLog] = useState<any>(null);

  const [selectedPltdForProduksi, setSelectedPltdForProduksi] = useState('');
  const [produksiLogFilterMode, setProduksiLogFilterMode] = useState('monthly');
  const [produksiLogFilterMonth, setProduksiLogFilterMonth] = useState(new Date().toISOString().substring(0, 7));
  const [produksiFormData, setProduksiFormData] = useState<any>({ tanggal: todayStr, petugas: [], stand_kwh_kemarin: '', stand_kwh_hari_ini: '', stand_bbm_kemarin: '', stand_bbm_hari_ini: '' });

  const [selectedPltdForBBM, setSelectedPltdForBBM] = useState('');
  const [isAddingBBM, setIsAddingBBM] = useState(false);
  const [bbmFormData, setBbmFormData] = useState<any>({ tanggal: todayStr, jam: '10:00', jenis_input: 'Penerimaan', referensi: '', petugas: [], tangki_data: [] });

  const [absensiDate, setAbsensiDate] = useState(todayStr);
  const [absensiDatePltd, setAbsensiDatePltd] = useState(todayStr);
  const [notification, setNotification] = useState<any>(null);

  const currentAssets = activeTab === 'assets_pltd' ? pltdAssets : pltsAssets;
  const currentHeaders = currentAssets.length > 0 ? Object.keys(currentAssets[0]).filter(k => k !== '_id') : [];
  const pltsTechKeys = ['kapasitas_battery_kwh', 'kapasitas_batt_inverter_kw', 'kapasitas_grid_inverter_kw', 'kapasitas_panel_pv', 'jumlah_panel', 'jumlah_battery', 'jumlah_batt_inverter', 'jumlah_grid_inverter'];

  // LOGIKA PENGURUTAN KOLOM TABEL INVENTARIS
  let displayHeaders = currentHeaders.filter(h => !(activeTab === 'assets_plts' && pltsTechKeys.includes(h)));
  const prioritasKolom = activeTab === 'assets_pltd'
    ? ['site_id', 'nama_pltd', 'desa', 'kecamatan', 'kabupaten', 'Status', 'daya_terpasang_kw', 'daya_mampu_kw']
    : ['site_id', 'nama_plts', 'desa', 'kecamatan', 'kabupaten', 'Status', 'kapasitas_kwp'];

  displayHeaders.sort((a, b) => {
    const indexA = prioritasKolom.indexOf(a);
    const indexB = prioritasKolom.indexOf(b);
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    return a.localeCompare(b);
  });

  // ANTI-CRASH FILTERING LOGS
  const currentPltsLogs = useMemo(() => {
    if (!selectedPltsForLog) return [];
    let logs = pltsLogs.filter(log => log.site_id === selectedPltsForLog);
    if (logFilterMode === 'daily') logs = logs.filter(log => log.tanggal === logFilterDate);
    else if (logFilterMode === 'monthly') logs = logs.filter(log => (log.tanggal || '').startsWith(logFilterMonth));
    return logs.sort((a, b) => {
      if ((a.tanggal || '') === (b.tanggal || '')) return (b.jam || '').localeCompare(a.jam || '');
      return (b.tanggal || '').localeCompare(a.tanggal || '');
    });
  }, [pltsLogs, selectedPltsForLog, logFilterMode, logFilterDate, logFilterMonth]);

  const currentPltdLogs = useMemo(() => {
    if (!selectedPltdForLog) return [];
    let logs = pltdLogs.filter(log => log.site_id === selectedPltdForLog);
    if (logFilterModePltd === 'daily') logs = logs.filter(log => log.tanggal === logFilterDatePltd);
    else if (logFilterModePltd === 'monthly') logs = logs.filter(log => (log.tanggal || '').startsWith(logFilterMonthPltd));
    return logs.sort((a, b) => {
      if ((a.tanggal || '') === (b.tanggal || '')) return (b.jam || '').localeCompare(a.jam || '');
      return (b.tanggal || '').localeCompare(a.tanggal || '');
    });
  }, [pltdLogs, selectedPltdForLog, logFilterModePltd, logFilterDatePltd, logFilterMonthPltd]);

  const currentMesinLogs = useMemo(() => {
    if (!selectedPltdForMesinLog) return [];
    let logs = mesinLogs.filter(log => log.site_id === selectedPltdForMesinLog);
    if (mesinLogFilterMode === 'daily') logs = logs.filter(log => log.tanggal === mesinLogFilterDate);
    else if (mesinLogFilterMode === 'monthly') logs = logs.filter(log => (log.tanggal || '').startsWith(mesinLogFilterMonth));
    return logs.sort((a, b) => {
      if ((a.tanggal || '') === (b.tanggal || '')) return (b.jam || '').localeCompare(a.jam || '');
      return (b.tanggal || '').localeCompare(a.tanggal || '');
    });
  }, [mesinLogs, selectedPltdForMesinLog, mesinLogFilterMode, mesinLogFilterDate, mesinLogFilterMonth]);

  const currentProduksiLogs = useMemo(() => {
    if (!selectedPltdForProduksi) return [];
    let logs = produksiLogs.filter(log => log.site_id === selectedPltdForProduksi);
    if (produksiLogFilterMode === 'monthly') logs = logs.filter(log => (log.tanggal || '').startsWith(produksiLogFilterMonth));
    return logs.sort((a, b) => (b.tanggal || '').localeCompare(a.tanggal || ''));
  }, [produksiLogs, selectedPltdForProduksi, produksiLogFilterMode, produksiLogFilterMonth]);

  const previousProduksiLog = useMemo(() => {
    if (!selectedPltdForProduksi || !produksiFormData.tanggal) return null;
    const pastLogs = produksiLogs.filter(log => log.site_id === selectedPltdForProduksi && (log.tanggal || '') < produksiFormData.tanggal);
    return pastLogs.sort((a, b) => (b.tanggal || '').localeCompare(a.tanggal || ''))[0];
  }, [produksiLogs, selectedPltdForProduksi, produksiFormData.tanggal]);

  // PENCEGAH INFINITE LOOP
  useEffect(() => {
    if (previousProduksiLog) {
      setProduksiFormData((prev: any) => {
        if (prev.stand_kwh_kemarin === previousProduksiLog.stand_kwh_hari_ini &&
          prev.stand_bbm_kemarin === previousProduksiLog.stand_bbm_hari_ini) {
          return prev;
        }
        return { ...prev, stand_kwh_kemarin: previousProduksiLog.stand_kwh_hari_ini || '0', stand_bbm_kemarin: previousProduksiLog.stand_bbm_hari_ini || '0' };
      });
    }
  }, [previousProduksiLog]);

  const handleLogin = (e: any) => {
    e.preventDefault();
    const uname = loginUsername.trim().toLowerCase();

    if (uname === 'admin') {
      setCurrentUser({ role: 'admin', name: 'Administrator', site_id: 'ALL' });
      setActiveTab('dashboard');
      setLoginError('');
      return;
    }

    const formattedUname = uname.replace(/_/g, ' ');
    const matchPlts = pltsAssets.find(p => p.nama_plts?.toLowerCase() === formattedUname || p.nama_plts?.toLowerCase().replace(/ /g, '_') === uname);

    if (matchPlts) {
      setCurrentUser({ role: 'plts', name: matchPlts.nama_plts, site_id: matchPlts.site_id });
      setSelectedPltsForLog(matchPlts.site_id);
      setActiveTab('log_plts');
      setLoginError('');
      return;
    }

    const matchPltd = pltdAssets.find(p => p.nama_pltd?.toLowerCase() === formattedUname || p.nama_pltd?.toLowerCase().replace(/ /g, '_') === uname);

    if (matchPltd) {
      setCurrentUser({ role: 'pltd', name: matchPltd.nama_pltd, site_id: matchPltd.site_id });
      setSelectedPltdForLog(matchPltd.site_id);
      setSelectedPltdForMesinLog(matchPltd.site_id);
      setSelectedPltdForProduksi(matchPltd.site_id);
      setSelectedPltdForBBM(matchPltd.site_id);
      setActiveTab('log_pltd');
      setLoginError('');
      return;
    }

    setLoginError('Username tidak ditemukan! Coba format "PLTS_Amaru" atau "PLTD_Agats".');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLoginUsername('');
    setActiveTab('dashboard');
    setSelectedPltsForLog('');
    setSelectedPltdForLog('');
    setSelectedPltdForMesinLog('');
    setSelectedPltdForProduksi('');
    setSelectedPltdForBBM('');
  };

  useEffect(() => {
    let isMounted = true;
    const initMap = () => {
      const windowL = window as any;
      if (!mapRef.current || !windowL.L || activeTab !== 'dashboard') return;
      if (mapInstance.current) { mapInstance.current.remove(); }

      const L = windowL.L;
      const map = L.map(mapRef.current).setView([-5.533, 138.455], 7);
      mapInstance.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap contributors' }).addTo(map);

      pltsAssets.forEach(asset => {
        const lat = parseFloat(asset.Latitude);
        const lon = parseFloat(asset.longitude);
        if (!isNaN(lat) && !isNaN(lon)) {
          let markerColor = '#64748b';
          const status = (asset.Status || '').toUpperCase();
          if (status === 'OPERASI') markerColor = '#10b981';
          else if (status === 'GANGGUAN') markerColor = '#ef4444';
          else if (status === 'OPERASI TERBATAS') markerColor = '#f59e0b';
          else if (status === 'ON GOING' || status === 'ONGOING' || status === 'ON PROGRES') markerColor = '#6366f1';

          const circle = L.circleMarker([lat, lon], { radius: 7, fillColor: markerColor, color: '#ffffff', weight: 2, opacity: 1, fillOpacity: 0.9 }).addTo(map);
          circle.bindPopup(`
                    <div style="font-family: sans-serif; min-width: 150px;">
                        <strong style="display:block; margin-bottom: 4px; font-size: 14px; color: #1e293b;">${asset.nama_plts}</strong>
                        <div style="font-size: 12px; margin-bottom: 2px; color: #475569;">Jenis: <b>PLTS</b></div>
                        <div style="font-size: 12px; margin-bottom: 2px; color: #475569;">Kapasitas: <b>${asset.kapasitas_kwp || 0} kWp</b></div>
                        <div style="font-size: 12px; margin-bottom: 2px; color: #475569;">Desa: <b>${asset.desa || '-'}</b></div>
                        <div style="font-size: 12px; margin-bottom: 2px; color: #475569;">Status: <span style="font-weight:bold; color: ${markerColor}">${asset.Status || '-'}</span></div>
                    </div>
                `);
        }
      });

      pltdAssets.forEach(asset => {
        const lat = parseFloat(asset.Latitude);
        const lon = parseFloat(asset.longitude);
        if (!isNaN(lat) && !isNaN(lon)) {
          const markerColor = '#a855f7';
          const circle = L.circleMarker([lat, lon], { radius: 8, fillColor: markerColor, color: '#ffffff', weight: 2, opacity: 1, fillOpacity: 1 }).addTo(map);
          circle.bindPopup(`
                    <div style="font-family: sans-serif; min-width: 150px;">
                        <strong style="display:block; margin-bottom: 4px; font-size: 14px; color: #1e293b;">${asset.nama_pltd}</strong>
                        <div style="font-size: 12px; margin-bottom: 2px; color: #475569;">Jenis: <b>PLTD</b></div>
                        <div style="font-size: 12px; margin-bottom: 2px; color: #475569;">Daya Terpasang: <b>${asset.daya_terpasang_kw || 0} kW</b></div>
                        <div style="font-size: 12px; margin-bottom: 2px; color: #475569;">Daya Mampu: <b>${asset.daya_mampu_kw || 0} kW</b></div>
                        <div style="font-size: 12px; margin-bottom: 2px; color: #475569;">Desa: <b>${asset.desa || '-'}</b></div>
                        <div style="font-size: 12px; margin-bottom: 2px; color: #475569;">Status: <span style="font-weight:bold; color: ${markerColor}">${asset.Status || '-'}</span></div>
                    </div>
                `);
        }
      });
    };

    if (activeTab === 'dashboard') {
      const windowL = window as any;
      if (!windowL.L) {
        if (!document.getElementById('leaflet-css')) {
          const link = document.createElement('link'); link.id = 'leaflet-css'; link.rel = 'stylesheet'; link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; document.head.appendChild(link);
        }
        const script = document.createElement('script'); script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => { if (isMounted) initMap(); }; document.head.appendChild(script);
      } else {
        setTimeout(() => { if (isMounted) initMap(); }, 100);
      }
    }
    return () => { isMounted = false; };
  }, [pltsAssets, pltdAssets, activeTab]);

  const statsPLTS = useMemo(() => {
    if (!pltsAssets || pltsAssets.length === 0) return { total: 0, active: 0, limited: 0, issue: 0, standby: 0, ongoing: 0, types: {} };
    let active = 0, limited = 0, issue = 0, standby = 0, ongoing = 0;
    const types: any = {};

    pltsAssets.forEach(asset => {
      const statusKey = Object.keys(asset).find(k => k.toLowerCase() === 'status') || '';
      const statusVal = statusKey && asset[statusKey] ? String(asset[statusKey]).toUpperCase() : '';

      if (statusVal === 'OPERASI') active++;
      else if (statusVal === 'OPERASI TERBATAS') limited++;
      else if (statusVal === 'GANGGUAN') issue++;
      else if (statusVal === 'STAND BY' || statusVal === 'STANDBY') standby++;
      else if (statusVal === 'ON GOING' || statusVal === 'ONGOING' || statusVal === 'ON PROGRES') ongoing++;

      const validStatus = statusVal || 'TIDAK DIKETAHUI';
      types[validStatus] = (types[validStatus] || 0) + 1;
    });
    return { total: pltsAssets.length, active, limited, issue, standby, ongoing, types };
  }, [pltsAssets]);

  const statsPLTD = useMemo(() => {
    let totalDayaMampu = 0;
    pltdAssets.forEach(asset => { totalDayaMampu += Number(asset.daya_mampu_kw || 0); });
    return { total: pltdAssets.length, dayaMampu: totalDayaMampu };
  }, [pltdAssets]);

  const pieChartData = Object.keys(statsPLTS.types).map(key => ({ name: key, value: statsPLTS.types[key] }));

  const filteredAssets = useMemo(() => {
    let result = currentAssets.filter(asset => Object.values(asset).some(val => val != null && String(val).toLowerCase().includes(searchTerm.toLowerCase())));
    if (sortConfig.key) {
      result.sort((a, b) => {
        const valA = a[sortConfig.key as keyof typeof a] || ''; const valB = b[sortConfig.key as keyof typeof b] || '';
        const numA = Number(valA); const numB = Number(valB);
        if (valA !== '' && !isNaN(numA) && valB !== '' && !isNaN(numB)) return sortConfig.direction === 'asc' ? numA - numB : numB - numA;
        const strA = String(valA).toLowerCase(); const strB = String(valB).toLowerCase();
        if (strA < strB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (strA > strB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [currentAssets, searchTerm, sortConfig]);

  const dashboardSummaryData = useMemo(() => {
    let data = pltsAssets.map(plts => {
      const latestLog = pltsLogs.filter(log => log.site_id === plts.site_id).sort((a, b) => {
        const dateA = a.tanggal || ''; const dateB = b.tanggal || '';
        const timeA = a.jam || ''; const timeB = b.jam || '';
        return dateB.localeCompare(dateA) || timeB.localeCompare(timeA);
      })[0];
      return {
        nama_plts: plts.nama_plts,
        kapasitas_kwp: plts.kapasitas_kwp,
        status: plts.Status || plts.status || '',
        beban_terbaru: latestLog ? latestLog.beban_puncak : 0,
        waktu_terbaru: latestLog ? `${latestLog.tanggal} ${latestLog.jam}` : '-'
      };
    });

    if (dashboardSortConfig.key) {
      data.sort((a: any, b: any) => {
        if (dashboardSortConfig.key === 'Status') {
          const getRank = (s: any) => String(s || '').toUpperCase() === 'OPERASI' ? 1 : String(s || '').toUpperCase() === 'OPERASI TERBATAS' ? 2 : String(s || '').toUpperCase() === 'STAND BY' ? 3 : String(s || '').toUpperCase() === 'GANGGUAN' ? 4 : 5;
          return dashboardSortConfig.direction === 'asc' ? getRank(a.status) - getRank(b.status) : getRank(b.status) - getRank(a.status);
        } else {
          const valA = a[dashboardSortConfig.key] || ''; const valB = b[dashboardSortConfig.key] || '';
          const numA = Number(valA); const numB = Number(valB);
          if (valA !== '' && !isNaN(numA) && valB !== '' && !isNaN(numB)) return dashboardSortConfig.direction === 'asc' ? numA - numB : numB - numA;
          const strA = String(valA).toLowerCase(); const strB = String(valB).toLowerCase();
          if (strA < strB) return dashboardSortConfig.direction === 'asc' ? -1 : 1;
          if (strA > strB) return dashboardSortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        }
      });
    } else {
      data.sort((a, b) => String(a.status || '').toUpperCase() === 'OPERASI' ? -1 : 1);
    }
    return data;
  }, [pltsAssets, pltsLogs, dashboardSortConfig]);

  const dashboardSummaryPLTDData = useMemo(() => {
    let data = pltdAssets.map(pltd => {
      const latestLog = pltdLogs.filter(log => log.site_id === pltd.site_id).sort((a, b) => {
        const dateA = a.tanggal || ''; const dateB = b.tanggal || '';
        const timeA = a.jam || ''; const timeB = b.jam || '';
        return dateB.localeCompare(dateA) || timeB.localeCompare(timeA);
      })[0];

      const totalDayaTerpasang = mesinPltd.filter(m => m.site_id === pltd.site_id).reduce((sum, m) => sum + (Number(m.daya_terpasang) || 0), 0) || pltd.daya_terpasang_kw || 0;
      const totalDayaMampu = mesinPltd.filter(m => m.site_id === pltd.site_id).reduce((sum, m) => sum + (Number(m.daya_mampu) || 0), 0) || pltd.daya_mampu_kw || 0;
      const totalStokBBM = tangkiPltd.filter(t => t.site_id === pltd.site_id).reduce((sum, t) => sum + (Number(t.volume_terkini) || 0), 0);

      return {
        nama_pltd: pltd.nama_pltd,
        status: pltd.Status || pltd.status || '',
        daya_terpasang: totalDayaTerpasang,
        daya_mampu: totalDayaMampu,
        beban_terbaru: latestLog ? latestLog.beban_aktif : 0,
        waktu_terbaru: latestLog ? `${latestLog.tanggal} ${latestLog.jam}` : '-',
        stok_bbm: totalStokBBM
      };
    });

    if (dashboardPltdSortConfig.key) {
      data.sort((a: any, b: any) => {
        if (dashboardPltdSortConfig.key === 'Status') {
          const getRank = (s: any) => String(s || '').toUpperCase() === 'OPERASI' ? 1 : String(s || '').toUpperCase() === 'OPERASI TERBATAS' ? 2 : String(s || '').toUpperCase() === 'STAND BY' ? 3 : String(s || '').toUpperCase() === 'GANGGUAN' ? 4 : 5;
          return dashboardPltdSortConfig.direction === 'asc' ? getRank(a.status) - getRank(b.status) : getRank(b.status) - getRank(a.status);
        } else {
          const valA = a[dashboardPltdSortConfig.key] || ''; const valB = b[dashboardPltdSortConfig.key] || '';
          const numA = Number(valA); const numB = Number(valB);
          if (valA !== '' && !isNaN(numA) && valB !== '' && !isNaN(numB)) return dashboardPltdSortConfig.direction === 'asc' ? numA - numB : numB - numA;
          const strA = String(valA).toLowerCase(); const strB = String(valB).toLowerCase();
          if (strA < strB) return dashboardPltdSortConfig.direction === 'asc' ? -1 : 1;
          if (strA > strB) return dashboardPltdSortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        }
      });
    } else {
      data.sort((a, b) => (a.nama_pltd || '').localeCompare(b.nama_pltd || ''));
    }
    return data;
  }, [pltdAssets, pltdLogs, mesinPltd, tangkiPltd, dashboardPltdSortConfig]);

  const absensiData = useMemo(() => {
    const result: any[] = [];
    const logsOnDate = pltsLogs.filter(log => log.tanggal === absensiDate);

    pltsAssets.forEach(plts => {
      const rawOperators: any[] = [];
      for (let i = 1; i <= 10; i++) {
        if (plts[`operator_${i}_-_nip`]) rawOperators.push(plts[`operator_${i}_-_nip`]);
      }
      if (rawOperators.length === 0) return;

      const siteLogs = logsOnDate.filter(log => log.site_id === plts.site_id);
      const hasReported = siteLogs.length > 0;

      let presentSet = new Set();
      siteLogs.forEach(log => {
        if (Array.isArray(log.petugas)) log.petugas.forEach((p: any) => presentSet.add(p));
      });

      const operatorsData = rawOperators.map(op => ({ nama: op, hadir: presentSet.has(op) }));
      result.push({ site_id: plts.site_id, nama_plts: plts.nama_plts, sudah_lapor: hasReported, operators: operatorsData });
    });
    return result.sort((a, b) => (a.sudah_lapor === b.sudah_lapor ? 0 : a.sudah_lapor ? -1 : 1));
  }, [pltsAssets, pltsLogs, absensiDate]);

  const absensiDataPltd = useMemo(() => {
    const result: any[] = [];
    const logsOnDate = pltdLogs.filter(log => log.tanggal === absensiDatePltd);

    pltdAssets.forEach(pltd => {
      const rawOperators: any[] = [];
      for (let i = 1; i <= 15; i++) {
        if (pltd[`operator_${i}_-_nip`]) rawOperators.push(pltd[`operator_${i}_-_nip`]);
      }
      if (rawOperators.length === 0) return;

      const siteLogs = logsOnDate.filter(log => log.site_id === pltd.site_id);
      const hasReported = siteLogs.length > 0;

      let presentSet = new Set();
      siteLogs.forEach(log => {
        if (Array.isArray(log.petugas)) log.petugas.forEach((p: any) => presentSet.add(p));
      });

      const operatorsData = rawOperators.map(op => ({ nama: op, hadir: presentSet.has(op) }));
      result.push({ site_id: pltd.site_id, nama_pltd: pltd.nama_pltd, sudah_lapor: hasReported, operators: operatorsData });
    });
    return result.sort((a, b) => (a.sudah_lapor === b.sudah_lapor ? 0 : a.sudah_lapor ? -1 : 1));
  }, [pltdAssets, pltdLogs, absensiDatePltd]);

  const handleSort = (key: any) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };
  const handleDashboardSort = (key: any) => {
    let direction = 'asc';
    if (dashboardSortConfig.key === key && dashboardSortConfig.direction === 'asc') direction = 'desc';
    setDashboardSortConfig({ key, direction });
  };
  const handleDashboardPltdSort = (key: any) => {
    let direction = 'asc';
    if (dashboardPltdSortConfig.key === key && dashboardPltdSortConfig.direction === 'asc') direction = 'desc';
    setDashboardPltdSortConfig({ key, direction });
  };

  const handleExportPDF = () => {
    const windowJsPdf = window as any;
    if (!windowJsPdf.jspdf) {
      const script1 = document.createElement('script'); script1.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script1.onload = () => {
        const script2 = document.createElement('script'); script2.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js';
        script2.onload = generatePDF; document.head.appendChild(script2);
      };
      document.head.appendChild(script1); setNotification('Mempersiapkan library PDF...');
    } else { generatePDF(); }
  };

  const generatePDF = () => {
    const windowJsPdf = window as any;
    try {
      const { jsPDF } = windowJsPdf.jspdf; const doc = new jsPDF();
      doc.setFontSize(16); doc.text("Ringkasan Operasional PLTS", 14, 15);
      doc.setFontSize(10); doc.text(`Tanggal Cetak: ${new Date().toLocaleString()}`, 14, 22);
      doc.autoTable({ html: '#plts-summary-table', startY: 28, theme: 'grid', headStyles: { fillColor: [14, 165, 233] }, styles: { fontSize: 8 } });
      doc.save(`Ringkasan_PLTS_${new Date().toISOString().split('T')[0]}.pdf`); setNotification('PDF diunduh!');
    } catch (error) { setNotification('Gagal membuat PDF.'); }
  };

  const handleExportWAGSummary = () => {
    let text = `*RINGKASAN OPERASIONAL PLTS*\n📅 *Update:* ${new Date().toLocaleString('id-ID')}\n\n`;
    let opText = `✅ *OPERASI*\n`; let limitText = `⚠️ *OPERASI TERBATAS*\n`; let gangText = `❌ *GANGGUAN*\n`; let sbText = `⏸️ *STAND BY / LAINNYA*\n`;

    dashboardSummaryData.forEach(p => {
      const line = `▪️ ${p.nama_plts} (${p.kapasitas_kwp} kWp) - Beban: ${p.beban_terbaru || 0} kW\n`;
      if ((p.status || '').toUpperCase() === 'OPERASI') opText += line;
      else if ((p.status || '').toUpperCase() === 'OPERASI TERBATAS') limitText += line;
      else if ((p.status || '').toUpperCase() === 'GANGGUAN') gangText += line;
      else sbText += line;
    });

    text += opText + `\n` + limitText + `\n` + gangText + `\n` + sbText;
    const textArea = document.createElement("textarea"); textArea.value = text; document.body.appendChild(textArea); textArea.select();
    try { document.execCommand('copy'); setNotification('Ringkasan disalin untuk WAG!'); } catch (err) { }
    document.body.removeChild(textArea);
  };

  const handleExportPDFPltd = () => {
    const windowJsPdf = window as any;
    if (!windowJsPdf.jspdf) {
      const script1 = document.createElement('script'); script1.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script1.onload = () => {
        const script2 = document.createElement('script'); script2.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js';
        script2.onload = generatePDFPltd; document.head.appendChild(script2);
      };
      document.head.appendChild(script1); setNotification('Mempersiapkan library PDF...');
    } else { generatePDFPltd(); }
  };

  const generatePDFPltd = () => {
    const windowJsPdf = window as any;
    try {
      const { jsPDF } = windowJsPdf.jspdf; const doc = new jsPDF();
      doc.setFontSize(16); doc.text("Ringkasan Operasional PLTD", 14, 15);
      doc.setFontSize(10); doc.text(`Tanggal Cetak: ${new Date().toLocaleString()}`, 14, 22);
      doc.autoTable({ html: '#pltd-summary-table', startY: 28, theme: 'grid', headStyles: { fillColor: [147, 51, 234] }, styles: { fontSize: 8 } });
      doc.save(`Ringkasan_PLTD_${new Date().toISOString().split('T')[0]}.pdf`); setNotification('PDF diunduh!');
    } catch (error) { setNotification('Gagal membuat PDF.'); }
  };

  const handleExportWAGSummaryPltd = () => {
    let text = `*RINGKASAN OPERASIONAL PLTD*\n📅 *Update:* ${new Date().toLocaleString('id-ID')}\n\n`;
    dashboardSummaryPLTDData.forEach(p => {
      text += `⚡ *${p.nama_pltd}*\n  ├ Daya Terpasang : ${p.daya_terpasang} kW\n  ├ Daya Mampu   : ${p.daya_mampu} kW\n  ├ Beban Puncak : ${p.beban_terbaru || 0} kW\n  └ Stok BBM     : ${Number(p.stok_bbm).toLocaleString('id-ID')} Liter\n\n`;
    });
    const textArea = document.createElement("textarea"); textArea.value = text; document.body.appendChild(textArea); textArea.select();
    try { document.execCommand('copy'); setNotification('Ringkasan PLTD disalin untuk WAG!'); } catch (err) { }
    document.body.removeChild(textArea);
  };

  const handleCopyAbsensi = () => {
    let text = `*REKAP ABSENSI OPERATOR PLTS*\n📅 *Tanggal:* ${absensiDate}\n\n`;
    let laporText = `✅ *SUDAH LAPOR (HADIR)*\n`; let blmLaporText = `❌ *BELUM LAPOR / ALPA*\n`;

    absensiData.forEach(site => {
      if (site.sudah_lapor) {
        const hadir = site.operators.filter((o: any) => o.hadir).map((o: any) => String(o.nama).split(' - ')[0]).join(', ');
        laporText += `▪️ ${site.nama_plts}: ${hadir || '(Tidak ada yg dicentang)'}\n`;
      } else {
        const alpa = site.operators.map((o: any) => String(o.nama).split(' - ')[0]).join(', ');
        blmLaporText += `▪️ ${site.nama_plts}: ${alpa}\n`;
      }
    });
    text += laporText + `\n` + blmLaporText;
    const textArea = document.createElement("textarea"); textArea.value = text; document.body.appendChild(textArea); textArea.select();
    try { document.execCommand('copy'); setNotification('Rekap Absensi disalin!'); } catch (err) { }
    document.body.removeChild(textArea);
  };

  const handleCopyAbsensiPltd = () => {
    let text = `*REKAP ABSENSI OPERATOR PLTD*\n📅 *Tanggal:* ${absensiDatePltd}\n\n`;
    let laporText = `✅ *SUDAH LAPOR (HADIR)*\n`; let blmLaporText = `❌ *BELUM LAPOR / ALPA*\n`;

    absensiDataPltd.forEach(site => {
      if (site.sudah_lapor) {
        const hadir = site.operators.filter((o: any) => o.hadir).map((o: any) => String(o.nama).split(' - ')[0]).join(', ');
        laporText += `▪️ ${site.nama_pltd}: ${hadir || '(Tidak ada yg dicentang)'}\n`;
      } else {
        const alpa = site.operators.map((o: any) => String(o.nama).split(' - ')[0]).join(', ');
        blmLaporText += `▪️ ${site.nama_pltd}: ${alpa}\n`;
      }
    });
    text += laporText + `\n` + blmLaporText;
    const textArea = document.createElement("textarea"); textArea.value = text; document.body.appendChild(textArea); textArea.select();
    try { document.execCommand('copy'); setNotification('Rekap Absensi PLTD disalin!'); } catch (err) { }
    document.body.removeChild(textArea);
  };

  const handleEditClick = (asset: any) => { setEditingAsset(asset); setEditFormData({ ...asset }); };

  const handleSaveEdit = async () => {
    try {
      setNotification('Memperbarui data...');
      const collectionName = activeTab === 'assets_pltd' ? 'assets_pltd' : 'assets_plts';
      const { _id, ...dataToUpdate } = editFormData;
      await updateDoc(doc(db, collectionName, (editingAsset as any)._id), dataToUpdate);
      setEditingAsset(null); setNotification('Data berhasil diperbarui!');
    } catch (error) { setNotification('Gagal memperbarui data!'); }
  };

  const handleDeleteClick = (asset: any) => { setDeletingAsset(asset); };
  const confirmDelete = async () => {
    try {
      setNotification('Menghapus data...');
      const collectionName = activeTab === 'assets_pltd' ? 'assets_pltd' : 'assets_plts';
      await deleteDoc(doc(db, collectionName, (deletingAsset as any)._id));
      setDeletingAsset(null); setNotification('Data berhasil dihapus!');
    } catch (error) { setNotification('Gagal menghapus data!'); }
  };

  const handleAddClick = () => {
    const initialData: any = {}; currentHeaders.forEach(h => initialData[h] = '');
    setAddFormData(initialData); setIsAddingAsset(true);
  };

  const handleSaveAdd = async () => {
    try {
      setNotification('Menyimpan data...');
      const collectionName = activeTab === 'assets_pltd' ? 'assets_pltd' : 'assets_plts';
      await addDoc(collection(db, collectionName), addFormData);
      setIsAddingAsset(false); setAddFormData({}); setNotification('Data baru berhasil ditambahkan!');
    } catch (error) { setNotification('Gagal menambahkan data!'); }
  };

  const handleSaveSpec = async () => {
    try {
      const { _id, ...dataToUpdate } = specFormData;
      await updateDoc(doc(db, 'assets_plts', viewingPltsSpec._id), dataToUpdate);
      setViewingPltsSpec(specFormData); setIsEditingSpec(false); setNotification('Spesifikasi diperbarui!');
    } catch (error) { setNotification('Gagal perbarui spesifikasi!'); }
  };

  const handleSaveAddMesin = async () => {
    try {
      const newMesin = { ...mesinAddFormData, site_id: viewingMesin.site_id };
      await addDoc(collection(db, 'mesin_pltd'), newMesin);
      setIsAddingMesin(false); setMesinAddFormData({}); setNotification('Mesin ditambahkan!');
    } catch (error) { setNotification('Gagal tambah mesin!'); }
  };

  const handleSaveEditMesin = async () => {
    try {
      const { _id, ...dataToUpdate } = mesinEditFormData;
      await updateDoc(doc(db, 'mesin_pltd', editingMesinId), dataToUpdate);
      setEditingMesinId(null); setNotification('Mesin diperbarui!');
    } catch (error) { setNotification('Gagal edit mesin!'); }
  };

  const confirmDeleteMesin = async () => {
    try {
      await deleteDoc(doc(db, 'mesin_pltd', deletingMesin._id));
      setDeletingMesin(null); setNotification('Mesin dihapus!');
    } catch (error) { setNotification('Gagal hapus mesin!'); }
  };

  const handleSaveAddTangki = async () => {
    try {
      const newTangki = { ...tangkiAddFormData, site_id: viewingTangki.site_id, volume_terkini: '0' };
      await addDoc(collection(db, 'tangki_pltd'), newTangki);
      setIsAddingTangki(false); setTangkiAddFormData({}); setNotification('Tangki ditambahkan!');
    } catch (error) { setNotification('Gagal tambah tangki!'); }
  };

  const handleSaveEditTangki = async () => {
    try {
      const { _id, ...dataToUpdate } = tangkiEditFormData;
      await updateDoc(doc(db, 'tangki_pltd', editingTangkiId), dataToUpdate);
      setEditingTangkiId(null); setNotification('Tangki diperbarui!');
    } catch (error) { setNotification('Gagal edit tangki!'); }
  };

  const confirmDeleteTangki = async () => {
    try {
      await deleteDoc(doc(db, 'tangki_pltd', deletingTangki._id));
      setDeletingTangki(null); setNotification('Tangki dihapus!');
    } catch (error) { setNotification('Gagal hapus tangki!'); }
  };

  const handleTogglePetugas = (nip: any, formState: any, setFormState: any) => {
    const current = formState.petugas || [];
    if (current.includes(nip)) setFormState({ ...formState, petugas: current.filter((p: any) => p !== nip) });
    else setFormState({ ...formState, petugas: [...current, nip] });
  };

  const handleSaveLog = async () => {
    try {
      if (editingLogId) {
        const { _id, ...dataToUpdate } = logFormData;
        await updateDoc(doc(db, 'log_plts', editingLogId), dataToUpdate);
        setEditingLogId(null); setNotification('Log berhasil diubah!');
      } else {
        await addDoc(collection(db, 'log_plts'), { ...logFormData, site_id: selectedPltsForLog });
        setNotification('Log berhasil disimpan!');
      }
      setIsAddingLog(false); setLogFormData({ tanggal: todayStr, jam: '12:00', beban_puncak: '', status: 'Operasi', petugas: [], keterangan: '' });
    } catch (error) { setNotification('Gagal menyimpan log!'); }
  };

  const confirmDeleteLog = async () => {
    try { await deleteDoc(doc(db, 'log_plts', deletingLogId)); setDeletingLogId(null); setNotification('Log dihapus!'); } catch (e) { }
  };

  const handleSaveLogPltd = async () => {
    try {
      if (editingLogPltdId) {
        const { _id, ...dataToUpdate } = logPltdFormData;
        await updateDoc(doc(db, 'log_pltd', editingLogPltdId), dataToUpdate);
        setEditingLogPltdId(null); setNotification('Log PLTD diubah!');
      } else {
        await addDoc(collection(db, 'log_pltd'), { ...logPltdFormData, site_id: selectedPltdForLog });
        setNotification('Log PLTD disimpan!');
      }
      setIsAddingLogPltd(false); setLogPltdFormData({ tanggal: todayStr, jam: '12:00', petugas: [], beban_aktif: '', beban_reaktif: '', arus_r: '', arus_s: '', arus_t: '', tegangan_rs: '', tegangan_st: '', tegangan_tr: '', frekuensi: '50.0' });
    } catch (error) { setNotification('Gagal menyimpan log!'); }
  };

  const confirmDeleteLogPltd = async () => {
    try { await deleteDoc(doc(db, 'log_pltd', deletingLogPltdId)); setDeletingLogPltdId(null); setNotification('Log dihapus!'); } catch (e) { }
  };

  const handleOpenAddMesinLog = () => {
    const currentEngines = mesinPltd.filter(m => m.site_id === selectedPltdForMesinLog);
    const initialMesinData = currentEngines.map(m => ({ _id: m._id, id_mesin: m.id_mesin, merk_type: m.merk_type, daya_terpasang: m.daya_terpasang, daya_mampu: m.daya_mampu || '', beban_supply: m.beban_supply || '', status_operasi: m.status_operasi || 'OPERASI' }));
    setMesinLogFormData({ tanggal: todayStr, jam: '10:00', petugas: [], mesin_data: initialMesinData });
    setIsAddingMesinLog(true);
  };

  const handleMesinLogDataChange = (engineId: any, field: any, value: any) => { setMesinLogFormData((prev: any) => ({ ...prev, mesin_data: prev.mesin_data.map((m: any) => m._id === engineId ? { ...m, [field]: value } : m) })); };

  const handleSaveMesinLog = async () => {
    try {
      setNotification('Menyimpan log & update master mesin...');
      await addDoc(collection(db, 'log_mesin'), { site_id: selectedPltdForMesinLog, tanggal: mesinLogFormData.tanggal, jam: mesinLogFormData.jam, petugas: mesinLogFormData.petugas, mesin_data: mesinLogFormData.mesin_data });

      for (const m of mesinLogFormData.mesin_data) {
        await updateDoc(doc(db, 'mesin_pltd', m._id), { daya_mampu: m.daya_mampu, beban_supply: m.beban_supply, status_operasi: m.status_operasi });
      }
      setIsAddingMesinLog(false); setNotification('Log Status Mesin disimpan & Master Data terupdate!');
    } catch (error) { setNotification('Gagal menyimpan log mesin!'); }
  };

  const handleUpdateMesinLogData = (engineId: any, field: any, value: any) => { setEditingMesinLog((prev: any) => ({ ...prev, mesin_data: prev.mesin_data.map((m: any) => m._id === engineId ? { ...m, [field]: value } : m) })); };

  const handleSaveEditMesinLog = async () => {
    try { const { _id, ...dataToUpdate } = editingMesinLog; await updateDoc(doc(db, 'log_mesin', _id), dataToUpdate); setEditingMesinLog(null); setNotification('Log Status Mesin berhasil diperbarui!'); } catch (e) { }
  };

  const confirmDeleteMesinLog = async () => {
    try { await deleteDoc(doc(db, 'log_mesin', deletingMesinLog._id)); setDeletingMesinLog(null); setNotification('Log dihapus!'); } catch (e) { }
  };

  // --- STATE DAN FUNGSI EDIT LOG PRODUKSI ---
  const [editingProduksiId, setEditingProduksiId] = useState<any>(null);
  const [editProduksiFormData, setEditProduksiFormData] = useState<any>({});
  const [deletingProduksiId, setDeletingProduksiId] = useState<any>(null);

  const kwhProduksiEditCalc = (Number(editProduksiFormData.stand_kwh_hari_ini) || 0) - (Number(editProduksiFormData.stand_kwh_kemarin) || 0);
  const bbmPemakaianEditCalc = (Number(editProduksiFormData.stand_bbm_hari_ini) || 0) - (Number(editProduksiFormData.stand_bbm_kemarin) || 0);
  const sfcEditCalc = kwhProduksiEditCalc > 0 ? (bbmPemakaianEditCalc / kwhProduksiEditCalc).toFixed(4) : '0.0000';

  const handleSaveEditProduksiLog = async () => {
    try {
      const { _id, ...dataToUpdate } = editProduksiFormData;
      await updateDoc(doc(db, 'log_produksi', editingProduksiId), {
        ...dataToUpdate,
        kwh_produksi: kwhProduksiEditCalc,
        pemakaian_bbm: bbmPemakaianEditCalc,
        sfc: sfcEditCalc
      });
      setEditingProduksiId(null);
      setNotification('Log Produksi & BBM berhasil diperbarui!');
    } catch (error) { setNotification('Gagal perbarui data produksi!'); }
  };

  const confirmDeleteProduksiLog = async () => {
    try { await deleteDoc(doc(db, 'log_produksi', deletingProduksiId)); setDeletingProduksiId(null); setNotification('Log Produksi dihapus!'); } catch (e) { }
  };

  // --- PERHITUNGAN FORMULIR UTAMA (JANGAN DIHAPUS) ---
  const kwhProduksiCalc = (Number(produksiFormData.stand_kwh_hari_ini) || 0) - (Number(produksiFormData.stand_kwh_kemarin) || 0);
  const bbmPemakaianCalc = (Number(produksiFormData.stand_bbm_hari_ini) || 0) - (Number(produksiFormData.stand_bbm_kemarin) || 0);
  const sfcCalc = kwhProduksiCalc > 0 ? (bbmPemakaianCalc / kwhProduksiCalc).toFixed(4) : '0.0000';

  const handleSaveProduksiLog = async () => {
    try {
      const newLog = {
        site_id: selectedPltdForProduksi, tanggal: produksiFormData.tanggal, petugas: produksiFormData.petugas,
        stand_kwh_kemarin: produksiFormData.stand_kwh_kemarin, stand_kwh_hari_ini: produksiFormData.stand_kwh_hari_ini,
        stand_bbm_kemarin: produksiFormData.stand_bbm_kemarin, stand_bbm_hari_ini: produksiFormData.stand_bbm_hari_ini,
        kwh_produksi: kwhProduksiCalc, pemakaian_bbm: bbmPemakaianCalc, sfc: sfcCalc
      };
      await addDoc(collection(db, 'log_produksi'), newLog);
      setNotification('Data Produksi & BBM berhasil disimpan!');
      setProduksiFormData({ tanggal: todayStr, petugas: [], stand_kwh_kemarin: newLog.stand_kwh_hari_ini, stand_kwh_hari_ini: '', stand_bbm_kemarin: newLog.stand_bbm_hari_ini, stand_bbm_hari_ini: '' });
    } catch (error) { setNotification('Gagal simpan produksi!'); }
  };

  const handleOpenInputBBM = () => {
    const currentTanks = tangkiPltd.filter(t => t.site_id === selectedPltdForBBM);
    const initialTanksData = currentTanks.map(t => ({ _id: t._id, id_tangki: t.id_tangki, kapasitas_liter: t.kapasitas_liter, volume_terkini: t.volume_terkini || '0', input_volume: '' }));
    setBbmFormData({ tanggal: todayStr, jam: '10:00', jenis_input: 'Penerimaan', referensi: '', petugas: [], tangki_data: initialTanksData });
    setIsAddingBBM(true);
  };

  const handleBbmDataChange = (tankId: any, value: any) => { setBbmFormData((prev: any) => ({ ...prev, tangki_data: prev.tangki_data.map((t: any) => t._id === tankId ? { ...t, input_volume: value } : t) })); };

  const [editingBbmLog, setEditingBbmLog] = useState<any>(null);
  const [deletingBbmLogId, setDeletingBbmLogId] = useState<any>(null);

  const currentBbmLogs = useMemo(() => {
    if (!selectedPltdForBBM) return [];
    return bbmLogs.filter(log => log.site_id === selectedPltdForBBM).sort((a, b) => {
      const dateA = a.tanggal || ''; const dateB = b.tanggal || '';
      const timeA = a.jam || ''; const timeB = b.jam || '';
      if (dateA === dateB) return timeB.localeCompare(timeA);
      return dateB.localeCompare(dateA);
    });
  }, [bbmLogs, selectedPltdForBBM]);

  const handleSaveBBM = async () => {
    try {
      setNotification('Update stok BBM & menyimpan log...');
      const activeTanks = bbmFormData.tangki_data.filter((t: any) => t.input_volume && t.input_volume !== '');

      // 1. Simpan Riwayat Log ke Firebase
      if (activeTanks.length > 0) {
        await addDoc(collection(db, 'log_bbm'), {
          site_id: selectedPltdForBBM, tanggal: bbmFormData.tanggal, jam: bbmFormData.jam,
          jenis_input: bbmFormData.jenis_input, referensi: bbmFormData.referensi,
          petugas: bbmFormData.petugas, tangki_data: activeTanks
        });
      }

      // 2. Update Volume di Master Tangki
      for (const inputTank of bbmFormData.tangki_data) {
        if (inputTank.input_volume) {
          const tangkiLama = tangkiPltd.find(t => t._id === inputTank._id);
          const currentVol = Number(tangkiLama?.volume_terkini) || 0;
          const inputVol = Number(inputTank.input_volume) || 0;
          const newVol = bbmFormData.jenis_input === 'Penerimaan' ? currentVol + inputVol : inputVol;
          await updateDoc(doc(db, 'tangki_pltd', inputTank._id), { volume_terkini: String(newVol) });
        }
      }
      setIsAddingBBM(false); setNotification('Stok BBM & Log berhasil disimpan!');
    } catch (error) { setNotification('Gagal update BBM!'); }
  };

  const handleUpdateBbmEditData = (tankId: any, value: any) => { setEditingBbmLog((prev: any) => ({ ...prev, tangki_data: prev.tangki_data.map((t: any) => t._id === tankId ? { ...t, input_volume: value } : t) })); };

  const handleSaveEditBbmLog = async () => {
    try {
      const { _id, ...dataToUpdate } = editingBbmLog;
      await updateDoc(doc(db, 'log_bbm', _id), dataToUpdate);
      setEditingBbmLog(null); setNotification('Log BBM berhasil diperbarui!');
      // Catatan: Edit log ini murni untuk merapikan riwayat, tidak mengubah ulang Master Tangki secara otomatis untuk mencegah error perhitungan ganda.
    } catch (error) { setNotification('Gagal perbarui log!'); }
  };

  const confirmDeleteBbmLog = async () => {
    try { await deleteDoc(doc(db, 'log_bbm', deletingBbmLogId)); setDeletingBbmLogId(null); setNotification('Log BBM dihapus!'); } catch (e) { }
  };

  // ANTI-CRASH GET OPERATORS
  const getOperatorsForSite = (siteId: any, isPltd = false) => {
    const assets = isPltd ? pltdAssets : pltsAssets;
    const asset = assets.find(a => a.site_id === siteId);
    if (!asset) return [];
    const ops = [];
    for (let i = 1; i <= 15; i++) {
      const val = asset[`operator_${i}_-_nip`];
      if (val && typeof val === 'string') ops.push(val);
    }
    return ops;
  };

  if (!currentUser || !currentUser.role) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 font-sans">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-slate-100 animate-in zoom-in duration-300">
          <div className="flex justify-center mb-6">
            <div className="flex -space-x-2">
              <Sun className="text-yellow-500 w-12 h-12 relative z-10 drop-shadow-md" />
              <Zap className="text-purple-600 w-12 h-12 relative drop-shadow-md" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-slate-800 text-center mb-2">PLN ULP Agats</h1>
          <p className="text-sm text-slate-500 text-center mb-8 font-medium">Monitoring PLTS & PLTD</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Username Login</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserCheck className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Contoh: PLTS_Amor atau PLTD_Atsj"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            {loginError && <div className="text-xs font-bold text-rose-500 bg-rose-50 p-3 rounded-lg border border-rose-100 flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {loginError}</div>}
            <button type="submit" disabled={!loginUsername.trim()} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-blue-700 shadow-md transition-all disabled:opacity-50 flex justify-center items-center gap-2">
              Masuk ke Sistem <Check className="w-4 h-4" />
            </button>
          </form>
          <div className="mt-8 text-center text-[10px] text-slate-400 font-medium">
            &copy; 2026 PLN ULP Agats. Role Based Access Control.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans print:bg-white">
      <aside className="w-full md:w-64 bg-slate-900 text-slate-100 flex-shrink-0 flex flex-col print:hidden z-10">
        <div className="p-5 flex items-center gap-3 border-b border-slate-800">
          <div className="flex -space-x-2"><Sun className="text-yellow-400 w-7 h-7 relative z-10" /><Zap className="text-purple-400 w-7 h-7 relative" /></div>
          <div><h1 className="font-bold text-lg tracking-tight leading-tight">PLN ULP Agats</h1><p className="text-[11px] text-slate-400">Monitoring PLTS & PLTD</p></div>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {currentUser.role === 'admin' && (
            <>
              <button onClick={() => { setActiveTab('dashboard'); setSearchTerm(''); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}><Activity className="w-5 h-5" /><span className="font-medium text-sm">Dashboard Utama</span></button>

              <div className="pt-4 pb-1"><p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Manajemen Aset</p></div>
              <button onClick={() => { setActiveTab('assets_plts'); setSearchTerm(''); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'assets_plts' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}><Sun className="w-5 h-5 text-yellow-400" /><span className="font-medium text-sm">Data Master PLTS</span></button>
              <button onClick={() => { setActiveTab('assets_pltd'); setSearchTerm(''); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'assets_pltd' ? 'bg-purple-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}><Zap className="w-5 h-5 text-purple-400" /><span className="font-medium text-sm">Data Master PLTD</span></button>
            </>
          )}

          <div className="pt-4 pb-1"><p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Operasional Log</p></div>

          {(currentUser.role === 'admin' || currentUser.role === 'plts') && (
            <button onClick={() => { setActiveTab('log_plts'); setSearchTerm(''); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'log_plts' ? 'bg-sky-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}><ClipboardList className="w-5 h-5 text-sky-400" /><span className="font-medium text-sm">Log Beban PLTS</span></button>
          )}

          {(currentUser.role === 'admin' || currentUser.role === 'pltd') && (
            <>
              <button onClick={() => { setActiveTab('log_pltd'); setSearchTerm(''); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'log_pltd' ? 'bg-purple-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}><ClipboardList className="w-5 h-5 text-purple-400" /><span className="font-medium text-sm">Log Beban PLTD</span></button>
              <button onClick={() => { setActiveTab('log_mesin'); setSearchTerm(''); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'log_mesin' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}><Server className="w-5 h-5 text-indigo-400" /><span className="font-medium text-sm">Log Status Mesin</span></button>
              <button onClick={() => { setActiveTab('log_produksi'); setSearchTerm(''); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'log_produksi' ? 'bg-orange-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}><Gauge className="w-5 h-5 text-orange-400" /><span className="font-medium text-sm">Log Produksi & BBM</span></button>
              <button onClick={() => { setActiveTab('input_bbm'); setSearchTerm(''); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'input_bbm' ? 'bg-teal-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}><Droplet className="w-5 h-5 text-teal-400" /><span className="font-medium text-sm">Input Stok BBM</span></button>
            </>
          )}

          {currentUser.role === 'admin' && (
            <>
              <div className="pt-4 pb-1"><p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Absensi</p></div>
              <button onClick={() => { setActiveTab('absensi_plts'); setSearchTerm(''); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'absensi_plts' ? 'bg-pink-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}><UserCheck className="w-5 h-5 text-pink-400" /><span className="font-medium text-sm">Absensi PLTS</span></button>
              <button onClick={() => { setActiveTab('absensi_pltd'); setSearchTerm(''); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'absensi_pltd' ? 'bg-purple-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}><UserCheck className="w-5 h-5 text-purple-400" /><span className="font-medium text-sm">Absensi PLTD</span></button>
            </>
          )}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden print:h-auto print:overflow-visible relative">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap gap-4 items-center justify-between z-10 print:hidden">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
            {activeTab === 'dashboard' ? 'Ringkasan Sistem Pembangkit' :
              (activeTab === 'assets_plts' ? 'Manajemen Master Aset PLTS' :
                (activeTab === 'log_plts' ? 'Log Pencatatan Beban PLTS' :
                  (activeTab === 'log_pltd' ? 'Log Pencatatan Beban PLTD' :
                    (activeTab === 'log_mesin' ? 'Log Status Operasi Mesin' :
                      (activeTab === 'log_produksi' ? 'Pencatatan Produksi & SFC PLTD' :
                        (activeTab === 'input_bbm' ? 'Penerimaan & Stok Opname BBM' :
                          (activeTab === 'absensi_plts' ? 'Rekap Absensi Operator PLTS' :
                            (activeTab === 'absensi_pltd' ? 'Rekap Absensi Operator PLTD' : 'Manajemen Master Aset PLTD'))))))))}
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-bold text-slate-800">{currentUser?.name || 'Guest'}</div>
              <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                {currentUser?.role === 'admin' ? 'Administrator' : 'Operator ' + String(currentUser?.role || '').toUpperCase()}
              </div>
            </div>
            <button onClick={handleLogout} className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors" title="Logout Keluar">
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6 print:p-0 print:overflow-visible">

          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between col-span-2">
                  <p className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider flex items-center gap-1"><Sun className="w-3 h-3 text-yellow-500" /> Total PLTS</p>
                  <h3 className="text-2xl font-bold text-slate-800 flex items-center justify-between">{statsPLTS.total} <span className="text-sm font-normal text-slate-400">Unit</span></h3>
                </div>
                <div className="bg-emerald-50/50 p-4 rounded-xl shadow-sm border border-emerald-100 flex flex-col justify-between">
                  <p className="text-[10px] font-bold text-emerald-600 mb-1 uppercase tracking-wider">Operasi</p><h3 className="text-xl font-bold text-emerald-700">{statsPLTS.active}</h3>
                </div>
                <div className="bg-amber-50/50 p-4 rounded-xl shadow-sm border border-amber-100 flex flex-col justify-between">
                  <p className="text-[10px] font-bold text-amber-600 mb-1 uppercase tracking-wider">Terbatas</p><h3 className="text-xl font-bold text-amber-700">{statsPLTS.limited}</h3>
                </div>
                <div className="bg-rose-50/50 p-4 rounded-xl shadow-sm border border-rose-100 flex flex-col justify-between">
                  <p className="text-[10px] font-bold text-rose-600 mb-1 uppercase tracking-wider">Gangguan</p><h3 className="text-xl font-bold text-rose-700">{statsPLTS.issue}</h3>
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between col-span-2">
                  <p className="text-xs font-medium text-slate-500 mb-1 uppercase tracking-wider flex items-center gap-1"><Zap className="w-3 h-3 text-purple-500" /> Total PLTD</p>
                  <h3 className="text-2xl font-bold text-slate-800 flex items-center justify-between">{statsPLTD.total} <span className="text-sm font-normal text-slate-400">Unit</span></h3>
                </div>
                <div className="bg-purple-50/50 p-4 rounded-xl shadow-sm border border-purple-100 flex flex-col justify-between">
                  <p className="text-[10px] font-bold text-purple-600 mb-1 uppercase tracking-wider">Total Daya</p>
                  <h3 className="text-xl font-bold text-purple-700">{statsPLTD.dayaMampu} <span className="text-xs">kW</span></h3>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2 flex flex-col min-h-[400px]">
                  <h3 className="font-bold text-slate-800 mb-4">Peta Lokasi Aset Pembangkit</h3>
                  <div className="flex-1 w-full rounded-xl overflow-hidden border border-slate-200 relative z-0">
                    <div ref={mapRef} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' }}></div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
                  <h3 className="font-bold text-slate-800 mb-6">Status Pembangkit Surya</h3>
                  <div className="flex-1 min-h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                          {pieChartData.map((entry, index) => {
                            let color = COLORS[index % COLORS.length];
                            if (entry.name === 'OPERASI') color = '#10b981'; else if (entry.name === 'OPERASI TERBATAS') color = '#f59e0b'; else if (entry.name === 'GANGGUAN') color = '#ef4444'; else if (entry.name === 'STAND BY') color = '#64748b'; else if (entry.name === 'ON GOING' || entry.name === 'ON PROGRES') color = '#6366f1';
                            return <Cell key={`cell-${index}`} fill={color} />;
                          })}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* TABEL RINGKASAN PLTS */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-lg text-slate-800">Ringkasan Operasional PLTS</h3>
                  <div className="flex gap-2 print:hidden">
                    <button onClick={handleExportPDF} className="px-4 py-2 bg-rose-50 text-rose-600 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-rose-100"><Download className="w-4 h-4" /> Export PDF</button>
                    <button onClick={handleExportWAGSummary} className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-emerald-100"><Copy className="w-4 h-4" /> Export WAG</button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table id="plts-summary-table" className="w-full text-left">
                    <thead className="bg-slate-50 border-b text-xs font-bold text-slate-500 uppercase">
                      <tr>
                        <th className="p-4 cursor-pointer hover:bg-slate-200" onClick={() => handleDashboardSort('nama_plts')}>Nama PLTS {dashboardSortConfig.key === 'nama_plts' && (dashboardSortConfig.direction === 'asc' ? <ArrowUp className="inline w-3 h-3" /> : <ArrowDown className="inline w-3 h-3" />)}</th>
                        <th className="p-4 cursor-pointer hover:bg-slate-200 text-center" onClick={() => handleDashboardSort('Status')}>Status {dashboardSortConfig.key === 'Status' && (dashboardSortConfig.direction === 'asc' ? <ArrowUp className="inline w-3 h-3" /> : <ArrowDown className="inline w-3 h-3" />)}</th>
                        <th className="p-4 cursor-pointer hover:bg-slate-200 text-right" onClick={() => handleDashboardSort('kapasitas_kwp')}>Kapasitas (kWp) {dashboardSortConfig.key === 'kapasitas_kwp' && (dashboardSortConfig.direction === 'asc' ? <ArrowUp className="inline w-3 h-3" /> : <ArrowDown className="inline w-3 h-3" />)}</th>
                        <th className="p-4 cursor-pointer hover:bg-slate-200 text-right" onClick={() => handleDashboardSort('beban_terbaru')}>Beban Terbaru (kW) {dashboardSortConfig.key === 'beban_terbaru' && (dashboardSortConfig.direction === 'asc' ? <ArrowUp className="inline w-3 h-3" /> : <ArrowDown className="inline w-3 h-3" />)}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {dashboardSummaryData.map((plts, i) => {
                        const valUpper = plts.status ? String(plts.status).toUpperCase() : '';
                        let badgeClass = "bg-slate-100 text-slate-700";
                        if (valUpper === 'OPERASI') badgeClass = "bg-emerald-100 text-emerald-700 border border-emerald-200";
                        else if (valUpper === 'GANGGUAN') badgeClass = "bg-rose-100 text-rose-700 border border-rose-200";
                        else if (valUpper === 'OPERASI TERBATAS') badgeClass = "bg-amber-100 text-amber-700 border border-amber-200";
                        else if (valUpper.includes('STAND BY')) badgeClass = "bg-slate-100 text-slate-600 border border-slate-200";
                        else badgeClass = "bg-indigo-100 text-indigo-700 border border-indigo-200";

                        return (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="p-4 font-bold text-slate-700">{plts.nama_plts}</td>
                            <td className="p-4 text-center"><span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider ${badgeClass}`}>{plts.status}</span></td>
                            <td className="p-4 text-right font-medium">{plts.kapasitas_kwp}</td>
                            <td className="p-4 text-right font-bold text-sky-600">{plts.beban_terbaru} <div className="text-[10px] font-normal text-slate-400">{plts.waktu_terbaru !== '-' ? plts.waktu_terbaru : ''}</div></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* TABEL RINGKASAN PLTD */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-lg text-slate-800">Ringkasan Operasional PLTD</h3>
                  <div className="flex gap-2 print:hidden">
                    <button onClick={handleExportPDFPltd} className="px-4 py-2 bg-purple-50 text-purple-600 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-purple-100"><Download className="w-4 h-4" /> Export PDF</button>
                    <button onClick={handleExportWAGSummaryPltd} className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-emerald-100"><Copy className="w-4 h-4" /> Export WAG</button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table id="pltd-summary-table" className="w-full text-left">
                    <thead className="bg-slate-50 border-b text-xs font-bold text-slate-500 uppercase">
                      <tr>
                        <th className="p-4 cursor-pointer hover:bg-slate-200" onClick={() => handleDashboardPltdSort('nama_pltd')}>Nama PLTD {dashboardPltdSortConfig.key === 'nama_pltd' && (dashboardPltdSortConfig.direction === 'asc' ? <ArrowUp className="inline w-3 h-3" /> : <ArrowDown className="inline w-3 h-3" />)}</th>

                        {/* BARIS BARU: HEADER STATUS */}
                        <th className="p-4 cursor-pointer hover:bg-slate-200 text-center" onClick={() => handleDashboardPltdSort('Status')}>Status {dashboardPltdSortConfig.key === 'Status' && (dashboardPltdSortConfig.direction === 'asc' ? <ArrowUp className="inline w-3 h-3" /> : <ArrowDown className="inline w-3 h-3" />)}</th>

                        <th className="p-4 cursor-pointer hover:bg-slate-200 text-right" onClick={() => handleDashboardPltdSort('daya_terpasang')}>Daya Terpasang (kW) {dashboardPltdSortConfig.key === 'daya_terpasang' && (dashboardPltdSortConfig.direction === 'asc' ? <ArrowUp className="inline w-3 h-3" /> : <ArrowDown className="inline w-3 h-3" />)}</th>
                        <th className="p-4 cursor-pointer hover:bg-slate-200 text-right" onClick={() => handleDashboardPltdSort('daya_mampu')}>Daya Mampu (kW) {dashboardPltdSortConfig.key === 'daya_mampu' && (dashboardPltdSortConfig.direction === 'asc' ? <ArrowUp className="inline w-3 h-3" /> : <ArrowDown className="inline w-3 h-3" />)}</th>
                        <th className="p-4 cursor-pointer hover:bg-slate-200 text-right" onClick={() => handleDashboardPltdSort('beban_terbaru')}>Beban Terbaru (kW) {dashboardPltdSortConfig.key === 'beban_terbaru' && (dashboardPltdSortConfig.direction === 'asc' ? <ArrowUp className="inline w-3 h-3" /> : <ArrowDown className="inline w-3 h-3" />)}</th>
                        <th className="p-4 cursor-pointer hover:bg-slate-200 text-right" onClick={() => handleDashboardPltdSort('stok_bbm')}>Stok BBM Tersedia (L) {dashboardPltdSortConfig.key === 'stok_bbm' && (dashboardPltdSortConfig.direction === 'asc' ? <ArrowUp className="inline w-3 h-3" /> : <ArrowDown className="inline w-3 h-3" />)}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {dashboardSummaryPLTDData.map((pltd, i) => {
                        // --- BARIS BARU: Logika Warna Badge Status ---
                        const valUpper = pltd.status ? String(pltd.status).toUpperCase() : '';
                        let badgeClass = "bg-slate-100 text-slate-700";
                        if (valUpper === 'OPERASI') badgeClass = "bg-emerald-100 text-emerald-700 border border-emerald-200";
                        else if (valUpper === 'GANGGUAN') badgeClass = "bg-rose-100 text-rose-700 border border-rose-200";
                        else if (valUpper === 'OPERASI TERBATAS') badgeClass = "bg-amber-100 text-amber-700 border border-amber-200";
                        else if (valUpper.includes('STAND BY')) badgeClass = "bg-slate-100 text-slate-600 border border-slate-200";
                        else badgeClass = "bg-indigo-100 text-indigo-700 border border-indigo-200";

                        return (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="p-4 font-bold text-slate-700">{pltd.nama_pltd}</td>

                            {/* BARIS BARU: TAMPILAN BADGE STATUS */}
                            <td className="p-4 text-center"><span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider ${badgeClass}`}>{pltd.status || '-'}</span></td>

                            <td className="p-4 text-right font-medium">{pltd.daya_terpasang}</td>
                            <td className="p-4 text-right font-bold text-emerald-600">{pltd.daya_mampu}</td>
                            <td className="p-4 text-right font-bold text-purple-600">{pltd.beban_terbaru} <div className="text-[10px] font-normal text-slate-400">{pltd.waktu_terbaru !== '-' ? pltd.waktu_terbaru : ''}</div></td>
                            <td className="p-4 text-right font-bold text-teal-600">{Number(pltd.stok_bbm).toLocaleString('id-ID')}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {(activeTab === 'assets_plts' || activeTab === 'assets_pltd') && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full min-h-[500px]">
              <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {activeTab === 'assets_plts' ? <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Sun className="w-5 h-5" /></div> : <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Zap className="w-5 h-5" /></div>}
                  <h3 className="font-bold text-lg text-slate-800">Inventaris {activeTab === 'assets_plts' ? 'PLTS' : 'PLTD'}</h3>
                </div>

                {/* --- BAGIAN YANG DIUBAH: Penambahan div flex untuk merapikan tombol & search --- */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* TOMBOL TAMBAH DATA */}
                  <button
                    onClick={handleAddClick}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> Tambah Data
                  </button>

                  <div className="relative">
                    <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input type="text" placeholder="Cari aset..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64" />
                  </div>
                </div>
                {/* --- AKHIR BAGIAN YANG DIUBAH --- */}

              </div>
              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-sm font-semibold uppercase tracking-wider">
                      <th className="p-4 w-12 text-center">#</th><th className="p-4 w-24 text-center">Aksi</th>
                      {displayHeaders.map((header, idx) => (
                        <th key={idx} className="p-4 whitespace-nowrap cursor-pointer hover:bg-slate-200 transition-colors select-none group" onClick={() => handleSort(header)}>
                          <div className="flex items-center gap-2"><span>{header.replace(/_/g, ' ')}</span>{sortConfig.key === header ? (sortConfig.direction === 'asc' ? <ArrowUp className="w-4 h-4 text-blue-600" /> : <ArrowDown className="w-4 h-4 text-blue-600" />) : <ArrowUpDown className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />}</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                    {filteredAssets.length > 0 ? (
                      filteredAssets.map((asset, rowIndex) => (
                        <tr key={asset._id || asset.site_id || rowIndex} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 text-center font-medium text-slate-400">{rowIndex + 1}</td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {activeTab === 'assets_pltd' && (
                                <>
                                  <button onClick={() => setViewingMesin(asset)} className="p-1.5 bg-purple-50 text-purple-600 rounded hover:bg-purple-100 transition-colors" title="Data Mesin"><Cpu className="w-4 h-4" /></button>
                                  <button onClick={() => setViewingTangki(asset)} className="p-1.5 bg-teal-50 text-teal-600 rounded hover:bg-teal-100 transition-colors" title="Data Tangki"><Database className="w-4 h-4" /></button>
                                </>
                              )}
                              {activeTab === 'assets_plts' && (
                                <button onClick={() => { setViewingPltsSpec(asset); setIsEditingSpec(false); setSpecFormData(asset); }} className="p-1.5 bg-yellow-50 text-yellow-600 rounded hover:bg-yellow-100 transition-colors" title="Spesifikasi Teknis PLTS"><Battery className="w-4 h-4" /></button>
                              )}
                              <button onClick={() => handleEditClick(asset)} className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors" title="Edit"><Edit className="w-4 h-4" /></button>
                              <button onClick={() => handleDeleteClick(asset)} className="p-1.5 bg-rose-50 text-rose-600 rounded hover:bg-rose-100 transition-colors" title="Hapus"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                          {displayHeaders.map((header, colIndex) => {
                            const val = asset[header];
                            const isStatus = header.toLowerCase() === 'status';
                            let cellContent = val;
                            if (isStatus) {
                              const valUpper = val ? String(val).toUpperCase() : '';
                              let badgeClass = "bg-slate-100 text-slate-700";
                              if (valUpper === 'OPERASI') badgeClass = "bg-emerald-100 text-emerald-700 border border-emerald-200";
                              else if (valUpper === 'GANGGUAN') badgeClass = "bg-rose-100 text-rose-700 border border-rose-200";
                              else if (valUpper === 'OPERASI TERBATAS') badgeClass = "bg-amber-100 text-amber-700 border border-amber-200";
                              else if (valUpper === 'STAND BY' || valUpper === 'STANDBY') badgeClass = "bg-slate-100 text-slate-600 border border-slate-200";
                              else if (valUpper === 'ON GOING' || valUpper === 'ONGOING' || valUpper === 'ON PROGRES') badgeClass = "bg-indigo-100 text-indigo-700 border border-indigo-200";
                              cellContent = <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider ${badgeClass}`}>{val || '-'}</span>;
                            }
                            return (<td key={colIndex} className="p-4 whitespace-nowrap">{cellContent}</td>);
                          })}
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={currentHeaders.length + 1} className="p-8 text-center text-slate-500">Tidak ada data.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'log_plts' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col min-h-[600px]">
              <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-sky-50 text-sky-600 rounded-lg"><ClipboardList className="w-5 h-5" /></div>
                  <h3 className="font-bold text-lg text-slate-800">Log Beban PLTS</h3>
                </div>
                {currentUser.role === 'admin' ? (
                  <select className="px-4 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 font-medium text-slate-800" value={selectedPltsForLog} onChange={(e) => { setSelectedPltsForLog(e.target.value); setLogFormData({ ...logFormData, petugas: [] }); }}>
                    <option value="" disabled>-- Pilih PLTS --</option>
                    {pltsAssets.map(p => <option key={p.site_id} value={p.site_id}>{p.nama_plts} ({p.site_id})</option>)}
                  </select>
                ) : (
                  <div className="px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm font-bold text-slate-700">
                    {currentUser.name}
                  </div>
                )}
              </div>
              <div className="p-6">
                {!selectedPltsForLog ? (
                  <div className="text-center py-12 text-slate-400">Pilih PLTS terlebih dahulu.</div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-sky-50/50 p-5 rounded-xl border border-sky-100">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-sky-800 flex items-center gap-2"><Plus className="w-4 h-4" /> Catat Log Baru</h4>
                        <button onClick={() => { setIsAddingLog(!isAddingLog); setEditingLogId(null); }} className="text-xs font-bold text-sky-600 bg-white px-3 py-1.5 rounded-md border border-sky-200">{isAddingLog ? 'Tutup' : 'Buka Formulir'}</button>
                      </div>
                      {isAddingLog && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4 bg-white p-4 rounded-lg border border-sky-100">
                          <div><label className="block text-xs font-bold text-slate-600 mb-1">Tanggal</label><input type="date" className="w-full text-sm px-3 py-2 border rounded-lg" value={logFormData.tanggal} onChange={e => setLogFormData({ ...logFormData, tanggal: e.target.value })} /></div>
                          <div><label className="block text-xs font-bold text-slate-600 mb-1">Jam</label><input type="time" className="w-full text-sm px-3 py-2 border rounded-lg" value={logFormData.jam} onChange={e => setLogFormData({ ...logFormData, jam: e.target.value })} /></div>
                          <div><label className="block text-xs font-bold text-slate-600 mb-1">Beban Puncak (kW)</label><input type="number" step="0.1" className="w-full text-sm px-3 py-2 border rounded-lg" value={logFormData.beban_puncak} onChange={e => setLogFormData({ ...logFormData, beban_puncak: e.target.value })} /></div>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">Status</label>
                            <select className="w-full text-sm px-3 py-2 border rounded-lg" value={logFormData.status} onChange={e => setLogFormData({ ...logFormData, status: e.target.value })}>
                              <option>Operasi</option><option>Gangguan</option><option>Tidak Operasi</option>
                            </select>
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-600 mb-1">Keterangan Tambahan</label>
                            <input type="text" placeholder="Misal: Cuaca mendung, pemeliharaan rutin..." className="w-full text-sm px-3 py-2 border rounded-lg" value={logFormData.keterangan} onChange={e => setLogFormData({ ...logFormData, keterangan: e.target.value })} />
                          </div>
                          <div className="md:col-span-4 mt-2">
                            <label className="block text-xs font-bold text-slate-600 mb-2">Petugas Piket</label>
                            <div className="flex flex-wrap gap-3">
                              {getOperatorsForSite(selectedPltsForLog, false).length === 0 ? <span className="text-xs text-rose-500 italic">Belum ada data operator di Master Data PLTS ini.</span> :
                                getOperatorsForSite(selectedPltsForLog, false).map(op => (
                                  <label key={op} className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-slate-100">
                                    <input type="checkbox" checked={(logFormData.petugas || []).includes(op)} onChange={() => handleTogglePetugas(op, logFormData, setLogFormData)} className="rounded text-sky-600 focus:ring-sky-500" />
                                    <span className="text-xs font-medium text-slate-700">{String(op).split(' - ')[0]}</span>
                                  </label>
                                ))}
                            </div>
                          </div>
                          <div className="md:col-span-4 flex justify-end mt-2"><button onClick={handleSaveLog} disabled={!logFormData.beban_puncak} className="px-5 py-2.5 bg-sky-600 text-white text-sm font-bold rounded-lg hover:bg-sky-700 disabled:opacity-50">{editingLogId ? 'Simpan Perubahan' : 'Simpan Log'}</button></div>
                        </div>
                      )}
                    </div>
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left"><thead className="bg-slate-50 text-xs font-bold text-slate-600 uppercase border-b"><tr><th className="p-4">Waktu</th><th className="p-4 text-right">Beban (kW)</th><th className="p-4">Status & Ket</th><th className="p-4 text-center w-24">Aksi</th></tr></thead>
                        <tbody className="divide-y divide-slate-100">
                          {currentPltsLogs.map(log => (
                            <tr key={log._id} className="hover:bg-slate-50 text-sm group">
                              <td className="p-4"><div className="font-bold text-slate-800">{log.jam}</div><div className="text-[10px] text-slate-500">{log.tanggal}</div>
                                <div className="text-[10px] text-sky-600 font-bold mt-1 max-w-[150px] truncate" title={Array.isArray(log.petugas) ? log.petugas.join(', ') : ''}>👷 {Array.isArray(log.petugas) && log.petugas.length > 0 ? log.petugas.map((p: any) => String(p).split(' - ')[0]).join(', ') : '-'}</div>
                              </td>
                              <td className="p-4 text-right font-bold text-sky-600 text-base">{log.beban_puncak}</td>
                              <td className="p-4"><div className="font-bold text-slate-700">{log.status}</div><div className="text-xs text-slate-500 italic max-w-xs truncate" title={log.keterangan}>{log.keterangan || '-'}</div></td>
                              <td className="p-4 text-center">
                                <div className="flex justify-center gap-1">
                                  <button onClick={() => { let text = `*LAPORAN PLTS*\nTanggal: ${log.tanggal}\nJam: ${log.jam}\nBeban: ${log.beban_puncak} kW\nStatus: ${log.status}\nKet: ${log.keterangan || '-'}\nPetugas: ${Array.isArray(log.petugas) ? log.petugas.map((p: any) => String(p).split(' - ')[0]).join(', ') : '-'}`; const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); setNotification('Salin WAG berhasil!'); }} className="p-1.5 bg-sky-50 text-sky-600 rounded hover:bg-sky-100" title="Salin ke WAG"><Copy className="w-4 h-4" /></button>
                                  <button onClick={() => { setEditingLogId(log._id); setLogFormData(log); setIsAddingLog(true); }} className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100" title="Edit Log"><Edit className="w-4 h-4" /></button>
                                  <button onClick={() => setDeletingLogId(log._id)} className="p-1.5 bg-rose-50 text-rose-600 rounded hover:bg-rose-100" title="Hapus Log"><Trash2 className="w-4 h-4" /></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {currentPltsLogs.length > 0 && (
                      <div className="mt-6 bg-white p-6 border border-slate-200 rounded-xl shadow-sm">
                        <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><Activity className="w-5 h-5 text-sky-500" /> Grafik Tren Beban Puncak</h4>
                        <div className="h-72">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={[...currentPltsLogs].reverse()} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                              <XAxis dataKey="jam" tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={false} />
                              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={false} />
                              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                              <Line type="monotone" dataKey="beban_puncak" name="Beban Puncak (kW)" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4, fill: '#fff', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'log_pltd' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col min-h-[600px]">
              <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><ClipboardList className="w-5 h-5" /></div>
                  <h3 className="font-bold text-lg text-slate-800">Log Beban PLTD</h3>
                </div>
                {currentUser.role === 'admin' ? (
                  <select className="px-4 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 font-medium text-slate-800" value={selectedPltdForLog} onChange={(e) => { setSelectedPltdForLog(e.target.value); setLogPltdFormData({ ...logPltdFormData, petugas: [] }); }}>
                    <option value="" disabled>-- Pilih PLTD --</option>
                    {pltdAssets.map(p => <option key={p.site_id} value={p.site_id}>{p.nama_pltd} ({p.site_id})</option>)}
                  </select>
                ) : (
                  <div className="px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm font-bold text-slate-700">
                    {currentUser.name}
                  </div>
                )}
              </div>
              <div className="p-6">
                {!selectedPltdForLog ? (
                  <div className="text-center py-12 text-slate-400">Pilih PLTD terlebih dahulu.</div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-purple-50/50 p-5 rounded-xl border border-purple-100">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-purple-800 flex items-center gap-2"><Plus className="w-4 h-4" /> Catat Log Beban Baru</h4>
                        <button onClick={() => { setIsAddingLogPltd(!isAddingLogPltd); setEditingLogPltdId(null); }} className="text-xs font-bold text-purple-600 bg-white px-3 py-1.5 rounded-md border border-purple-200">{isAddingLogPltd ? 'Tutup' : 'Buka Formulir'}</button>
                      </div>
                      {isAddingLogPltd && (
                        <div className="bg-white p-5 rounded-xl border border-purple-100 shadow-sm mt-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div><label className="block text-xs font-bold text-slate-600 mb-1">Tanggal</label><input type="date" className="w-full text-sm px-3 py-2.5 border rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-500" value={logPltdFormData.tanggal} onChange={e => setLogPltdFormData({ ...logPltdFormData, tanggal: e.target.value })} /></div>
                            <div><label className="block text-xs font-bold text-slate-600 mb-1">Jam</label><input type="time" className="w-full text-sm px-3 py-2.5 border rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-purple-500" value={logPltdFormData.jam} onChange={e => setLogPltdFormData({ ...logPltdFormData, jam: e.target.value })} /></div>
                            <div className="bg-purple-50/50 p-3 rounded-lg border border-purple-100 col-span-1 md:col-span-2">
                              <label className="block text-xs font-bold text-purple-800 mb-2">Beban (kW / kVAR)</label>
                              <div className="flex gap-2">
                                <input type="number" placeholder="Aktif (kW)" className="w-full text-sm px-3 py-2 border rounded-lg" value={logPltdFormData.beban_aktif} onChange={e => setLogPltdFormData({ ...logPltdFormData, beban_aktif: e.target.value })} />
                                <input type="number" placeholder="Reaktif (kVAR)" className="w-full text-sm px-3 py-2 border rounded-lg" value={logPltdFormData.beban_reaktif} onChange={e => setLogPltdFormData({ ...logPltdFormData, beban_reaktif: e.target.value })} />
                              </div>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 col-span-1 md:col-span-2">
                              <label className="block text-xs font-bold text-slate-600 mb-2">Arus R / S / T (A)</label>
                              <div className="flex gap-2">
                                <input type="number" placeholder="R" className="w-full text-sm px-2 py-2 border rounded-lg text-center" value={logPltdFormData.arus_r} onChange={e => setLogPltdFormData({ ...logPltdFormData, arus_r: e.target.value })} />
                                <input type="number" placeholder="S" className="w-full text-sm px-2 py-2 border rounded-lg text-center" value={logPltdFormData.arus_s} onChange={e => setLogPltdFormData({ ...logPltdFormData, arus_s: e.target.value })} />
                                <input type="number" placeholder="T" className="w-full text-sm px-2 py-2 border rounded-lg text-center" value={logPltdFormData.arus_t} onChange={e => setLogPltdFormData({ ...logPltdFormData, arus_t: e.target.value })} />
                              </div>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 col-span-1 lg:col-span-1">
                              <label className="block text-xs font-bold text-slate-600 mb-2">Teg. RS/ST/TR (kV)</label>
                              <div className="flex gap-2">
                                <input type="number" placeholder="RS" step="0.1" className="w-full text-sm px-1 py-2 border rounded-lg text-center" value={logPltdFormData.tegangan_rs} onChange={e => setLogPltdFormData({ ...logPltdFormData, tegangan_rs: e.target.value })} />
                                <input type="number" placeholder="ST" step="0.1" className="w-full text-sm px-1 py-2 border rounded-lg text-center" value={logPltdFormData.tegangan_st} onChange={e => setLogPltdFormData({ ...logPltdFormData, tegangan_st: e.target.value })} />
                                <input type="number" placeholder="TR" step="0.1" className="w-full text-sm px-1 py-2 border rounded-lg text-center" value={logPltdFormData.tegangan_tr} onChange={e => setLogPltdFormData({ ...logPltdFormData, tegangan_tr: e.target.value })} />
                              </div>
                            </div>
                            <div><label className="block text-xs font-bold text-slate-600 mb-1">Frekuensi (Hz)</label><input type="number" step="0.1" className="w-full text-lg font-bold px-3 py-2.5 border border-slate-300 rounded-lg text-center focus:ring-2 focus:ring-purple-500" value={logPltdFormData.frekuensi} onChange={e => setLogPltdFormData({ ...logPltdFormData, frekuensi: e.target.value })} /></div>
                            <div className="lg:col-span-4 mt-2">
                              <label className="block text-xs font-bold text-slate-600 mb-2">Petugas Piket</label>
                              <div className="flex flex-wrap gap-3">
                                {getOperatorsForSite(selectedPltdForLog, true).length === 0 ? <span className="text-xs text-rose-500 italic">Belum ada data operator di Master Data PLTD ini.</span> :
                                  getOperatorsForSite(selectedPltdForLog, true).map(op => (
                                    <label key={op} className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-slate-100">
                                      <input type="checkbox" checked={(logPltdFormData.petugas || []).includes(op)} onChange={() => handleTogglePetugas(op, logPltdFormData, setLogPltdFormData)} className="rounded text-purple-600 focus:ring-purple-500" />
                                      <span className="text-xs font-medium text-slate-700">{String(op).split(' - ')[0]}</span>
                                    </label>
                                  ))}
                              </div>
                            </div>
                            <div className="lg:col-span-4 flex justify-end mt-4 pt-4 border-t border-slate-100">
                              <button onClick={handleSaveLogPltd} disabled={!logPltdFormData.beban_aktif} className="px-8 py-3 bg-purple-600 text-white text-sm font-bold rounded-xl hover:bg-purple-700 shadow-md disabled:opacity-50">{editingLogPltdId ? 'Simpan Perubahan' : 'Simpan Log PLTD'}</button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="border border-slate-200 rounded-xl overflow-x-auto">
                      <table className="w-full text-left min-w-[800px]"><thead className="bg-slate-50 text-xs font-bold text-slate-600 uppercase border-b"><tr><th className="p-4">Waktu</th><th className="p-4 text-right">B. Aktif (kW)</th><th className="p-4 text-right">B. Reaktif</th><th className="p-4 text-center">Arus (R/S/T)</th><th className="p-4 text-center">Teg. (RS/ST/TR)</th><th className="p-4 text-center">Frek (Hz)</th><th className="p-4 text-center">Aksi</th></tr></thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                          {currentPltdLogs.map(log => (
                            <tr key={log._id} className="hover:bg-slate-50 group">
                              <td className="p-4"><div className="font-bold">{log.jam}</div><div className="text-[10px] text-slate-500">{log.tanggal}</div><div className="text-[10px] text-purple-600 font-bold mt-1" title={Array.isArray(log.petugas) ? log.petugas.join(', ') : ''}>👷 {Array.isArray(log.petugas) && log.petugas.length > 0 ? log.petugas.map((p: any) => String(p).split(' - ')[0]).join(', ') : '-'}</div></td>
                              <td className="p-4 text-right font-bold text-purple-600 text-base">{log.beban_aktif}</td><td className="p-4 text-right">{log.beban_reaktif}</td>
                              <td className="p-4 text-center font-mono text-xs">{log.arus_r}/{log.arus_s}/{log.arus_t}</td><td className="p-4 text-center font-mono text-xs">{log.tegangan_rs}/{log.tegangan_st}/{log.tegangan_tr}</td><td className="p-4 text-center font-bold text-emerald-600">{log.frekuensi}</td>
                              <td className="p-4 text-center">
                                <div className="flex justify-center gap-1">
                                  <button onClick={() => { let text = `*LAPORAN PLTD*\nTanggal: ${log.tanggal} ${log.jam}\nAktif: ${log.beban_aktif} kW\nReaktif: ${log.beban_reaktif}\nPetugas: ${Array.isArray(log.petugas) ? log.petugas.map((p: any) => String(p).split(' - ')[0]).join(', ') : '-'}`; const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); setNotification('Salin WAG berhasil!'); }} className="p-1.5 bg-purple-50 text-purple-600 rounded hover:bg-purple-100" title="Salin ke WAG"><Copy className="w-4 h-4" /></button>
                                  <button onClick={() => { setEditingLogPltdId(log._id); setLogPltdFormData(log); setIsAddingLogPltd(true); }} className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100" title="Edit Log"><Edit className="w-4 h-4" /></button>
                                  <button onClick={() => setDeletingLogPltdId(log._id)} className="p-1.5 bg-rose-50 text-rose-600 rounded hover:bg-rose-100" title="Hapus Log"><Trash2 className="w-4 h-4" /></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {currentPltdLogs.length > 0 && (
                      <div className="mt-6 bg-white p-6 border border-slate-200 rounded-xl shadow-sm">
                        <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><Activity className="w-5 h-5 text-purple-500" /> Grafik Tren Beban Aktif & Reaktif</h4>
                        <div className="h-72">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={[...currentPltdLogs].reverse()} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                              <XAxis dataKey="jam" tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={false} />
                              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={false} />
                              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                              <Legend wrapperStyle={{ paddingTop: '20px' }} />
                              <Line type="monotone" dataKey="beban_aktif" name="Beban Aktif (kW)" stroke="#9333ea" strokeWidth={3} dot={{ r: 4, fill: '#fff', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                              <Line type="monotone" dataKey="beban_reaktif" name="Beban Reaktif (kVAR)" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#fff', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'log_mesin' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col min-h-[600px]">
              <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Server className="w-5 h-5" /></div>
                  <h3 className="font-bold text-lg text-slate-800">Log Status Operasi Mesin</h3>
                </div>
                {currentUser.role === 'admin' ? (
                  <select className="px-4 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 font-medium text-slate-800" value={selectedPltdForMesinLog} onChange={(e) => setSelectedPltdForMesinLog(e.target.value)}>
                    <option value="" disabled>-- Pilih PLTD --</option>
                    {pltdAssets.map(p => <option key={p.site_id} value={p.site_id}>{p.nama_pltd} ({p.site_id})</option>)}
                  </select>
                ) : (
                  <div className="px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm font-bold text-slate-700">
                    {currentUser.name}
                  </div>
                )}
              </div>
              <div className="p-6">
                {!selectedPltdForMesinLog ? (
                  <div className="text-center py-12 text-slate-400">Pilih PLTD terlebih dahulu.</div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-indigo-50/50 p-5 rounded-xl border border-indigo-100">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-indigo-800 flex items-center gap-2"><Plus className="w-4 h-4" /> Catat Status Mesin</h4>
                        <button onClick={() => { if (isAddingMesinLog) setIsAddingMesinLog(false); else handleOpenAddMesinLog(); }} className="text-xs font-bold text-indigo-600 bg-white px-3 py-1.5 rounded-md border border-indigo-200">{isAddingMesinLog ? 'Batal' : 'Buka Formulir'}</button>
                      </div>
                      {isAddingMesinLog && (
                        <div className="mt-4 bg-white p-5 rounded-xl border border-indigo-100 shadow-sm">
                          <div className="flex flex-wrap gap-4 mb-4">
                            <div><label className="block text-xs font-bold text-slate-600 mb-1">Tanggal</label><input type="date" className="w-40 text-sm px-3 py-2 border rounded-lg" value={mesinLogFormData.tanggal} onChange={e => setMesinLogFormData({ ...mesinLogFormData, tanggal: e.target.value })} /></div>
                            <div><label className="block text-xs font-bold text-slate-600 mb-1">Jam (Jadwal)</label><select className="w-32 text-sm px-3 py-2 border rounded-lg" value={mesinLogFormData.jam} onChange={e => setMesinLogFormData({ ...mesinLogFormData, jam: e.target.value })}><option value="10:00">10:00 WIT</option><option value="19:00">19:00 WIT</option></select></div>
                            <div className="flex-1 min-w-[200px]">
                              <label className="block text-xs font-bold text-slate-600 mb-2">Petugas Piket</label>
                              <div className="flex flex-wrap gap-2">
                                {getOperatorsForSite(selectedPltdForMesinLog, true).length === 0 ? <span className="text-xs text-rose-500 italic">Belum ada data operator.</span> :
                                  getOperatorsForSite(selectedPltdForMesinLog, true).map(op => (
                                    <label key={op} className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-2 py-1 rounded cursor-pointer hover:bg-slate-100">
                                      <input type="checkbox" checked={(mesinLogFormData.petugas || []).includes(op)} onChange={() => handleTogglePetugas(op, mesinLogFormData, setMesinLogFormData)} className="rounded text-indigo-600 focus:ring-indigo-500" />
                                      <span className="text-[11px] font-medium text-slate-700">{String(op).split(' - ')[0]}</span>
                                    </label>
                                  ))}
                              </div>
                            </div>
                          </div>
                          <div className="border border-slate-200 rounded-xl overflow-x-auto bg-white">
                            <table className="w-full text-left min-w-[700px]"><thead className="bg-slate-50 text-xs font-bold text-slate-600 uppercase border-b"><tr><th className="p-3 w-48">ID Mesin</th><th className="p-3 text-right">D. Terpasang</th><th className="p-3">Daya Mampu (kW)</th><th className="p-3">Beban Supply (kW)</th><th className="p-3">Status Operasi</th></tr></thead>
                              <tbody className="divide-y divide-slate-100">
                                {mesinLogFormData.mesin_data.length === 0 ? (<tr><td colSpan={5} className="p-4 text-center text-rose-500 text-sm">Tidak ada mesin di Master Data.</td></tr>) : mesinLogFormData.mesin_data.map((m: any) => (
                                  <tr key={m._id} className="hover:bg-slate-50">
                                    <td className="p-3"><div className="font-bold text-sm">{m.id_mesin}</div><div className="text-[10px] text-slate-400">{m.merk_type}</div></td>
                                    <td className="p-3 text-right text-sm font-semibold">{m.daya_terpasang}</td>
                                    <td className="p-3"><input type="number" className="w-full px-2 py-1.5 border rounded text-sm" value={m.daya_mampu} onChange={e => handleMesinLogDataChange(m._id, 'daya_mampu', e.target.value)} /></td>
                                    <td className="p-3"><input type="number" className="w-full px-2 py-1.5 border rounded text-sm" value={m.beban_supply} onChange={e => handleMesinLogDataChange(m._id, 'beban_supply', e.target.value)} /></td>
                                    <td className="p-3"><select className="w-full px-2 py-1.5 border rounded text-xs font-bold" value={m.status_operasi} onChange={e => handleMesinLogDataChange(m._id, 'status_operasi', e.target.value)}><option value="OPERASI">OPERASI</option><option value="STAND BY">STAND BY</option><option value="GANGGUAN">GANGGUAN</option></select></td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <div className="flex justify-end mt-4"><button onClick={handleSaveMesinLog} disabled={mesinLogFormData.mesin_data.length === 0} className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"><Save className="w-4 h-4" /> Simpan & Update Master</button></div>
                        </div>
                      )}
                    </div>
                    <div className="border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full text-left"><thead className="bg-slate-50 text-xs font-bold text-slate-600 uppercase border-b"><tr><th className="p-4 w-24 text-center">Waktu</th><th className="p-4">Petugas Piket</th><th className="p-4">Jumlah Mesin</th><th className="p-4 text-center w-24">Aksi</th></tr></thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                          {currentMesinLogs.map((log: any) => (
                            <tr key={log._id} className="hover:bg-slate-50 group">
                              <td className="p-4 text-center"><div className="font-bold text-lg">{log.jam}</div><div className="text-[10px] text-slate-500">{log.tanggal}</div></td>
                              <td className="p-4"><div className="font-bold text-indigo-700">{Array.isArray(log.petugas) && log.petugas.length > 0 ? log.petugas.map((p: any) => String(p).split(' - ')[0]).join(', ') : '-'}</div></td>
                              <td className="p-4 font-medium">{log.mesin_data.length} Unit Mesin Terdata</td>
                              <td className="p-4 text-center flex justify-center gap-1">
                                {/* TOMBOL COPY WAG */}
                                <button onClick={() => {
                                  const pltdName = pltdAssets.find(p => p.site_id === log.site_id)?.nama_pltd || log.site_id;
                                  let text = `*LAPORAN STATUS MESIN PLTD*\nLokasi: ${pltdName}\nTanggal: ${log.tanggal}\nJam: ${log.jam}\nPetugas: ${Array.isArray(log.petugas) && log.petugas.length > 0 ? log.petugas.map((p: any) => String(p).split(' - ')[0]).join(', ') : '-'}\n\n*Rincian Mesin:*\n`;

                                  log.mesin_data.forEach((m: any, idx: number) => {
                                    text += `${idx + 1}. ${m.id_mesin} (${m.merk_type}): Mampu ${m.daya_mampu}kW | Supply ${m.beban_supply}kW | *${m.status_operasi}*\n`;
                                  });

                                  const ta = document.createElement("textarea");
                                  ta.value = text;
                                  document.body.appendChild(ta);
                                  ta.select();
                                  document.execCommand('copy');
                                  document.body.removeChild(ta);
                                  setNotification('Format WAG Status Mesin disalin!');
                                }} className="p-1.5 bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-100" title="Salin ke WAG">
                                  <Copy className="w-4 h-4" />
                                </button>

                                {/* TOMBOL EDIT */}
                                <button onClick={() => setEditingMesinLog(log)} className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100" title="Edit Log">
                                  <Edit className="w-4 h-4" />
                                </button>

                                {/* TOMBOL HAPUS */}
                                <button onClick={() => setDeletingMesinLog(log)} className="p-1.5 bg-rose-50 text-rose-600 rounded hover:bg-rose-100" title="Hapus Log">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'log_produksi' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col min-h-[600px]">
              <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Gauge className="w-5 h-5" /></div>
                  <div><h3 className="font-bold text-lg text-slate-800">Pencatatan Produksi & SFC PLTD</h3></div>
                </div>
                {currentUser.role === 'admin' ? (
                  <select className="px-4 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 font-medium text-slate-800" value={selectedPltdForProduksi} onChange={(e) => { setSelectedPltdForProduksi(e.target.value); setProduksiFormData({ ...produksiFormData, petugas: [] }); }}>
                    <option value="" disabled>-- Pilih PLTD --</option>
                    {pltdAssets.map(p => <option key={p.site_id} value={p.site_id}>{p.nama_pltd} ({p.site_id})</option>)}
                  </select>
                ) : (
                  <div className="px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm font-bold text-slate-700">
                    {currentUser.name}
                  </div>
                )}
              </div>

              <div className="p-6">
                {!selectedPltdForProduksi ? (
                  <div className="text-center py-12 text-slate-400">Pilih PLTD terlebih dahulu.</div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-orange-50/30 p-6 rounded-xl border border-orange-100 shadow-sm">
                      <div className="mb-4 pb-4 border-b border-orange-100 flex flex-wrap gap-4 justify-between items-center">
                        <div className="flex items-center gap-4">
                          <h4 className="font-bold text-orange-800 flex items-center gap-2"><Calendar className="w-5 h-5" /> Tanggal</h4>
                          <input type="date" className="px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold" value={produksiFormData.tanggal} onChange={e => setProduksiFormData({ ...produksiFormData, tanggal: e.target.value })} />
                        </div>
                        <div className="flex items-center gap-2 flex-1 max-w-lg">
                          <h4 className="font-bold text-orange-800 text-sm whitespace-nowrap">Petugas:</h4>
                          <div className="flex flex-wrap gap-1">
                            {getOperatorsForSite(selectedPltdForProduksi, true).length === 0 ? <span className="text-xs text-rose-500 italic">Belum ada operator.</span> :
                              getOperatorsForSite(selectedPltdForProduksi, true).map(op => (
                                <label key={op} className="flex items-center gap-1.5 bg-white border border-orange-200 px-2 py-1 rounded cursor-pointer hover:bg-orange-50">
                                  <input type="checkbox" checked={(produksiFormData.petugas || []).includes(op)} onChange={() => handleTogglePetugas(op, produksiFormData, setProduksiFormData)} className="rounded text-orange-600 focus:ring-orange-500" />
                                  <span className="text-[10px] font-bold text-orange-900">{String(op).split(' - ')[0]}</span>
                                </label>
                              ))}
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-4 rounded-xl border border-slate-200">
                          <h5 className="font-bold text-slate-700 mb-4 flex items-center gap-2 text-sm"><Activity className="w-4 h-4 text-sky-500" /> Data Produksi kWh</h5>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div><label className="block text-xs font-bold text-slate-500 mb-1">Stand Kemarin</label><input type="number" className={`w-full px-3 py-2 border rounded-lg text-sm ${previousProduksiLog ? 'bg-slate-100' : 'bg-yellow-50'}`} value={produksiFormData.stand_kwh_kemarin} onChange={e => setProduksiFormData({ ...produksiFormData, stand_kwh_kemarin: e.target.value })} readOnly={!!previousProduksiLog} /></div>
                            <div><label className="block text-xs font-bold text-slate-700 mb-1">Stand Hari Ini</label><input type="number" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold" value={produksiFormData.stand_kwh_hari_ini} onChange={e => setProduksiFormData({ ...produksiFormData, stand_kwh_hari_ini: e.target.value })} /></div>
                          </div>
                          <div className="bg-sky-50 p-3 rounded-lg border border-sky-100 flex justify-between items-center"><span className="text-xs font-bold text-sky-700 uppercase">Produksi (kWh)</span><span className="text-lg font-black text-sky-600">{Number(kwhProduksiCalc).toLocaleString('id-ID')}</span></div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-200">
                          <h5 className="font-bold text-slate-700 mb-4 flex items-center gap-2 text-sm"><Droplet className="w-4 h-4 text-rose-500" /> Data Flow Meter BBM</h5>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div><label className="block text-xs font-bold text-slate-500 mb-1">Stand Kemarin</label><input type="number" className={`w-full px-3 py-2 border rounded-lg text-sm ${previousProduksiLog ? 'bg-slate-100' : 'bg-yellow-50'}`} value={produksiFormData.stand_bbm_kemarin} onChange={e => setProduksiFormData({ ...produksiFormData, stand_bbm_kemarin: e.target.value })} readOnly={!!previousProduksiLog} /></div>
                            <div><label className="block text-xs font-bold text-slate-700 mb-1">Stand Hari Ini</label><input type="number" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold" value={produksiFormData.stand_bbm_hari_ini} onChange={e => setProduksiFormData({ ...produksiFormData, stand_bbm_hari_ini: e.target.value })} /></div>
                          </div>
                          <div className="bg-rose-50 p-3 rounded-lg border border-rose-100 flex justify-between items-center"><span className="text-xs font-bold text-rose-700 uppercase">Pemakaian (L)</span><span className="text-lg font-black text-rose-600">{Number(bbmPemakaianCalc).toLocaleString('id-ID')}</span></div>
                        </div>
                      </div>
                      <div className="mt-6 flex flex-col md:flex-row gap-4 items-center">
                        <div className="flex-1 bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex justify-between items-center w-full">
                          <div><h4 className="font-bold text-emerald-800 text-sm">SFC</h4><p className="text-[10px] text-emerald-600 font-medium">Liter / kWh</p></div>
                          <div className="text-right"><span className="text-3xl font-black text-emerald-600 tracking-tight">{sfcCalc}</span></div>
                        </div>
                        <button onClick={handleSaveProduksiLog} disabled={!produksiFormData.stand_kwh_hari_ini || !produksiFormData.stand_bbm_hari_ini} className="w-full md:w-auto h-full px-8 py-4 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 disabled:opacity-50"><Save className="w-5 h-5 inline mr-2" /> Simpan Data</button>
                      </div>
                    </div>
                    <div className="border border-slate-200 rounded-xl overflow-x-auto bg-white">
                      <table className="w-full text-left min-w-[700px]">
                        <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase border-b"><tr><th className="p-4">Tanggal & Petugas</th><th className="p-4 text-center">Produksi (kWh)</th><th className="p-4 text-center">BBM (L)</th><th className="p-4 text-center">SFC</th><th className="p-4 text-center">Aksi</th></tr></thead>
                        <tbody className="divide-y divide-slate-100">
                          {currentProduksiLogs.map((log: any) => (
                            <tr key={log._id} className="hover:bg-slate-50 group">
                              <td className="p-4"><div className="font-bold text-slate-800">{log.tanggal}</div><div className="text-[10px] text-orange-600 font-bold mt-1">👷 {Array.isArray(log.petugas) && log.petugas.length > 0 ? log.petugas.map((p: any) => String(p).split(' - ')[0]).join(', ') : '-'}</div></td>
                              <td className="p-4 text-center"><div className="font-bold text-sky-600 text-base">{Number(log.kwh_produksi).toLocaleString('id-ID')}</div><div className="text-[10px] text-slate-400">{log.stand_kwh_kemarin} → {log.stand_kwh_hari_ini}</div></td>
                              <td className="p-4 text-center"><div className="font-bold text-rose-600 text-base">{Number(log.pemakaian_bbm).toLocaleString('id-ID')}</div><div className="text-[10px] text-slate-400">{log.stand_bbm_kemarin} → {log.stand_bbm_hari_ini}</div></td>
                              <td className="p-4 text-center"><span className="bg-emerald-100 text-emerald-700 font-bold px-3 py-1 rounded-md">{log.sfc}</span></td>
                              <td className="p-4 text-center">
                                <div className="flex justify-center gap-1">
                                  <button onClick={() => { let text = `*PRODUKSI & BBM*\nTanggal: ${log.tanggal}\nProduksi: ${Number(log.kwh_produksi).toLocaleString('id-ID')} kWh\nBBM: ${Number(log.pemakaian_bbm).toLocaleString('id-ID')} L\nSFC: ${log.sfc}\nPetugas: ${Array.isArray(log.petugas) ? log.petugas.map((p: any) => String(p).split(' - ')[0]).join(', ') : '-'}`; const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); setNotification('Salin WAG berhasil!'); }} className="p-1.5 bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-100" title="Salin ke WAG">
                                    <Copy className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => { setEditingProduksiId(log._id); setEditProduksiFormData(log); }} className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100" title="Edit Log">
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => setDeletingProduksiId(log._id)} className="p-1.5 bg-rose-50 text-rose-600 rounded hover:bg-rose-100" title="Hapus Log">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {currentProduksiLogs.length > 0 && (
                      <div className="mt-6 bg-white p-6 border border-slate-200 rounded-xl shadow-sm">
                        <h4 className="font-bold text-slate-800 mb-6 flex items-center gap-2"><Gauge className="w-5 h-5 text-orange-500" /> Grafik Tren Produksi & SFC</h4>
                        <div className="h-72">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={[...currentProduksiLogs].reverse()} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                              <XAxis dataKey="tanggal" tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={false} />
                              <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={false} />
                              <YAxis yAxisId="right" orientation="right" domain={['dataMin - 0.05', 'auto']} tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={false} />
                              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                              <Legend wrapperStyle={{ paddingTop: '20px' }} />
                              <Line yAxisId="left" type="monotone" dataKey="kwh_produksi" name="Produksi (kWh)" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 4, fill: '#fff', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                              <Line yAxisId="right" type="monotone" dataKey="sfc" name="SFC (L/kWh)" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#fff', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'input_bbm' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col min-h-[600px]">
              <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="flex items-center gap-3"><div className="p-2 bg-teal-50 text-teal-600 rounded-lg"><Droplet className="w-5 h-5" /></div><div><h3 className="font-bold text-lg text-slate-800">Input Stok BBM Tangki</h3><p className="text-xs text-slate-500">Penerimaan DO / Koreksi Stok Opname</p></div></div>
                {currentUser.role === 'admin' ? (
                  <select className="px-4 py-2 border border-slate-300 rounded-lg text-sm bg-slate-50 font-medium text-slate-800" value={selectedPltdForBBM} onChange={(e) => { setSelectedPltdForBBM(e.target.value); setIsAddingBBM(false); }}>
                    <option value="" disabled>-- Pilih PLTD --</option>
                    {pltdAssets.map(p => <option key={p.site_id} value={p.site_id}>{p.nama_pltd} ({p.site_id})</option>)}
                  </select>
                ) : (
                  <div className="px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm font-bold text-slate-700">
                    {currentUser.name}
                  </div>
                )}
              </div>
              <div className="p-6">
                {!selectedPltdForBBM ? (
                  <div className="text-center py-12 text-slate-400">Pilih PLTD terlebih dahulu.</div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-teal-50/50 p-6 rounded-xl border border-teal-100">
                      <div className="flex justify-between items-center mb-6">
                        <h4 className="font-bold text-teal-800 flex items-center gap-2"><Plus className="w-5 h-5" /> Form Input Massal Tangki</h4>
                        {!isAddingBBM && <button onClick={handleOpenInputBBM} className="px-4 py-2 bg-white border border-teal-200 text-teal-700 font-bold rounded-lg text-sm shadow-sm hover:bg-teal-50">Buka Formulir</button>}
                      </div>

                      {isAddingBBM && (
                        <div className="bg-white p-5 rounded-xl border border-teal-200 shadow-sm">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 pb-6 border-b border-slate-100">
                            <div><label className="block text-xs font-bold text-slate-600 mb-1">Tanggal & Jam</label><div className="flex gap-2"><input type="date" className="w-full text-sm px-3 py-2 border rounded-lg" value={bbmFormData.tanggal} onChange={e => setBbmFormData({ ...bbmFormData, tanggal: e.target.value })} /><input type="time" className="w-24 text-sm px-2 py-2 border rounded-lg" value={bbmFormData.jam} onChange={e => setBbmFormData({ ...bbmFormData, jam: e.target.value })} /></div></div>
                            <div><label className="block text-xs font-bold text-slate-600 mb-1">Jenis Input</label><select className="w-full text-sm px-3 py-2 border rounded-lg bg-teal-50 font-bold text-teal-800" value={bbmFormData.jenis_input} onChange={e => setBbmFormData({ ...bbmFormData, jenis_input: e.target.value })}><option value="Penerimaan">Penerimaan (Tambah Volume)</option><option value="Stok Opname">Stok Opname (Ubah Aktual)</option></select></div>
                            <div className="md:col-span-2"><label className="block text-xs font-bold text-slate-600 mb-1">Referensi / Keterangan</label><input type="text" placeholder="Misal: No. DO Pertamina / Hasil Opname Akhir Bulan" className="w-full text-sm px-3 py-2 border rounded-lg" value={bbmFormData.referensi} onChange={e => setBbmFormData({ ...bbmFormData, referensi: e.target.value })} /></div>
                            <div className="md:col-span-4"><label className="block text-xs font-bold text-slate-600 mb-2">Petugas Pendamping / Pelaksana</label>
                              <div className="flex flex-wrap gap-2">
                                {getOperatorsForSite(selectedPltdForBBM, true).length === 0 ? <span className="text-xs text-rose-500 italic">Belum ada operator terdata.</span> :
                                  getOperatorsForSite(selectedPltdForBBM, true).map(op => (
                                    <label key={op} className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg cursor-pointer hover:bg-teal-50">
                                      <input type="checkbox" checked={(bbmFormData.petugas || []).includes(op)} onChange={() => handleTogglePetugas(op, bbmFormData, setBbmFormData)} className="rounded text-teal-600 focus:ring-teal-500" />
                                      <span className="text-xs font-bold text-teal-900">{String(op).split(' - ')[0]}</span>
                                    </label>
                                  ))}
                              </div>
                            </div>
                          </div>
                          <div className="overflow-x-auto"><table className="w-full text-left border-collapse"><thead className="bg-slate-50 text-xs font-bold text-slate-600 uppercase border-b border-t"><tr><th className="p-3">ID Tangki</th><th className="p-3 text-right">Kapasitas (L)</th><th className="p-3 text-right">Volume Terkini (L)</th><th className="p-3 bg-teal-50 w-48">{bbmFormData.jenis_input === 'Penerimaan' ? 'Jml Tambah (L)' : 'Vol Aktual (L)'}</th></tr></thead>
                            <tbody className="divide-y divide-slate-100">
                              {bbmFormData.tangki_data.length === 0 ? <tr><td colSpan={4} className="p-4 text-center text-rose-500 text-sm">Tidak ada tangki terdata di PLTD ini.</td></tr> : bbmFormData.tangki_data.map((t: any) => (
                                <tr key={t._id} className="hover:bg-slate-50 text-sm"><td className="p-3 font-bold text-slate-700">{t.id_tangki}</td><td className="p-3 text-right text-slate-500">{Number(t.kapasitas_liter).toLocaleString('id-ID')}</td><td className="p-3 text-right font-bold text-slate-700">{Number(t.volume_terkini).toLocaleString('id-ID')}</td><td className="p-3 bg-teal-50/30"><input type="number" className="w-full px-2 py-1.5 border border-teal-200 rounded text-right font-bold focus:ring-2 focus:ring-teal-500" value={t.input_volume} onChange={e => handleBbmDataChange(t._id, e.target.value)} placeholder="0" /></td></tr>
                              ))}
                            </tbody>
                          </table></div>
                          <div className="flex justify-end mt-4 pt-4 border-t border-slate-100 gap-3">
                            <button onClick={() => setIsAddingBBM(false)} className="px-5 py-2.5 text-slate-500 font-bold hover:bg-slate-100 rounded-lg text-sm">Batal</button>
                            <button onClick={handleSaveBBM} className="px-6 py-2.5 bg-teal-600 text-white text-sm font-bold rounded-lg hover:bg-teal-700 shadow-md flex items-center gap-2"><Save className="w-4 h-4" /> Simpan & Update Semua Tangki</button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* --- KODE TABEL LOG BBM (DIPINDAH KE LUAR FORMULIR) --- */}
                    <div className="border border-slate-200 rounded-xl overflow-x-auto bg-white mt-6 shadow-sm">
                      <table className="w-full text-left min-w-[800px]">
                        <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase border-b">
                          <tr><th className="p-4">Waktu & Petugas</th><th className="p-4">Jenis Input & Ref</th><th className="p-4">Rincian Tangki (Volume)</th><th className="p-4 text-center">Aksi</th></tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {currentBbmLogs.map((log: any) => (
                            <tr key={log._id} className="hover:bg-slate-50 group text-sm">
                              <td className="p-4"><div className="font-bold text-slate-800">{log.tanggal}</div><div className="text-[10px] text-slate-500 font-bold">{log.jam} WIT</div><div className="text-[10px] text-teal-600 font-bold mt-1">👷 {Array.isArray(log.petugas) && log.petugas.length > 0 ? log.petugas.map((p: any) => String(p).split(' - ')[0]).join(', ') : '-'}</div></td>
                              <td className="p-4"><span className={`px-2 py-1 rounded text-[10px] font-bold ${log.jenis_input === 'Penerimaan' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>{log.jenis_input}</span><div className="text-xs text-slate-500 mt-2 font-medium">{log.referensi || '-'}</div></td>
                              <td className="p-4">
                                <ul className="space-y-1 text-xs font-medium text-slate-700">
                                  {log.tangki_data.map((t: any, i: number) => (
                                    <li key={i}>• {t.id_tangki}: <span className="font-bold text-teal-600">{log.jenis_input === 'Penerimaan' ? '+' : ''}{Number(t.input_volume).toLocaleString('id-ID')} L</span></li>
                                  ))}
                                </ul>
                              </td>
                              <td className="p-4 text-center">
                                <div className="flex justify-center gap-1">
                                  <button onClick={() => { let text = `*LAPORAN STOK BBM TANGKI*\nTanggal: ${log.tanggal} ${log.jam}\nJenis: ${log.jenis_input}\nRef: ${log.referensi || '-'}\nPetugas: ${Array.isArray(log.petugas) ? log.petugas.map((p: any) => String(p).split(' - ')[0]).join(', ') : '-'}\n\n*Rincian Volume:*\n`; log.tangki_data.forEach((t: any, idx: number) => { text += `${idx + 1}. ${t.id_tangki} = ${log.jenis_input === 'Penerimaan' ? '+' : ''}${Number(t.input_volume).toLocaleString('id-ID')} Liter\n`; }); const ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); setNotification('Salin WAG berhasil!'); }} className="p-1.5 bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-100" title="Salin ke WAG"><Copy className="w-4 h-4" /></button>
                                  <button onClick={() => setEditingBbmLog(log)} className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100" title="Edit Log"><Edit className="w-4 h-4" /></button>
                                  <button onClick={() => setDeletingBbmLogId(log._id)} className="p-1.5 bg-rose-50 text-rose-600 rounded hover:bg-rose-100" title="Hapus Log"><Trash2 className="w-4 h-4" /></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {currentBbmLogs.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-slate-400 italic">Belum ada riwayat input BBM.</td></tr>}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'absensi_plts' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col min-h-[600px]">
              <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50 rounded-t-2xl">
                <div className="flex items-center gap-3"><div className="p-2 bg-pink-100 text-pink-600 rounded-lg"><UserCheck className="w-6 h-6" /></div><div><h3 className="font-bold text-lg text-slate-800">Rekap Absensi Operator PLTS</h3><p className="text-xs text-slate-500">Ter-generate otomatis dari Log Beban</p></div></div>
                <div className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-slate-200"><Calendar className="w-5 h-5 text-slate-400 ml-2" /><input type="date" className="px-2 py-1 text-sm font-bold text-slate-700 outline-none cursor-pointer" value={absensiDate} onChange={e => setAbsensiDate(e.target.value)} /><button onClick={handleCopyAbsensi} className="px-4 py-2 bg-pink-600 text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-pink-700 transition-colors shadow-sm"><Copy className="w-4 h-4" /> Salin Rekap WAG</button></div>
              </div>
              <div className="p-0 overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]"><thead className="bg-white border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider"><tr><th className="p-5 w-16 text-center">No</th><th className="p-5 w-64">Lokasi PLTS</th><th className="p-5 w-40 text-center">Status Lapor</th><th className="p-5">Daftar Operator (Hadir / Tidak)</th></tr></thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {absensiData.map((row, idx) => (
                      <tr key={row.site_id} className={`hover:bg-slate-50 transition-colors ${!row.sudah_lapor ? 'bg-rose-50/20' : ''}`}>
                        <td className="p-5 text-center font-medium text-slate-400">{idx + 1}</td>
                        <td className="p-5 font-bold text-slate-700">{row.nama_plts}</td>
                        <td className="p-5 text-center">{row.sudah_lapor ? <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold"><Check className="w-3 h-3" /> Sudah Lapor</span> : <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-bold"><AlertCircle className="w-3 h-3" /> Belum Lapor</span>}</td>
                        <td className="p-5">
                          <div className="flex flex-wrap gap-2">
                            {row.operators.map((op: any, i: number) => (
                              <div key={i} className={`px-2.5 py-1 rounded text-[11px] font-bold border ${op.hadir ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                                {op.hadir && <Check className="w-3 h-3 inline mr-1" />}{String(op.nama).split(' - ')[0]}
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {absensiData.length === 0 && <tr><td colSpan={4} className="p-12 text-center text-slate-400">Tidak ada data untuk tanggal ini.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'absensi_pltd' && (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col min-h-[600px]">
              <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50 rounded-t-2xl">
                <div className="flex items-center gap-3"><div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><UserCheck className="w-6 h-6" /></div><div><h3 className="font-bold text-lg text-slate-800">Rekap Absensi Operator PLTD</h3><p className="text-xs text-slate-500">Ter-generate otomatis dari Log Beban PLTD</p></div></div>
                <div className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-slate-200"><Calendar className="w-5 h-5 text-slate-400 ml-2" /><input type="date" className="px-2 py-1 text-sm font-bold text-slate-700 outline-none cursor-pointer" value={absensiDatePltd} onChange={e => setAbsensiDatePltd(e.target.value)} /><button onClick={handleCopyAbsensiPltd} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-purple-700 transition-colors shadow-sm"><Copy className="w-4 h-4" /> Salin Rekap WAG</button></div>
              </div>
              <div className="p-0 overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]"><thead className="bg-white border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider"><tr><th className="p-5 w-16 text-center">No</th><th className="p-5 w-64">Lokasi PLTD</th><th className="p-5 w-40 text-center">Status Lapor</th><th className="p-5">Daftar Operator (Hadir / Tidak)</th></tr></thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {absensiDataPltd.map((row, idx) => (
                      <tr key={row.site_id} className={`hover:bg-slate-50 transition-colors ${!row.sudah_lapor ? 'bg-rose-50/20' : ''}`}>
                        <td className="p-5 text-center font-medium text-slate-400">{idx + 1}</td>
                        <td className="p-5 font-bold text-slate-700">{row.nama_pltd}</td>
                        <td className="p-5 text-center">{row.sudah_lapor ? <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold"><Check className="w-3 h-3" /> Sudah Lapor</span> : <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-bold"><AlertCircle className="w-3 h-3" /> Belum Lapor</span>}</td>
                        <td className="p-5">
                          <div className="flex flex-wrap gap-2">
                            {row.operators.map((op: any, i: number) => (
                              <div key={i} className={`px-2.5 py-1 rounded text-[11px] font-bold border ${op.hadir ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                                {op.hadir && <Check className="w-3 h-3 inline mr-1" />}{String(op.nama).split(' - ')[0]}
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {absensiDataPltd.length === 0 && <tr><td colSpan={4} className="p-12 text-center text-slate-400">Tidak ada data untuk tanggal ini.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {viewingPltsSpec && (
            <div className="fixed inset-0 bg-slate-900/50 z-[60] flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg"><Battery className="w-5 h-5" /></div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">Spesifikasi Teknis PLTS</h3>
                      <p className="text-xs text-slate-500 font-medium">{viewingPltsSpec.nama_plts} ({viewingPltsSpec.site_id})</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!isEditingSpec ? (
                      <button onClick={() => setIsEditingSpec(true)} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg font-bold text-xs hover:bg-blue-100 transition-colors">
                        Edit Spesifikasi
                      </button>
                    ) : (
                      <button onClick={handleSaveSpec} className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg font-bold text-xs flex items-center gap-1 hover:bg-emerald-700 transition-colors">
                        <Save className="w-3 h-3" /> Simpan
                      </button>
                    )}
                    <button onClick={() => setViewingPltsSpec(null)} className="text-slate-400 hover:text-slate-600 ml-2"><X className="w-5 h-5" /></button>
                  </div>
                </div>
                <div className="p-6 overflow-y-auto space-y-4 bg-white">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {['kapasitas_kwp', 'kapasitas_battery_kwh', 'kapasitas_batt_inverter_kw', 'kapasitas_grid_inverter_kw', 'kapasitas_panel_pv', 'jumlah_panel', 'jumlah_battery', 'jumlah_batt_inverter', 'jumlah_grid_inverter'].map(key => (
                      <div key={key} className="flex flex-col">
                        <span className="text-xs font-bold text-slate-500 mb-1">{key.replace(/_/g, ' ').toUpperCase()}</span>
                        {isEditingSpec ? (
                          <input type="text" className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none text-sm font-medium" value={specFormData[key] || ''} onChange={e => setSpecFormData({ ...specFormData, [key]: e.target.value })} />
                        ) : (
                          <span className="text-sm font-bold bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-slate-700">{viewingPltsSpec[key] || '-'}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {viewingMesin && (
            <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-2xl">
                  <div className="flex items-center gap-3"><div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Cpu className="w-5 h-5" /></div><div><h3 className="text-lg font-bold text-slate-800">Master Data Mesin</h3><p className="text-xs text-slate-500 font-medium">{viewingMesin.nama_pltd} ({viewingMesin.site_id})</p></div></div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setIsAddingMesin(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-bold hover:bg-purple-700 transition-colors"><Plus className="w-3.5 h-3.5" /> Tambah Mesin</button>
                    <div className="w-px h-6 bg-slate-300 mx-1"></div>
                    <button onClick={() => setViewingMesin(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
                  </div>
                </div>
                <div className="bg-white border-b border-slate-200 px-6 py-3 flex flex-wrap gap-6 shadow-sm z-20">
                  <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"><Zap className="w-4 h-4" /></div><div><p className="text-[10px] font-bold text-slate-500 uppercase">Total Daya Terpasang</p><p className="text-sm font-bold text-slate-800">{mesinPltd.filter(m => m.site_id === viewingMesin.site_id).reduce((sum, m) => sum + (Number(m.daya_terpasang) || 0), 0).toLocaleString('id-ID')} kW</p></div></div>
                  <div className="w-px h-8 bg-slate-200"></div>
                  <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600"><Zap className="w-4 h-4" /></div><div><p className="text-[10px] font-bold text-emerald-600 uppercase">Total Daya Mampu</p><p className="text-sm font-bold text-emerald-700">{mesinPltd.filter(m => m.site_id === viewingMesin.site_id).reduce((sum, m) => sum + (Number(m.daya_mampu) || 0), 0).toLocaleString('id-ID')} kW</p></div></div>
                  <div className="w-px h-8 bg-slate-200"></div>
                  <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center text-sky-600"><Activity className="w-4 h-4" /></div><div><p className="text-[10px] font-bold text-sky-600 uppercase">Total Beban Supply</p><p className="text-sm font-bold text-sky-700">{mesinPltd.filter(m => m.site_id === viewingMesin.site_id).reduce((sum, m) => sum + (Number(m.beban_supply) || 0), 0).toLocaleString('id-ID')} kW</p></div></div>
                </div>
                <div className="p-0 overflow-x-auto overflow-y-auto flex-1">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead className="sticky top-0 bg-white shadow-sm z-10"><tr className="border-b border-slate-200 text-slate-600 text-[11px] font-bold uppercase tracking-wider bg-slate-50"><th className="p-4 w-12 text-center">#</th><th className="p-4 w-24 text-center">Aksi</th><th className="p-4">ID Mesin</th><th className="p-4">Merk / Type</th><th className="p-4">SN</th><th className="p-4 text-right">D. Terpasang</th><th className="p-4 text-right">D. Mampu</th><th className="p-4 text-right">B. Supply</th><th className="p-4">Status</th></tr></thead>
                    <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                      {isAddingMesin && (
                        <tr className="bg-purple-50/50"><td className="p-3 text-center">-</td><td className="p-3 text-center flex gap-1 justify-center"><button onClick={handleSaveAddMesin} className="p-1 bg-emerald-100 text-emerald-600 rounded"><Check className="w-4 h-4" /></button><button onClick={() => setIsAddingMesin(false)} className="p-1 bg-rose-100 text-rose-600 rounded"><X className="w-4 h-4" /></button></td><td className="p-2"><input type="text" className="w-full px-2 py-1 border rounded" value={mesinAddFormData.id_mesin || ''} onChange={e => setMesinAddFormData({ ...mesinAddFormData, id_mesin: e.target.value })} /></td><td className="p-2"><input type="text" className="w-full px-2 py-1 border rounded" value={mesinAddFormData.merk_type || ''} onChange={e => setMesinAddFormData({ ...mesinAddFormData, merk_type: e.target.value })} /></td><td className="p-2"><input type="text" className="w-full px-2 py-1 border rounded" value={mesinAddFormData.sn || ''} onChange={e => setMesinAddFormData({ ...mesinAddFormData, sn: e.target.value })} /></td><td className="p-2"><input type="number" className="w-full px-2 py-1 border rounded text-right" value={mesinAddFormData.daya_terpasang || ''} onChange={e => setMesinAddFormData({ ...mesinAddFormData, daya_terpasang: e.target.value })} /></td><td className="p-2"><input type="number" className="w-full px-2 py-1 border rounded text-right" value={mesinAddFormData.daya_mampu || ''} onChange={e => setMesinAddFormData({ ...mesinAddFormData, daya_mampu: e.target.value })} /></td><td className="p-2"><input type="number" className="w-full px-2 py-1 border rounded text-right" value={mesinAddFormData.beban_supply || ''} onChange={e => setMesinAddFormData({ ...mesinAddFormData, beban_supply: e.target.value })} /></td><td className="p-2"><input type="text" className="w-full px-2 py-1 border rounded" value={mesinAddFormData.status_operasi || ''} onChange={e => setMesinAddFormData({ ...mesinAddFormData, status_operasi: e.target.value })} /></td></tr>
                      )}
                      {mesinPltd.filter(m => m.site_id === viewingMesin.site_id).map((mesin, idx) => {
                        if (editingMesinId === mesin._id) {
                          return <tr key={mesin._id} className="bg-blue-50/40"><td className="p-3 text-center">{idx + 1}</td><td className="p-3 text-center flex gap-1 justify-center"><button onClick={handleSaveEditMesin} className="p-1 bg-emerald-100 text-emerald-600 rounded"><Check className="w-4 h-4" /></button><button onClick={() => setEditingMesinId(null)} className="p-1 bg-rose-100 text-rose-600 rounded"><X className="w-4 h-4" /></button></td><td className="p-2"><input type="text" className="w-full px-2 py-1 border rounded" value={mesinEditFormData.id_mesin || ''} onChange={e => setMesinEditFormData({ ...mesinEditFormData, id_mesin: e.target.value })} /></td><td className="p-2"><input type="text" className="w-full px-2 py-1 border rounded" value={mesinEditFormData.merk_type || ''} onChange={e => setMesinEditFormData({ ...mesinEditFormData, merk_type: e.target.value })} /></td><td className="p-2"><input type="text" className="w-full px-2 py-1 border rounded" value={mesinEditFormData.sn || ''} onChange={e => setMesinEditFormData({ ...mesinEditFormData, sn: e.target.value })} /></td><td className="p-2"><input type="number" className="w-full px-2 py-1 border rounded text-right" value={mesinEditFormData.daya_terpasang || ''} onChange={e => setMesinEditFormData({ ...mesinEditFormData, daya_terpasang: e.target.value })} /></td><td className="p-2"><input type="number" className="w-full px-2 py-1 border rounded text-right" value={mesinEditFormData.daya_mampu || ''} onChange={e => setMesinEditFormData({ ...mesinEditFormData, daya_mampu: e.target.value })} /></td><td className="p-2"><input type="number" className="w-full px-2 py-1 border rounded text-right" value={mesinEditFormData.beban_supply || ''} onChange={e => setMesinEditFormData({ ...mesinEditFormData, beban_supply: e.target.value })} /></td><td className="p-2"><input type="text" className="w-full px-2 py-1 border rounded" value={mesinEditFormData.status_operasi || ''} onChange={e => setMesinEditFormData({ ...mesinEditFormData, status_operasi: e.target.value })} /></td></tr>
                        }
                        return (
                          <tr key={mesin._id} className="hover:bg-slate-50 group">
                            <td className="p-4 text-center text-slate-400">{idx + 1}</td>
                            <td className="p-4 text-center">
                              <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100"><button onClick={() => { setEditingMesinId(mesin._id); setMesinEditFormData(mesin); }} className="p-1 bg-blue-50 text-blue-600 rounded"><Edit className="w-4 h-4" /></button><button onClick={() => setDeletingMesin(mesin)} className="p-1 bg-rose-50 text-rose-600 rounded"><Trash2 className="w-4 h-4" /></button></div>
                            </td>
                            <td className="p-4 font-semibold">{mesin.id_mesin}</td><td className="p-4">{mesin.merk_type}</td><td className="p-4">{mesin.sn}</td>
                            <td className="p-4 text-right font-bold">{mesin.daya_terpasang}</td><td className="p-4 text-right font-bold text-emerald-600">{mesin.daya_mampu}</td><td className="p-4 text-right font-bold text-sky-600">{mesin.beban_supply || '0'}</td><td className="p-4 font-bold text-xs">{mesin.status_operasi}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {viewingTangki && (
            <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-2xl">
                  <div className="flex items-center gap-3"><div className="p-2 bg-teal-100 text-teal-600 rounded-lg"><Database className="w-5 h-5" /></div><div><h3 className="text-lg font-bold text-slate-800">Data Kapasitas Tangki</h3><p className="text-xs text-slate-500 font-medium">{viewingTangki.nama_pltd}</p></div></div>
                  <div className="flex gap-2">
                    <button onClick={() => setIsAddingTangki(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-bold hover:bg-teal-700 transition-colors"><Plus className="w-3.5 h-3.5" /> Tambah Tangki</button>
                    <button onClick={() => setViewingTangki(null)} className="text-slate-400 hover:text-slate-600 ml-2"><X className="w-5 h-5" /></button>
                  </div>
                </div>
                <div className="bg-white border-b border-slate-200 px-6 py-4 flex gap-8 shadow-sm">
                  <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"><Database className="w-4 h-4" /></div><div><p className="text-[10px] font-bold text-slate-500 uppercase">Total Kapasitas</p><p className="text-sm font-bold text-slate-800">{tangkiPltd.filter(t => t.site_id === viewingTangki.site_id).reduce((sum, t) => sum + (Number(t.kapasitas_liter) || 0), 0).toLocaleString('id-ID')} L</p></div></div>
                  <div className="w-px h-8 bg-slate-200"></div>
                  <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-600"><Droplet className="w-4 h-4" /></div><div><p className="text-[10px] font-bold text-teal-600 uppercase">Total Volume Terkini</p><p className="text-sm font-bold text-teal-700">{tangkiPltd.filter(t => t.site_id === viewingTangki.site_id).reduce((sum, t) => sum + (Number(t.volume_terkini) || 0), 0).toLocaleString('id-ID')} L</p></div></div>
                </div>
                <div className="p-0 overflow-y-auto">
                  <table className="w-full text-left">
                    <thead className="bg-white sticky top-0 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase"><tr><th className="p-4 w-24 text-center">Aksi</th><th className="p-4">ID Tangki / Tandon</th><th className="p-4 text-right">Kapasitas Maksimal (Liter)</th><th className="p-4 text-right">Volume Terkini (Liter)</th></tr></thead>
                    <tbody className="divide-y divide-slate-100">
                      {isAddingTangki && (
                        <tr className="bg-teal-50/50">
                          <td className="p-3 text-center flex justify-center gap-1"><button onClick={handleSaveAddTangki} className="p-1 bg-emerald-100 text-emerald-600 rounded"><Check className="w-4 h-4" /></button><button onClick={() => setIsAddingTangki(false)} className="p-1 bg-rose-100 text-rose-600 rounded"><X className="w-4 h-4" /></button></td>
                          <td className="p-3"><input type="text" className="w-full px-2 py-1.5 border rounded text-sm" value={tangkiAddFormData.id_tangki || ''} onChange={e => setTangkiAddFormData({ ...tangkiAddFormData, id_tangki: e.target.value })} placeholder="Nama Tangki" /></td>
                          <td className="p-3"><input type="number" className="w-full px-2 py-1.5 border rounded text-sm text-right" value={tangkiAddFormData.kapasitas_liter || ''} onChange={e => setTangkiAddFormData({ ...tangkiAddFormData, kapasitas_liter: e.target.value })} placeholder="0" /></td>
                          <td className="p-3 text-right text-sm text-slate-400 italic">0 (Default)</td>
                        </tr>
                      )}
                      {tangkiPltd.filter(t => t.site_id === viewingTangki.site_id).map(t => {
                        if (editingTangkiId === t._id) {
                          return (
                            <tr key={t._id} className="bg-blue-50/40">
                              <td className="p-3 text-center flex justify-center gap-1"><button onClick={handleSaveEditTangki} className="p-1 bg-emerald-100 text-emerald-600 rounded"><Check className="w-4 h-4" /></button><button onClick={() => setEditingTangkiId(null)} className="p-1 bg-rose-100 text-rose-600 rounded"><X className="w-4 h-4" /></button></td>
                              <td className="p-3"><input type="text" className="w-full px-2 py-1.5 border rounded text-sm" value={tangkiEditFormData.id_tangki || ''} onChange={e => setTangkiEditFormData({ ...tangkiEditFormData, id_tangki: e.target.value })} /></td>
                              <td className="p-3"><input type="number" className="w-full px-2 py-1.5 border rounded text-sm text-right" value={tangkiEditFormData.kapasitas_liter || ''} onChange={e => setTangkiEditFormData({ ...tangkiEditFormData, kapasitas_liter: e.target.value })} /></td>
                              <td className="p-3"><input type="number" className="w-full px-2 py-1.5 border rounded text-sm text-right font-bold text-teal-600" value={tangkiEditFormData.volume_terkini || ''} onChange={e => setTangkiEditFormData({ ...tangkiEditFormData, volume_terkini: e.target.value })} /></td>
                            </tr>
                          )
                        }
                        return (
                          <tr key={t._id} className="hover:bg-slate-50 group text-sm">
                            <td className="p-4 text-center">
                              <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100"><button onClick={() => { setEditingTangkiId(t._id); setTangkiEditFormData(t); }} className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"><Edit className="w-4 h-4" /></button><button onClick={() => setDeletingTangki(t)} className="p-1.5 bg-rose-50 text-rose-600 rounded hover:bg-rose-100"><Trash2 className="w-4 h-4" /></button></div>
                            </td>
                            <td className="p-4 font-bold text-slate-700">{t.id_tangki}</td>
                            <td className="p-4 text-right text-slate-500 font-medium">{Number(t.kapasitas_liter).toLocaleString('id-ID')}</td>
                            <td className="p-4 text-right font-bold text-teal-600 text-base">{Number(t.volume_terkini || 0).toLocaleString('id-ID')}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* MODAL EDIT LOG STATUS MESIN */}
          {editingMesinLog && (
            <div className="fixed inset-0 bg-slate-900/50 z-[70] flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-2xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><Server className="w-5 h-5" /></div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">Edit Log Status Mesin</h3>
                      <p className="text-xs text-slate-500 font-medium">Ubah data riwayat pencatatan</p>
                    </div>
                  </div>
                  <button onClick={() => setEditingMesinLog(null)} className="text-slate-400 hover:text-rose-500 transition-colors"><X className="w-5 h-5" /></button>
                </div>

                <div className="p-6 overflow-y-auto">
                  <div className="flex flex-wrap gap-4 mb-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Tanggal</label>
                      <input type="date" className="w-40 text-sm px-3 py-2 border border-slate-300 rounded-lg" value={editingMesinLog.tanggal || ''} onChange={e => setEditingMesinLog({ ...editingMesinLog, tanggal: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Jam (Jadwal)</label>
                      <select className="w-32 text-sm px-3 py-2 border border-slate-300 rounded-lg" value={editingMesinLog.jam || ''} onChange={e => setEditingMesinLog({ ...editingMesinLog, jam: e.target.value })}>
                        <option value="10:00">10:00 WIT</option>
                        <option value="19:00">19:00 WIT</option>
                      </select>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                      <label className="block text-xs font-bold text-slate-600 mb-2">Petugas Piket</label>
                      <div className="flex flex-wrap gap-2">
                        {getOperatorsForSite(selectedPltdForMesinLog, true).length === 0 ? <span className="text-xs text-rose-500 italic">Belum ada data operator.</span> :
                          getOperatorsForSite(selectedPltdForMesinLog, true).map(op => (
                            <label key={op} className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-2 py-1 rounded cursor-pointer hover:bg-indigo-50">
                              <input type="checkbox" checked={(editingMesinLog.petugas || []).includes(op)} onChange={() => handleTogglePetugas(op, editingMesinLog, setEditingMesinLog)} className="rounded text-indigo-600 focus:ring-indigo-500" />
                              <span className="text-[11px] font-bold text-slate-700">{String(op).split(' - ')[0]}</span>
                            </label>
                          ))}
                      </div>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-xl overflow-x-auto bg-white shadow-sm">
                    <table className="w-full text-left min-w-[700px]">
                      <thead className="bg-slate-50 text-xs font-bold text-slate-600 uppercase border-b">
                        <tr><th className="p-3 w-48">ID Mesin</th><th className="p-3 text-right">D. Terpasang</th><th className="p-3">Daya Mampu (kW)</th><th className="p-3">Beban Supply (kW)</th><th className="p-3">Status Operasi</th></tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {editingMesinLog.mesin_data.map((m: any) => (
                          <tr key={m._id} className="hover:bg-slate-50">
                            <td className="p-3"><div className="font-bold text-sm text-slate-700">{m.id_mesin}</div><div className="text-[10px] text-slate-400">{m.merk_type}</div></td>
                            <td className="p-3 text-right text-sm font-semibold text-slate-500">{m.daya_terpasang}</td>
                            <td className="p-3"><input type="number" className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-indigo-500" value={m.daya_mampu} onChange={e => handleUpdateMesinLogData(m._id, 'daya_mampu', e.target.value)} /></td>
                            <td className="p-3"><input type="number" className="w-full px-2 py-1.5 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-indigo-500" value={m.beban_supply} onChange={e => handleUpdateMesinLogData(m._id, 'beban_supply', e.target.value)} /></td>
                            <td className="p-3">
                              <select className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs font-bold focus:ring-2 focus:ring-indigo-500" value={m.status_operasi} onChange={e => handleUpdateMesinLogData(m._id, 'status_operasi', e.target.value)}>
                                <option value="OPERASI">OPERASI</option><option value="STAND BY">STAND BY</option><option value="GANGGUAN">GANGGUAN</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="p-6 bg-slate-50 rounded-b-2xl border-t border-slate-100 flex justify-end gap-3">
                  <button onClick={() => setEditingMesinLog(null)} className="px-5 py-2.5 text-slate-500 font-bold hover:bg-slate-200 rounded-lg text-sm transition-colors">Batal</button>
                  <button onClick={handleSaveEditMesinLog} className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-indigo-700 flex items-center gap-2 transition-colors">
                    <Save className="w-4 h-4" /> Simpan Perubahan
                  </button>
                </div>
              </div>
            </div>
          )}

          {(isAddingAsset || editingAsset) && (
            <div className="fixed inset-0 bg-slate-900/50 z-[70] flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-2xl">
                  <h3 className="text-lg font-bold text-slate-800">{isAddingAsset ? 'Tambah Data Aset' : 'Edit Data Aset'}</h3>
                  <button onClick={() => { setIsAddingAsset(false); setEditingAsset(null); }} className="text-slate-400 hover:text-rose-500 transition-colors"><X className="w-5 h-5" /></button>
                </div>

                <div className="p-6 overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {/* BAGIAN YANG DIUBAH: Tambahkan logika sort() menggunakan prioritasKolom */}
                    {[...currentHeaders].sort((a, b) => {
                      const indexA = prioritasKolom.indexOf(a);
                      const indexB = prioritasKolom.indexOf(b);
                      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
                      if (indexA !== -1) return -1;
                      if (indexB !== -1) return 1;
                      return a.localeCompare(b);
                    }).map((h, i) => (
                      <div key={i} className="flex flex-col">
                        <label className="text-[10px] font-bold block mb-1.5 uppercase tracking-wider text-slate-500">
                          {h.replace(/_/g, ' ')}
                        </label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
                          value={isAddingAsset ? addFormData[h] || '' : editFormData[h] || ''}
                          onChange={e => { isAddingAsset ? setAddFormData({ ...addFormData, [h]: e.target.value }) : setEditFormData({ ...editFormData, [h]: e.target.value }) }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 bg-slate-50 rounded-b-2xl border-t border-slate-100 flex justify-end gap-3">
                  <button onClick={() => { setIsAddingAsset(false); setEditingAsset(null); }} className="px-5 py-2 text-slate-500 font-bold hover:bg-slate-200 rounded-lg text-sm transition-colors">Batal</button>
                  <button onClick={isAddingAsset ? handleSaveAdd : handleSaveEdit} className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-blue-700 flex items-center gap-2 transition-colors">
                    <Save className="w-4 h-4" /> Simpan Data
                  </button>
                </div>
              </div>
            </div>
          )}

          {(deletingAsset || deletingLogId || deletingLogPltdId || deletingMesinLog) && (
            <div className="fixed inset-0 bg-slate-900/50 z-[70] flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-xl p-6 text-center w-full max-w-sm">
                <h3 className="font-bold text-lg mb-2">Hapus Data?</h3><p className="text-sm text-slate-500 mb-6">Tindakan ini tidak bisa dibatalkan.</p>
                <div className="flex justify-center gap-3"><button onClick={() => { setDeletingAsset(null); setDeletingLogId(null); setDeletingLogPltdId(null); setDeletingMesinLog(null); }} className="px-4 py-2 border rounded-lg font-bold">Batal</button><button onClick={deletingAsset ? confirmDelete : (deletingLogId ? confirmDeleteLog : (deletingLogPltdId ? confirmDeleteLogPltd : confirmDeleteMesinLog))} className="px-4 py-2 bg-rose-600 text-white rounded-lg font-bold">Hapus Permanen</button></div>
              </div>
            </div>
          )}

          {/* MODAL EDIT LOG PRODUKSI & BBM */}
          {editingProduksiId && (
            <div className="fixed inset-0 bg-slate-900/50 z-[70] flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-2xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><Gauge className="w-5 h-5" /></div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">Edit Log Produksi & BBM</h3>
                      <p className="text-xs text-slate-500 font-medium">Ubah data stand kWh dan BBM</p>
                    </div>
                  </div>
                  <button onClick={() => setEditingProduksiId(null)} className="text-slate-400 hover:text-rose-500"><X className="w-5 h-5" /></button>
                </div>

                <div className="p-6 overflow-y-auto space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Tanggal</label>
                      <input type="date" className="w-full px-3 py-2 border rounded-lg text-sm" value={editProduksiFormData.tanggal || ''} onChange={e => setEditProduksiFormData({ ...editProduksiFormData, tanggal: e.target.value })} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1">Petugas</label>
                      <div className="flex flex-wrap gap-2">
                        {getOperatorsForSite(selectedPltdForProduksi, true).map(op => (
                          <label key={op} className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 px-2 py-1 rounded cursor-pointer hover:bg-orange-50">
                            <input type="checkbox" checked={(editProduksiFormData.petugas || []).includes(op)} onChange={() => handleTogglePetugas(op, editProduksiFormData, setEditProduksiFormData)} className="rounded text-orange-600 focus:ring-orange-500" />
                            <span className="text-[10px] font-bold text-slate-700">{String(op).split(' - ')[0]}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="col-span-2 grid grid-cols-2 gap-4">
                      <div className="bg-sky-50 p-4 rounded-xl border border-sky-100">
                        <h5 className="font-bold text-sky-800 mb-3 text-sm">Stand kWh Produksi</h5>
                        <div className="space-y-3">
                          <div><label className="text-xs font-medium text-slate-600 block mb-1">Stand Kemarin</label><input type="number" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" value={editProduksiFormData.stand_kwh_kemarin || ''} onChange={e => setEditProduksiFormData({ ...editProduksiFormData, stand_kwh_kemarin: e.target.value })} /></div>
                          <div><label className="text-xs font-medium text-slate-600 block mb-1">Stand Hari Ini</label><input type="number" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" value={editProduksiFormData.stand_kwh_hari_ini || ''} onChange={e => setEditProduksiFormData({ ...editProduksiFormData, stand_kwh_hari_ini: e.target.value })} /></div>
                          <div className="pt-2 border-t border-sky-200 flex justify-between"><span className="text-xs font-bold">Total Produksi:</span><span className="font-bold text-sky-700">{kwhProduksiEditCalc} kWh</span></div>
                        </div>
                      </div>

                      <div className="bg-rose-50 p-4 rounded-xl border border-rose-100">
                        <h5 className="font-bold text-rose-800 mb-3 text-sm">Stand Flow BBM</h5>
                        <div className="space-y-3">
                          <div><label className="text-xs font-medium text-slate-600 block mb-1">Stand Kemarin</label><input type="number" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" value={editProduksiFormData.stand_bbm_kemarin || ''} onChange={e => setEditProduksiFormData({ ...editProduksiFormData, stand_bbm_kemarin: e.target.value })} /></div>
                          <div><label className="text-xs font-medium text-slate-600 block mb-1">Stand Hari Ini</label><input type="number" className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" value={editProduksiFormData.stand_bbm_hari_ini || ''} onChange={e => setEditProduksiFormData({ ...editProduksiFormData, stand_bbm_hari_ini: e.target.value })} /></div>
                          <div className="pt-2 border-t border-rose-200 flex justify-between"><span className="text-xs font-bold">Total Pemakaian:</span><span className="font-bold text-rose-700">{bbmPemakaianEditCalc} L</span></div>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-2 bg-emerald-50 p-3 rounded-lg flex justify-between items-center border border-emerald-100">
                      <span className="font-bold text-emerald-800">SFC (Liter/kWh):</span>
                      <span className="text-xl font-black text-emerald-600">{sfcEditCalc}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-slate-50 rounded-b-2xl border-t border-slate-100 flex justify-end gap-3">
                  <button onClick={() => setEditingProduksiId(null)} className="px-5 py-2.5 text-slate-500 font-bold hover:bg-slate-200 rounded-lg text-sm transition-colors">Batal</button>
                  <button onClick={handleSaveEditProduksiLog} className="px-6 py-2.5 bg-orange-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-orange-700 flex items-center gap-2 transition-colors">
                    <Save className="w-4 h-4" /> Simpan Perubahan
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MODAL HAPUS LOG PRODUKSI */}
          {deletingProduksiId && (
            <div className="fixed inset-0 bg-slate-900/50 z-[70] flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-xl p-6 text-center w-full max-w-sm">
                <h3 className="font-bold text-lg mb-2">Hapus Log Produksi?</h3>
                <p className="text-sm text-slate-500 mb-6">Tindakan ini tidak bisa dibatalkan dan akan memengaruhi riwayat SFC.</p>
                <div className="flex justify-center gap-3">
                  <button onClick={() => setDeletingProduksiId(null)} className="px-4 py-2 border rounded-lg font-bold">Batal</button>
                  <button onClick={confirmDeleteProduksiLog} className="px-4 py-2 bg-rose-600 text-white rounded-lg font-bold">Hapus Permanen</button>
                </div>
              </div>
            </div>
          )}

          {/* MODAL EDIT LOG BBM */}
          {editingBbmLog && (
            <div className="fixed inset-0 bg-slate-900/50 z-[70] flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-2xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-teal-100 text-teal-600 rounded-lg"><Droplet className="w-5 h-5" /></div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">Edit Log BBM</h3>
                      <p className="text-xs text-slate-500 font-medium">Ubah catatan teks riwayat</p>
                    </div>
                  </div>
                  <button onClick={() => setEditingBbmLog(null)} className="text-slate-400 hover:text-rose-500"><X className="w-5 h-5" /></button>
                </div>

                <div className="p-6 overflow-y-auto space-y-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div><label className="block text-xs font-bold text-slate-600 mb-1">Tanggal</label><input type="date" className="w-full px-3 py-2 border rounded-lg text-sm" value={editingBbmLog.tanggal} onChange={e => setEditingBbmLog({ ...editingBbmLog, tanggal: e.target.value })} /></div>
                    <div><label className="block text-xs font-bold text-slate-600 mb-1">Jam</label><input type="time" className="w-full px-3 py-2 border rounded-lg text-sm" value={editingBbmLog.jam} onChange={e => setEditingBbmLog({ ...editingBbmLog, jam: e.target.value })} /></div>
                    <div><label className="block text-xs font-bold text-slate-600 mb-1">Jenis Input</label><select className="w-full px-3 py-2 border rounded-lg text-sm bg-slate-50 font-bold" value={editingBbmLog.jenis_input} onChange={e => setEditingBbmLog({ ...editingBbmLog, jenis_input: e.target.value })}><option value="Penerimaan">Penerimaan</option><option value="Stok Opname">Stok Opname</option></select></div>
                    <div><label className="block text-xs font-bold text-slate-600 mb-1">Referensi</label><input type="text" className="w-full px-3 py-2 border rounded-lg text-sm" value={editingBbmLog.referensi} onChange={e => setEditingBbmLog({ ...editingBbmLog, referensi: e.target.value })} /></div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h4 className="font-bold text-slate-700 text-sm mb-3">Rincian Volume Tangki</h4>
                    {editingBbmLog.tangki_data.map((t: any) => (
                      <div key={t._id} className="flex justify-between items-center bg-white p-2 rounded border border-slate-100 mb-2">
                        <span className="text-xs font-bold text-slate-600">{t.id_tangki}</span>
                        <input type="number" className="w-32 px-2 py-1 border rounded text-sm text-right font-bold focus:ring-2 focus:ring-teal-500" value={t.input_volume} onChange={e => handleUpdateBbmEditData(t._id, e.target.value)} />
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-orange-500 italic mt-2">*Catatan: Mengedit log ini hanya mengubah riwayat tampilan, tidak mengubah volume Master Data Tangki untuk mencegah error kalkulasi ganda.</p>
                </div>

                <div className="p-6 bg-slate-50 rounded-b-2xl border-t border-slate-100 flex justify-end gap-3">
                  <button onClick={() => setEditingBbmLog(null)} className="px-5 py-2.5 text-slate-500 font-bold hover:bg-slate-200 rounded-lg text-sm transition-colors">Batal</button>
                  <button onClick={handleSaveEditBbmLog} className="px-6 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-bold shadow-md hover:bg-teal-700 flex items-center gap-2"><Save className="w-4 h-4" /> Simpan Perubahan</button>
                </div>
              </div>
            </div>
          )}

          {/* MODAL HAPUS LOG BBM */}
          {deletingBbmLogId && (
            <div className="fixed inset-0 bg-slate-900/50 z-[70] flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-xl p-6 text-center w-full max-w-sm">
                <h3 className="font-bold text-lg mb-2">Hapus Riwayat Input?</h3>
                <p className="text-sm text-slate-500 mb-6">Tindakan ini menghapus catatan laporan secara permanen.</p>
                <div className="flex justify-center gap-3">
                  <button onClick={() => setDeletingBbmLogId(null)} className="px-4 py-2 border rounded-lg font-bold">Batal</button>
                  <button onClick={confirmDeleteBbmLog} className="px-4 py-2 bg-rose-600 text-white rounded-lg font-bold">Hapus Permanen</button>
                </div>
              </div>
            </div>
          )}

          {notification && (
            <div className="fixed bottom-6 right-6 z-[100] bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3"><Check className="w-4 h-4" /> <span className="text-sm font-bold">{notification}</span> <button onClick={() => setNotification(null)}><X className="w-4 h-4" /></button></div>
          )}

        </div>
      </main>
    </div>
  );
}