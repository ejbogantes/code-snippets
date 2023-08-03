/* eslint-disable no-irregular-whitespace */
/* eslint-disable react/no-unescaped-entities */
import React from 'react';
import Link from 'next/link';

export function Content({ styles }) {
  return (
    <div>
      <h1>GDPR Privacy Policy</h1>
      <p>
        <b>Updated at 2023-01-03</b>
      </p>
      <hr></hr>
      <br></br>
      <p>
        At Soom, we are committed to protecting your personal data and respecting your privacy.Our policy covers this
        Electronic Instructions for Use (eIFU) website under{' '}
        <Link target="_blank" href="https://eur-lex.europa.eu/eli/reg_impl/2021/2226/oj">
          <strong>Commission Implementing Regulation (EU) 2021/2226 of 14 December 2021</strong>
        </Link>
        <p>Reference. General Data Protection Regulation (GDPR) (EU) 2016/679</p>
      </p>
      <h3>1. Who is responsible for data processing?</h3>
      <p>
        &#8195;Soom, Inc
        <br></br>&#8195;50 Milk St, 16th Floor
        <br></br>&#8195;Boston, MA 02109 USA
        <br></br>&#8195;https://www.soom.com
      </p>
      <br></br>
      <h3>2. What data do we process, and for what purposes?</h3>
      <ul>
        <li>&#8195;a. The data we receive is only processed to provide the services you request.</li>
      </ul>
      <br></br>
      <h3>3. For example:</h3>
      <ul>
        <li>
          &#8195;a. When an email address, name, mail address, and phone number are provided, that data is used to
          respond to the email and request a printed version of an Electronic Instructions for Use (eIFU).
          <br></br>
        </li>
        <li>
          <br></br>
          &#8195;b. The following information is mandatory to request an Electronic Instructions for Use (eIFU): GUDID,
          CFN, product code, product name, or brand name. This information is used to determine the appropriate
          Instructions of Use (IFU) to be provided.
        </li>
      </ul>
      <br></br>
      <h3>4. Personal data:</h3>
      <ul>
        <li>
          &#8195;a. We collect general personal data like name, last name, email address, and mailing address to provide
          the printed version of the Electronic Instructions for Use to the user's mail address.
        </li>
      </ul>
      <br></br>
      <h3>5. Credentials:</h3>
      <ul>
        <li>&#8195;a. Login or user identification accounts are not used.</li>
      </ul>
      <br></br>
      <h3>6. Cookies used on our website:</h3>
      <ul>
        <li>
          &#8195;a. When entering our website, a prompt will appear and ask for your consent to process data through
          cookies. The consent refers to listed cookies and represents consent according to Art. 6 (1) lit. a GDPR.
        </li>
        <li>
          <br></br>
          &#8195;b. If consent is given, cookies are stored for 28 days. After 28 days have expired, our website will
          request consent to process cookies again.
        </li>
      </ul>
      <br></br>
      <h3>7. Your rights as “data subject”:</h3>
      <ul>
        <li>
          &#8195;a. You have the right to obtain information on the personal data processed, per Art. 15 GDPR. If a
          request for information needs to be submitted in writing, please understand that documentation may be
          requested to prove your identity.
        </li>
        <li>
          <br></br>
          &#8195;b. Furthermore, you have the right of rectification, erasure (the right to be forgotten), or
          restriction of processing whenever legally permitted, according to Art. 16, 17, and 18 of the GDPR.
        </li>
      </ul>
      <br></br>
      <h3>8. Automated individual decision-making, including profiling:</h3>
      <ul>
        <li>&#8195;a. As per Art. 22 of the GDPR, automated individual decision-making does not apply.</li>
        <li>
          <br></br>
          &#8195;b. Furthermore, you have the right of objection to processing within the scope of the legal provisions.
          The same applies to the right of data portability.
        </li>
      </ul>
      <br></br>
      <br></br>
      <hr></hr>
      <p>© Soom, Inc. All rights reserved. Last updated. 03 Jan 2023</p>
    </div>
  );
}

export default Content;
