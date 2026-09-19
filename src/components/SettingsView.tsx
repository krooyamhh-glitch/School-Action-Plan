import React, { useState } from 'react';
import {
  FiscalYear,
  School,
  StudentLevel,
  RevenueItem,
  BudgetAllocation,
  Project,
  BudgetTransaction,
} from '../types';
import {
  Settings,
  Calendar,
  Sparkles,
  Download,
  Upload,
  Database,
  Save,
  Check,
  RefreshCw,
  FileCode,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { generateSqlDump } from '../utils/exportUtils';

interface SettingsViewProps {
  school: School;
  fiscalYears: FiscalYear[];
  activeFiscalYear: FiscalYear;
  onSelectFiscalYear: (fy: FiscalYear) => void;
  onAddFiscalYear: (newYear: number) => void;
  students: StudentLevel[];
  revenues: RevenueItem[];
  allocations: BudgetAllocation[];
  projects: Project[];
  transactions: BudgetTransaction[];
  onRestoreData: (backupData: any) => void;
  onApplyPresetRates: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  school,
  fiscalYears,
  activeFiscalYear,
  onSelectFiscalYear,
  onAddFiscalYear,
  students,
  revenues,
  allocations,
  projects,
  transactions,
  onRestoreData,
  onApplyPresetRates,
}) => {
  const [newYearInput, setNewYearInput] = useState<number>(activeFiscalYear.year + 1);
  const [presetSuccess, setPresetSuccess] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [restoreSuccess, setRestoreSuccess] = useState(false);

  const handleAddNewYear = (e: React.FormEvent) => {
    e.preventDefault();
    if (newYearInput < 2500 || newYearInput > 2600) {
      alert('กรุณาระบุปีงบประมาณ พ.ศ. ที่ถูกต้อง');
      return;
    }
    onAddFiscalYear(newYearInput);
    setNewYearInput(newYearInput + 1);
  };

  const handleApplyPreset = () => {
    if (confirm('คุณต้องการนำเข้าอัตราเงินอุดหนุนและเกณฑ์จัดสรรมาตรฐาน สพฐ. พ.ศ. 2568 หรือไม่?')) {
      onApplyPresetRates();
      setPresetSuccess(true);
      setTimeout(() => setPresetSuccess(false), 3000);
    }
  };

  // Export SQL Dump
  const handleDownloadSqlDump = () => {
    const sql = generateSqlDump(
      school,
      activeFiscalYear,
      students,
      revenues,
      allocations,
      projects,
      transactions
    );
    const blob = new Blob([sql], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_${school.name}_ปี${activeFiscalYear.year}.sql`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export JSON Backup
  const handleDownloadJsonBackup = () => {
    const data = {
      exportDate: new Date().toISOString(),
      school,
      activeFiscalYear,
      students,
      revenues,
      allocations,
      projects,
      transactions,
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_${school.name}_ปี${activeFiscalYear.year}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Restore JSON
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (!parsed.school || !parsed.projects) {
          throw new Error('รูปแบบไฟล์สำรองข้อมูลไม่ถูกต้อง');
        }
        onRestoreData(parsed);
        setRestoreSuccess(true);
        setRestoreError(null);
        setTimeout(() => setRestoreSuccess(false), 4000);
      } catch (err: any) {
        setRestoreError(err.message || 'ไม่สามารถกู้คืนข้อมูลได้');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="h-6 w-6 text-blue-700" />
            <span>ตั้งค่าระบบและการสำรองข้อมูล (System Settings)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            จัดการปีงบประมาณ เกณฑ์อัตรามาตรฐาน สพฐ. การสำรองข้อมูล (SQL / JSON) และการกู้คืนข้อมูล
          </p>
        </div>
      </div>

      {/* Grid: 3 Main Settings Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel 1: Fiscal Year Management */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Calendar className="h-5 w-5 text-blue-700" />
            <div>
              <h3 className="text-sm font-semibold text-slate-900">1. กำหนดและสลับปีงบประมาณ</h3>
              <p className="text-xs text-slate-500">รองรับระบบ Multi-Year แยกข้อมูลตามปีงบประมาณ</p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-700 block">
              ปีงบประมาณที่เปิดใช้งานอยู่ในปัจจุบัน:
            </label>
            <div className="flex flex-wrap gap-2">
              {fiscalYears.map((fy) => {
                const isActive = activeFiscalYear.id === fy.id;
                return (
                  <button
                    key={fy.id}
                    type="button"
                    onClick={() => onSelectFiscalYear(fy)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                      isActive
                        ? 'bg-blue-900 text-amber-300 border-blue-900 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>พ.ศ. {fy.year}</span>
                    {isActive && (
                      <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleAddNewYear} className="pt-3 border-t border-slate-100 space-y-2">
            <label className="text-xs font-semibold text-slate-700 block">
              เปิดปีงบประมาณใหม่:
            </label>
            <div className="flex gap-2">
              <input
                id="input-new-fiscal-year"
                type="number"
                min="2560"
                max="2580"
                value={newYearInput}
                onChange={(e) => setNewYearInput(Number(e.target.value))}
                className="w-36 text-sm font-bold font-mono rounded-lg border border-slate-300 px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                id="btn-create-fiscal-year"
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-xs font-semibold text-white transition-colors"
              >
                + เพิ่มปีงบประมาณ
              </button>
            </div>
          </form>
        </div>

        {/* Panel 2: OBEC Presets & Rates */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <div>
              <h3 className="text-sm font-semibold text-slate-900">2. อัตราเงินอุดหนุนรายหัวมาตรฐาน สพฐ.</h3>
              <p className="text-xs text-slate-500">เกณฑ์อัตราตามระเบียบกระทรวงศึกษาธิการ</p>
            </div>
          </div>

          <div className="text-xs space-y-2 text-slate-600 bg-amber-50/60 p-3 rounded-lg border border-amber-200">
            <div className="font-semibold text-amber-950">เกณฑ์อัตราพื้นฐานต่อคน/ปี:</div>
            <ul className="list-disc pl-4 space-y-1 text-[11px] text-amber-900">
              <li>ก่อนประถมศึกษา (อนุบาล 1-3): 1,800 บาท/คน/ปี</li>
              <li>ประถมศึกษา (ป.1 - ป.6): 2,050 บาท/คน/ปี</li>
              <li>เงินอุดหนุนรายหัวส่วนเพิ่ม (โรงเรียนขนาดเล็ก): ~500 บาท/คน/ปี</li>
              <li>ค่าเครื่องแบบนักเรียน: อนุบาล 325 บ. / ประถม 400 บ.</li>
              <li>ค่าอุปกรณ์การเรียน: อนุบาล 145 บ. / ประถม 220 บ.</li>
              <li>ค่ากิจกรรมพัฒนาผู้เรียน: อนุบาล 464 บ. / ประถม 518 บ.</li>
            </ul>
          </div>

          {presetSuccess && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 p-2 rounded-lg">
              <Check className="h-4 w-4" />
              <span>ปรับปรุงอัตราและประมาณการรายรับตามเกณฑ์ สพฐ. เรียบร้อยแล้ว</span>
            </div>
          )}

          <button
            id="btn-apply-obec-presets"
            type="button"
            onClick={handleApplyPreset}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-amber-400 bg-amber-50 hover:bg-amber-100 text-amber-950 text-xs font-bold transition-colors shadow-2xs"
          >
            <Sparkles className="h-4 w-4 text-amber-600" />
            <span>ปรับใช้อัตรามาตรฐาน สพฐ. พ.ศ. 2568 ทันที</span>
          </button>
        </div>

        {/* Panel 3: Backup & Restore Data */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4 lg:col-span-2">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Database className="h-5 w-5 text-emerald-600" />
            <div>
              <h3 className="text-sm font-semibold text-slate-900">3. สำรองข้อมูล (Backup) และกู้คืนข้อมูล (Restore)</h3>
              <p className="text-xs text-slate-500">
                ส่งออกเป็นไฟล์ SQL สำหรับนำเข้า MySQL / phpMyAdmin บน Web Hosting หรือไฟล์ JSON สำหรับกู้คืนในระบบ
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Backup Box */}
            <div className="rounded-xl border border-slate-200 p-4 space-y-3 bg-slate-50">
              <div className="font-semibold text-xs text-slate-800 flex items-center gap-1.5">
                <Download className="h-4 w-4 text-blue-600" />
                <span>สำรองข้อมูลระบบ (Export Backup)</span>
              </div>
              <p className="text-xs text-slate-500">
                ดาวน์โหลดข้อมูลโรงเรียน นักเรียน ประมาณการรายรับ การจัดสรรงบประมาณ โครงการ และรายการเบิกจ่ายทั้งหมด
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  id="btn-backup-sql"
                  type="button"
                  onClick={handleDownloadSqlDump}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-xs transition-colors"
                >
                  <FileCode className="h-4 w-4" />
                  <span>ส่งออกเป็น SQL (.sql) สำหรับ phpMyAdmin</span>
                </button>

                <button
                  id="btn-backup-json"
                  type="button"
                  onClick={handleDownloadJsonBackup}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
                >
                  <Download className="h-4 w-4 text-slate-500" />
                  <span>ส่งออกเป็น JSON (.json)</span>
                </button>
              </div>
            </div>

            {/* Restore Box */}
            <div className="rounded-xl border border-slate-200 p-4 space-y-3 bg-slate-50">
              <div className="font-semibold text-xs text-slate-800 flex items-center gap-1.5">
                <Upload className="h-4 w-4 text-emerald-600" />
                <span>กู้คืนข้อมูล (Restore Backup)</span>
              </div>
              <p className="text-xs text-slate-500">
                เลือกไฟล์สำรองข้อมูล JSON (.json) ที่เคยส่งออกจากระบบเพื่อกู้คืนสถานะข้อมูล
              </p>

              <div>
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold cursor-pointer shadow-xs transition-colors">
                  <Upload className="h-4 w-4" />
                  <span>เลือกไฟล์ JSON เพื่อกู้คืน</span>
                  <input
                    id="input-file-restore-json"
                    type="file"
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {restoreSuccess && (
                <div className="flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-100 p-2 rounded-lg">
                  <Check className="h-4 w-4" />
                  <span>กู้คืนข้อมูลจากไฟล์สำรองสำเร็จเรียบร้อยแล้ว!</span>
                </div>
              )}

              {restoreError && (
                <div className="flex items-center gap-1.5 text-xs text-red-800 bg-red-100 p-2 rounded-lg">
                  <AlertCircle className="h-4 w-4" />
                  <span>{restoreError}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
