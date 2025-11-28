import axios from "axios";

const API_URL = "http://localhost:7013/api/admin"; // Replace with your backend URL

// Admin API Calls
export const createCoupon = (couponData, image) => {
  const formData = new FormData();
  formData.append("couponName", couponData.couponName);
  formData.append("shortDescription", couponData.shortDescription);
  formData.append("applyUser", couponData.applyUser);
  formData.append("discountPrice", couponData.discountPrice);
  formData.append("productId", couponData.productId);
  formData.append("image", image);

  return axios.post(`${API_URL}/coupons`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const updateCoupon = (id, couponData, image) => {
  const formData = new FormData();
  formData.append("couponName", couponData.couponName);
  formData.append("shortDescription", couponData.shortDescription);
  formData.append("applyUser", couponData.applyUser);
  formData.append("discountPrice", couponData.discountPrice);
  formData.append("productId", couponData.productId);
  formData.append("image", image);

  return axios.put(`${API_URL}/coupons/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const deleteCoupon = (id) => {
  return axios.delete(`${API_URL}/coupons/${id}`);
};

// User API Calls
export const getCoupons = () => {
  return axios.get(`${API_URL}/coupons`);
};
