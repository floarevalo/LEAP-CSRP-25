// afterActionReviewStorage.tsx renders the after action reviews page. Core functionalities include displaying 
// round statistics (scores/tactics/more info)

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
  Title
} from '@mantine/core';
// Import Mantine hooks for UI state management
import { useDisclosure } from '@mantine/hooks';
// Import React Router hooks for navigation and accessing URL parameters
import { useNavigate, useParams } from 'react-router-dom';
// Import icons from the react-icons library
import { FaArrowAltCircleLeft, FaInfoCircle } from "react-icons/fa";
// Import local CSS module for styling
import classes from './TableReviews.module.css';
// Import axios for making HTTP requests to the backend
import axios from 'axios';
// Import application logo
import logo from '../images/logo/Tr_FullColor_NoSlogan.png';
// Import custom hook to get the current user's role
import { useUserRole } from '../context/UserContext';


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

// Defines the structure for the tactics data associated with an engagement
export interface Tactics {
  question: string;
  friendlyawareness?: number;
  enemyawareness?: number;
  friendlylogistics?: number;
  enemylogistics?: number;
  friendlycoverage?: number;
  enemycoverage?: number;
  friendlygps?: number;
  enemygps?: number;
  friendlycomms?: number;
  enemycomms?: number;
  friendlyfire?: number;
  enemyfire?: number;
  friendlypattern?: number;
  enemypattern?: number;
  engagementid?: number;
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
        const response = await axios.get<Engagement[]>(`${process.env.REACT_APP_BACKEND_URL}/api/ordered_engagements/${sectionId}`, {
          params: {
            sectionid: sectionId  // Pass userSection as a query parameter
          }
        });
        setEngagements(response.data);
        console.log(response.data[0])

