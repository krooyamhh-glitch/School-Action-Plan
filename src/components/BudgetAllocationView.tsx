import React, { useState } from 'react';
import { BudgetAllocation, FiscalYear } from '../types';
import { 
  PieChart, 
  AlertTriangle, 
  CheckCircle2, 
  Save, 
  Check, 
  Plus, 
  Trash2, 
  Info,
  DollarSign
} from 'lucide-react';

interface BudgetAllocationViewProps {
  allocations: BudgetAllocation[];
  activeFiscalYear: FiscalYear;
  totalRevenue: number;
  onUpdateAllocations: (updated: BudgetAllocation[]) => void;
}

export const BudgetAllocationView: React.FC<BudgetAllocationViewProps> = ({
  allocations,
  activeFiscalYear,
  totalRevenue,
  onUpdateAllocations,
}) => {
  const [list, setList] = useState<BudgetAllocation[]>([...allocations]);
  const [baseBudget, setBaseBudget] = useState<number>(() => {
    const currentAllocSum = allocations.reduce((s, a) => s + a.allocatedAmount, 0);
    return currentAllocSum > 0 ? currentAllocSum : totalRevenue;
  });
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Calculate sum of percentages
  const totalPercentage = Math.round(list.reduce((sum, a) => sum + (Number(a.percentage) || 0), 0) * 100) / 100;
  const isHundredPercent = Math.abs(totalPercentage - 100) < 0.01;

  // Handle % edit
  const handlePercentageChange = (id: number, val: string) => {
    const pct = Math.max(0, parseFloat(val) || 0);
    setList((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newAlloc = Math.round((baseBudget * pct) / 100);
          return {
            ...item,
            percentage: pct,
            allocatedAmount: newAlloc,
            remainingAmount: Math.max(0, newAlloc - item.spentAmount),
          };
        }
        return item;
      })
    );
  };

  // Handle base budget change
  const handleBaseBudgetChange = (newBase: number) => {
    setBaseBudget(newBase);
    setList((prev) =>
      prev.map((item) => {
        const newAlloc = Math.round((newBase * item.percentage) / 100);
        return {
          ...item,
          allocatedAmount: newAlloc,
          remainingAmount: Math.max(0, newAlloc - item.spentAmount),
        };
      })
    );
  };

  // Add department
  const handleAddDepartment = () => {
    const newId = list.length > 0 ? Math.max(...list.map((i) => i.id)) + 1 : 1;
    const colors = ['#2563eb', '#0284c7', '#059669', '#d97706', '#7c3aed', '#ec4899', '#f97316'];
    const newDept: BudgetAllocation = {
      id: newId,
      schoolId: 1,
      fiscalYearId: activeFiscalYear.id,
      departmentName: `ฝ่ายงานใหม่ที่ ${list.length + 1}`,
      percentage: 0,
      allocatedAmount: 0,
      spentAmount: 0,
      remainingAmount: 0,
      colorHex: colors[list.length % colors.length],
      description: 'ระบุขอบข่ายภารกิจ',
    };
    setList((prev) => [...prev, newDept]);
  };

  // Remove department
  const handleRemoveDept = (id: number) => {
    if (confirm('ต้องการลบฝ่ายนี้ใช่หรือไม่?')) {
      setList((prev) => prev.filter((i) => i.id !== id));
    }
  };

  const handleSave = () => {
    if (!isHundredPercent) {
      if (!confirm(`สัดส่วนเปอร์เซ็นต์รวมปัจจุบันคือ ${totalPercentage}% (ยังไม่เท่ากับ 100%)\nคุณต้องการบันทึกต่อไปหรือไม่?`)) {
        return;
      }
    }
    onUpdateAllocations(list);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <PieChart className="h-6 w-6 text-blue-700" />
            <span>การจัดสรรงบประมาณตามฝ่าย/งาน (สัดส่วน 100%)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            กำหนดสัดส่วนงบประมาณสำหรับ 4 ฝ่ายบริหารงานหลักและงบกลาง เพื่อใช้เป็นกรอบวงเงินในการจัดทำโครงการ
          </p>
        </div>

        <div className="flex items-center gap-2">
          {savedSuccess && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
              <Check className="h-4 w-4" />
              <span>บันทึกการจัดสรรงบเรียบร้อยแล้ว</span>
            </div>
          )}
          <button
            id="btn-save-budget-alloc"
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 px-5 py-2 text-xs font-semibold text-white shadow-sm transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>บันทึกการจัดสรร</span>
          </button>
        </div>
      </div>

      {/* 100% Validation Alert Bar */}
      <div
        className={`rounded-xl p-4 border transition-colors ${
          isHundredPercent
            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
            : 'bg-amber-50 border-amber-300 text-amber-900'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {isHundredPercent ? (
              <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="h-6 w-6 text-amber-600 shrink-0" />
            )}
            <div>
              <div className="text-sm font-bold">
                {isHundredPercent ? (
                  <span>✅ ยอดรวมสัดส่วนเปอร์เซ็นต์ถูกต้องครบถ้วน (100.00%)</span>
                ) : (
                  <span>
                    ⚠️ แจ้งเตือน: สัดส่วนเปอร์เซ็นต์รวมปัจจุบันคือ {totalPercentage.toFixed(2)}% (ต้องเท่ากับ 100%)
                  </span>
                )}
              </div>
              <p className="text-xs opacity-90">
                {isHundredPercent
                  ? 'งบประมาณได้รับการจัดสรรลงสู่ทุกฝ่ายงานอย่างสมดุลตามมติที่ประชุม'
                  : `ต้องการอีก ${(100 - totalPercentage).toFixed(2)}% เพื่อให้ครบ 100% กรุณาปรับเปอร์เซ็นต์ของฝ่ายงานให้ถูกต้อง`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            <span className="text-xs font-medium">เปอร์เซ็นต์รวม:</span>
            <span
              className={`rounded-lg px-3 py-1 font-mono text-base font-black ${
                isHundredPercent
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-500 text-slate-900'
              }`}
            >
              {totalPercentage.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>

      {/* Budget Basis Setting */}
      <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <DollarSign className="h-4 w-4 text-blue-600" />
            <span>ฐานงบประมาณที่จะนำมาจัดสรร (บาท):</span>
          </label>
          <p className="text-xs text-slate-500">
            สามารถใช้ยอดจากประมาณการรายรับรวม หรือกำหนดวงเงินแผนปฏิบัติการเฉพาะกิจได้
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="input-base-budget-amount"
            type="number"
            min="0"
            step="1000"
            value={baseBudget}
            onChange={(e) => handleBaseBudgetChange(Number(e.target.value) || 0)}
            className="w-48 text-right rounded-lg border border-slate-300 py-1.5 px-3 text-sm font-bold font-mono text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => handleBaseBudgetChange(totalRevenue)}
            className="text-xs text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-2 rounded-lg whitespace-nowrap"
            title="ใช้ยอดประมาณการรายรับทั้งหมดจากระบบ"
          >
            ใช้วงเงินรายรับรวม ({totalRevenue.toLocaleString()} บ.)
          </button>
        </div>
      </div>

      {/* Allocation Cards and Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="text-xs font-semibold text-slate-700">
            ตารางกำหนดสัดส่วนร้อยละ (%) และคำนวณจำนวนเงินที่จัดสรร
          </h3>
          <button
            id="btn-add-dept"
            type="button"
            onClick={handleAddDepartment}
            className="flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>เพิ่มฝ่ายงาน</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold">
                <th className="py-3 px-4 w-12 text-center">สี</th>
                <th className="py-3 px-4 min-w-[200px]">ฝ่าย / งาน</th>
                <th className="py-3 px-4 w-32 text-center">สัดส่วน (%)</th>
                <th className="py-3 px-4 w-44 text-right bg-blue-50/60 text-blue-950 font-bold">งบประมาณที่จัดสรร (บาท)</th>
                <th className="py-3 px-4 w-36 text-right">ใช้ไปแล้ว (บาท)</th>
                <th className="py-3 px-4 w-36 text-right font-semibold text-emerald-700">คงเหลือ (บาท)</th>
                <th className="py-3 px-4 min-w-[200px]">ขอบข่ายงาน / รายละเอียด</th>
                <th className="py-3 px-4 w-14 text-center">ลบ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 text-center">
                    <span
                      className="inline-block h-4 w-4 rounded-full border border-slate-300 shadow-xs"
                      style={{ backgroundColor: item.colorHex }}
                    />
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">
                    <input
                      type="text"
                      value={item.departmentName}
                      onChange={(e) => {
                        const name = e.target.value;
                        setList((prev) => prev.map((d) => (d.id === item.id ? { ...d, departmentName: name } : d)));
                      }}
                      className="w-full rounded border border-transparent hover:border-slate-300 focus:border-blue-500 py-1 px-2 text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:bg-white"
                    />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="inline-flex items-center gap-1">
                      <input
                        id={`input-dept-percent-${item.id}`}
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={item.percentage}
                        onChange={(e) => handlePercentageChange(item.id, e.target.value)}
                        className="w-20 text-center rounded-lg border border-slate-300 py-1 px-2 text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                      <span className="text-slate-500 text-xs">%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right bg-blue-50/30 font-bold font-mono text-blue-900">
                    {item.allocatedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-600">
                    {item.spentAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">
                    {item.remainingAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-4">
                    <input
                      type="text"
                      value={item.description || ''}
                      onChange={(e) => {
                        const desc = e.target.value;
                        setList((prev) => prev.map((d) => (d.id === item.id ? { ...d, description: desc } : d)));
                      }}
                      className="w-full rounded border border-transparent hover:border-slate-200 focus:border-blue-300 py-1 px-2 text-xs text-slate-500 focus:outline-none focus:bg-white"
                    />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveDept(item.id)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                      title="ลบฝ่ายงาน"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-900 text-white font-bold text-sm">
                <td colSpan={2} className="py-3.5 px-4 text-right">
                  ยอดรวมสัดส่วนการจัดสรรทั้งสิ้น:
                </td>
                <td className="py-3.5 px-4 text-center">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded font-mono font-black ${
                      isHundredPercent ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-slate-900'
                    }`}
                  >
                    {totalPercentage.toFixed(2)}%
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right bg-blue-950 text-amber-300 font-black font-mono text-base">
                  {list.reduce((s, a) => s + a.allocatedAmount, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                  {list.reduce((s, a) => s + a.spentAmount, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-3.5 px-4 text-right font-mono text-emerald-400 font-bold">
                  {list.reduce((s, a) => s + a.remainingAmount, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td colSpan={2} className="py-3.5 px-4 text-xs text-slate-400 font-normal">
                  บาท ({list.length} ฝ่ายงาน)
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
