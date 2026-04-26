import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function getUserFromToken() {
    const cookieStore = await cookies();
    const token = cookieStore.get('jwt-datt')?.value;

    if (!token) {
        throw new Error('Chưa đăng nhập');
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        return decoded; // chứa thông tin user như { id, role, ... }
    } catch (error) {
        console.error('Token không hợp lệ:', error);
        throw new Error('Token không hợp lệ');
    }
}
