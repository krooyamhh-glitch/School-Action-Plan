export type UserRole = 'admin' | 'director' | 'teacher';

export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: UserRole;
  department?: string;
  position?: string;
  phone?: string;
  avatar?: string;
  schoolId: number;
  isActive?: boolean;
}

export interface School {
  id: number;
  schoolCode: string;
  name: string;
  address: string;
  subdistrict: string;
  district: string;
  province: string;
  zipcode: string;
  affiliation: string; // e.g. สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน (สพฐ.)
  educationArea: string; // e.g. สำนักงานเขตพื้นที่การศึกษาประถมศึกษาขอนแก่น เขต 1
  fiscalYear: number; // e.g. 2568
  directorName: string;
  phone: string;
  email: string;
  logoUrl: string;
}

export interface FiscalYear {
  id: number;
  schoolId: number;
  year: number; // e.g. 2568
  isActive: boolean;
  startDate: string;
  endDate: string;
  totalStudents?: number;
  teacherCount: number;
}

export interface StudentLevel {
  id: number;
  schoolId: number;
  fiscalYearId: number;
  gradeLevel: string; // อ.1, อ.2, อ.3, ป.1, ป.2, ป.3, ป.4, ป.5, ป.6
  stage: 'อนุบาล' | 'ประถม';
  maleCount: number;
  femaleCount: number;
  totalCount: number;
}

export interface RevenueItem {
  id: number;
  schoolId: number;
  fiscalYearId: number;
  category: 'subsidy' | 'activity' | 'welfare' | 'lunch' | 'fundraising' | 'revenue' | 'other';
  itemName: string;
  ratePerHead: number;
  eligibleCount: number;
  calculatedAmount: number;
  isCustomRate: boolean;
  note: string;
}

export interface BudgetAllocation {
  id: number;
  schoolId: number;
  fiscalYearId: number;
  departmentName: string;
  percentage: number;
  allocatedAmount: number;
  spentAmount: number;
  remainingAmount: number;
  colorHex: string;
  description: string;
}

export interface LearnerActivity {
  id: number;
  schoolId: number;
  fiscalYearId: number;
  activityName: string;
  percentage: number;
  allocatedAmount: number;
  spentAmount: number;
  remainingAmount: number;
  note: string;
  description?: string;
}

export interface Strategy {
  id: number;
  schoolId: number;
  fiscalYearId: number;
  code: string;
  name: string;
  description: string;
}

export interface Goal {
  id: number;
  strategyId: number;
  code: string;
  name: string;
}

export interface Indicator {
  id: number;
  goalId: number;
  code: string;
  name: string;
  targetValue: string;
  unit: string;
}

export interface ProjectExpenseItem {
  id: number;
  projectId: number;
  itemName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalAmount: number;
  category: 'ค่าตอบแทน' | 'ค่าใช้สอย' | 'ค่าวัสดุ' | 'ค่าครุภัณฑ์' | 'อื่น ๆ' | string;
}

export type ProjectExpense = ProjectExpenseItem;

export type ProjectStatus = 'not_started' | 'in_progress' | 'completed';
export type ApprovalStatus = 'draft' | 'pending' | 'approved' | 'rejected';

export interface Project {
  id: number;
  schoolId: number;
  fiscalYearId: number;
  projectCode: string;
  projectName: string;
  rationale: string;
  objectives: string;
  quantitativeGoals: string;
  qualitativeGoals: string;
  kpis: string;
  procedures: string;
  durationStart: string;
  durationEnd: string;
  location: string;
  targetGroup: string;
  responsiblePerson: string;
  responsibleId?: number;
  department: string;
  budgetSource: string;
  allocatedBudget: number;
  spentBudget: number;
  remainingBudget: number;
  status: ProjectStatus;
  approvalStatus: ApprovalStatus;
  strategyId: number;
  goalId?: number;
  indicatorId?: number;
  sortOrder: number;
  expenseItems: ProjectExpenseItem[];
  // Convenience aliases & additional fields
  expenses?: ProjectExpenseItem[];
  duration?: string;
  kpi?: string;
  rationales?: string;
  quantitativeTarget?: string;
  qualitativeTarget?: string;
  approvedBy?: string;
  approvedDate?: string;
}

export interface BudgetTransaction {
  id: number;
  schoolId: number;
  fiscalYearId: number;
  projectId: number;
  docNumber: string;
  transactionDate: string;
  itemDescription: string;
  amount: number;
  payee: string;
  receiptNumber?: string;
  approvedBy?: string;
  status?: 'approved' | 'pending';
  note?: string;
  recordedBy?: string;
}

export interface ProjectProposalActivity {
  phase: string;
  description: string;
  duration: string;
  responsible: string;
}

export interface ProjectProposal {
  projectCode: string;
  projectName: string;
  projectType: 'ใหม่' | 'ต่อเนื่อง' | string;
  department: string;
  strategyAlignment: string;
  responsiblePerson: string;
  position?: string;
  rationale: string;
  objectives: string[];
  quantitativeTarget: string;
  qualitativeTarget: string;
  timeline: string;
  location: string;
  activities: ProjectProposalActivity[];
  expenseItems: ProjectExpenseItem[];
  totalBudget: number;
  budgetSource: string;
  kpis: string;
  evaluationMethods: string;
  expectedBenefits: string[];
  proposedBy?: string;
  approvedBy?: string;
  acknowledgedBy?: string;
}

