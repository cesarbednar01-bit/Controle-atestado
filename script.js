const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    sessionStorage.removeItem("atestado_logged");
    window.location.replace("index.html");
  });
}

const STORAGE = {
  certificates: "atestado30_certificates_v2"
};

const LEGACY_SHIFT_CHIEFS = {
  A: "Jean Marcelo Costa de Souza",
  B: "Osvaldo Silva Daveis Filho",
  C: "Juliano dos Santos Lima",
  D: "Anderson Neves da Silva"
};

let certificates = load(STORAGE.certificates, []);
let distributionChart = null;

const $ = id => document.getElementById(id);

function load(key, fallback) {
  const value = localStorage.getItem(key);
  if (!value) return fallback;
  try { return JSON.parse(value); } catch { return fallback; }
}

function save() {
  localStorage.setItem(STORAGE.certificates, JSON.stringify(certificates));
}

function dateLocal(value) {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function iso(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDate(value) {
  if (!value) return "-";
  return dateLocal(value).toLocaleDateString("pt-BR");
}

function addDays(value, amount) {
  const d = dateLocal(value);
  d.setDate(d.getDate() + amount);
  return iso(d);
}

function daysBetweenInclusive(start, end) {
  if (!start || !end || end < start) return 0;
  return Math.round((dateLocal(end) - dateLocal(start)) / 86400000) + 1;
}

function showToast(message) {
  const toast = $("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2600);
}

function getCertificateEmployee(c) {
  return c.employeeName || c.employee || "Colaborador";
}

function getCertificateChief(c) {
  return c.chiefName || LEGACY_SHIFT_CHIEFS[c.shift] || "-";
}

function getOffDaysCount(c) {
  if (Array.isArray(c.offDays)) return c.offDays.length;
  if (c.offStart && c.offEnd) return daysBetweenInclusive(c.offStart, c.offEnd);
  return 0;
}

function navigate(page) {
  document.querySelectorAll(".page").forEach(p => {
    p.classList.toggle("active", p.id === page);
  });

  document.querySelectorAll(".nav-item").forEach(b => {
    b.classList.toggle("active", b.dataset.page === page);
  });

  const titles = {
    dashboard: "Dashboard",
    lancamento: "Lançar atestado",
    historico: "Histórico"
  };

  $("pageTitle").textContent = titles[page] || "Dashboard";

  if (page === "dashboard") updateDashboard();
  if (page === "historico") renderHistory();
}

document.querySelectorAll(".nav-item").forEach(button => {
  button.addEventListener("click", () => navigate(button.dataset.page));
});

document.querySelectorAll("[data-page-target]").forEach(button => {
  button.addEventListener("click", () => navigate(button.dataset.pageTarget));
});

$("quickLaunch").addEventListener("click", () => navigate("lancamento"));

/* =========================
   LANÇAMENTO DO ATESTADO
========================= */

function updateEndDate() {
  const start = $("startDate").value;
  const days = Number($("days").value);

  $("endDate").value =
    start && days > 0
      ? addDays(start, days - 1)
      : "";

  updateOffDaysLimits();
  updateOffDaysVisibility();
  updatePeriodPreview();
}

function updateOffDaysLimits() {
  const start = $("startDate").value;
  const end = $("endDate").value;

  $("folgaInicio").min = start || "";
  $("folgaInicio").max = end || "";
  $("folgaFim").min = start || "";
  $("folgaFim").max = end || "";
}

function updateOffDaysVisibility() {
  const selected = document.querySelector('input[name="teveFolga"]:checked');
  const hasOffDays = selected?.value === "sim";

  $("periodoFolga").classList.toggle("hidden", !hasOffDays);

  if (!hasOffDays) {
    $("folgaInicio").value = "";
    $("folgaFim").value = "";
  }

  updateCalculation();
}

function updatePeriodPreview() {
  const start = $("startDate").value;
  const days = Number($("days").value);

  if (!start || !days || days < 1 || days > 30) {
    $("periodPreview").classList.add("hidden");
    return;
  }

  $("periodPreview").classList.remove("hidden");
  $("previewTotal").textContent =
    `${days} ${days === 1 ? "dia" : "dias"}`;

  updateCalculation();
}

function getOffDaysCountFromForm() {
  const hasOffDays =
    document.querySelector('input[name="teveFolga"]:checked')?.value === "sim";

  if (!hasOffDays) return 0;

  const start = $("folgaInicio").value;
  const end = $("folgaFim").value;

  if (!start || !end || end < start) return 0;

  return daysBetweenInclusive(start, end);
}

function updateCalculation() {
  const days = Number($("days").value) || 0;
  const off = getOffDaysCountFromForm();

  $("calcSick").textContent = days;
  $("calcOff").textContent = off;
  $("calcWork").textContent = Math.max(0, days - off);

  validateOffPeriod();
}

function validateOffPeriod() {
  const certificateStart = $("startDate").value;
  const certificateEnd = $("endDate").value;
  const offStart = $("folgaInicio").value;
  const offEnd = $("folgaFim").value;

  $("folgaInicio").setCustomValidity("");
  $("folgaFim").setCustomValidity("");

  if (!offStart && !offEnd) return true;

  if (offStart && certificateStart && certificateEnd &&
      (offStart < certificateStart || offStart > certificateEnd)) {
    $("folgaInicio").setCustomValidity(
      "A data inicial da folga deve estar dentro do período do atestado."
    );
    return false;
  }

  if (offEnd && certificateStart && certificateEnd &&
      (offEnd < certificateStart || offEnd > certificateEnd)) {
    $("folgaFim").setCustomValidity(
      "A data final da folga deve estar dentro do período do atestado."
    );
    return false;
  }

  if (offStart && offEnd && offEnd < offStart) {
    $("folgaFim").setCustomValidity(
      "A data final da folga não pode ser anterior à data inicial."
    );
    return false;
  }

  return true;
}

$("startDate").addEventListener("input", updateEndDate);
$("days").addEventListener("input", updateEndDate);

document.querySelectorAll('input[name="teveFolga"]').forEach(input => {
  input.addEventListener("change", updateOffDaysVisibility);
});

$("folgaInicio").addEventListener("input", updateCalculation);
$("folgaFim").addEventListener("input", updateCalculation);

$("clearForm").addEventListener("click", () => {
  $("certificateForm").reset();
  $("periodoFolga").classList.add("hidden");
  $("periodPreview").classList.add("hidden");
  $("endDate").value = "";
  $("folgaInicio").value = "";
  $("folgaFim").value = "";
});

$("certificateForm").addEventListener("submit", event => {
  event.preventDefault();

  const employeeName = $("employee").value.trim();
  const chiefShift = $("shiftChief").value;
  const start = $("startDate").value;
  const days = Number($("days").value);

  if (!employeeName || !chiefShift || !start || !days) {
    showToast("Preencha todos os campos obrigatórios.");
    return;
  }

  if (days < 1 || days > 30) {
    showToast("O atestado deve ter entre 1 e 30 dias.");
    return;
  }

  const end = addDays(start, days - 1);
  const hasOffDays =
    document.querySelector('input[name="teveFolga"]:checked')?.value === "sim";

  let offStart = "";
  let offEnd = "";
  let offDays = [];

  if (hasOffDays) {
    offStart = $("folgaInicio").value;
    offEnd = $("folgaFim").value;

    if (!offStart || !offEnd) {
      showToast("Informe a data inicial e final da folga.");
      return;
    }

    if (!validateOffPeriod()) {
      showToast("Confira o período da folga.");
      return;
    }

    for (let d = offStart; d <= offEnd; d = addDays(d, 1)) {
      offDays.push(d);
    }
  }

  certificates.push({
    id: crypto.randomUUID(),
    employeeName,
    chiefName: chiefShift,
    start,
    end,
    days,
    hasOffDays,
    offStart,
    offEnd,
    offDays,
    observation: $("observation").value.trim(),
    createdAt: new Date().toISOString()
  });

  save();

  showToast("Atestado lançado com sucesso.");

  $("certificateForm").reset();
  $("periodoFolga").classList.add("hidden");
  $("periodPreview").classList.add("hidden");
  $("endDate").value = "";
  $("folgaInicio").value = "";
  $("folgaFim").value = "";

  navigate("dashboard");
});

/* =========================
   DASHBOARD
========================= */

function getDateRange() {
  const start = $("dashStart").value;
  const end = $("dashEnd").value;

  return {
    start: start || "1900-01-01",
    end: end || "2999-12-31"
  };
}

function inRange(cert, start, end) {
  return cert.start <= end && cert.end >= start;
}

function getStats() {
  const { start, end } = getDateRange();
  let selected = certificates.filter(c => inRange(c, start, end));

  let sick = 0;
  let off = 0;

  selected.forEach(c => {
    const clippedStart = c.start < start ? start : c.start;
    const clippedEnd = c.end > end ? end : c.end;

    let certificateDays = daysBetweenInclusive(clippedStart, clippedEnd);
    let offForCertificate = 0;

    if (c.offStart && c.offEnd) {
      const offStart = c.offStart < clippedStart ? clippedStart : c.offStart;
      const offEnd = c.offEnd > clippedEnd ? clippedEnd : c.offEnd;
      offForCertificate = daysBetweenInclusive(offStart, offEnd);
    } else {
      offForCertificate = (c.offDays || []).filter(
        d => d >= clippedStart && d <= clippedEnd
      ).length;
    }

    off += offForCertificate;
    sick += Math.max(0, certificateDays - offForCertificate);
  });

  const totalPeriod =
    start !== "1900-01-01" && end !== "2999-12-31"
      ? Math.max(0, daysBetweenInclusive(start, end))
      : 30;

  const uniqueEmployees = new Set(
    selected.map(c => getCertificateEmployee(c).trim().toLowerCase())
  );

  const totalAvailable = totalPeriod * uniqueEmployees.size;
  const worked = Math.max(0, totalAvailable - off - sick);

  return {
    selected,
    sick,
    off,
    worked,
    totalPeriod,
    uniqueEmployees: uniqueEmployees.size
  };
}

function updateDashboard() {
  const stats = getStats();

  $("metricEmployees").textContent = stats.uniqueEmployees;
  $("metricCertificates").textContent = stats.selected.length;
  $("metricSickDays").textContent = stats.sick;
  $("metricOffDays").textContent = stats.off;

  const chartData = [
    { label: "Trabalhados", value: stats.worked },
    { label: "Atestado", value: stats.sick },
    { label: "Folgas", value: stats.off }
  ];

  if (distributionChart) distributionChart.destroy();

  distributionChart = new Chart($("distributionChart"), {
    type: "doughnut",
    data: {
      labels: chartData.map(x => x.label),
      datasets: [{ data: chartData.map(x => x.value) }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: "bottom" } },
      cutout: "68%"
    }
  });

  const recent = certificates
    .slice()
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 8);

  $("recentTable").innerHTML = recent.length
    ? recent.map(c => `
      <tr>
        <td>${getCertificateEmployee(c)}</td>
        <td>${getCertificateChief(c)}</td>
        <td>${formatDate(c.start)}</td>
        <td>${formatDate(c.end)}</td>
        <td>${c.days}</td>
        <td>${getOffDaysCount(c)}</td>
      </tr>
    `).join("")
    : `<tr><td colspan="6" class="empty">Nenhum atestado lançado.</td></tr>`;
}

/* =========================
   HISTÓRICO
========================= */

function getHistoryFilteredCertificates() {
  const search = $("historySearch").value.toLowerCase().trim();
  const startFilter = $("historyStart").value;
  const endFilter = $("historyEnd").value;

  if (startFilter && endFilter && endFilter < startFilter) {
    return { filtered: [], invalidRange: true, startFilter, endFilter };
  }

  const filtered = certificates
    .slice()
    .sort((a, b) => b.start.localeCompare(a.start))
    .filter(c => {
      const employeeName = getCertificateEmployee(c).toLowerCase();

      const matchesSearch = !search || employeeName.includes(search);
      const matchesStart = !startFilter || c.end >= startFilter;
      const matchesEnd = !endFilter || c.start <= endFilter;

      return matchesSearch && matchesStart && matchesEnd;
    });

  return { filtered, invalidRange: false, startFilter, endFilter };
}

function renderHistory() {
  const { filtered, invalidRange } = getHistoryFilteredCertificates();

  if (invalidRange) {
    $("historyTable").innerHTML =
      `<tr><td colspan="7" class="empty">A data final não pode ser anterior à data inicial.</td></tr>`;
    return;
  }

  $("historyTable").innerHTML = filtered.length
    ? filtered.map(c => `
      <tr>
        <td>${getCertificateEmployee(c)}</td>
        <td>${getCertificateChief(c)}</td>
        <td>${formatDate(c.start)} → ${formatDate(c.end)}</td>
        <td>${c.days} dia(s)</td>
        <td>${
          c.offStart && c.offEnd
            ? `${formatDate(c.offStart)} → ${formatDate(c.offEnd)}`
            : (c.offDays || []).length
              ? c.offDays.map(formatDate).join(", ")
              : "Nenhuma"
        }</td>
        <td>${Math.max(0, c.days - getOffDaysCount(c))} dia(s)</td>
        <td>
          <button class="danger-btn" onclick="deleteCertificate('${c.id}')">
            Excluir
          </button>
        </td>
      </tr>
    `).join("")
    : `<tr><td colspan="7" class="empty">Nenhum registro encontrado para os filtros selecionados.</td></tr>`;
}

$("historySearch").addEventListener("input", renderHistory);
$("historyStart").addEventListener("change", renderHistory);
$("historyEnd").addEventListener("change", renderHistory);
$("applyHistory").addEventListener("click", renderHistory);

function getReportStats(filtered, startFilter, endFilter) {
  const periodStart = startFilter || (filtered.length ? filtered.reduce((min, c) => c.start < min ? c.start : min, filtered[0].start) : "");
  const periodEnd = endFilter || (filtered.length ? filtered.reduce((max, c) => c.end > max ? c.end : max, filtered[0].end) : "");

  const uniqueEmployees = new Set(
    filtered.map(c => getCertificateEmployee(c).trim().toLowerCase())
  ).size;

  const totalPeriod = periodStart && periodEnd
    ? daysBetweenInclusive(periodStart, periodEnd)
    : 0;

  let sick = 0;
  let off = 0;

  filtered.forEach(c => {
    const clippedStart = periodStart && c.start < periodStart ? periodStart : c.start;
    const clippedEnd = periodEnd && c.end > periodEnd ? periodEnd : c.end;
    const certificateDays = daysBetweenInclusive(clippedStart, clippedEnd);

    let offForCertificate = 0;
    if (c.offStart && c.offEnd) {
      const offStart = c.offStart < clippedStart ? clippedStart : c.offStart;
      const offEnd = c.offEnd > clippedEnd ? clippedEnd : c.offEnd;
      offForCertificate = daysBetweenInclusive(offStart, offEnd);
    } else {
      offForCertificate = (c.offDays || []).filter(
        d => d >= clippedStart && d <= clippedEnd
      ).length;
    }

    off += offForCertificate;
    sick += Math.max(0, certificateDays - offForCertificate);
  });

  const available = totalPeriod * uniqueEmployees;
  const worked = Math.max(0, available - sick - off);

  return { uniqueEmployees, totalPeriod, available, sick, off, worked, periodStart, periodEnd };
}

function makePdfChart(type, labels, values) {
  const canvas = document.createElement("canvas");
  canvas.width = 900;
  canvas.height = 500;
  canvas.style.position = "fixed";
  canvas.style.left = "-10000px";
  canvas.style.top = "-10000px";
  document.body.appendChild(canvas);

  const chart = new Chart(canvas, {
    type,
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: ["#123b63", "#c53b3b", "#c88719", "#24805a"],
        borderWidth: 0
      }]
    },
    options: {
      responsive: false,
      animation: false,
      plugins: {
        legend: { position: "bottom" }
      },
      scales: type === "bar" ? {
        y: { beginAtZero: true, ticks: { precision: 0 } }
      } : undefined
    }
  });

  const image = chart.toBase64Image();
  chart.destroy();
  canvas.remove();
  return image;
}

