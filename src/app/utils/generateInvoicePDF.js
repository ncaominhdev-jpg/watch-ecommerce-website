import PDFDocument from 'pdfkit';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function generateInvoicePDF({ name, address, phone, payment, items, total }) {
    return new Promise((resolve, reject) => {
        const fontPath = path.resolve(__dirname, '../../../public/font/Roboto.ttf');
        const boldFontPath = path.resolve(__dirname, '../../../public/font/Roboto-Bold.ttf');
        const italicFontPath = path.resolve(__dirname, '../../../public/font/Roboto-Italic.ttf');
        const logoPath = path.resolve('public/image/main/logonight.jpg');

        const doc = new PDFDocument({
            autoFirstPage: false,
            font: fontPath,
            size: 'A4',
            margins: {
                top: 56.7,
                bottom: 56.7,
                left: 85,
                right: 56.7
            }
        });
        doc.addPage();
        const startX = doc.page.margins.left;
        const startY = 320;
        const rowHeight = 40;
        const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

        const buffers = [];
        doc.on('data', (chunk) => buffers.push(chunk));
        doc.on('end', () => resolve({ pdfBuffer: Buffer.concat(buffers), invoiceId }));
        doc.on('error', (err) => reject(err));

        const today = new Date();
        const day = today.getDate().toString().padStart(2, '0');
        const month = (today.getMonth() + 1).toString().padStart(2, '0');
        const year = today.getFullYear();
        const dateStr = `Ngày ${day} tháng ${month} năm ${year}`;
        const invoiceId = Math.floor(10000000 + Math.random() * 90000000);

        doc.registerFont('RobotoBold', boldFontPath);
        doc.registerFont('RobotoItalic', italicFontPath);
        doc.registerFont('Roboto', fontPath);
        doc.font('Roboto');

        if (fs.existsSync(logoPath)) {
            doc.image(logoPath, startX, 30, { width: 100 });
        }

        const blue = '#004085';

        const pageWidthCenter = doc.page.width;

        doc.fontSize(20)
            .fillColor('#ff0000')
            .text('HÓA ĐƠN BÁN HÀNG', 0, 40, {
                width: pageWidthCenter,
                align: 'center'
            });

        doc.fontSize(11)
            .fillColor(blue)
            .text(dateStr, 0, 70, {
                width: pageWidthCenter,
                align: 'center'
            });


        doc.moveTo(startX, 100)
            .lineTo(startX + pageWidth, 100)
            .strokeColor(blue)
            .lineWidth(1)
            .stroke();

        doc.fontSize(12)
            .fillColor(blue)
            .font('RobotoItalic')
            .text('Tên người bán (Seller): ', startX, 110, { continued: true })
            .fillColor('black').text('CỬA HÀNG ĐỒNG HỒ WATCHES CẦN THƠ');

        doc.fillColor(blue)
            .font('RobotoItalic')
            .text('Địa chỉ (Address): ', startX, 130, { continued: true })
            .fillColor('black').text('đường 3/2 - phường Cái Răng - Thành phố Cần Thơ');

        doc.fillColor(blue)
            .font('RobotoItalic')
            .text('Số điẹn thoại (Tel): ', startX, 150, { continued: true })
            .fillColor('black').text('0987654321');

        doc.fillColor(blue)
            .font('RobotoItalic')
            .text('Email (mail): ', startX, 170, { continued: true })
            .fillColor('black').text('donghoWATCHES@gmail.com');

        doc.moveTo(startX, 190)
            .lineTo(startX + pageWidth, 190)
            .strokeColor(blue)
            .lineWidth(1)
            .stroke();

        doc.fillColor(blue)
            .font('RobotoItalic')
            .text('Tên người mua (Buyer): ', startX, 210, { continued: true })
            .fillColor('black').text(`${name}`);

        doc.fillColor(blue)
            .font('RobotoItalic')
            .text('Địa chỉ (Address): ', startX, 230, { continued: true })
            .fillColor('black').text(`${address}`);

        doc.fillColor(blue)
            .font('RobotoItalic')
            .text('Hình thức thanh toán (Payment): ', startX, 250, { continued: true })
            .fillColor('black').text(`${payment}`);

        doc.fillColor(blue)
            .font('RobotoItalic')
            .text('Số điện thoại (Tel): ', startX, 270, { continued: true })
            .fillColor('black').text(`${phone}`);

        doc.font('RobotoItalic')
            .fillColor(blue)
            .text('Đơn vị được tính theo: VND', startX, 290, {
                align: 'right'
            });

        doc.font('RobotoBold').fontSize(10);
        const headers = ['STT', 'Tên hàng hóa', 'Đơn vị', 'Số lượng', 'Đơn giá', 'Thành tiền'];
        const colWidths = [23, 185, 40, 45, 85, 85];
        let currentY = startY;
        let currentX = startX;

        headers.forEach((header, i) => {
            doc.text(header, currentX + 2, currentY + 5, { width: colWidths[i] - 4, align: 'center' });
            currentX += colWidths[i];
        });
        doc.rect(startX, currentY, colWidths.reduce((a, b) => a + b), rowHeight).stroke();
        currentX = startX;
        for (let i = 0; i < colWidths.length; i++) {
            doc.moveTo(currentX + colWidths[i], currentY)
                .lineTo(currentX + colWidths[i], currentY + rowHeight)
                .stroke();
            currentX += colWidths[i];
        }

        currentY += rowHeight;
        doc.font('RobotoItalic').fontSize(10);
        items.forEach((item, i) => {
            currentX = startX;
            const thanhTien = item.quantity * item.price;

            const row = [
                `${i + 1}`,
                 `${item.nameProduct}\n${item.nameVariant || ''}`,
                item.unit || 'Cái',
                `${item.quantity}`,
                `${item.price.toLocaleString()}`,
                `${thanhTien.toLocaleString()}`
            ];

            row.forEach((cell, j) => {
                doc.text(cell, currentX + 2, currentY + 5, { width: colWidths[j] - 4, align: 'center' });
                currentX += colWidths[j];
            });

            doc.rect(startX, currentY, colWidths.reduce((a, b) => a + b), rowHeight).stroke();
            currentX = startX;
            for (let i = 0; i < colWidths.length; i++) {
                doc.moveTo(currentX + colWidths[i], currentY)
                    .lineTo(currentX + colWidths[i], currentY + rowHeight)
                    .stroke();
                currentX += colWidths[i];
            }
            currentY += rowHeight;
        });

        doc.fontSize(14)
            .fillColor(blue)
            .text(`Tổng cộng: ${total.toLocaleString()} VND`, startX, currentY + 10, { align: 'right' });

        doc.fontSize(10)
            .fillColor(blue)
            .text(`Số hóa đơn: ${invoiceId}`, startX, currentY + 10, { align: 'left' });

        doc.end();
    });
}
