// pages/adminPage.js
import { useState, useEffect, useRef } from 'react';
import {
  AppShell,
  Group,
  Image,
  Box,
  Table,
  Button,
  // Switch,
  // Modal,
  // TextInput,
  useMantineTheme,
  MantineProvider,
  // FocusTrap,
  // Center,
  // Space,
  Menu,
  ActionIcon,
  rem
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useNavigate } from 'react-router-dom';
// import { sections as initialSections } from '../data/sections';
import { useUserRole } from '../context/UserContext';
import { FaArrowAltCircleLeft } from "react-icons/fa";
import axios from 'axios';
import { Section } from './landingPage';
import {
  // IconCopy, IconCubeOff, IconCubePlus, 
  IconDots,
  // IconMessages, IconNote, IconPencil, IconReportAnalytics, 
  IconTrash
} from '@tabler/icons-react';
// import UnitCreationModule from '../components/UnitCreationModule';
// import UnitDeleteModule from '../components/UnitDeleteModule';
// import SectionCopyModule from '../components/sectionCopyModule';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';
import RenameConfirmationModal from '../components/RenameConfirmationModal';
// import { IconCheck, IconX } from '@tabler/icons-react';
import REACT_APP_BACKEND_URL from '../APIBase';
const logo = '/images/symbols/Tr_FullColor_NoSlogan.png'



