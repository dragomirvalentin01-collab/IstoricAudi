import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

const money = (n) => Number(n || 0).toFixed(2)

/** Export istoric schimburi in PDF, gata de dus la service */
export function exportPdf(changes, vehicle) {
  const doc = new jsPDF({ orientation: 'landscape' })

  doc.setFontSize(18)
  doc.text('Istoric schimburi ulei + filtre', 14, 18)

  doc.setFontSize(10)
  doc.setTextColor(110)
  const titlu = vehicle
    ? `${vehicle.name}${vehicle.plate ? ' · ' + vehicle.plate : ''}`
    : 'Toate vehiculele'
  doc.text(titlu, 14, 25)
  doc.text(`Generat: ${new Date().toLocaleDateString('ro-RO')}`, 14, 31)
  doc.setTextColor(0)

  const rows = changes.map((c) => [
    new Date(c.date).toLocaleDateString('ro-RO'),
    `${c.km} km`,
    [c.oil_brand, c.oil_spec].filter(Boolean).join(' ') || '-',
    c.oil_quantity ? `${c.oil_quantity} L` : '-',
    [c.filter_oil, c.filter_air, c.filter_cabin].filter(Boolean).join(', ') || '-',
    money(c.part_cost),
    money(c.labor_cost),
    money(Number(c.part_cost || 0) + Number(c.labor_cost || 0)),
    c.shop || '-'
  ])

  autoTable(doc, {
    startY: 36,
    head: [['Data', 'Kilometraj', 'Ulei', 'Cantitate', 'Filtre', 'Piese', 'Manopera', 'Total', 'Service']],
    body: rows,
    styles: { fontSize: 9, cellPadding: 3 },
    headStyles: { fillColor: [2, 132, 199] }
  })

  const total = changes.reduce(
    (sum, c) => sum + Number(c.part_cost || 0) + Number(c.labor_cost || 0), 0
  )
  doc.setFontSize(12)
  doc.text(`Total general: ${total.toFixed(2)} lei`, 14, doc.lastAutoTable.finalY + 10)

  const name = `istoric-schimburi-${new Date().toISOString().slice(0, 10)}.pdf`
  doc.save(name)
  return name
}

/** Export istoric in Excel */
export function exportExcel(changes, vehicle) {
  const data = changes.map((c) => ({
    Data: new Date(c.date).toLocaleDateString('ro-RO'),
    'Kilometraj (km)': c.km,
    'Brand ulei': c.oil_brand || '',
    'Specificatie': c.oil_spec || '',
    'Cantitate (L)': c.oil_quantity || '',
    'Filtru ulei': c.filter_oil || '',
    'Filtru aer': c.filter_air || '',
    'Filtru habitaclu': c.filter_cabin || '',
    'Cost piese': Number(c.part_cost || 0),
    'Cost manopera': Number(c.labor_cost || 0),
    Total: Number(c.part_cost || 0) + Number(c.labor_cost || 0),
    Service: c.shop || '',
    Observatii: c.notes || ''
  }))

  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Schimburi')

  const name = `istoric-schimburi-${new Date().toISOString().slice(0, 10)}.xlsx`
  XLSX.writeFile(wb, name)
  return name
}
