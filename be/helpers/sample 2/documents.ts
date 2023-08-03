import { find as _find } from 'lodash';

import { documentTypes } from '@soom-universe/soom-utils/constants';

export const getDocumentTypeLabel = (docType) => {
  const label = _find(documentTypes, (type) => {
    return docType === type.value;
  });

  return label ? label.label : docType;
};
