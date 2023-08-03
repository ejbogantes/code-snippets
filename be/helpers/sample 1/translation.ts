import { get as _get } from 'lodash';

export const getPageTranslation = async (page = 'index', locale = 'en') => {
  const data: object = await new Promise((resolve) => {
    import(`../locale/${locale}/pages/${page}.json`)
      .then((obj) => {
        resolve(obj.default);
      })
      .catch((error) => {
        console.error(error);
        resolve({});
      });
  });

  const common: object = await new Promise((resolve) => {
    import(`../locale/${locale}/common.json`)
      .then((obj) => {
        resolve(obj.default);
      })
      .catch((error) => {
        console.error(error);
        resolve({});
      });
  });

  return { page, locale, data: { ...data, common } };
};

export class Translation {
  translation = {};

  constructor(data: object) {
    if (data) {
      this.translation = data;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get(pathValue: string, defaultValue: any) {
    return _get(this.translation, pathValue, defaultValue);
  }
}
