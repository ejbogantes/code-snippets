/* eslint-disable @typescript-eslint/no-empty-function */
import axios from 'axios';

// initializing axios
const api = axios.create({
  baseURL: process.env.VERCEL_API_URL,
  headers: { Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}` }
});

// const defaultHeaders = { 'Content-Type': 'application/json' };

export const getCustomDomainSettings = (customDomain) => {
  const res = {
    showDomainInstructions: false,
    showSubDomainInstructions: false,
    subdomain: ''
  };
  if (!['', undefined].includes(customDomain)) {
    const splittedCustom = customDomain.split('.');

    if (splittedCustom.length === 2) {
      res.showDomainInstructions = true;
      res.showSubDomainInstructions = true;
      res.subdomain = 'www';
    } else if (splittedCustom.length === 3 && splittedCustom[0] === 'www') {
      res.showSubDomainInstructions = true;
      res.subdomain = 'www';
    } else if (splittedCustom.length === 3 && splittedCustom[0] !== 'www') {
      res.showSubDomainInstructions = true;
      res.subdomain = splittedCustom[0];
    }
  }

  return res;
};

export const addDomainToProject = async (params) => {
  try {
    const result = await api.request({
      url: `/v10/projects/${process.env.VERCEL_PROJECT_ID}/domains?teamId=${process.env.VERCEL_TEAM_ID}`,
      method: 'POST',
      data: {
        name: params.domain
      }
    });
    return result;
  } catch (error) {
    // console.error(error);
    return {};
  }
};

export const deleteDomainFromProject = async (params) => {
  try {
    const result = await api.request({
      url: `/v9/projects/${process.env.VERCEL_PROJECT_ID}/domains/${params.domain}?teamId=${process.env.VERCEL_TEAM_ID}`,
      method: 'DELETE'
    });
    return result;
  } catch (error) {
    // console.error(error);
    return {};
  }
};

export const verifyDomainFromProject = async (params) => {
  try {
    const result = await api.request({
      url: `/v9/projects/${process.env.VERCEL_PROJECT_ID}/domains/${params.domain}/verify?teamId=${process.env.VERCEL_TEAM_ID}`,
      method: 'post'
    });
    return result;
  } catch (error) {
    console.error(error);
    return {};
  }
};
