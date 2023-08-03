import axios from 'axios';

const defaultHeaders = { 'Content-Type': 'application/json', 'Accept-Language': 'en' };

// documents
export const requestAutocomplete = async (params: object, headers: object = {}, signal?: AbortSignal) => {
  try {
    const response = await axios.request({
      method: 'get',
      url: '/api/documents/autocomplete',
      headers: { ...defaultHeaders, ...headers },
      params,
      signal
    });

    return response.data;
  } catch (e) {
    //   console.error(e);
    return [];
  }
};

export const requestSearch = async (params: object, headers: object = {}) => {
  try {
    const response = await axios.request({
      method: 'get',
      url: '/api/documents/search',
      headers: { ...defaultHeaders, ...headers },
      params
    });

    if (response.data) {
      return response.data.documents || [];
    }

    return [];
  } catch (e) {
    //   console.error(e);
    return [];
  }
};

export const requestDocumentDetail = async (params: object, headers: object = {}) => {
  try {
    const response = await axios.request({
      method: 'get',
      url: '/api/documents/detail',
      headers: { ...defaultHeaders, ...headers },
      params
    });

    if (response.data) {
      return response.data || null;
    }

    return null;
  } catch (e) {
    //   console.error(e);
    return null;
  }
};

// notifications
export const requestPrintedVersion = async (data: object, headers: object = {}) => {
  try {
    const response = await axios.request({
      method: 'post',
      url: '/api/notifications/requestPrintedVersion',
      headers: { ...defaultHeaders, ...headers },
      data
    });

    return response.data;
  } catch (e) {
    //   console.error(e);
    return null;
  }
};

// authentication
export const requestPassword = async (data: object, headers: object = {}) => {
  try {
    const response = await axios.request({
      method: 'post',
      url: '/api/authentication',
      headers: { ...defaultHeaders, ...headers },
      data
    });

    return response.data && response.data.valid;
  } catch (e) {
    //   console.error(e);
    return false;
  }
};

// subscriptions
export const requestSubscription = async (data: object, headers: object = {}) => {
  try {
    const response = await axios.request({
      method: 'post',
      url: '/api/documents/subscription',
      headers: { ...defaultHeaders, ...headers },
      data
    });

    return response.data;
  } catch (e) {
    //   console.error(e);
    return null;
  }
};

export const requestUnsubscribe = async (data: object, headers: object = {}) => {
  try {
    const response = await axios.request({
      method: 'post',
      url: '/api/documents/unsubscribe',
      headers: { ...defaultHeaders, ...headers },
      data
    });

    return response.data;
  } catch (e) {
    //   console.error(e);
    return null;
  }
};
