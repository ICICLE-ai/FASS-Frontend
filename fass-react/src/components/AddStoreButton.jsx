import React, { useState } from 'react';
import { Button, Toast, ToastContainer } from 'react-bootstrap';

const AddStoreButton = () => {
    const [showToast, setShowToast] = useState(false);
    
    const handleClick = () => {
        setShowToast(true);
        
        const mapEl = map.getContainer?.() || document.querySelector('.leaflet-container');

        // set custom cursor on the actual map element
        mapEl?.style.setProperty(
            'cursor',
            'url("http://wiki-devel.sugarlabs.org/images/e/e2/Arrow.cur") 0 0, crosshair',
            'important'
        );

    };

    return (
        <>
            <Button variant="primary" onClick={handleClick}>
                Add Store
            </Button>
            
            <ToastContainer position="top-center" className="p-3">
                <Toast 
                    show={showToast} 
                    onClose={() => setShowToast(false)} 
                    delay={4000} 
                    autohide
                >
                    <Toast.Header>
                        <strong className="me-auto">Add Store Mode</strong>
                    </Toast.Header>
                    <Toast.Body>
                        Click on the map to add a store at that location!
                    </Toast.Body>
                </Toast>
            </ToastContainer>
        </>
    );
  };
  
  export default AddStoreButton;