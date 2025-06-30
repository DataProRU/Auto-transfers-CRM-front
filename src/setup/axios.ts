import axios from 'axios';

export const API_URL = import.meta.env.VITE_BACKEND_URL;

export const APPROVED_ROLES = [
  'logistician',
  'opening_manager',
  'title',
  'inspector',
  're_export',
  'reciever',
];

const $api = axios.create({
  withCredentials: true,
  baseURL: API_URL,
});

export default $api;
