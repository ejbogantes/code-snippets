import axios from 'axios';

const defaultHeaders = { 'Content-Type': 'application/json' };

// profile
export const requestGetProfileByEmailOrg = async (app, org) => {
  try {
    const response = await axios.request({
      method: 'get',
      url: `/api/profiles/me`,
      headers: defaultHeaders,
      params: { app, org }
    });

    return response.data;
  } catch (e) {
    // console.error(e);
    return {};
  }
};

// documents
export const requestAutocomplete = async (params) => {
  try {
    const response = await axios.request({
      method: 'get',
      url: '/api/documents/autocomplete',
      headers: defaultHeaders,
      params
    });

    return response.data;
  } catch (e) {
    // console.error(e);
    return [];
  }
};

export const requestGetDocuments = async (params) => {
  try {
    const response = await axios.request({
      method: 'get',
      url: '/api/documents/list',
      headers: defaultHeaders,
      params
    });

    return response.data;
  } catch (e) {
    // console.error(e);
    return null;
  }
};

export const requestGetDocument = async (params) => {
  try {
    const response = await axios.request({
      method: 'get',
      url: '/api/documents/get',
      headers: defaultHeaders,
      params
    });

    return response.data;
  } catch (e) {
    // console.error(e);
    return null;
  }
};

export const requestCreateDocument = async (params) => {
  try {
    const response = await axios.request({
      method: 'post',
      url: '/api/documents/new',
      headers: defaultHeaders,
      data: params
    });

    return response.data;
  } catch (e) {
    // console.error(e);
    return null;
  }
};

export const requestUpdateDocument = async (params) => {
  try {
    const response = await axios.request({
      method: 'put',
      url: '/api/documents/edit',
      headers: defaultHeaders,
      data: params
    });

    return response.data;
  } catch (e) {
    // console.error(e);
    return null;
  }
};

export const requestUpdatePublishedDocument = async (params) => {
  try {
    const response = await axios.request({
      method: 'put',
      url: '/api/documents/edit-published',
      headers: defaultHeaders,
      data: params
    });

    return response.data;
  } catch (e) {
    // console.error(e);
    return null;
  }
};

export const requestUpdateDocumentStatus = async (params) => {
  try {
    const response = await axios.request({
      method: 'put',
      url: '/api/documents/editStatus',
      headers: defaultHeaders,
      data: params
    });

    return response.data;
  } catch (e) {
    // console.error(e);
    return null;
  }
};

export const requestDeleteDocument = async (params) => {
  try {
    const response = await axios.request({
      method: 'delete',
      url: '/api/documents/delete',
      headers: defaultHeaders,
      params
    });

    return { valid: true, data: response.data };
  } catch (e) {
    // console.error(e);
    if (e.response) {
      const data = e.response.data || {};
      return { valid: false, data };
    } else {
      return { valid: false };
    }
  }
};

// pin
export const requestGetSigningPin = async (params) => {
  try {
    const { signatureKey, profileId, pin } = params;

    const response = await axios.request({
      method: 'get',
      url: `/api/documents/signing-pin/${signatureKey}`,
      headers: defaultHeaders,
      params: {
        pin,
        signature_key: signatureKey,
        profile_id: profileId
      }
    });

    return response.data;
  } catch (e) {
    // console.error(e);
    return [];
  }
};

export const requestPostSigningPin = async (params) => {
  try {
    const response = await axios.request({
      method: 'post',
      url: '/api/documents/signing-pin/pin',
      headers: defaultHeaders,
      data: params
    });

    return response.data;
  } catch (e) {
    // console.error(e);
    return null;
  }
};

export const requestPutSigningPin = async (params) => {
  try {
    const { signatureKey } = params;
    const response = await axios.request({
      method: 'put',
      url: `/api/documents/signing-pin/${signatureKey}`,
      headers: defaultHeaders,
      data: {
        signature_key: signatureKey
      }
    });

    return response.data;
  } catch (e) {
    // console.error(e);
    return null;
  }
};

// settings
export const requestGetSettings = async (app, org) => {
  try {
    const response = await axios.request({
      method: 'get',
      url: `/api/configurations`,
      headers: defaultHeaders,
      params: { app, org }
    });

    return response.data;
  } catch (error) {
    // console.error(error);
    return null;
  }
};

