// afterActionReviewStorage.tsx renders the after action reviews page. Core functionalities include displaying 
// round statistics (scores/tactics/feedback)

// Import React hooks for state and lifecycle management
import React, { useState, useEffect } from 'react';
// Import necessary UI components from the Mantine library
import {
  AppShell,
  Group,
  Image,
  Table,
  Button,
  MantineProvider,
  Progress,
  Card,
  Tooltip,
  Text,
  Title,
  Container
} from '@mantine/core';
// Import Mantine hooks for UI state management
import { useDisclosure } from '@mantine/hooks';
// Import React Router hooks for navigation and accessing URL parameters
import { useNavigate, useParams } from 'react-router-dom';
// Import icons from the react-icons library
import { FaArrowAltCircleLeft, FaInfoCircle } from "react-icons/fa";
import {IconTrendingUp, IconTrendingDown} from '@tabler/icons-react';
// Import local CSS module for styling
import classes from './TableReviews.module.css';
// Import axios for making HTTP requests to the backend
import axios from 'axios';
// Import application logo
//import logo from '../images/logo/Tr_FullColor_NoSlogan.png';
// Import custom hook to get the current user's role
import { useUserRole } from '../context/UserContext';
import REACT_APP_BACKEND_URL from '../APIBase';
const logo = "/Tr_FullColor_NoSlogan.png";


// Defines the structure for recent engagement data (not currently used in this component)
export interface recentEngagementData {
  unit_type: string;
  role_type: string;
  unit_size: string;
  force_posture: string;
  force_mobility: string;
  force_readiness: string;
  force_skill: string;
  section: number;
}

// Defines the structure for the tactics data and feedback associated with an engagement
export interface Tactics {
  question: string;
  FriendlyISR?: number;
  EnemyISR?: number;
  FriendlyLogistics?: number;
  EnemyLogistics?: number;
  FriendlyCritical?: number;
  EnemyCritical?: number;
  FriendlyGPS?: number;
  EnemyGPS?: number;
  FriendlyComms?: number;
  EnemyComms?: number;
  FriendlyCAS?: number;
  EnemyCAS?: number;
  FriendlyAccess?: number;
  EnemyAccess?: number;
  engagementid?: number;
  firstAttackFriendly?: boolean;
  friendlyAccuracyPercent?: number;
  friendlyAccuracyLevel?: string;
  enemyAccuracyPercent?: number;
  enemyAccuracyLevel?: string;
  friendlyDamage?: number;
  enemyDamage?: number;
  detectionPositiveFeedback?: string;
  detectionNegativeFeedback?: string;
  accuracyPositiveFeedback?: string;
  accuracyNegativeFeedback?: string;
  damagePositiveFeedback?: string;
  damageNegativeFeedback?: string
}

// Defines the structure for a single engagement's summary data
export interface Engagement {
  friendlyid: string;
  enemyid: string;
  friendlyname: string;
  enemyname: string;
  engagementid: string;
  friendlybasescore: string;
  enemybasescore: string;
  friendlytacticsscore: string;
  enemytacticsscore: string;
  friendlytotalscore: number;
  enemytotalscore: number;
}

/**
 * The main component for the After Action Review (AAR) page.
 */