        // Step 2: For each engagement, create a promise to fetch its specific tactics data.
        const tacticsPromises = response.data.map(async (engagement) => {
          const tacticsResponse = await axios.get<Tactics[]>(`${process.env.REACT_APP_BACKEND_URL}/api/tactics/${engagement.engagementid}`);
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
      { question: 'Aware of OPFOR?', friendlyKey: 'friendlyawareness', enemyKey: 'enemyawareness' },
      { question: 'Within Logistics Support Range?', friendlyKey: 'friendlylogistics', enemyKey: 'enemylogistics' },
      { question: 'Within RPA/ISR Coverage?', friendlyKey: 'friendlycoverage', enemyKey: 'enemycoverage' },
      { question: 'Working GPS?', friendlyKey: 'friendlygps', enemyKey: 'enemygps' },
      { question: 'Within Communications Range?', friendlyKey: 'friendlycomms', enemyKey: 'enemycomms' },
      { question: 'Within Fire Support Range?', friendlyKey: 'friendlyfire', enemyKey: 'enemyfire' },
      { question: 'Within Range of a Pattern Force?', friendlyKey: 'friendlypattern', enemyKey: 'enemypattern' },
    ];
    
    // Assumes the tactics array contains a single object with all the data.
    const tacticData = tactics[0]; 

    /**
     * Determines the descriptive text for the tooltip based on the question and the friendly/enemy answers.
     * @param question - The tactic question being asked.
     * @param friendly - The friendly force's answer ('Yes' or 'No').
     * @param enemy - The enemy force's answer ('Yes' or 'No').
     * @returns A descriptive string for the tooltip.
     */
    const getTooltipLabel = (question: string, friendly: string, enemy: string): string => {
      // The outer switch statement checks which question is being asked
      switch (question) {
        case 'Aware of OPFOR?':
          if (friendly === 'Yes' && enemy === 'Yes') {
            return "No Advantage: Both forces were aware of each other. Neither side had the element of surprise.";
          } else if (friendly === 'Yes' && enemy === 'No') {
            return "Blue Advantage: Friendly forces were aware of the enemy, but the enemy was not. This provides a significant tactical advantage.";
          } else if (friendly === 'No' && enemy === 'Yes') {
            return "Red Advantage: Enemy forces were aware of friendlies, who were caught by surprise. This is a critical friendly vulnerability.";
          } else {
            return "No Advantage: Both forces were unaware of each other. The engagement likely began unexpectedly for both sides.";
          }

        case 'Within Logistics Support Range?':
            if (friendly === 'Yes' && enemy === 'Yes') {
                return "No Advantage: Both forces are operating within their supply lines and are able to be resupplied.";
            } else if (friendly === 'Yes' && enemy === 'No') {
                return "Blue Advantage: Friendly forces can sustain operations while the enemy is cut off from their supplies.";
            } else if (friendly === 'No' && enemy === 'Yes') {
                return "Red Advantage: Friendly forces risk exhaustion of supplies and cannot easily be reinforced or resupplied.";
            } else {
                return "No Advantage: Both forces are operating beyond their supply lines.";
            }

        case 'Within RPA/ISR Coverage?':
            if (friendly === 'Yes' && enemy === 'Yes') {
                return "No Advantage: Both sides have aerial surveillance, leading to a highly transparent battlefield.";
            } else if (friendly === 'Yes' && enemy === 'No') {
                return "Blue Advantage: Friendlies intel provides superior situational awareness of enemy movements.";
            } else if (friendly === 'No' && enemy === 'Yes') {
                return "Red Advantage: Friendly forces are operating blind while the enemy has better situational awareness.";
            } else {
                return "No Advantage: No aerial surveillance is available to either side.";
            }
        
        case 'Working GPS?':
            if (friendly === 'Yes' && enemy === 'Yes') {
                return "No Advantage: Both forces have reliable access to GPS for navigation and coordination.";
            } else if (friendly === 'Yes' && enemy === 'No') {
                return "Blue Advantage: Friendlies can navigate and coordinate precisely, while the enemy may be disorganized.";
            } else if (friendly === 'No' && enemy === 'Yes') {
                return "Red Advantage: Enemy can navigate and coordinate precisely, while friendlies may be disorganized.";
            } else {
                return "No Advantage: This is a GPS-denied environment. Both forces must rely on analog methods like map and compass.";
            }

        case 'Within Communications Range?':
            if (friendly === 'Yes' && enemy === 'Yes') {
                return "No Advantage: Both forces can communicate effectively within their chains of command.";
            } else if (friendly === 'Yes' && enemy === 'No') {
                return "Blue Advantage: Friendlies C2 capabilities provide a strategic advantage.";
            } else if (friendly === 'No' && enemy === 'Yes') {
                return "Red Advantage: Friendly command and control is degraded, while the enemy is able to continue using C2.";
            } else {
                return "No Advantage: Communications are jammed or unavailable.";
            }

        case 'Within Fire Support Range?':
            if (friendly === 'Yes' && enemy === 'Yes') {
                return "No Advantage: Both forces can call for indirect fire support like artillery or mortars.";
            } else if (friendly === 'Yes' && enemy === 'No') {
                return "Blue Advantage: Friendlies can use artillery to suppress, fix, or destroy enemy positions from a distance.";
            } else if (friendly === 'No' && enemy === 'Yes') {
                return "Red Advantage: Friendlies are vulnerable to enemy artillery support.";
            } else {
                return "No Advantage: The engagement is outside the range of heavy fire support.";
            }

        case 'Within Range of a Pattern Force?':
            if (friendly === 'Yes' && enemy === 'Yes') {
                return "No Advantage: Both sides have reinforcements or a quick reaction force they can call upon.";
            } else if (friendly === 'Yes' && enemy === 'No') {
                return "Blue Advantage: Friendlies can be reinforced, potentially turning the tide of the battle with fresh troops.";
            } else if (friendly === 'No' && enemy === 'Yes') {
                return "Red Advantage: The enemy can bring in reinforcements while friendly forces are isolated.";
            } else {
                return "No Advantage: Both forces are isolated. The units currently engaged are the only ones that will decide the outcome.";
            }

        default:
          // A fallback for any question that doesn't have a specific case
          return "No specific information available for this tactic.";
      }
    };
    
    /**
     * Determines the color for the tooltip and icon based on tactical advantage.
     * returns A color string (hex code or color name).
     */
    const getAdvantageColor = (friendly: string, enemy: string): string => {
      if (friendly === 'Yes' && enemy === 'No') { // Blue advantage
        return "#3d85c6";
      } else if (friendly === 'No' && enemy === 'Yes') { // Red advantage
        return "#c1432d";
      }
      return "grey"; // No advantage
    };

    // Maps over the predefined questions to generate a table row for each.
    return tacticQuestions.map((tactic, index) => {
      const friendlyAnswer = scoreToYesNo(tacticData[tactic.friendlyKey as keyof Tactics] as number);
      const enemyAnswer = scoreToYesNo(tacticData[tactic.enemyKey as keyof Tactics] as number);
      const tooltipLabel = getTooltipLabel(tactic.question, friendlyAnswer, enemyAnswer);
      const advantageColor = getAdvantageColor(friendlyAnswer, enemyAnswer);

      return (
        <Table.Tr key={`tactic-row-${index}`}>
          <Table.Td>{tactic.question}</Table.Td>
          <Table.Td style={{ textAlign: 'center' }}>{friendlyAnswer}</Table.Td>
          <Table.Td style={{ textAlign: 'center' }}>{enemyAnswer}</Table.Td>
          <Table.Td style={{ textAlign: 'center' }}>
            <Tooltip
              label={tooltipLabel}
              withArrow
              position="right"
              color={advantageColor}
              z-index={200} 
              multiline // Allows the tooltip text to wrap to multiple lines
              w={220}     // Sets a fixed width, forcing text to wrap
            >
              {/* This div is the critical fix to allow the Tooltip to attach a ref */}
              <div>
                <FaInfoCircle style={{ cursor: 'pointer' }} color = {advantageColor}/>
              </div>
            </Tooltip>
          </Table.Td>
        </Table.Tr>
      );
    });
  };

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
          <h2 style={{ justifyContent: 'center', alignItems: 'center', display: 'flex' }}>Scenerio: {sectionId}</h2>
          
