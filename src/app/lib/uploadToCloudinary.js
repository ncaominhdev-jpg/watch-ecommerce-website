import { Readable } from 'stream';
import cloudinary from 'cloudinary';

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = async (buffer) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.v2.uploader.upload_stream(
            {
                resource_type: 'raw',
                public_id: `invoices/invoice_${Date.now()}`,
                format: 'pdf',
            },
            (error, result) => {
                if (error) return reject(error);
                const downloadUrl = cloudinary.v2.url(result.public_id, {
                    resource_type: 'raw',
                    attachment: true,
                });
                resolve(downloadUrl);
            }
        );

        Readable.from(buffer).pipe(uploadStream);
    });
};