export default function AAR() {
  // --- STATE MANAGEMENT ---
  const navigate = useNavigate(); // Hook for programmatic navigation
  const [mobileOpened] = useDisclosure(false); // Mantine hook for mobile navbar state
  const [desktopOpened] = useDisclosure(false); // Mantine hook for desktop navbar state
  const { sectionId } = useParams(); // Retrieves sectionId from the URL (e.g., /aar/:sectionId)
  const [engagements, setEngagements] = useState<Engagement[]>([]); // State for storing the list of all engagements
  const [tacticsMap, setTacticsMap] = useState<Map<string, Tactics[]>>(new Map()); // State for storing tactics, keyed by engagement ID for quick lookup
  const { userRole } = useUserRole(); // Custom hook to determine if the user is a Student or Observer
  const [selectedEngagement, setSelectedEngagement] = useState<Engagement | null>(null); // State to track the currently selected engagement to display in detail

  // --- EVENT HANDLERS ---

  /**
   * Navigates to the main landing page when the logo is clicked.
   */
  const handleLogoClick = () => {
    navigate('/');
  };

  /**
   * Navigates back to the appropriate user page (Student or Observer) based on role.
   */
  const handleArrowClick = () => {
    if (userRole === 'Student') {
      navigate(`/studentPage/${sectionId}`);
    }
    else if (userRole === 'Observer') {
      navigate(`/observerPage/${sectionId}`);
    }
  };

  /**
   * Navigates back to the appropriate user page, used by the "Return" button.
   */
  const handleAARClick = () => {
    if (userRole === 'Student') {
      navigate(`/studentPage/${sectionId}`);
    }
    else if (userRole === 'Observer') {
      navigate(`/observerPage/${sectionId}`);
    }
  };

  // --- DATA FETCHING ---

  /**
   * useEffect hook to fetch all engagement and tactics data when the component mounts or sectionId changes.
   */
  useEffect(() => {
    const fetchEngagementData = async () => {
      try {
        console.log('Fetching data for engagement:', sectionId);
        const response = await axios.get<Engagement[]>(`${REACT_APP_BACKEND_URL}/ordered_engagements/${sectionId}`, {
          params: {
            sectionid: sectionId  // Pass userSection as a query parameter
          }
        });
        setEngagements(response.data);
        console.log(response.data[0])

        // Step 2: For each engagement, create a promise to fetch its specific tactics data.
        const tacticsPromises = response.data.map(async (engagement) => {
          const tacticsResponse = await axios.get<Tactics[]>(`${REACT_APP_BACKEND_URL}/tactics/${engagement.engagementid}`);
          return { engagementId: engagement.engagementid, tactics: tacticsResponse.data };
        });

        // Step 3: Wait for all tactics data promises to resolve.
        const tacticsData = await Promise.all(tacticsPromises);

        const tacticsMap = new Map<string, Tactics[]>();
        tacticsData.forEach((tacticsItem) => {
          tacticsMap.set(tacticsItem.engagementId, tacticsItem.tactics);
        });

        // Step 5: Update the state with the new map.
        setTacticsMap(tacticsMap);

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchEngagementData();
  }, [sectionId]); // This effect re-runs if the sectionId in the URL changes.

  // --- RENDER LOGIC ---

  /**
   * Renders the rows for the tactics table within the "Selected Engagement" card.
   * param tactics - An array of tactics data for the selected engagement.
   * returns JSX elements representing the table rows.
   */
  const renderTacticsRows = (tactics: Tactics[] | undefined) => {
    // Helper function to convert a numeric score into a simple "Yes" or "No".
    const scoreToYesNo = (score: number | undefined) => (score && score > 0 ? 'Yes' : 'No');

    // --- GUARD CLAUSES for rendering tactics ---

    // Case 1: No engagements have been loaded for the section.
    if (engagements.length === 0) {
      return (
        <Table.Tr>
          <Table.Td colSpan={4} align="center">No engagements found</Table.Td>
        </Table.Tr>
      );
    }
    // Case 2: Engagements exist, but the user has not selected one yet.
    if (!selectedEngagement) {
      return (
        <Table.Tr>
          <Table.Td colSpan={4} align="center">Select an engagement to view tactics</Table.Td>
        </Table.Tr>
      );
    }
    // Case 3: An engagement is selected, but its tactics data is missing or empty.
    if (!tactics || tactics.length === 0) {
      return (
        <Table.Tr>
          <Table.Td colSpan={4} align="center">No tactics data available for this engagement</Table.Td>
        </Table.Tr>
      );
    }
    
    // Defines the questions and the corresponding data keys for the tactics table.
    const tacticQuestions = [
      { question: 'Conducted ISR prior to moving land forces?', friendlyKey: 'FriendlyISR', enemyKey: 'EnemyISR' },
      { question: 'Within logistics support range?', friendlyKey: 'FriendlyLogistics', enemyKey: 'EnemyLogistics' },
      { question: 'Is the target defending a critical location?', friendlyKey: 'FriendlyCritical', enemyKey: 'EnemyCritical' },
      { question: 'GPS being jammed?', friendlyKey: 'FriendlyGPS', enemyKey: 'EnemyGPS' },
      { question: 'Communications being jammed?', friendlyKey: 'FriendlyComms', enemyKey: 'EnemyComms' },
      { question: 'Have close air support?', friendlyKey: 'FriendlyCAS', enemyKey: 'EnemyCAS' },
      { question: 'Is the target accessible?', friendlyKey: 'FriendlyAccess', enemyKey: 'EnemyAccess' },
    ];
    
    // Assumes the tactics array contains a single object with all the data.
    const tacticData = tactics[0]; 

    // Maps over the predefined questions to generate a table row for each.
    return tacticQuestions.map((tactic, index) => {
      const friendlyAnswer = scoreToYesNo(tacticData[tactic.friendlyKey as keyof Tactics] as number);
      const enemyAnswer = scoreToYesNo(tacticData[tactic.enemyKey as keyof Tactics] as number);

      return (
        <Table.Tr key={`tactic-row-${index}`}>
          <Table.Td>{tactic.question}</Table.Td>
          <Table.Td style={{ textAlign: 'center' }}>{friendlyAnswer}</Table.Td>
          <Table.Td style={{ textAlign: 'center' }}>{enemyAnswer}</Table.Td>
        </Table.Tr>
      );
    });
  };

  const selectedTacticsData = selectedEngagement 
    ? tacticsMap.get(selectedEngagement.engagementid)?.[0] 
    : null;

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
          <Group h="100%" justify="space-between" px="md" align="center">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: "space-between" }}>
              <Button size='sm' variant='link' onClick={handleArrowClick} style={{ margin: '10px' }}><FaArrowAltCircleLeft /> </Button>
              <Image
                src={logo}
                radius="md"
                h={50}
                fallbackSrc="https://placehold.co/600x400?text=Placeholder"
                onClick={handleLogoClick}
                style={{ cursor: 'pointer', scale: '1', padding: '8px' }}
              />
            </div>
          </Group>
        </AppShell.Header>

        <AppShell.Main>
          <div style={{ justifyContent: 'right', display: 'flex' }}>
            <Button size='sm' variant='link' onClick={handleAARClick} style={{ margin: '10px ' }}>Return</Button>
          </div>
          <h1 style={{ justifyContent: 'center', alignItems: 'center', display: 'flex' }}>After Action Reviews</h1>
          <h3 style={{ justifyContent: 'center', alignItems: 'center', display: 'flex' }}>Scenerio: {sectionId}</h3>
          
          {/* This div centers the "Selected Engagement" card */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center', // Vertically centers the placeholder text
              margin: '2rem 0',
              // Conditionally set a minimum height to act as a placeholder
              minHeight: !selectedEngagement ? '550px' : undefined,
            }}
          >
              {/* Conditional rendering for the top card */}
              {engagements.length === 0 ? (
                // Displayed if no engagements are loaded
                <Title order={3} ta="center" c="#8a8989">No engagements available for this section</Title>
                ) : !selectedEngagement ? (
                // Displayed if engagements are loaded but none is selected
                <Title order={3} ta="center" c="#8a8989">[Select an engagement to view tactics]</Title>
                ) : (
                // Displayed once an engagement is selected

                <Group justify="center" mt="xl" display={'flex'}>
                  <Card shadow="sm" radius="md" withBorder style={{ width: '600px', textAlign: 'center' }}>
                    <Card.Section withBorder inheritPadding py="xs">
                      <div style={{ textAlign: 'center' }}>
                        <h2 style={{ marginTop: 10 }}>Round ID: {selectedEngagement.engagementid}</h2>
                      </div>

                      {/* Container for the friendly and enemy score progress bars */}
                      <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 15 }}>
                        {/* Friendly Score Section */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <Text>{selectedEngagement?.friendlyname}</Text>
                          <Tooltip
                            position="bottom"
                            color="gray"
                            transitionProps={{ transition: 'fade-up', duration: 300 }}
                            label="Overall Score Out of 100"
                          >
                            <Progress.Root style={{ width: '200px', height: '25px' }}>
                              <Progress.Section
                                className={classes.progressSection}
                                value={Number(selectedEngagement?.friendlytotalscore)}
                                color='#3d85c6'>
                                {Number(selectedEngagement?.friendlytotalscore).toFixed(0)}
                              </Progress.Section>
                            </Progress.Root>
                          </Tooltip>
                        </div>

                        {/* Enemy Score Section */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <Text>{selectedEngagement?.enemyname}</Text>
                          <Tooltip
                            position="bottom"
                            color="gray"
                            transitionProps={{ transition: 'fade-up', duration: 300 }}
                            label="Overall Score Out of 100"
                          >
                            <Progress.Root style={{ width: '200px', height: '25px' }}>
                              <Progress.Section
                                className={classes.progressSection}
                                value={Number(selectedEngagement?.enemytotalscore)}
                                color='#c1432d'>
                                {Number(selectedEngagement?.enemytotalscore).toFixed(0)}
                              </Progress.Section>
                            </Progress.Root>
                          </Tooltip>
                        </div>
                      </div>
                      
                      {/* Tactics Table for the selected engagement */}
                      <Table verticalSpacing={'xs'} style={{ justifyContent: 'center', width: "100%" }} >
                        <Table.Thead>
                          <Table.Tr>
                            <Table.Th style={{ textAlign: 'center' }}>Tactic</Table.Th>
                            <Table.Th style={{ color: '#60acf7', textAlign: 'center' }}>Friendly Score</Table.Th>
                            <Table.Th style={{ color: '#f4888a', textAlign: 'center' }}>Enemy Score</Table.Th>
                          </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>{renderTacticsRows(
                          selectedEngagement?.engagementid
                            ? tacticsMap.get(selectedEngagement.engagementid)
                            : undefined
                        )}
                        </Table.Tbody>
                      </Table>
                    </Card.Section>

                    {/* Tactics Feedback Table for the selected engagement */}
                    <Card.Section withBorder inheritPadding py="xs">
                      <Container>
                        <Text size="xl" fw={700}>Tactics Feedback & Effects</Text>
                      </Container>
                      <Table verticalSpacing={'xs'} style={{ justifyContent: 'center', width: "100%" }}>
                        <Table.Thead>
                          <Table.Tr>
                            <Table.Th style={{ textAlign: 'center', width: '34%' }}>Detection</Table.Th>
                            <Table.Th style={{ textAlign: 'center', width: '33%' }}>Accuracy</Table.Th>
                            <Table.Th style={{ textAlign: 'center', width: '33%' }}>Damage</Table.Th>
                          </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                          {/* Row 1: Text Feedback */}
                          <Table.Tr>
                            <Table.Td>
                              <Text c={selectedTacticsData?.firstAttackFriendly ? '#60acf7' : '#f4888a'}>
                                {selectedTacticsData?.firstAttackFriendly ? 'You surprised the enemy and attacked first!' : 'Enemy surprised you and attacked first!'}
                              </Text>
                            </Table.Td>
                            <Table.Td>
                              <Text c="#60acf7">{selectedTacticsData?.friendlyAccuracyLevel}, {Number(selectedTacticsData?.friendlyAccuracyPercent).toFixed(2)}%</Text>
                              <Text c="#f4888a">{selectedTacticsData?.enemyAccuracyLevel}, {Number(selectedTacticsData?.enemyAccuracyPercent).toFixed(2)}%</Text>
                            </Table.Td>
                            <Table.Td>
                              <Text c="#60acf7">-{Number(selectedTacticsData?.friendlyDamage).toFixed(0)} points</Text>
                              <Text c="#f4888a">-{Number(selectedTacticsData?.enemyDamage).toFixed(0)} points</Text>
                            </Table.Td>
                          </Table.Tr>

                          {/* Row 2: Icon Tooltips */}
                          <Table.Tr>
                          {/* Detection columm */}
                            <Table.Td>
                              <Group justify="center" gap="xs">
                                {/* Positive Feedback Tooltip */}
                                <Tooltip
                                  label={
                                    <div style={{ textAlign: 'left', paddingBottom: '0.7rem' }}>
                                      <p style={{ color: 'black' }}>Factors that INCREASED detection:</p>
                                      {
                                        (selectedTacticsData?.detectionPositiveFeedback || "No significant factors.")
                                          .split('\n')
                                          .map((factor, index) => (
                                            <p key={index} style={{ margin: 0, paddingLeft: '1em', color: 'black' }}>- {factor}</p>
                                          ))
                                      }
                                    </div>
                                  }
                                  color="#8bc17c" withArrow position="bottom"
                                >
                                  <IconTrendingUp size={24} color="#8bc17c" />
                                </Tooltip>

                                {/* Negative Feedback Tooltip */}
                                <Tooltip
                                  label={
                                    <div style={{ textAlign: 'left', paddingBottom: '0.7rem' }}>
                                      <p style={{ color: 'black' }}>Factors that DECREASED detection:</p>
                                      {
                                        (selectedTacticsData?.detectionNegativeFeedback || "No significant factors.")
                                          .split('\n')
                                          .map((factor, index) => (
                                            <p key={index} style={{ margin: 0, paddingLeft: '1em', color: 'black' }}>- {factor}</p>
                                          ))
                                      }
                                    </div>
                                  }
                                  color="#f4888a" withArrow position="bottom"
                                >
                                  <IconTrendingDown size={24} color="#f4888a" />
                                </Tooltip>
                              </Group>
                            </Table.Td>

                            {/* Repeat the same pattern for Accuracy and Damage columns */}

                            {/* Accuracy Column */}
                            <Table.Td>
                              <Group justify="center" gap="xs">
                                <Tooltip
                                  label={
                                    <div style={{ textAlign: 'left', paddingBottom: '0.7rem' }}>
                                      <p style={{ color: 'black' }}>Factors that INCREASED accuracy:</p>
                                      {(selectedTacticsData?.accuracyPositiveFeedback || "No significant factors.").split('\n').map((factor, index) => (
                                        <p key={index} style={{ margin: 0, paddingLeft: '1em', color: 'black' }}>- {factor}</p>
                                      ))}
                                    </div>
                                  }
                                  color="#8bc17c" withArrow position="bottom"
                                >
                                  <IconTrendingUp size={24} color="#8bc17c" />
                                </Tooltip>
                                <Tooltip
                                  label={
                                    <div style={{ textAlign: 'left', paddingBottom: '0.7rem' }}>
                                      <p style={{ color: 'black' }}>Factors that DECREASED accuracy:</p>
                                      {(selectedTacticsData?.accuracyNegativeFeedback || "No significant factors.").split('\n').map((factor, index) => (
                                        <p key={index} style={{ margin: 0, paddingLeft: '1em', color: 'black' }}>- {factor}</p>
                                      ))}
                                    </div>
                                  }
                                  color="#f4888a" withArrow position="bottom"
                                >
                                  <IconTrendingDown size={24} color="#f4888a" />
                                </Tooltip>
                              </Group>
                            </Table.Td>

                            {/* Damage Column */}
                            <Table.Td>
                              <Group justify="center" gap="xs">
                                <Tooltip
                                  label={
                                    <div style={{ textAlign: 'left', paddingBottom: '0.7rem' }}>
                                      <p style={{ color: 'black' }}>Factors that INCREASED damage:</p>
                                      {(selectedTacticsData?.damagePositiveFeedback || "No significant factors.").split('\n').map((factor, index) => (
                                        <p key={index} style={{ margin: 0, paddingLeft: '1em', color: 'black' }}>- {factor}</p>
                                      ))}
                                    </div>
                                  }
                                  color="#8bc17c" withArrow position="bottom"
                                >
                                  <IconTrendingUp size={24} color="#8bc17c" />
                                </Tooltip>
                                <Tooltip
                                  label={
                                    <div style={{ textAlign: 'left', paddingBottom: '0.7rem' }}>
                                      <p style={{ color: 'black' }}>Factors that DECREASED damage:</p>
                                      {(selectedTacticsData?.damageNegativeFeedback || "No significant factors.").split('\n').map((factor, index) => (
                                        <p key={index} style={{ margin: 0, paddingLeft: '1em', color: 'black' }}>- {factor}</p>
                                      ))}
                                    </div>
                                  }
                                  color="#f4888a" withArrow position="bottom"
                                >
                                  <IconTrendingDown size={24} color="#f4888a" />
                                </Tooltip>
                              </Group>
                            </Table.Td>
                          </Table.Tr>
                        </Table.Tbody>
                      </Table>
                      <Text style={{fontSize: '0.75rem', color: '#868e96', textAlign: 'center', marginTop: '0.05rem', fontStyle: 'italic'}}>
                          Hover over the icons above for round's feedback.
                      </Text>
                    </Card.Section>
                    
                  </Card>
                </Group>
              )
              }
            </div>

            {/* Main table listing all engagements */}
            <Table verticalSpacing={'xs'} style={{ width: '100%', tableLayout: 'fixed', justifyContent: 'space-between' }}>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Round ID</Table.Th>
                  <Table.Th>Friendly Unit Name</Table.Th>
                  <Table.Th>Friendly Total Score</Table.Th>
                  <Table.Th>Enemy Unit Name</Table.Th>
                  <Table.Th>Enemy Total Score</Table.Th>
                </Table.Tr>
              </Table.Thead>
              {/* Map through all engagements to create a row for each */}
              {engagements.map((row, index) => ( 
                <Table.Tbody key={index}>
                  <Table.Tr key={row.engagementid}>
                    <Table.Td>{row.engagementid}</Table.Td>
                    <Table.Td>{row.friendlyname}</Table.Td>
                    <Table.Td>
                      <Tooltip
                        position="bottom"
                        color="gray"
                        transitionProps={{ transition: 'fade-up', duration: 300 }}
                        label="Overall Score Out of 100"
                      >
                        <Progress.Root style={{ width: '200px', height: '25px' }}>
                          <Progress.Section
                            className={classes.progressSection}
                            value={row.friendlytotalscore}
                            color='#3d85c6'>
                            {Number(row.friendlytotalscore).toFixed(0)}
                          </Progress.Section>
                        </Progress.Root>
                      </Tooltip>
                    </Table.Td>
                    <Table.Td>{row.enemyname}</Table.Td>
                    <Table.Td>
                      <Tooltip
                        position="bottom"
                        color="gray"
                        transitionProps={{ transition: 'fade-up', duration: 300 }}
                        label="Overall Score Out of 100"
                      >
                        <Progress.Root style={{ width: '200px', height: '25px', display: 'flex' }}>

                          <Progress.Section
                            className={classes.progressSection}
                            value={row.enemytotalscore}
                            color='#c1432d'>
                            {Number(row.enemytotalscore).toFixed(0)}
                          </Progress.Section>
                        </Progress.Root>
                      </Tooltip>
                    </Table.Td>
                    <Table.Td style={{ display: 'flex' }}>
                      {/* This button sets the selected engagement, causing the top card to re-render with this row's data */}
                      <Button className='.toggle-details' size="xs" onClick={() => setSelectedEngagement(row)}>
                        Show Engagement
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                  {/* The collapsible section is currently commented out */}
                  <Table.Tr style={{ display: 'flex', justifyContent: 'center', width: '100%', marginLeft: '255%' }}>
                    {/* <Collapse in={isOpen[index]} style={{ width: '100%' }}> ... </Collapse> */}
                  </Table.Tr>
                </Table.Tbody>
              ))}
            </Table>
          
        </AppShell.Main>
      </AppShell>
    </MantineProvider>
  );
}