export const requestSaveSettings = async (data) => {
  try {
    const response = await axios.request({
      method: 'post',
      url: '/api/configurations',
      headers: defaultHeaders,
      data
    });

    return response.data;
  } catch (e) {
    // console.error(e);
    let data = { error: 'There was an error processing your request!' };
    if (e.response && e.response.data) {
      data = e.response.data;
    }
    return { error: true, data };
  }
};

export const requestGetLicenseSettings = async (app, org) => {
  try {
    const response = await axios.request({
      method: 'get',
      url: `/api/license-configurations`,
      headers: defaultHeaders,
      params: { app, org }
    });

    return response.data;
  } catch (error) {
    // console.error(error);
    return null;
  }
};

export const requestSaveLicenseSettings = async (data) => {
  try {
    const response = await axios.request({
      method: 'post',
      url: '/api/license-configurations',
      headers: defaultHeaders,
      data
    });

    return response.data;
  } catch (e) {
    // console.error(e);
    let data = { error: 'There was an error processing your request!' };
    if (e.response && e.response.data) {
      data = e.response.data;
    }
    return { error: true, data };
  }
};

export const requestPublishLicenseSettings = async (app, org) => {
  try {
    const response = await axios.request({
      method: 'put',
      url: '/api/license-configurations',
      headers: defaultHeaders,
      data: { app, org }
    });

    return response.data;
  } catch (e) {
    // console.error(e);
    let data = { error: 'There was an error processing your request!' };
    if (e.response && e.response.data) {
      data = e.response.data;
    }
    return { error: true, data };
  }
};

// users
export const requestGetUsers = async (app, org) => {
  try {
    const response = await axios.request({
      method: 'get',
      url: `/api/users`,
      headers: defaultHeaders,
      params: { app, org }
    });

    return response.data;
  } catch (error) {
    // console.error(error);
    return {};
  }
};

