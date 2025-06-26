// RenameConfirmationModal.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Modal, Button, Title, Group, Text, TextInput } from '@mantine/core';
import { Section } from '../pages/landingPage';

// Define the props expected by this modal component
interface RenameConfirmationModalProps {
    open: boolean; // Controls whether the modal is shown
    onClose: () => void;      // Callback to close the modal
    sectionId: string;  // ID of the section currently selected for renaming
    onRenameSuccess: (newSectionId: string) => void;  // Callback when renaming is successful
    sections: Section[]; // All existing sections
}

// RenameConfirmationModal is a reusable modal that lets users rename an existing section
export default function RenameConfirmationModal({ open, onClose, sectionId, onRenameSuccess, sections }: RenameConfirmationModalProps) {
    const [newSectionId, setNewSectionId] = useState('');  // Input state for the new section name
    const [error, setError] = useState<string | null>(null);  // Error message shown below input if validation fails

    // This useEffect clears the input and error whenever the modal is closed
    useEffect(() => {
        if (!open) {
            setError(null);
            setNewSectionId('');
        }
    }, [open]);

    // This function is called when the user clicks "Rename"
    const handleRename = async () => {

        // Check if the new section ID contains any characters outside the allowed set
        const hasInvalidChars = /[^a-zA-Z0-9 _-]/.test(newSectionId);
        if (hasInvalidChars) {
            setError('Section ID can only contain letters, numbers, spaces, hyphens, and underscores.');
            return;
        }

        // Check if a section with the same name already exists
        const sectionExists = sections.some(section => section.sectionid === newSectionId);
        if (sectionExists) {
            setError('sectionId already exists. Please try a different name');
            return;
        }
        try {
            // Send PUT request to the backend to update the section ID
            console.log("Attempting to rename section");
            await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/sections`, {
                sectionIdToBeRenamed: sectionId,
                newSectionId: newSectionId // pass new name in body
            });
            onRenameSuccess(newSectionId); // Notify the admin page of the change
            onClose();  // Close the modal
        } catch (err) {
            //TODO: shows a pop up menu for failing to rename the section
            console.error('Error renaming section:', err);
            setError("Error renaming section. Please try again");
        }

    }

    return (
        <Modal opened={open} onClose={onClose} title="Rename Scenario" centered>


            <TextInput
                label="New SectionId "
                placeholder="Enter New sectionId"
                value={newSectionId}
                onChange={(e) => {
                    setNewSectionId(e.currentTarget.value);  // Update the input state as the user types
                    setError(null);    // Clear any previous error message while typing
                }}

            />

            {/* Show error message if validation or request failed */}
            {error && (
                <Text color="red" mt='sm'>
                    {error}
                </Text>
            )
            }

            {/* Footer buttons: Cancel and Rename */}
            <Group mt="md">
                <Button variant='default' onClick={onClose}>Cancel</Button>
                <Button color="blue" onClick={handleRename}>Rename</Button>

            </Group>
        </Modal>
    );
}