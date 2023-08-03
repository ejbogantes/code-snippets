import { withApiAuthRequired } from '@auth0/nextjs-auth0';
// import { renderToStream } from '@react-pdf/renderer';
// import MyDocument from '../../components/pdf/IQReport';

export default withApiAuthRequired(async function handler(req, res) {
  return res.status(404).json({ message: 'Not supported' });
  /* if (req.method === 'GET') {
    // get params
    const client = req.query.client.toString();

    // stream the pdf
    const value = await renderToStream(MyDocument({ client }));

    // file headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `filename=test.pdf`);
    // res.setHeader('Content-Disposition', `attachment; filename=test.pdf`);
    res.status(200);
    res.send(value);

    return;
  }

  return res.status(404).json({ message: 'Not supported' }); */
});
