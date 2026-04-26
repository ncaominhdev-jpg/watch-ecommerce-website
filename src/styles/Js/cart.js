function TinhTien(button, change) {
    const quantityInput = button.parentElement.querySelector('input[type="number"]');
    let currentQuantity = parseInt(quantityInput.value);
    currentQuantity += change;

    if (currentQuantity < 1) {
        currentQuantity = 1;
    }

    quantityInput.value = currentQuantity;

    const pricePerUnit = 10000; // Giá 
    const totalPrice = currentQuantity * pricePerUnit;
    const totalPriceCell = button.closest('tr').querySelector('.item-total');
    totalPriceCell.innerText = totalPrice.toLocaleString() + ' VNĐ';

    updateGrandTotal();
}

function updateGrandTotal() {
    const itemTotals = document.querySelectorAll('.item-total');
    let grandTotal = 0;

    itemTotals.forEach(item => {
        const price = parseInt(item.innerText.replace(/[^0-9]/g, ''));
        grandTotal += price;
    });

    document.getElementById('grandTotal').innerText = grandTotal.toLocaleString() + ' VNĐ';
}
function Voucher() {
    const voucherInput = document.getElementById('voucherCode').value;
    const totalElement = document.getElementById('grandTotal');
    const messageElement = document.getElementById('voucherMessage');
    let totalAmount = 50000; // Tổng tiền ban đầu

    if (voucherInput === "JKSS") {
        totalAmount -= 5000; 
        messageElement.innerText = "Mã voucher hợp lệ! Đã giảm 5,000 VNĐ.";
        messageElement.style.color = "green"; 
    } else {
        messageElement.innerText = "Mã voucher không hợp lệ.";
        messageElement.style.color = "red";
    }

    totalElement.innerText = totalAmount.toLocaleString() + ' VNĐ';
}