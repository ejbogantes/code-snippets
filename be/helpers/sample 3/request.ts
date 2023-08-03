import axios from 'axios';

const defaultHeaders = { 'Content-Type': 'application/json' };
// profile
export const requestGetProfileByEmail = async () => {
  try {
    const response = await axios.request({
      method: 'get',
      url: `/api/profiles/me`,
      headers: defaultHeaders
    });

    return response.data;
  } catch (e) {
    //   console.error(e);
    return null;
  }
};

export const requestUpdateProfile = async (values) => {
  try {
    const response = await axios.request({
      method: 'put',
      url: `/api/profiles`,
      headers: defaultHeaders,
      data: values
    });

    return response.data;
  } catch (e) {
    //   console.error(e);
    return null;
  }
};

export const requestChangePassword = async () => {
  try {
    const response = await axios.request({
      method: 'post',
      url: `/api/profiles/change-password`,
      headers: defaultHeaders
    });

    return response.data;
  } catch (e) {
    // console.error(e);
    let data = { message: 'There was an error processing your request!' };
    if (e.response && e.response.data) {
      data = e.response.data;
    }
    return { error: true, data };
  }
};

export const requestAcceptTOS = async () => {
  try {
    const response = await axios.request({
      method: 'post',
      url: `/api/profiles/accept-tos`,
      headers: defaultHeaders
    });

    return response.data;
  } catch (e) {
    // console.error(e);
    let data = { message: 'There was an error processing your request!' };
    if (e.response && e.response.data) {
      data = e.response.data;
    }
    return { error: true, data };
  }
};

export const requestAcceptPP = async () => {
  try {
    const response = await axios.request({
      method: 'post',
      url: `/api/profiles/accept-pp`,
      headers: defaultHeaders
    });

    return response.data;
  } catch (e) {
    // console.error(e);
    let data = { message: 'There was an error processing your request!' };
    if (e.response && e.response.data) {
      data = e.response.data;
    }
    return { error: true, data };
  }
};

// apps
export const requestGetApps = async () => {
  try {
    const response = await axios.request({
      method: 'get',
      url: '/api/apps',
      headers: defaultHeaders
    });

    return response.data;
  } catch (e) {
    //   console.error(e);
    return [];
  }
};

export const requestGetApp = async (slug: string) => {
  try {
    const response = await axios.request({
      method: 'get',
      url: `/api/apps/${slug}`,
      headers: defaultHeaders
    });

    return response.data || null;
  } catch (e) {
    // console.error(e);
    return null;
  }
};

// licenses
export const requestGetLicenses = async (appId) => {
  try {
    const response = await axios.request({
      method: 'get',
      url: `/api/licenses/${appId}`,
      headers: defaultHeaders
    });

    return response.data;
  } catch (e) {
    //   console.error(e);
    return [];
  }
};

// organizations
export const requestGetOrganizationsForNewApp = async (params) => {
  try {
    const response = await axios.request({
      method: 'get',
      url: '/api/organizations/new-app',
      headers: defaultHeaders,
      params
    });

    return response.data;
  } catch (e) {
    // console.error(e);
    return [];
  }
};

export const requestPostOrganization = async (params) => {
  try {
    const response = await axios.request({
      method: 'post',
      url: '/api/organizations',
      headers: defaultHeaders,
      data: params
    });

    return response.data;
  } catch (e) {
    // console.error(e);
    let data = { message: 'There was an error processing your request!' };
    if (e.response && e.response.data) {
      data = e.response.data;
    }
    return { error: true, data };
  }
};

export const requestPostOrganizationProfile = async (params) => {
  try {
    const response = await axios.request({
      method: 'post',
      url: '/api/organizations-profiles',
      headers: defaultHeaders,
      data: params
    });

    return response.data;
  } catch (e) {
    //   console.error(e);
    return null;
  }
};

// configurations
export const requestPostConfiguration = async (params) => {
  try {
    const response = await axios.request({
      method: 'post',
      url: '/api/configurations',
      headers: defaultHeaders,
      data: params
    });

    return response.data;
  } catch (e) {
    //   console.error(e);
    return null;
  }
};

export const requestDeleteConfiguration = async (configId) => {
  try {
    const response = await axios.request({
      method: 'delete',
      url: `/api/configurations/${configId}`,
      headers: defaultHeaders
    });

    return response.data;
  } catch (e) {
    // console.error(e);
    let data = { message: 'There was an error processing your request!' };
    if (e.response && e.response.data) {
      data = e.response.data;
    }
    return { error: true, data };
  }
};

// uploads
export const requestPostCreateBucket = async (bucket) => {
  try {
    const response = await axios.request({
      method: 'post',
      url: '/api/uploads/createBucket',
      headers: defaultHeaders,
      data: { bucket }
    });

    return response.data;
  } catch (e) {
    //   console.error(e);
    return null;
  }
};

// register website
export const requestPostRegisterWebsite = async (slug: string, config: number, app: string) => {
  try {
    const response = await axios.request({
      method: 'post',
      url: `/api/sites/${slug}?config=${config}&app=${app}`,
      headers: defaultHeaders
    });

    return response.data;
  } catch (e) {
    //   console.error(e);
    return {};
  }
};
