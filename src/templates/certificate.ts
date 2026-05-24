interface CertificateData {
  committeeArea: string;
  headOfFamilyName: string;
  village: string;
  locality: string;
  boundaryNorth: string;
  boundarySouth: string;
  boundaryEast: string;
  boundaryWest: string;
  areaSqm: number | null;
  issuedDate: string;
  certificateNumber: string;
}

export function generateCertificateHtml(data: CertificateData): string {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Noto Naskh Arabic', 'Arial', sans-serif;
      font-size: 14pt;
      background: white;
      color: #000;
      padding: 40px;
      line-height: 2;
    }
    .page {
      width: 148mm;
      min-height: 200mm;
      margin: 0 auto;
      padding: 20mm 15mm;
      border: 2px solid #000;
    }
    .bismillah {
      text-align: center;
      font-size: 18pt;
      font-weight: 700;
      margin-bottom: 20px;
    }
    .header {
      text-align: center;
      font-size: 13pt;
      font-weight: 600;
      margin-bottom: 6px;
    }
    .title {
      text-align: center;
      font-size: 16pt;
      font-weight: 700;
      text-decoration: underline;
      margin: 14px 0 20px;
    }
    .field {
      margin-bottom: 10px;
      display: flex;
      gap: 6px;
    }
    .label { font-weight: 600; white-space: nowrap; }
    .value { border-bottom: 1px solid #000; flex: 1; min-width: 80px; padding-bottom: 2px; }
    .body-text {
      margin: 18px 0;
      text-align: justify;
      line-height: 2.2;
    }
    .signature-area {
      margin-top: 30px;
      text-align: center;
    }
    .cert-number {
      text-align: left;
      font-size: 11pt;
      margin-bottom: 10px;
      color: #555;
    }
  </style>
</head>
<body>
<div class="page">
  <div class="cert-number">رقم: ${data.certificateNumber}</div>

  <div class="bismillah">بسم الله الرحمن الرحيم</div>

  <div class="header">اللجنة الإدارية ${data.committeeArea || data.village}</div>

  <div class="title">شهادة سكن</div>

  <div class="field">
    <span class="label">التاريخ :</span>
    <span class="value">${data.issuedDate}</span>
  </div>

  <div class="body-text">
    تشهد اللجنة الإدارية ${data.committeeArea || data.village} بأن المواطن /
    <strong>${data.headOfFamilyName}</strong>
    يملك منزل بـ${data.village} يحده من الجنوب <strong>${data.boundarySouth || '...'}</strong> ،
    من الشمال <strong>${data.boundaryNorth || '...'}</strong> ،
    من الغرب <strong>${data.boundaryWest || '...'}</strong> ،
    الشرق <strong>${data.boundaryEast || '...'}</strong> .
    وتبلغ مساحته <strong>${data.areaSqm ? data.areaSqm + ' م²' : '...'}</strong> تقريباً .
  </div>

  <div class="body-text">وهذه شهادة منا بذلك .</div>

  <div class="body-text">حررت هذه الشهادة بناء على ذلك .</div>

  <div class="signature-area">
    <div>رئيس اللجنة</div>
    <div style="margin-top: 40px; border-top: 1px solid #000; width: 120px; margin-inline: auto;"></div>
    <div style="margin-top: 6px; font-size: 11pt;">التوقيع / الختم</div>
  </div>
</div>
</body>
</html>`;
}
