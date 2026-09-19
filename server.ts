import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Check Gemini API status
app.get('/api/ai/status', (req, res) => {
  const hasEnvKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '');
  res.json({
    status: 'ok',
    hasSystemKey: hasEnvKey,
    model: 'gemini-3.8-flash',
  });
});

// Fallback high-quality template generator in case API key is unavailable or quota is exceeded
function generateFallbackProposal(params: {
  projectName?: string;
  projectType?: string;
  department?: string;
  strategyName?: string;
  targetGroup?: string;
  estimatedBudget?: number;
  duration?: string;
  specialFocus?: string;
}) {
  const name = params.projectName?.trim() || 'โครงการยกระดับคุณภาพการจัดการศึกษาและพัฒนาศักยภาพผู้เรียน';
  const type = params.projectType || 'ใหม่';
  const dept = params.department || 'ฝ่ายวิชาการ';
  const strat = params.strategyName || 'ยุทธศาสตร์ที่ 1 พัฒนาคุณภาพผู้เรียนตามมาตรฐานการศึกษาขั้นพื้นฐาน';
  const target = params.targetGroup || 'นักเรียน ครู และบุคลากรทางการศึกษา';
  const budget = Number(params.estimatedBudget) > 0 ? Number(params.estimatedBudget) : 25000;
  const dur = params.duration || 'ตลอดปีการศึกษา 2568 (16 พฤษภาคม 2568 - 31 มีนาคม 2569)';
  const focus = params.specialFocus ? ` โดยเน้น ${params.specialFocus}` : '';

  const remBudget = Math.round(budget * 0.2);
  const operBudget = Math.round(budget * 0.45);
  const matBudget = Math.round(budget * 0.35);

  return {
    projectCode: 'กค.01/2568',
    projectName: name,
    projectType: type,
    department: dept,
    strategyAlignment: strat,
    responsiblePerson: 'หัวหน้ากลุ่มงาน/ผู้รับผิดชอบโครงการ',
    position: 'ครูผู้รับผิดชอบงานโครงการ',
    rationale: `ตามพระราชบัญญัติการศึกษาแห่งชาติ พ.ศ. 2542 และที่แก้ไขเพิ่มเติม รวมถึงนโยบายและจุดเน้นของสำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน (สพฐ.) มุ่งเน้นการยกระดับคุณภาพการจัดการศึกษาให้ผู้เรียนมีสมรรถนะสำคัญตามหลักสูตรแกนกลาง มีทักษะในศตวรรษที่ 21 และมีคุณลักษณะอันพึงประสงค์ โรงเรียนจึงตระหนักถึงความสำคัญในการจัดทำ "${name}" ขึ้น เพื่อขับเคลื่อนการพัฒนาศักยภาพของ${target}อย่างเป็นระบบ ต่อเนื่อง และมีประสิทธิภาพ${focus} ตอบสนองต่อมาตรฐานการศึกษาของสถานศึกษาและทิศทางการพัฒนาการศึกษาชาติอย่างยั่งยืน`,
    objectives: [
      `เพื่อพัฒนาทักษะ ความรู้ และสมรรถนะที่สำคัญของ${target} ให้สอดคล้องกับมาตรฐานการเรียนรู้`,
      `เพื่อยกระดับผลสัมฤทธิ์และส่งเสริมกระบวนการเรียนรู้เชิงรุก (Active Learning) ให้เกิดประสิทธิภาพสูงสุด`,
      `เพื่อสร้างเครือข่ายความร่วมมือระหว่างครู ผู้เรียน และผู้ปกครองในการสนับสนุนการจัดกิจกรรมการเรียนรู้`,
    ],
    quantitativeTarget: `${target} ร้อยละ 90 เข้าร่วมกิจกรรมและได้รับการพัฒนาตามเกณฑ์ที่กำหนด`,
    qualitativeTarget: `ผู้เข้าร่วมโครงการมีความพึงพอใจในระดับดีมาก (ร้อยละ 85 ขึ้นไป) และนำความรู้ไปประยุกต์ใช้ในการเรียนและการปฏิบัติงานได้อย่างเป็นรูปธรรม`,
    timeline: dur,
    location: 'โรงเรียนและแหล่งเรียนรู้ที่เกี่ยวข้อง',
    activities: [
      {
        phase: '1. ขั้นเตรียมการ (Plan)',
        description: 'ประชุมวางแผน ชี้แจงคณะทำงาน แต่งตั้งคณะกรรมการดำเนินงาน และจัดเตรียมสื่อ เอกสาร อุปกรณ์',
        duration: 'พฤษภาคม 2568',
        responsible: 'ผู้รับผิดชอบโครงการ',
      },
      {
        phase: '2. ขั้นดำเนินการ (Do)',
        description: 'จัดอบรมเชิงปฏิบัติการ กิจกรรมพัฒนาทักษะ และการแลกเปลี่ยนเรียนรู้ตามแผนงาน',
        duration: 'มิถุนายน 2568 - มกราคม 2569',
        responsible: 'คณะทำงานประจำโครงการ',
      },
      {
        phase: '3. ขั้นติดตามประเมินผล (Check)',
        description: 'นิเทศ ติดตามผลการดำเนินกิจกรรม ประเมินผลตามตัวชี้วัดความสำเร็จ และสรุปผลแบบสอบถามความพึงพอใจ',
        duration: 'กุมภาพันธ์ 2569',
        responsible: 'คณะกรรมการประเมินผล',
      },
      {
        phase: '4. ขั้นรายงานผลและสรุป (Action)',
        description: 'สรุปและรายงานผลการดำเนินโครงการต่อผู้อำนวยการโรงเรียน และเผยแพร่ผลการดำเนินงาน',
        duration: 'มีนาคม 2569',
        responsible: 'ผู้รับผิดชอบโครงการ',
      },
    ],
    expenseItems: [
      {
        id: 1,
        projectId: 0,
        itemName: 'ค่าตอบแทนวิทยากรผู้เชี่ยวชาญ (6 ชม. x 600 บาท)',
        category: 'ค่าตอบแทน',
        quantity: 1,
        unit: 'ครั้ง',
        unitPrice: remBudget,
        totalAmount: remBudget,
      },
      {
        id: 2,
        projectId: 0,
        itemName: 'ค่าอาหารกลางวันและอาหารว่างสำหรับผู้เข้าร่วมกิจกรรม',
        category: 'ค่าใช้สอย',
        quantity: 1,
        unit: 'รายการ',
        unitPrice: operBudget,
        totalAmount: operBudget,
      },
      {
        id: 3,
        projectId: 0,
        itemName: 'ค่าวัสดุ อุปกรณ์ สื่อการเรียนรู้ และเอกสารประกอบการจัดกิจกรรม',
        category: 'ค่าวัสดุ',
        quantity: 1,
        unit: 'ชุด',
        unitPrice: matBudget,
        totalAmount: matBudget,
      },
    ],
    totalBudget: budget,
    budgetSource: 'เงินอุดหนุนรายหัว สพฐ. / แผนปฏิบัติการประจำปี',
    kpis: 'ร้อยละ 85 ของผู้เข้าร่วมโครงการมีผลการประเมินทักษะและสมรรถนะผ่านเกณฑ์ที่กำหนดในระดับดีขึ้นไป',
    evaluationMethods: 'แบบประเมินสมรรถนะ, แบบทดสอบ, แบบสังเกตพฤติกรรม, และแบบสอบถามความพึงพอใจ',
    expectedBenefits: [
      `${target} ได้รับการพัฒนาทักษะและองค์ความรู้อย่างมีคุณภาพ`,
      'สถานศึกษามีผลสัมฤทธิ์และมาตรฐานการจัดการศึกษาที่สูงขึ้นตามเป้าหมายของ สพฐ.',
      'เกิดนวัตกรรมและแนวปฏิบัติที่ดี (Best Practice) สามารถนำไปต่อยอดขยายผลได้',
    ],
    proposedBy: 'ลงชื่อ.......................................................... ผู้เสนอโครงการ',
    approvedBy: 'ลงชื่อ.......................................................... ผู้อนุมัติโครงการ (ผู้อำนวยการโรงเรียน)',
    acknowledgedBy: 'ลงชื่อ.......................................................... ผู้เห็นชอบโครงการ (หัวหน้ากลุ่มงาน)',
  };
}

