import prisma from "../../../lib/prisma";

export default async function handleContactIntent(msg, userId) {
    if (!userId)
        return "Vui lòng đăng nhập để gửi yêu cầu liên hệ hoặc hỗ trợ. [Đăng nhập](/auth/login)";

    await prisma.contacts.create({
        data: {
            user_id: parseInt(userId),
            title: "Liên hệ từ Chatbot",
            message: msg,
        },
    });
    return "Cảm ơn bạn đã liên hệ. Bộ phận CSKH sẽ phản hồi sớm nhất.";
}
