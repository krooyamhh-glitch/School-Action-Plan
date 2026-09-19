import React, { useState } from 'react';
import { School, FiscalYear } from '../types';
import { Building2, Save, Check, RefreshCw, Upload, Image as ImageIcon } from 'lucide-react';

interface SchoolInfoViewProps {
  school: School;
  activeFiscalYear: FiscalYear;
  onUpdateSchool: (updated: School) => void;
}

export const SchoolInfoView: React.FC<SchoolInfoViewProps> = ({
  school,
  activeFiscalYear,
  onUpdateSchool,
}) => {
  const [formData, setFormData] = useState<School>({ ...school });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'fiscalYear' ? Number(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSchool(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="h-6 w-6 text-blue-700" />
            <span>ข้อมูลพื้นฐานสถานศึกษา</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            ข้อมูลประจำโรงเรียนสำหรับการออกรายงาน แผนปฏิบัติการ และเอกสารราชการ
          </p>
        </div>
        {savedSuccess && (
          <div className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
            <Check className="h-4 w-4" />
            <span>บันทึกข้อมูลเรียบร้อยแล้ว</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
        {/* Top summary row with logo */}
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="h-20 w-20 rounded-xl bg-blue-900 border border-amber-300 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
            {formData.logoUrl ? (
              <img
                src={formData.logoUrl}
                alt="Logo"
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <Building2 className="h-10 w-10 text-amber-400" />
            )}
          </div>
          <div className="flex-1 space-y-1">
            <label className="block text-xs font-semibold text-slate-700">URL โลโก้หรือตราสัญลักษณ์โรงเรียน</label>
            <div className="flex gap-2">
              <input
                id="school-logo-url-input"
                type="text"
                name="logoUrl"
                value={formData.logoUrl}
                onChange={handleChange}
                placeholder="https://example.com/logo.png"
                className="w-full text-xs rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    logoUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=160&auto=format&fit=crop&q=80',
                  }));
                }}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 whitespace-nowrap"
              >
                ตัวอย่าง
              </button>
            </div>
            <p className="text-[11px] text-slate-500">สามารถใส่ลิงก์รูปภาพ หรืออัปโหลดเข้า cPanel ไปที่ <code>assets/images/logo.png</code></p>
          </div>
        </div>

        {/* Grid Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ชื่อโรงเรียน <span className="text-red-500">*</span>
            </label>
            <input
              id="input-school-name"
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              รหัสโรงเรียน (10 หลัก) <span className="text-red-500">*</span>
            </label>
            <input
              id="input-school-code"
              type="text"
              name="schoolCode"
              required
              value={formData.schoolCode}
              onChange={handleChange}
              className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              สังกัดหน่วยงาน <span className="text-red-500">*</span>
            </label>
            <input
              id="input-school-affiliation"
              type="text"
              name="affiliation"
              required
              value={formData.affiliation}
              onChange={handleChange}
              className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              สำนักงานเขตพื้นที่การศึกษา <span className="text-red-500">*</span>
            </label>
            <input
              id="input-school-education-area"
              type="text"
              name="educationArea"
              required
              value={formData.educationArea}
              onChange={handleChange}
              className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ผู้อำนวยการโรงเรียน <span className="text-red-500">*</span>
            </label>
            <input
              id="input-school-director"
              type="text"
              name="directorName"
              required
              value={formData.directorName}
              onChange={handleChange}
              className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ปีงบประมาณ พ.ศ.
            </label>
            <input
              id="input-school-fiscal-year"
              type="number"
              name="fiscalYear"
              value={formData.fiscalYear}
              onChange={handleChange}
              className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              เบอร์โทรศัพท์ติดต่อ
            </label>
            <input
              id="input-school-phone"
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ที่อยู่ / หมู่บ้าน / ถนน
            </label>
            <input
              id="input-school-address"
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ตำบล / แขวง
            </label>
            <input
              id="input-school-subdistrict"
              type="text"
              name="subdistrict"
              value={formData.subdistrict}
              onChange={handleChange}
              className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              อำเภอ / เขต
            </label>
            <input
              id="input-school-district"
              type="text"
              name="district"
              value={formData.district}
              onChange={handleChange}
              className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              จังหวัด
            </label>
            <input
              id="input-school-province"
              type="text"
              name="province"
              value={formData.province}
              onChange={handleChange}
              className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              รหัสไปรษณีย์
            </label>
            <input
              id="input-school-zipcode"
              type="text"
              name="zipcode"
              value={formData.zipcode}
              onChange={handleChange}
              className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email ประจำโรงเรียน
            </label>
            <input
              id="input-school-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full text-sm rounded-lg border border-slate-300 px-3 py-2 text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            id="btn-reset-school-info"
            type="button"
            onClick={() => setFormData({ ...school })}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>คืนค่าเดิม</span>
          </button>

          <button
            id="btn-save-school-info"
            type="submit"
            className="flex items-center gap-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 px-5 py-2 text-xs font-semibold text-white shadow-sm transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>บันทึกข้อมูลโรงเรียน</span>
          </button>
        </div>
      </form>
    </div>
  );
};
