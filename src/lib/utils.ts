/* src/lib/utils.ts */

/**
 * Định dạng số thành chuỗi tiền tệ VNĐ (ví dụ: 1.000.000)
 */
export const formatVND = (val: string | number) => {
    if (val === undefined || val === null || val === '') return "";
    const str = val.toString().replace(/\D/g, "");
    if (!str) return "";
    return str.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

/**
 * Chuyển chuỗi định dạng tiền tệ VNĐ về dạng số thô
 */
export const parseVND = (val: string) => {
    return val.replace(/\./g, "");
};

/**
 * Kiểm tra xem chuỗi có chỉ chứa các chữ số hay không
 */
export const isOnlyDigits = (val: string) => {
    return /^\d+$/.test(val);
};

/**
 * Format số điện thoại (chỉ giữ lại số)
 */
export const formatPhone = (val: string) => {
    return val.replace(/\D/g, "");
};
