import PDFDocument from 'pdfkit';
import fs from 'fs';
import { print } from 'pdf-to-printer';

export class PrinterService {
  static async printRemission(remissionData: any) {
    // 1. Generar PDF
    const doc = new PDFDocument();
    const pdfPath = `./temp/remission_${remissionData.id}_${Date.now()}.pdf`;
    
    // Configurar contenido del PDF
    doc.pipe(fs.createWriteStream(pdfPath));
    
    // Diseño profesional de remisión
    doc.image('./assets/logo.png', 50, 45, { width: 50 }) // Logo
      .fillColor('#444444')
      .fontSize(20)
      .text('REMISIÓN #' + remissionData.id, 110, 57)
      .fontSize(10)
      .text(new Date().toLocaleDateString(), { align: 'right' })
      .moveDown(2);

    // Tabla de productos
    const table = {
      headers: ['Producto', 'Cantidad', 'Precio', 'Total'],
      rows: remissionData.details.map(d => [
        d.eggType.name,
        d.boxCount,
        `$${d.pricePerKilo.toFixed(2)}`,
        `$${(d.boxCount * d.pricePerKilo).toFixed(2)}`
      ])
    };

    // Dibujar tabla
    doc.font('Helvetica-Bold');
    table.headers.forEach((header, i) => {
      doc.text(header, 50, 150 + (i * 15));
    });
    
    doc.font('Helvetica');
    table.rows.forEach((row, rowIndex) => {
      row.forEach((cell, cellIndex) => {
        doc.text(cell, 50 + (cellIndex * 120), 170 + (rowIndex * 20));
      });
    });

    doc.end();

    // 2. Enviar a impresora
    try {
      const options = {
        printer: process.env.PRINTER_NAME,
        scale: 'fit' // Ajustar al tamaño del papel
      };

      await print(pdfPath, options);
      fs.unlinkSync(pdfPath); // Limpiar archivo temporal
      
      return { success: true };
    } catch (error) {
      fs.unlinkSync(pdfPath);
      throw new Error(`Error al imprimir: ${error.message}`);
    }
  }
}