function AdminPage() {
  const [mobileOpened] = useDisclosure(false);
  const [desktopOpened] = useDisclosure(false);
  const navigate = useNavigate();
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const theme = useMantineTheme();
  // const [newSectionName, setNewSectionName] = useState('');
  // const [modalOpened, setModalOpened] = useState(false);
  const { userRole } = useUserRole();
  // const [unitModalOpened, setUnitModalOpened] = useState(false);
  // const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  // const [copyModalOpened, setCopyModalOpened] = useState(false);
  // const [sectionToCopy, setSectionToCopy] = useState<string | null>(null);
  // const [sectionDeleteOpen, setSectionDeleteOpen] = useState(false);
  const [opened, { open, close }] = useDisclosure(false);  // Controls delete modal visibility
  const [renameModalOpened, { open: openRenameModal, close: closeRenameModal }] = useDisclosure(false); //Controls Rename Modal Visibility

  const [sections, setSections] = useState<Section[]>([]); // Stores all section records




  useEffect(() => {
    if (userRole !== 'Administrator') {
      console.trace('redirect to landing page')
      navigate('/');
    }
  }, [navigate, userRole]);


  // Function to open copy modal
  // const openCopyModal = (sectionid: string) => {
  //   setSectionToCopy(sectionid);
  //   setCopyModalOpened(true);
  // };

  // Function to close copy modal
  // const closeCopyModal = () => {
  //   setCopyModalOpened(false);
  //   setSectionToCopy(null);
  //   fetchData();
  // };

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleArrowClick = () => {
    navigate('/');
  };


  // Fetch all sections from the backend
  const fetchData = async () => {
    try {
      const response = await axios.get<Section[]>(`${REACT_APP_BACKEND_URL}/sections`);
      setSections(response.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };
  // Load section data on component mount
  useEffect(() => {
    fetchData();

    const eventSource = new EventSource(`${REACT_APP_BACKEND_URL}/sectionevents`);

    eventSource.onopen = () => {
      console.log('Connected to /sectionevents');
    };

    eventSource.onerror = (err) => {
      console.error('SSE error:', err);
    };

    eventSource.onmessage = async (event) => {
      console.log('frontend has recieved the section');
      try {
        const newSection = JSON.parse(event.data); // { sectionid: "..." }
        console.log(newSection);

        setSections(prev => {
          if (prev.some(s => s.sectionid === newSection)) return prev;
          return [...prev, newSection];
        });
      } catch (err) {
        console.error('Error handling section event', err);
      }
    };

    return () => {
      eventSource.close();
    };
  }, []);


  const trapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (trapRef.current) {
      trapRef.current.focus();
    }
  }, []);


  // const handleCreateNewSection = async () => {
  //   if (newSectionName.trim()) {
  //     try {
  //       // Make POST request to backend
  //       const response = await axios.post(`${REACT_APP_BACKEND_URL}/sections`, {
  //         sectionid: newSectionName.trim(),
  //         isonline: false, // Default to offline
  //       });

  //       // Assuming successful creation, update frontend state
  //       setSections((prevSections) => [
  //         ...prevSections,
  //         { sectionid: newSectionName.trim(), isonline: false },
  //       ]);
  //       setNewSectionName('');
  //       closeModal();
  //     } catch (error) {
  //       console.error('Error creating new section:', error);
  //       // Add any error handling for the frontend here
  //     }
  //   }
  // };

  // This function updates the "isonline" status of a section when the toggle is clicked
  const toggleSectionOnline = async (sectionID: string, isOnline: boolean): Promise<void> => {
    try {
      // Send a PUT request to the backend to update the section's online status
      const response = await fetch(`${REACT_APP_BACKEND_URL}/sections/${sectionID}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isonline: !isOnline }), // Flip the current online status
      });

      if (!response.ok) {
        throw new Error('Failed to update section status');
      }

      // Update the local sections state in the frontend
      setSections(
        (prevSections) => prevSections.map((section) =>
          // If the section matches the updated one, return a new object with updated status
          section.sectionid === sectionID
            ? { ...section, isonline: !isOnline }
            : section // Otherwise, return the section unchanged
        )
      );
    } catch (error) {
      console.error('Error toggling section online status:', error);
    }
  };

  // const handleLaunchSession = (sectionid: string) => {
  //   setUserSection(selectedSection);
  //   navigate(`/sectionControls/${sectionid}`);
  // }

  // // Open delete modal
  // const openModal = () => {
  //   setModalOpened(true);
  // };

  // // Close delete modal
  // const closeModal = () => {
  //   setModalOpened(false);
  // };


  // const handleDeleteSection = async (sectionId: string) => {

  //   try {
  //     // Confirm deletion
  //     const confirmDelete = window.confirm('Are you sure you want to delete this section? This action is irreversible.');
  //     if (!confirmDelete) return;

  //     // Send delete request to the backend
  //     await axios.delete(`${REACT_APP_BACKEND_URL}/sections/${sectionId}`);

  //     // Success: Update the sections state by removing the deleted section
  //     setSections((prevSections) =>
  //       prevSections.filter((section) => section.sectionid !== sectionId)
  //     );

  //     alert('Section deleted successfully');
  //   } catch (error) {
  //     console.error('Error deleting section:', error);
  //     alert('Failed to delete section');
  //   }
  // };  

  const openRenameSectionModal = () => {
    openRenameModal();
  };

  // Open the delete modal for the selected section
  const openDeleteSectionModal = () => {
    open();
  };

  // After successful deletion, update frontend state
  const handleDeleteSectionSuccess = () => {
    if (selectedSection) {
      setSections((prevSections) =>
        prevSections.filter((section) => section.sectionid !== selectedSection)
      );
      setSelectedSection(null);
    }
    // setDeleteModalOpened(false);
    fetchData();
  };

  const handleRenameSection = (newSectionId: string) => {
    if (selectedSection) {
      setSections(prevSections =>
        prevSections.map(section => section.sectionid === selectedSection ? { ...section, sectionid: newSectionId } : section)
      );
    }
    setSelectedSection(newSectionId); // Optionally update the selected section too

  };
  // const handleRowDoubleClick = (sectionid: string) => {
  //   setUserSection(sectionid);
  //   navigate(`/sectionControls/${sectionid}`);
  // };

  // Function to render the sections table
  const renderSectionsTable = () => (
    <Box style={{ maxWidth: 600, margin: '0 auto' }}>
      <Table>
        <thead>
          <tr>
            <th>Scenerio Name</th>
            <th>Status</th>
          </tr>
        </thead>
        <Table.Tbody>
          {sections.map((section) => (
            <Table.Tr
              key={section.sectionid}
              onClick={() => setSelectedSection(section.sectionid)}
              // onDoubleClick={() => handleRowDoubleClick(section.sectionid)}
              style={{
                cursor: 'pointer',
                backgroundColor: selectedSection === section.sectionid ? 'rgba(128, 128, 128, 0.5)' : '',
              }}
              className="highlightable-row"
            >
              <td>{section.sectionid}</td>
              <td>
                <Box
                  onClick={() => toggleSectionOnline(section.sectionid, section.isonline)}
                  style={{
                    backgroundColor: section.isonline ? theme.colors.green[0] : theme.colors.red[0],
                    color: section.isonline ? theme.colors.green[9] : theme.colors.red[9],
                    padding: '4px',
                    margin: '5px',
                    paddingRight: '20px',
                    paddingLeft: '20px',
                    borderRadius: '4px',
                    display: 'inline-block',
                  }}
                >
                  {section.isonline ? 'Online' : 'Offline'}
                </Box>
                {/* <Switch
                checked={section.isonline}
                onChange={() => toggleSectionOnline(section.sectionid, section.isonline)}
                color={section.isonline ? 'teal' : 'red'}
                size="md"
                label={section.isonline ? 'Section Online' : 'Section Offline'}
                thumbIcon={
                  section.isonline ? (
                    <IconCheck
                      style={{ width: rem(12), height: rem(12) }}
                      color={theme.colors.teal[6]}
                      stroke={3}
                    />
                  ) : (
                    <IconX
                      style={{ width: rem(12), height: rem(12) }}
                      color={theme.colors.red[6]}
                      stroke={3}
                    />
                  )
                }
              /> */}

              </td>
              <td>
                {/* <SectionCopyModule
                  isOpen={copyModalOpened}
                  onClose={closeCopyModal}
                  sectionToCopy={sectionToCopy}  // Pass the section to copy
                  onCopySuccess={(newSectionId: any) => {
                    // Optional: You can update sections state here if needed after successful copy
                    console.log("Section copied successfully with new ID:", newSectionId);
                  }}
                /> */}

                <Group justify="flex-end">
                  <Menu
                    transitionProps={{ transition: 'pop' }}
                    withArrow
                    position="bottom-end"
                    withinPortal={false}
                  >
                    <Menu.Target>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ActionIcon variant="subtle" color="white" style={{ marginRight: '15px' }}>
                          <IconDots style={{ width: rem(16), height: rem(16) }} stroke={1.5} />
                        </ActionIcon>
                      </div>
                    </Menu.Target>
                    <Menu.Dropdown>
                      {/* <Menu.Item
                        leftSection={<IconCopy style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
                        onClick={() => openCopyModal(section.sectionid)}  // Open copy modal with section ID
                      >
                        Copy Scenerio
                      </Menu.Item> */}
                      <Menu.Item
                        color="white"
                        onClick={() => openRenameSectionModal()}
                      >Rename Scenario</Menu.Item>

                      <Menu.Item
                        leftSection={<IconTrash style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
                        color="red"
                        onClick={() => openDeleteSectionModal()}
                      >
                        Delete Scenario
                      </Menu.Item>

                    </Menu.Dropdown>
                  </Menu>
                </Group>
              </td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Box>
  );

  // function handleCreateUnit() {
  //   setUnitModalOpened(true); // Open the modal when the button is clicked
  // }

  // const closeUnitModal = () => {
  //   setUnitModalOpened(false); // Close the modal
  // };

  // function handleDeleteUnit() {
  //   setDeleteModalOpened(true); // Open the modal when the button is clicked
  // }

  // const closeDeleteModal = () => {
  //   setDeleteModalOpened(false); // Close the modal
  // };

  return (
    <MantineProvider defaultColorScheme='dark'>
      <AppShell
        header={{ height: 60 }}
        navbar={{
          width: 300,
          breakpoint: 'sm',
          collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
        }}
        padding="md"
      >
        <AppShell.Header>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button size='sm' variant='link' onClick={handleArrowClick} style={{ margin: '10px' }}>
              <FaArrowAltCircleLeft />
            </Button>
            <div style={{ display: 'flex', justifyContent: 'center'}}>
              <img
                src={logo}
                alt="A descriptive alt text for the logo"
                height="30"
                style={{
                  borderRadius: 'var(--mantine-radius-md)',
                  width: 'auto',
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://placehold.co/600x400?text=Placeholder';
                }}
              />
            </div>
          </div>
        </AppShell.Header>
        <AppShell.Main>
          <div className="App">
            <h1>Admin Page</h1>
            {renderSectionsTable()}
            {/* <div style={{ display: "flex", justifyContent: "center", textAlign: "center" }}>
              <Button
                style={{ height: '40px', width: '225px', textAlign: "center" }}
                mt="xl"
                size="md"
                onClick={() => selectedSection && handleLaunchSession(selectedSection)} // Update route
                disabled={!selectedSection}
              >
                Edit Scenerio
              </Button>
            </div>
            <Group mt="md" style={{ display: "flex", justifyContent: "center", textAlign: "center" }}>
              <Button color="blue" onClick={openModal} style={{ display: "flex", justifyContent: "center", textAlign: "center" }}>
                Create Scenerio
              </Button>
            </Group>
            <Group mt="md" style={{ display: "flex", justifyContent: "center", textAlign: "center" }}>
              <Button color="green" onClick={handleCreateUnit} style={{ width: '150px', marginTop: 20 }}>
                <IconCubePlus /><Space w="10" />Unit Creator
              </Button>
              <Button color="red" onClick={handleDeleteUnit} style={{ width: '150px', marginTop: 20 }}>
                <IconCubeOff /><Space w="10" />Delete Units
              </Button>
            </Group> */}
          </div>
        </AppShell.Main>

        {/* <UnitCreationModule isOpen={unitModalOpened} onClose={closeUnitModal} />
        <UnitDeleteModule isOpen={deleteModalOpened} onClose={closeDeleteModal} />

        <Modal opened={modalOpened} onClose={closeModal} title="New Scenerio" centered>
          <FocusTrap>
            <div>
              <TextInput
                autoFocus
                label="Scenerio Name"
                placeholder="Enter scenerio name"
                value={newSectionName}
                onChange={(event) => {
                  const input = event.currentTarget.value;
                  if (input.length <= 15) {
                    setNewSectionName(input);
                  }
                }}
              />

              <Button fullWidth mt="md" onClick={handleCreateNewSection} disabled={!newSectionName.trim()}>
                Create
              </Button>
            </div>
          </FocusTrap>
        </Modal> */}

        {selectedSection && (
          <DeleteConfirmationModal
            open={opened}
            onClose={close}
            sectionId={selectedSection}
            onDeleteSuccess={handleDeleteSectionSuccess}
          />
        )}

        {selectedSection && (
          <RenameConfirmationModal
            open={renameModalOpened}
            onClose={closeRenameModal}
            sectionId={selectedSection}
            onRenameSuccess={handleRenameSection}
            sections={sections}
          />
        )}

      </AppShell>
    </MantineProvider>
  );
}

export default AdminPage;
