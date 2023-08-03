import { prismaWrite } from '../db';

export const updatePublishedDocument = async (configId: number, docId: string, action: string = 'save' || 'delete') => {
  try {
    if (action === 'save') {
      await prismaWrite.publishedDocument.create({
        data: { document_id: docId, configuration_id: configId }
      });
    } else if (action === 'delete') {
      await prismaWrite.publishedDocument.delete({
        where: { document_id: docId }
      });
    }

    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};
