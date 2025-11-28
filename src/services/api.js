const API_BASE_URL = 'http://localhost:8080/api';

export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('File upload failed');
  }

  return response.text();
};

export const fetchTransactions = async () => {
  const response = await fetch(`${API_BASE_URL}/transactions`);
  if (!response.ok) {
    throw new Error('Failed to fetch transactions');
  }
  return response.json();
};

export const fetchBudgets = async () => {
  const response = await fetch(`${API_BASE_URL}/budgets`);
  if (!response.ok) {
    throw new Error('Failed to fetch budgets');
  }
  return response.json();
};

export const fetchAnalytics = async () => {
  const response = await fetch(`${API_BASE_URL}/analytics`);
  if (!response.ok) {
    throw new Error('Failed to fetch analytics');
  }
  return response.json();
};