function exportHistoryPDF() {
  const { filtered, invalidRange, startFilter, endFilter } = getHistoryFilteredCertificates();

  if (invalidRange) {
    alert("A data final não pode ser anterior à data inicial.");
    return;
  }

  if (!filtered.length) {
    alert("Não existem atestados para os filtros selecionados.");
    return;
  }

  if (!window.jspdf?.jsPDF) {
    alert("A biblioteca de PDF não foi carregada. Verifique sua conexão com a internet e tente novamente.");
    return;
  }

  const stats = getReportStats(filtered, startFilter, endFilter);
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  let y = 18;

  const addPageIfNeeded = (needed = 12) => {
    if (y + needed > pageHeight - 18) {
      doc.addPage();
      y = 18;
    }
  };

  const addWrapped = (text, x, width, lineHeight = 5) => {
    const lines = doc.splitTextToSize(String(text), width);
    doc.text(lines, x, y);
    y += lines.length * lineHeight;
  };

  doc.setFont("helvetica", "bold");
  doc.setFontSize(19);
  doc.text("RELATÓRIO DE ATESTADOS", margin, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const periodo = startFilter && endFilter
    ? `${formatDate(startFilter)} até ${formatDate(endFilter)}`
    : startFilter
      ? `A partir de ${formatDate(startFilter)}`
      : endFilter
        ? `Até ${formatDate(endFilter)}`
        : "Todos os períodos";
  doc.text(`Período analisado: ${periodo}`, margin, y);
  y += 5;
  doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, margin, y);
  y += 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Resumo do período", margin, y);
  y += 7;

  const summary = [
    ["Colaboradores com lançamento", stats.uniqueEmployees],
    ["Quantidade de atestados", filtered.length],
    ["Dias de atestado", stats.sick],
    ["Dias de folga", stats.off],
    ["Dias trabalhados", stats.worked]
  ];

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  summary.forEach(([label, value]) => {
    doc.text(`${label}:`, margin, y);
    doc.setFont("helvetica", "bold");
    doc.text(String(value), margin + 72, y);
    doc.setFont("helvetica", "normal");
    y += 6;
  });

  y += 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Distribuição dos dias", margin, y);
  y += 4;

  const doughnut = makePdfChart(
    "doughnut",
    ["Trabalhados", "Atestado", "Folgas"],
    [stats.worked, stats.sick, stats.off]
  );
  doc.addImage(doughnut, "PNG", margin, y, 105, 58);
  y += 64;

  const byChief = {};
  filtered.forEach(c => {
    const chief = getCertificateChief(c);
    byChief[chief] = (byChief[chief] || 0) + Math.max(0, c.days - getOffDaysCount(c));
  });

  addPageIfNeeded(75);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Dias de atestado por chefe de turno", margin, y);
  y += 4;

  const bar = makePdfChart(
    "bar",
    Object.keys(byChief),
    Object.values(byChief)
  );
  doc.addImage(bar, "PNG", margin, y, 178, 65);
  y += 72;

  addPageIfNeeded(20);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Detalhamento dos lançamentos", margin, y);
  y += 8;

  filtered.forEach((c, index) => {
    const employee = getCertificateEmployee(c);
    const chief = getCertificateChief(c);
    const offCount = getOffDaysCount(c);
    const affected = Math.max(0, c.days - offCount);

    addPageIfNeeded(42);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    addWrapped(`${index + 1}. ${employee}`, margin, pageWidth - margin * 2, 5);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    addWrapped(`Chefe de turno: ${chief}`, margin + 3, pageWidth - margin * 2 - 3, 4.5);
    addWrapped(`Período do atestado: ${formatDate(c.start)} até ${formatDate(c.end)}`, margin + 3, pageWidth - margin * 2 - 3, 4.5);
    addWrapped(`Quantidade total: ${c.days} dia(s)`, margin + 3, pageWidth - margin * 2 - 3, 4.5);

    if (c.offStart && c.offEnd) {
      addWrapped(`Folga informada: ${formatDate(c.offStart)} até ${formatDate(c.offEnd)} (${offCount} dia(s))`, margin + 3, pageWidth - margin * 2 - 3, 4.5);
    } else {
      addWrapped(`Folgas: ${offCount ? (c.offDays || []).map(formatDate).join(", ") : "Nenhuma"}`, margin + 3, pageWidth - margin * 2 - 3, 4.5);
    }

    addWrapped(`Dias considerados como atestado: ${affected} dia(s)`, margin + 3, pageWidth - margin * 2 - 3, 4.5);

    if (c.observation) {
      addWrapped(`Observação: ${c.observation}`, margin + 3, pageWidth - margin * 2 - 3, 4.5);
    }

    y += 4;
    doc.setDrawColor(210, 215, 220);
    doc.line(margin, y, pageWidth - margin, y);
    y += 7;
  });

  const totalPages = doc.internal.getNumberOfPages();
  for (let page = 1; page <= totalPages; page++) {
    doc.setPage(page);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100, 110, 120);
    doc.text("Controle de Atestados | Relatório operacional", margin, pageHeight - 9);
    doc.text(`Página ${page} de ${totalPages}`, pageWidth - margin - 28, pageHeight - 9);
    doc.setTextColor(0, 0, 0);
  }

  const safeStart = startFilter || "todos";
  const safeEnd = endFilter || "periodos";
  doc.save(`relatorio-atestados-${safeStart}-${safeEnd}.pdf`);
}

$("exportPdf").addEventListener("click", exportHistoryPDF);

function deleteCertificate(id) {
  if (!confirm("Excluir este lançamento?")) return;

  certificates = certificates.filter(c => c.id !== id);
  save();
  renderHistory();
  updateDashboard();
  showToast("Lançamento excluído.");
}

window.deleteCertificate = deleteCertificate;

/* =========================
   INICIALIZAÇÃO
========================= */

function initialize() {
  const today = new Date();
  const start = new Date(today);
  start.setDate(start.getDate() - 29);

  $("dashStart").value = iso(start);
  $("dashEnd").value = iso(today);

  updateDashboard();
}

$("applyDashboard").addEventListener("click", updateDashboard);

initialize();
