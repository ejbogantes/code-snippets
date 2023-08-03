import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  heading: {
    fontWeight: 700,
    fontSize: 22
  },
  subheading: {
    fontWeight: 700,
    fontSize: 18
  },
  subheading1: {
    fontWeight: 700,
    fontSize: 14
  },
  subheadingCentered: {
    fontWeight: 700,
    fontSize: 18,
    textAlign: 'center'
  },
  contentItem: {
    fontSize: 12,
    paddingTop: 5,
    paddingBottom: 5
  },
  body1: {
    fontSize: 12
  },
  page: {
    backgroundColor: '#E4E4E4'
  },
  cover: {
    margin: 25,
    padding: 15,
    textAlign: 'center'
  },
  section: {
    margin: 25,
    padding: 15
  },
  tableOfContents: {
    marginTop: 30,
    fontSize: 12
  },
  textBox: {
    paddingTop: 5,
    paddingBottom: 5
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row'
  },
  tableCol: {
    width: '50%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0
  },
  tableCell: {
    padding: 5,
    fontSize: 12
  }
});

// Create Document Component
const MyDocument = ({ client }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.cover}>
        <Text style={styles.heading}>IQ Report - {client} eIFU</Text>
      </View>
    </Page>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.subheadingCentered}>Table of contents</Text>
        <View style={styles.tableOfContents}>
          <ul>
            <li>
              <Text style={styles.contentItem}>
                1. Scope
                ......................................................................................................................................
                2
              </Text>
            </li>
            <li>
              <Text style={styles.contentItem}>
                2. Purpose
                ...................................................................................................................................
                2
              </Text>
            </li>
            <li>
              <Text style={styles.contentItem}>
                3. Abbreviations, Acronyms and Definitions
                ................................................................................ 2
              </Text>
            </li>
            <li>
              <Text style={styles.contentItem}>
                4. System Description ................................................................................ 2
              </Text>
            </li>
            <li>
              <Text style={styles.contentItem}>
                5. Installation Test Protocol
                ................................................................................ 2
              </Text>
            </li>
            <li>
              <Text style={styles.contentItem}>
                6. Installation Test Conclusion
                ................................................................................ 2
              </Text>
            </li>
            <li>
              <Text style={styles.contentItem}>
                7. Document History ................................................................................ 2
              </Text>
            </li>
            <li>
              <Text style={styles.contentItem}>
                8. Approvals ................................................................................ 2
              </Text>
            </li>
          </ul>
        </View>
      </View>
    </Page>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <View style={styles.textBox}>
          <Text style={styles.subheading1}>1. Scope</Text>
          <Text style={styles.contentItem}>
            The scope of this document is to record the tools and applications needed to configure the Soom eIFU
            application for {client}.
          </Text>
        </View>
        <View style={styles.textBox}>
          <Text style={styles.subheading1}>2. Purpose</Text>
          <Text style={styles.contentItem}>
            The purpose of this document is to provide guidance on all key setup and installation of the Soom eIFU
            application for {client}.
          </Text>
        </View>
        <View style={styles.textBox}>
          <Text style={styles.subheading1}>3. Abbreviations, Acronyms and Definitions</Text>
          <Text style={styles.contentItem}>
            The following abbreviations, acronyms, or terms are used in this document.
          </Text>
        </View>
      </View>
      <View style={{ paddingLeft: 40, paddingRight: 40, fontSize: 12 }}>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <View style={{ ...styles.tableCol, width: '30%' }}>
              <Text style={{ ...styles.tableCell, fontWeight: 'bold' }}>Term</Text>
            </View>
            <View style={{ ...styles.tableCol, width: '70%' }}>
              <Text style={{ ...styles.tableCell, fontWeight: 'bold' }}>Definition</Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={{ ...styles.tableCol, width: '30%' }}>
              <Text style={styles.tableCell}>Soom eIFU Application</Text>
            </View>
            <View style={{ ...styles.tableCol, width: '70%' }}>
              <Text style={styles.tableCell}>
                Electronic instructions for use. The medical device product’s instructions for how to properly use the
                product in an electronic format.
              </Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={{ ...styles.tableCol, width: '30%' }}>
              <Text style={styles.tableCell}>Soom eIFU Dashboard</Text>
            </View>
            <View style={{ ...styles.tableCol, width: '70%' }}>
              <Text style={styles.tableCell}>
                The back-end where authorized users login to control the documents. It is hosted off of a soom.com URL
              </Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={{ ...styles.tableCol, width: '30%' }}>
              <Text style={styles.tableCell}>Customer (public) facing eIFU website</Text>
            </View>
            <View style={{ ...styles.tableCol, width: '70%' }}>
              <Text style={styles.tableCell}>
                The front-end website where clinicians and patients search for the eIFU. It is hosted off of a URL
                similar to the manufacturer’s company website.
              </Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={{ ...styles.tableCol, width: '30%' }}>
              <Text style={styles.tableCell}>Soom eIFU System</Text>
            </View>
            <View style={{ ...styles.tableCol, width: '70%' }}>
              <Text style={styles.tableCell}>
                Soom’s eIFU workflow utilizes proprietary knowledge graph technology for medical device manufacturers,
                which includes the Soom eIFU Dashboard and a Customer (public) facing eIFU website.
              </Text>
            </View>
          </View>
          <View style={styles.tableRow}>
            <View style={{ ...styles.tableCol, width: '30%' }}>
              <Text style={styles.tableCell}>Authorized User</Text>
            </View>
            <View style={{ ...styles.tableCol, width: '70%' }}>
              <Text style={styles.tableCell}>
                A person with credentials (email/password) to login to the system with an assigned role (content
                manager/admin/publisher).
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Page>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <View style={styles.textBox}>
          <Text style={styles.subheading1}>4. System Description</Text>
        </View>
        <View style={{ ...styles.textBox, marginLeft: 15, marginTop: 5 }}>
          <Text style={styles.subheading1}>4.1 System Components</Text>
        </View>
        <View style={{ paddingLeft: 40, paddingRight: 40, paddingTop: 15, fontSize: 12 }}>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <View style={{ ...styles.tableCol, width: '30%' }}>
                <Text style={{ ...styles.tableCell, fontWeight: 'bold' }}>Component</Text>
              </View>
              <View style={{ ...styles.tableCol, width: '70%' }}>
                <Text style={{ ...styles.tableCell, fontWeight: 'bold' }}>Description</Text>
              </View>
            </View>
            <View style={styles.tableRow}>
              <View style={{ ...styles.tableCol, width: '30%' }}>
                <Text style={styles.tableCell}>Soom platform client</Text>
              </View>
              <View style={{ ...styles.tableCol, width: '70%' }}>
                <Text style={styles.tableCell}>Authentication and authorization infrastructure</Text>
              </View>
            </View>
            <View style={styles.tableRow}>
              <View style={{ ...styles.tableCol, width: '30%' }}>
                <Text style={styles.tableCell}>eIFU website</Text>
              </View>
              <View style={{ ...styles.tableCol, width: '70%' }}>
                <Text style={styles.tableCell}>
                  Controls the visual display and interface of the customer (public) facing eIFU website
                </Text>
              </View>
            </View>
            <View style={styles.tableRow}>
              <View style={{ ...styles.tableCol, width: '30%' }}>
                <Text style={styles.tableCell}>eIFU workflow</Text>
              </View>
              <View style={{ ...styles.tableCol, width: '70%' }}>
                <Text style={styles.tableCell}>
                  Controls the approval process and rules associated with authorized user permissions and required
                  metadata fields for the Soom eIFU dashboard.
                </Text>
              </View>
            </View>
            <View style={styles.tableRow}>
              <View style={{ ...styles.tableCol, width: '30%' }}>
                <Text style={styles.tableCell}>eIFU analytics</Text>
              </View>
              <View style={{ ...styles.tableCol, width: '70%' }}>
                <Text style={styles.tableCell}>
                  Controls the interface and data available in the “Analytics” tab of the Soom eIFU dashboard.
                </Text>
              </View>
            </View>
            <View style={styles.tableRow}>
              <View style={{ ...styles.tableCol, width: '30%' }}>
                <Text style={styles.tableCell}>Soom Knowledge graph</Text>
              </View>
              <View style={{ ...styles.tableCol, width: '70%' }}>
                <Text style={styles.tableCell}>Proprietary code written by full-time Soom software engineers.</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{ ...styles.textBox, marginLeft: 15, marginTop: 10 }}>
          <Text style={styles.subheading1}>4.2 System Applications and Tools</Text>
        </View>
        <View style={{ paddingLeft: 40, paddingRight: 40, paddingTop: 15, fontSize: 12 }}>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <View style={{ ...styles.tableCol, width: '30%' }}>
                <Text style={{ ...styles.tableCell, fontWeight: 'bold' }}>Application</Text>
              </View>
              <View style={{ ...styles.tableCol, width: '70%' }}>
                <Text style={{ ...styles.tableCell, fontWeight: 'bold' }}>Description</Text>
              </View>
            </View>
            <View style={styles.tableRow}>
              <View style={{ ...styles.tableCol, width: '30%' }}>
                <Text style={styles.tableCell}>Amazon Web Services (AWS)</Text>
              </View>
              <View style={{ ...styles.tableCol, width: '70%' }}>
                <Text style={styles.tableCell}>Cloud computing services</Text>
              </View>
            </View>
            <View style={styles.tableRow}>
              <View style={{ ...styles.tableCol, width: '30%' }}>
                <Text style={styles.tableCell}>Microsoft Power BI</Text>
              </View>
              <View style={{ ...styles.tableCol, width: '70%' }}>
                <Text style={styles.tableCell}>
                  A business analytics service by Microsoft that provides interactive business intelligence
                  visualizations.
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{ ...styles.textBox, marginLeft: 15, marginTop: 10 }}>
          <Text style={styles.subheading1}>4.3 System Configuration</Text>
        </View>
        <View style={{ paddingLeft: 40, paddingRight: 40, paddingTop: 15, fontSize: 12 }}>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <View style={{ ...styles.tableCol, width: '30%' }}>
                <Text style={{ ...styles.tableCell, fontWeight: 'bold' }}>Configuration ID</Text>
              </View>
              <View style={{ ...styles.tableCol, width: '30%' }}>
                <Text style={{ ...styles.tableCell, fontWeight: 'bold' }}>Application or Tool</Text>
              </View>
              <View style={{ ...styles.tableCol, width: '40%' }}>
                <Text style={{ ...styles.tableCell, fontWeight: 'bold' }}>Configuration</Text>
              </View>
            </View>
            <View style={styles.tableRow}>
              <View style={{ ...styles.tableCol, width: '30%' }}>
                <Text style={styles.tableCell}>CS-001</Text>
              </View>
              <View style={{ ...styles.tableCol, width: '30%' }}>
                <Text style={styles.tableCell}>System</Text>
              </View>
              <View style={{ ...styles.tableCol, width: '40%' }}>
                <Text style={styles.tableCell}>Client ID</Text>
              </View>
            </View>
            <View style={styles.tableRow}>
              <View style={{ ...styles.tableCol, width: '30%' }}>
                <Text style={styles.tableCell}>CS-002</Text>
              </View>
              <View style={{ ...styles.tableCol, width: '30%' }}>
                <Text style={styles.tableCell}>System</Text>
              </View>
              <View style={{ ...styles.tableCol, width: '40%' }}>
                <Text style={styles.tableCell}>Client environment</Text>
              </View>
            </View>
            <View style={styles.tableRow}>
              <View style={{ ...styles.tableCol, width: '30%' }}>
                <Text style={styles.tableCell}>CS-003</Text>
              </View>
              <View style={{ ...styles.tableCol, width: '30%' }}>
                <Text style={styles.tableCell}>Vercel</Text>
              </View>
              <View style={{ ...styles.tableCol, width: '40%' }}>
                <Text style={styles.tableCell}>eIFU website endpoint</Text>
              </View>
            </View>
            <View style={styles.tableRow}>
              <View style={{ ...styles.tableCol, width: '30%' }}>
                <Text style={styles.tableCell}>CS-004</Text>
              </View>
              <View style={{ ...styles.tableCol, width: '30%' }}>
                <Text style={styles.tableCell}>Vercel</Text>
              </View>
              <View style={{ ...styles.tableCol, width: '40%' }}>
                <Text style={styles.tableCell}>eIFU dashboard endpoint</Text>
              </View>
            </View>
            <View style={styles.tableRow}>
              <View style={{ ...styles.tableCol, width: '30%' }}>
                <Text style={styles.tableCell}>CS-005</Text>
              </View>
              <View style={{ ...styles.tableCol, width: '30%' }}>
                <Text style={styles.tableCell}>Auth0</Text>
              </View>
              <View style={{ ...styles.tableCol, width: '40%' }}>
                <Text style={styles.tableCell}>User authentication</Text>
              </View>
            </View>
            <View style={styles.tableRow}>
              <View style={{ ...styles.tableCol, width: '30%' }}>
                <Text style={styles.tableCell}>CS-007</Text>
              </View>
              <View style={{ ...styles.tableCol, width: '30%' }}>
                <Text style={styles.tableCell}>AWS</Text>
              </View>
              <View style={{ ...styles.tableCol, width: '40%' }}>
                <Text style={styles.tableCell}>User groups</Text>
              </View>
            </View>
            <View style={styles.tableRow}>
              <View style={{ ...styles.tableCol, width: '30%' }}>
                <Text style={styles.tableCell}>CS-008</Text>
              </View>
              <View style={{ ...styles.tableCol, width: '30%' }}>
                <Text style={styles.tableCell}>AWS</Text>
              </View>
              <View style={{ ...styles.tableCol, width: '40%' }}>
                <Text style={styles.tableCell}>Management API</Text>
              </View>
            </View>
            <View style={styles.tableRow}>
              <View style={{ ...styles.tableCol, width: '30%' }}>
                <Text style={styles.tableCell}>CS-010</Text>
              </View>
              <View style={{ ...styles.tableCol, width: '30%' }}>
                <Text style={styles.tableCell}>Neo4J Aura</Text>
              </View>
              <View style={{ ...styles.tableCol, width: '40%' }}>
                <Text style={styles.tableCell}>Soom Knowledge graph</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </Page>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text>Installation Test Protocol</Text>
      </View>
    </Page>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text>Installation Test Conclusion</Text>
      </View>
    </Page>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text>Document History</Text>
      </View>
    </Page>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text>Approvals</Text>
      </View>
    </Page>
  </Document>
);

export default MyDocument;
