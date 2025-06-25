import React, { useState } from 'react';
import { Modal, Button, TextInput, Loader, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import axios from 'axios';
import { error } from 'console';
import REACT_APP_BACKEND_URL from '../APIBase';

interface SectionCopyProps {
  isOpen: boolean;
  onClose: () => void;
  sectionToCopy: string | null;  // Section to copy
  onCopySuccess?: (newSectionId: string) => void;  // Callback after successful copy
}

export default function SectionCopyModule({ isOpen, onClose, sectionToCopy, onCopySuccess }: SectionCopyProps) {
  const [loading, setLoading] = useState(false);
  const form = useForm({
    initialValues: {
      newSectionId: '',
    },
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // State for error message

  // Function to handle copy action
  const handleCopy = async () => {
    const { newSectionId } = form.values;

    console.log("New scenerio: ", newSectionId);
    console.log("Scenerio to copy: ", sectionToCopy);
    setErrorMessage(null); // Reset error message

    if (!newSectionId) {
      console.log('New scenerio name is required');
      return;
    }

    if (!sectionToCopy) {
      console.log('Old scenerio name is required');
      return;
    }

    try {
      const response = await fetch(`${REACT_APP_BACKEND_URL}/copySection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          oldSectionId: sectionToCopy,
          newSectionId: newSectionId,
        })
      });

      if (response.ok) {
        console.log(`Scenerio ${sectionToCopy} copied to ${newSectionId} successfully.`);
        onClose();
      } else {
        const errorData = await response.json();
        console.log(`Error: ${errorData.message}`);
        setErrorMessage('An error occurred. Make sure session name is unique.');
      }
    } catch (error) {
      console.log(`Error: ${error}`);
    }
  };

  return (
    <Modal opened={isOpen} onClose={onClose} title="Copy Scenerio" centered>
      <form onSubmit={form.onSubmit(handleCopy)}>
        <TextInput
          label="New scenerio name"
          placeholder="Enter scenerio name"
          {...form.getInputProps('newSectionId')}
        />

{errorMessage && <Text color="red" mt="md">{errorMessage}</Text>} {/* Display error message */}



        {loading ? <Loader size="sm" mt="md" /> : (
          <Button fullWidth mt="md" type="submit" disabled={!form.values.newSectionId.trim()}>
            Copy Section
          </Button>
        )}
      </form>
    </Modal>
  );
}
