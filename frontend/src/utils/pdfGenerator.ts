import jsPDF from 'jspdf';

interface GeneratePDFParams {
  patientName: string;
  patientAge: string;
  patientId: string;
  doctorName: string;
  hospitalName: string;
  date: string;
  time: string;
  soap: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  };
}

export const generateAndDownloadPDF = (data: GeneratePDFParams) => {
  const doc = new jsPDF();
  let yPos = 20;
  
  // Header
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(data.hospitalName, 105, yPos, { align: 'center' });
  
  yPos += 10;
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text("Clinical Consultation Record", 105, yPos, { align: 'center' });
  
  yPos += 15;
  
  // Patient Info Box
  doc.setLineWidth(0.5);
  doc.rect(14, yPos, 182, 35);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  
  const startY = yPos + 8;
  const col1 = 18;
  const col2 = 100;
  
  doc.text("Patient Name:", col1, startY);
  doc.text("Patient ID:", col1, startY + 8);
  doc.text("Age/Sex:", col1, startY + 16);
  
  doc.text("Attending Physician:", col2, startY);
  doc.text("Date of Encounter:", col2, startY + 8);
  doc.text("Time of Admission:", col2, startY + 16);
  
  doc.setFont("helvetica", "normal");
  doc.text(data.patientName, col1 + 30, startY);
  doc.text(data.patientId, col1 + 30, startY + 8);
  doc.text(data.patientAge, col1 + 30, startY + 16);
  
  doc.text(data.doctorName, col2 + 40, startY);
  doc.text(data.date, col2 + 40, startY + 8);
  doc.text(data.time, col2 + 40, startY + 16);
  
  yPos += 45;
  
  // SOAP Note Section
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("SOAP Documentation", 14, yPos);
  
  yPos += 10;
  
  const addSection = (title: string, content: string) => {
    // Add new page if we're near the bottom
    if (yPos > 260) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(title, 14, yPos);
    
    yPos += 6;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    const lines = doc.splitTextToSize(content || "Not documented.", 182);
    doc.text(lines, 14, yPos);
    
    yPos += (lines.length * 5) + 8;
  };
  
  addSection("SUBJECTIVE", data.soap.subjective);
  addSection("OBJECTIVE", data.soap.objective);
  addSection("ASSESSMENT", data.soap.assessment);
  addSection("PLAN", data.soap.plan);
  
  // Footer / Signatures
  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }
  
  yPos += 20;
  doc.setLineWidth(0.2);
  doc.line(14, yPos, 80, yPos);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Physician Signature", 14, yPos + 5);
  doc.text(`Dr. ${data.doctorName}`, 14, yPos + 10);
  
  // Open in new tab or download
  // doc.save(`Consultation_${data.patientId}_${data.date}.pdf`);
  window.open(doc.output('bloburl'), '_blank');
};
