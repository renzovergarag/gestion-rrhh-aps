'use client'

import React from 'react'
import { Download } from 'lucide-react'

interface Props {
  data: any[]
  filename: string
}

export default function ExportCSVButton({ data, filename }: Props) {
  const handleExport = () => {
    if (!data || data.length === 0) {
        alert('No hay datos para exportar')
        return
    }

    // Aplanar los datos si es necesario (ej. reportes con anidaciones)
    const flatData = data.map(row => {
        const flatRow: Record<string, string | number> = {}
        for (const key in row) {
            if (typeof row[key] === 'object' && row[key] !== null) {
                // Si es un objeto (como professional), aplanar sus propiedades
                for (const subKey in row[key]) {
                    flatRow[`${key}_${subKey}`] = row[key][subKey]
                }
            } else {
                flatRow[key] = row[key]
            }
        }
        return flatRow
    })

    const headers = Object.keys(flatData[0])
    const csvContent = [
      headers.join(','),
      ...flatData.map(row => 
        headers.map(header => {
            let cell = row[header] === null || row[header] === undefined ? '' : String(row[header])
            // Escape comillas y comas
            if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
                cell = `"${cell.replace(/"/g, '""')}"`
            }
            return cell
        }).join(',')
      )
    ].join('\n')

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <button onClick={handleExport} className="btn-secondary py-1.5 px-3 text-sm">
      <Download size={15} />
      Exportar CSV
    </button>
  )
}
