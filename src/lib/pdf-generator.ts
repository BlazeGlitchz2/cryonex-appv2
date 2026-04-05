import jsPDF from "jspdf";

interface WorksheetData {
  title: string;
  summary: string;
  flashcards: Array<{ front: string; back: string }>;
  quizzes: Array<{
    question: string;
    options?: string[];
    correctAnswer: string;
    explanation?: string;
    type: string;
  }>;
  metadata: {
    region?: string;
    curriculum?: string;
  };
}

export const generateWorksheetPDF = (data: WorksheetData) => {
  const doc = new jsPDF();
  const margin = 20;
  const topMargin = 20;
  const bottomMargin = 18;
  let cursorY = topMargin;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - margin * 2;

  // Deepshi Theme Colors
  const primaryColor = [6, 182, 212];
  const textColor = [20, 20, 40];
  const accentColor = [37, 99, 235];
  const mutedColor = [100, 100, 120];

  const ensureSpace = (neededHeight: number) => {
    if (cursorY + neededHeight > pageHeight - bottomMargin) {
      doc.addPage();
      cursorY = topMargin;
    }
  };

  const drawDivider = (y: number) => {
    doc.setDrawColor(230, 230, 240);
    doc.line(margin, y, pageWidth - margin, y);
    return y + 10;
  };

  const addText = (
    text: string,
    fontSize = 12,
    fontStyle = "normal",
    color = textColor,
    lineSpacing = 1.35,
  ) => {
    doc.setFont("helvetica", fontStyle);
    doc.setFontSize(fontSize);
    doc.setTextColor(color[0], color[1], color[2]);

    const lines = doc.splitTextToSize(text, contentWidth);
    const textHeight = lines.length * fontSize * lineSpacing;
    ensureSpace(textHeight + 4);
    doc.text(lines, margin, cursorY);
    cursorY += textHeight + 5;
  };

  const addSectionTitle = (text: string, color = primaryColor) => {
    ensureSpace(18);
    doc.setFillColor(color[0], color[1], color[2]);
    doc.roundedRect(margin, cursorY - 2, 46, 8, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(text.toUpperCase(), margin + 3, cursorY + 3.5);
    cursorY += 12;
  };

  const addPromptBlock = (label: string, body: string, isQuestion = false) => {
    const blockMinHeight = isQuestion ? 34 : 26;
    ensureSpace(blockMinHeight);
    doc.setDrawColor(226, 232, 240);
    doc.setFillColor(250, 250, 252);
    doc.roundedRect(margin, cursorY, contentWidth, blockMinHeight, 3, 3, "S");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.text(label, margin + 5, cursorY + 8);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
    const lines = doc.splitTextToSize(body, contentWidth - 10);
    doc.text(lines, margin + 5, cursorY + 14);
    cursorY += blockMinHeight + 6;
  };

  // --- Header ---
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 40, "F");
  
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text("Cryonex Study Guide", margin, 25);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`${data.title} | Active Recall Worksheet`, margin, 32);

  cursorY = 56;

  // --- Overview ---
  addSectionTitle("Overview", primaryColor);
  addText(data.summary, 10, "normal");
  cursorY = drawDivider(cursorY + 5);

  // --- Active Recall Section ---
  if (data.flashcards.length > 0) {
    addSectionTitle("Active Recall", accentColor);
    addText(
      "Try to define these terms without looking at your notes first.",
      9,
      "italic",
      mutedColor,
    );
    cursorY += 5;

    data.flashcards.slice(0, 10).forEach((card, index) => {
      addPromptBlock(`${index + 1}. ${card.front}`, "Write the answer here...", true);
    });
    cursorY = drawDivider(cursorY + 5);
  }

  // --- Assessment Section ---
  if (data.quizzes.length > 0) {
    addSectionTitle("Knowledge Check", primaryColor);
    cursorY += 5;

    data.quizzes.slice(0, 15).forEach((quiz, index) => {
      addPromptBlock(`${index + 1}. ${quiz.question}`, "Choose the best answer or write a short response.");

      if (quiz.options && quiz.options.length > 0) {
        quiz.options.slice(0, 4).forEach((opt, optIdx) => {
          const prefix = String.fromCharCode(65 + optIdx);
          addText(`   [ ] ${prefix}. ${opt}`, 10, "normal");
        });
      } else {
        ensureSpace(22);
        doc.setDrawColor(230, 230, 240);
        doc.rect(margin, cursorY, contentWidth, 24);
        cursorY += 28;
      }
      cursorY += 4;
    });
  }

  // --- Answer Key (Final Page) ---
  doc.addPage();
  cursorY = topMargin;
  addSectionTitle("Answer Key", accentColor);
  cursorY += 10;

  if (data.flashcards.length > 0) {
    addText("Terms & Definitions", 12, "bold", primaryColor);
    data.flashcards.slice(0, 10).forEach((card) => {
      addText(`${card.front}: ${card.back}`, 9, "normal");
    });
    cursorY += 5;
  }

  if (data.quizzes.length > 0) {
    addText("Quiz Answers", 12, "bold", primaryColor);
    data.quizzes.forEach((quiz, index) => {
      addText(`Q${index + 1}: ${quiz.correctAnswer}`, 9, "normal");
      if (quiz.explanation) {
        addText(`Why: ${quiz.explanation}`, 8, "italic", mutedColor);
      }
    });
  }

  // --- Footer ---
  const pageCount = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Generated by Cryonex AI • Worksheet for ${data.title} • Page ${i} of ${pageCount}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" },
    );
  }

  doc.save(`${data.title.replace(/\s+/g, "_")}_Worksheet.pdf`);
};