export const requestGetUserData = async (profileId, app, org) => {
  try {
    const response = await axios.request({
      method: 'get',
      url: `/api/users/${profileId}`,
      headers: defaultHeaders,
      params: { app, org }
    });

    return response.data;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const requestGetUserDataByEmail = async (email) => {
  try {
    const response = await axios.request({
      method: 'get',
      url: `/api/users/search`,
      headers: defaultHeaders,
      params: { email }
    });

    return response.data;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const requestCreateUser = async (data) => {
  try {
    const response = await axios.request({
      method: 'post',
      url: `/api/users`,
      headers: defaultHeaders,
      data
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

export const requestUpdateUserData = async (profileId, data) => {
  try {
    const response = await axios.request({
      method: data.new ? 'post' : 'put',
      url: `/api/users/${profileId}`,
      headers: defaultHeaders,
      data
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

// roles
export const requestGetRolesByApp = async (appName) => {
  try {
    const response = await axios.request({
      method: 'get',
      url: `/api/roles/${appName}`,
      headers: defaultHeaders
    });

    return response.data;
  } catch (error) {
    // console.error(error);
    return {};
  }
};

export const requestDeleteUser = async (userId, app, org) => {
  try {
    const response = await axios.request({
      method: 'delete',
      url: `/api/users/${userId}`,
      headers: defaultHeaders,
      params: { app, org }
    });

    return response.data;
  } catch (error) {
    // console.error(error);
    return {};
  }
};

//  products
export const requestListProducts = async (params) => {
  try {
    const response = await axios.request({
      method: 'get',
      url: '/api/products',
      headers: defaultHeaders,
      params
    });

    return response.data || null;
  } catch (e) {
    // console.error(e);
    return null;
  }
};

// reports
export const requestGetReport = async (type) => {
  try {
    const response = await axios.request({
      method: 'get',
      url: `/api/reports/${type}`,
      headers: defaultHeaders
    });

    return response.data;
  } catch (error) {
    // console.error(error);
    return {};
  }
};

// profile
export const requestVerifyCustomDomain = async (domain) => {
  try {
    const response = await axios.request({
      method: 'post',
      url: `/api/license-configurations/verify-domain`,
      headers: defaultHeaders,
      data: { domain }
    });

    return response.data;
  } catch (e) {
    // console.error(e);
    return {};
  }
};

// api keys
export const requestGetApiKeys = async (app, org) => {
  try {
    const response = await axios.request({
      method: 'get',
      url: `/api/api-keys`,
      headers: defaultHeaders,
      params: { app, org }
    });

    return response.data;
  } catch (error) {
    // console.error(error);
    return {};
  }
};

export const requestCreateApiKey = async (app, org) => {
  try {
    const response = await axios.request({
      method: 'post',
      url: `/api/api-keys`,
      headers: defaultHeaders,
      data: { app, org }
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

export const requestDeleteApiKey = async (app, org, key) => {
  try {
    const response = await axios.request({
      method: 'delete',
      url: `/api/api-keys`,
      headers: defaultHeaders,
      params: { app, org, key }
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

// business units
export const requestGetBusinessUnits = async (app, org) => {
  try {
    const response = await axios.request({
      method: 'get',
      url: `/api/business-units`,
      headers: defaultHeaders,
      params: { app, org }
    });

    return response.data;
  } catch (error) {
    // console.error(error);
    return {};
  }
};

export const requestCreateBusinessUnit = async (app, org, name) => {
  try {
    const response = await axios.request({
      method: 'post',
      url: `/api/business-units`,
      headers: defaultHeaders,
      data: { app, org, name }
    });

    return response.data;
  } catch (e) {
    // console.error(e);
    if (e.response && e.response.data) {
      return e.response.data;
    }
    return { valid: false, message: 'There was an error processing your request!' };
  }
};

export const requestEditBusinessUnit = async (app, org, id, name) => {
  try {
    const response = await axios.request({
      method: 'put',
      url: `/api/business-units`,
      headers: defaultHeaders,
      data: { app, org, id, name }
    });

    return response.data;
  } catch (e) {
    // console.error(e);
    if (e.response && e.response.data) {
      return e.response.data;
    }
    return { valid: false, message: 'There was an error processing your request!' };
  }
};

export const requestDeleteBusinessUnit = async (app, org, id) => {
  try {
    const response = await axios.request({
      method: 'delete',
      url: `/api/business-units`,
      headers: defaultHeaders,
      params: { app, org, id }
    });

    return response.data;
  } catch (e) {
    // console.error(e);
    if (e.response && e.response.data) {
      return e.response.data;
    }
    return { valid: false, message: 'There was an error processing your request!' };
  }
};

// external sites
export const requestGetExternalSites = async (app, org) => {
  try {
    const response = await axios.request({
      method: 'get',
      url: `/api/external-sites`,
      headers: defaultHeaders,
      params: { app, org }
    });

    return response.data;
  } catch (error) {
    // console.error(error);
    return {};
  }
};

export const requestCreateExternalSite = async (app, org, regions, url) => {
  try {
    const response = await axios.request({
      method: 'post',
      url: `/api/external-sites`,
      headers: defaultHeaders,
      data: { app, org, regions, url }
    });

    return response.data;
  } catch (e) {
    // console.error(e);
    if (e.response && e.response.data) {
      return e.response.data;
    }
    return { valid: false, message: 'There was an error processing your request!' };
  }
};

export const requestEditExternalSite = async (app, org, id, regions, url) => {
  try {
    const response = await axios.request({
      method: 'put',
      url: `/api/external-sites`,
      headers: defaultHeaders,
      data: { app, org, id, regions, url }
    });

    return response.data;
  } catch (e) {
    // console.error(e);
    if (e.response && e.response.data) {
      return e.response.data;
    }
    return { valid: false, message: 'There was an error processing your request!' };
  }
};

export const requestDeleteExternalSite = async (app, org, id) => {
  try {
    const response = await axios.request({
      method: 'delete',
      url: `/api/external-sites`,
      headers: defaultHeaders,
      params: { app, org, id }
    });

    return response.data;
  } catch (e) {
    // console.error(e);
    if (e.response && e.response.data) {
      return e.response.data;
    }
    return { valid: false, message: 'There was an error processing your request!' };
  }
};

// databases
export const requestGetDatabases = async (app, org) => {
  try {
    const response = await axios.request({
      method: 'get',
      url: `/api/databases`,
      headers: defaultHeaders,
      params: { app, org }
    });

    return response.data;
  } catch (error) {
    // console.error(error);
    return [];
  }
};
