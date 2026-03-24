import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra ?? {};

export const API_BASE_URL = extra.apiBaseUrl ?? 'http://localhost:5038/api';
export const STRIPE_PUBLISHABLE_KEY = extra.stripePublishableKey ?? 'pk_test_placeholder';
export const TAX_RATE = 0.08;
export const CURRENCY = 'usd';
export const DELIVERY_FEE = 4.99;
export const ESTIMATED_PICKUP_MINUTES = 20;
export const ESTIMATED_DELIVERY_MINUTES = 40;