// AI Project Proposal Generation Route
app.post('/api/ai/generate-project', async (req, res) => {
  try {
    const {
      prompt,
      projectName,
      projectType,
      department,
      strategyName,
      targetGroup,
      estimatedBudget,
      duration,
      specialFocus,
      customApiKey,
    } = req.body || {};

    const apiKey = (customApiKey && String(customApiKey).trim()) || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      // Return structured fallback and instruct client that API key can be provided
      const fallback = generateFallbackProposal({
        projectName,
        projectType,
        department,
        strategyName,
        targetGroup,
        estimatedBudget,
        duration,
        specialFocus,
      });
      return res.json({
        success: true,
        source: 'template_fallback',
        message: 'สร้างโครงร่างโครงการตามมาตรฐาน สพฐ. เรียบร้อย (แนะนำระบุ Gemini API Key เพื่อให้ AI เจนเนื้อหาแบบเฉพาะเจาะจง)',
        data: fallback,
      });
    }

    // Initialize @google/genai SDK per guidelines
    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const systemInstruction = `คุณคือผู้เชี่ยวชาญด้านการวางแผนการศึกษาและผู้ช่วยเขียนโครงการตามระเบียบของสำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน (สพฐ.) กระทรวงศึกษาธิการ
หน้าที่ของคุณคือร่างและเขียนข้อเสนอโครงการฉบับสมบูรณ์ (School Project Proposal) ที่เป็นทางการ ครบถ้วนตามระเบียบราชการไทย 
ประกอบด้วย:
1. projectCode: รหัสโครงการ เช่น "วช.01/2568"
2. projectName: ชื่อโครงการที่กระชับ สละสลวย ชัดเจน
3. projectType: "ใหม่" หรือ "ต่อเนื่อง"
4. department: กลุ่มงาน/ฝ่ายบริหาร เช่น "ฝ่ายวิชาการ", "ฝ่ายงบประมาณ", "ฝ่ายบุคคล", "ฝ่ายบริหารทั่วไป"
5. strategyAlignment: ความสอดคล้องกับยุทธศาสตร์สถานศึกษา หรือยุทธศาสตร์ สพฐ.
6. responsiblePerson: ผู้รับผิดชอบโครงการ (ระบุตำแหน่งด้วย เช่น ครูชำนาญการ/หัวหน้างาน)
7. position: ตำแหน่ง
8. rationale: หลักการและเหตุผล เขียนเป็นภาษาราชการ 2-3 ย่อหน้า ระบุบริบท นโยบาย สภาพปัญหา และความจำเป็น
9. objectives: อาร์เรย์ของวัตถุประสงค์ 3-4 ข้อ เริ่มต้นด้วย "เพื่อ..."
10. quantitativeTarget: เป้าหมายเชิงปริมาณที่ชัดเจน มีตัวเลขหรือร้อยละ
11. qualitativeTarget: เป้าหมายเชิงคุณภาพ
12. timeline: ระยะเวลาดำเนินการ
13. location: สถานที่ดำเนินการ
14. activities: ตารางขั้นตอนการดำเนินงานตามวงจร PDCA (4 ขั้น: Plan, Do, Check, Action) แต่ละขั้นมี phase, description, duration, responsible
15. expenseItems: แจกแจงรายการค่าใช้จ่าย 4 หมวดของ สพฐ. (ค่าตอบแทน, ค่าใช้สอย, ค่าวัสดุ, ค่าครุภัณฑ์) แต่ละรายการมี id, itemName, category, quantity, unit, unitPrice, totalAmount โดย totalAmount = quantity * unitPrice และผลรวมทุกรายการต้องเท่ากับ totalBudget
16. totalBudget: ตัวเลขงบประมาณรวมทั้งสิ้น (บาท)
17. budgetSource: แหล่งงบประมาณ เช่น "เงินอุดหนุนรายหัว สพฐ. ปีงบประมาณ 2568"
18. kpis: ตัวชี้วัดความสำเร็จ (KPI) ที่วัดผลได้จริง
19. evaluationMethods: วิธีการและเครื่องมือประเมินผล
20. expectedBenefits: ประโยชน์ที่คาดว่าจะได้รับ 3-4 ข้อ
ตอบกลับเป็นรูปแบบ JSON ที่ถูกต้องเท่านั้น`;

    const userPrompt = `โปรดช่วยเขียนและเสนอโครงการทางการศึกษาตามข้อมูลต่อไปนี้:
- ชื่อโครงการหรือแนวคิด: ${projectName || prompt || 'โครงการพัฒนาคุณภาพผู้เรียน'}
- ลักษณะโครงการ: ${projectType || 'ใหม่'}
- ฝ่ายบริหารที่รับผิดชอบ: ${department || 'ฝ่ายวิชาการ'}
- ยุทธศาสตร์ที่สอดคล้อง: ${strategyName || 'ยุทธศาสตร์พัฒนาคุณภาพผู้เรียน'}
- กลุ่มเป้าหมาย: ${targetGroup || 'นักเรียนและครูผู้สอน'}
- งบประมาณประมาณการ: ${estimatedBudget ? `${estimatedBudget} บาท` : '20,000 - 50,000 บาท'}
- ระยะเวลาดำเนินการ: ${duration || 'ตลอดปีการศึกษา 2568'}
- จุดเน้นหรือความต้องการพิเศษ: ${specialFocus || 'เน้นการปฏิบัติจริง พัฒนาผลสัมฤทธิ์ และความคุ้มค่าตามระเบียบราชการ'}
${prompt ? `คำสั่งเพิ่มเติม: ${prompt}` : ''}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const responseText = response.text || '';
    let parsedData;
    try {
      parsedData = JSON.parse(responseText.trim());
    } catch (parseErr) {
      // In case json contains backticks or formatting
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleanJson);
    }

    // Ensure budget consistency
    if (parsedData.expenseItems && Array.isArray(parsedData.expenseItems)) {
      parsedData.expenseItems = parsedData.expenseItems.map((item: any, idx: number) => ({
        id: item.id || idx + 1,
        projectId: 0,
        itemName: item.itemName || `รายการค่าใช้จ่ายที่ ${idx + 1}`,
        category: item.category || 'ค่าวัสดุ',
        quantity: Number(item.quantity) || 1,
        unit: item.unit || 'ชุด',
        unitPrice: Number(item.unitPrice) || 0,
        totalAmount: (Number(item.quantity) || 1) * (Number(item.unitPrice) || 0),
      }));
      parsedData.totalBudget = parsedData.expenseItems.reduce((sum: number, it: any) => sum + it.totalAmount, 0);
    }

    return res.json({
      success: true,
      source: 'gemini_ai',
      data: parsedData,
    });
  } catch (error: any) {
    console.error('Gemini API generation error:', error);
    // Graceful fallback to avoid leaving user with broken UI
    const fallback = generateFallbackProposal({
      projectName: req.body?.projectName,
      projectType: req.body?.projectType,
      department: req.body?.department,
      strategyName: req.body?.strategyName,
      targetGroup: req.body?.targetGroup,
      estimatedBudget: req.body?.estimatedBudget,
      duration: req.body?.duration,
      specialFocus: req.body?.specialFocus,
    });
    return res.json({
      success: true,
      source: 'fallback_error',
      errorMessage: error.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ Gemini API',
      data: fallback,
    });
  }
});

// Start server with Vite middleware integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
