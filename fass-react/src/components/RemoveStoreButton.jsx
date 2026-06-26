import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import RemoveStoreModal from './RemoveStoreModal';
import RemoveMultipleStoreModal from "./RemoveMultipleStoreModal";
import InfoTooltip from './InfoTooltip';

const RemoveStoreButton = ({ onConfirm }) => {
    const [showModal, setShowModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const handleClose = () => setShowModal(false);
    const handleConfirmClose = () => setShowConfirmModal(false);

    const handleClick = () => {
        // Try to remove highlighted stores directly
        const handled = window.handleRemoveStores?.();
        if (!handled) {
            // No highlighted stores, show modal for manual selection
            setShowModal(true);
        } else {
            // Highlighted stores exist, show mini confirmation modal
            setShowConfirmModal(true);
        }
    };

    const handleConfirm = () => {
        window.handleRemoveStores?.(true); 
        if (onConfirm) {
          onConfirm(true);
        }
        setShowConfirmModal(false);
    };

    const handleCancel = () => {
        if (onConfirm) {
          onConfirm(false);
        }
        setShowConfirmModal(false);
    };

    return (
        <>
            <InfoTooltip text="Remove a store: select one or more stores on the map, then click here to remove them.">
                <Button variant="primary" onClick={handleClick}>
                    Remove Store
                </Button>
            </InfoTooltip>

            {/* Modal for "no stores selected" */}
            <RemoveStoreModal show={showModal} handleClose={handleClose} />

            {/* Mini confirmation modal for multiple highlighted stores */}
            <RemoveMultipleStoreModal show={showConfirmModal} onConfirm={handleConfirm} onCancel={handleCancel}/>
        </>
    );
};

export default RemoveStoreButton;