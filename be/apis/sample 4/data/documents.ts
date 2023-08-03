// required helpers
import Api from '../../helpers/Axios';

// api configuration
const ApiConfig = {
  baseUrl: '',
  headers: {
    'Content-Type': 'application/json',
    'Accept-Encoding': 'application/json',
    'X-Api-Key': ''
  }
};

// document default export
const SoomDataApiDocuments = {
  // // lists all profiles
  // list: async () => {
  //   const DataApi = Api(ApiConfig);
  //   const res = await DataApi.get('listProfiles');
  //   return res;
  // },

  // Add new document
  list: async () => {
    const DataApi = Api(ApiConfig);
    const res = await DataApi.post('upload_update');
    return res;
  }
};

// export Profiles
export default SoomDataApiDocuments;
