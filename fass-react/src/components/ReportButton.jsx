import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import ReportModal from './ReportModal';
 
const ReportButton = () => {
  const [showModal, setShowModal] = useState(false);
 
  return (
    <>
      <Button onClick={() => setShowModal(true)}>
        Generate Report
      </Button>
      <ReportModal
        show={showModal}
        handleClose={() => setShowModal(false)}
      />
    </>
  );
};
 
export default ReportButton;
 