          {/* This AppShell contains the main content of the AAR page */}
          <AppShell>
            {/* This div centers the "Selected Engagement" card */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '45vh' }}>
              {/* Conditional rendering for the top card */}
              {engagements.length === 0 ? (
                // Displayed if no engagements are loaded
                <Title order={3} ta="center" c="gray">No engagements available for this section</Title>
              ) : !selectedEngagement ? (
                // Displayed if engagements are loaded but none is selected
                <Title order={3} ta="center" c="gray">Select an engagement to view tactics</Title>
              ) : (
                // Displayed once an engagement is selected
                <Card shadow="sm" radius="md" withBorder style={{ overflow: 'visible', display: 'grid', height: '40vh', width: '600px', placeItems: 'center', marginBottom: '125px', marginTop: '100px', textAlign: 'center' }}>
                  <Card.Section>
                    <div style={{ textAlign: 'center' }}>
                      <h2 style={{ marginTop: 10 }}>Round ID: {selectedEngagement.engagementid}</h2>
                    </div>

                    {/* Container for the friendly and enemy score progress bars */}
                    <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 30 }}>
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
                    <Table verticalSpacing={'xs'} style={{ width: '600px', justifyContent: 'center' }}>
                      <Table.Thead>
                        <Table.Tr>
                          <Table.Th style={{ textAlign: 'center' }}>Tactic</Table.Th>
                          <Table.Th style={{ textAlign: 'center' }}>Friendly Score</Table.Th>
                          <Table.Th style={{ textAlign: 'center' }}>Enemy Score</Table.Th>
                          <Table.Th style={{ textAlign: 'center' }}>More Info</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>{renderTacticsRows(
                        // Retrieve the correct tactics from the map using the selected engagement's ID
                        selectedEngagement?.engagementid
                          ? tacticsMap.get(selectedEngagement.engagementid)
                          : undefined
                      )}
                      </Table.Tbody>
                    </Table>
                  </Card.Section>
                </Card>
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
          </AppShell>
        </AppShell.Main>
      </AppShell>
    </MantineProvider>
  );
}