import { generateInvoicePDF } from '../../../utils/generateInvoicePDF';
import { uploadToCloudinary } from '../../../lib/uploadToCloudinary';
import nodemailer from 'nodemailer';

export async function POST(request) {
    try {
        const body = await request.json();
        const { name, email, address, phone, payment, total, items } = body;
        const currentDate = new Date();
        const month = currentDate.getMonth() + 1;
        const year = currentDate.getFullYear();
        const subject = `Hóa đơn mua hàng tháng ${month < 10 ? '0' + month : month}/${year} - Đồng hồ WATCHER Cần Thơ`;

        if (!name || !items || !total) {
            return new Response(JSON.stringify({ message: 'Thiếu dữ liệu đầu vào.' }), { status: 400 });
        }

        const { pdfBuffer, invoiceId } = await generateInvoicePDF({ name, address, phone, payment, items, total });

        const cloudUrl = await uploadToCloudinary(pdfBuffer);
        if (!cloudUrl || typeof cloudUrl !== 'string') {
            throw new Error('Không thể tạo URL từ Cloudinary.');
        }

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        await transporter.sendMail({
            from: `"Đồng hồ WATCHES" <${process.env.EMAIL_USERNAME}>`,
            to: email,
            subject: subject,
            html: `
                <p>Kính gửi Quý khách hàng,</p>
                <p>Xin trân trọng cảm ơn Quý khách đã sử dụng dịch vụ Hóa đơn điện tử của cửa hàng Đồng hồ WATCHES Cần Thơ.</p>
                <p>Đơn vị <strong>ĐỒNG HỒ WATCHES CẦN THƠ</strong> vừa phát hành hóa đơn điện tử tháng <strong>${month}/${year}</strong> của Quý khách hàng <strong>${name}</strong>.</p>

                <p><strong>1. Hóa đơn của khách hàng có:</strong></p>
                    <ul>
                    <li><strong>Số hóa đơn:</strong> ${invoiceId}</li>
                    <li><strong>Tên khách hàng:</strong> ${name}</li>
                    </ul>

                <p><strong>2. Hóa đơn của Quý khách:</strong></p>
                    <p>Hóa đơn đã được đính kèm dưới dạng tệp PDF. Vui lòng nhấp vào tệp để xem chi tiết.</p>

                <p>Trân trọng cảm ơn Quý khách và chúc Quý khách nhiều thành công khi sử dụng dịch vụ!</p>
            `,
            attachments: [
                {
                    filename: `invoice_${invoiceId}.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf',
                    disposition: 'attachment',
                },
            ],
        });

        return new Response(JSON.stringify({ message: 'Hóa đơn đã gửi qua email.', url: cloudUrl }), { status: 200 });
    } catch (error) {
        console.error('Lỗi xử lý POST:', error);
        return new Response(JSON.stringify({ message: 'Lỗi server', error: error.message }), { status: 500 });
    }
}