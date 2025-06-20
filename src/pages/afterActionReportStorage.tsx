//afterActionReviewStorage.tsx
import React, { useState, useEffect } from 'react';
import {
  AppShell,
  Group,
  Image,
  Table,
  Button,
  MantineProvider,
  Progress,
  Card,
  // Collapse,
  Tooltip,
  Text,
  Title
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowAltCircleLeft, FaInfoCircle } from "react-icons/fa";
import classes from './TableReviews.module.css';
import axios from 'axios';
import logo from '../images/logo/Tr_FullColor_NoSlogan.png'
import { useUserRole } from '../context/UserContext';


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


export default function AAR() {
  const navigate = useNavigate();
  const [mobileOpened] = useDisclosure(false);
  const [desktopOpened] = useDisclosure(false);
  const { sectionId } = useParams(); // Retrieve sectionId from route parameters
  const [engagements, setEngagements] = useState<Engagement[]>([]);
  const [tacticsMap, setTacticsMap] = useState<Map<string, Tactics[]>>(new Map()); // Changed: Added `tacticsMap` state for storing tactics data
  const { userRole } = useUserRole();
  const [selectedEngagement, setSelectedEngagement] = useState<Engagement | null>(null); //Tracks when the user selects an engagement

  const handleLogoClick = () => {
    navigate('/'); // Navigate to the main login page
  };


  //Question: Where does this route to
  const handleArrowClick = () => {
    if (userRole === 'Student') {
      navigate(`/studentPage/${sectionId}`);
    }
    else if (userRole === 'Observer') {
      navigate(`/observerPage/${sectionId}`);
    }
  };

  const handleAARClick = () => {
    if (userRole === 'Student') {
      navigate(`/studentPage/${sectionId}`);
    }
    else if (userRole === 'Observer') {
      navigate(`/observerPage/${sectionId}`);
    }
  };


  useEffect(() => {
    const fetchEngagementData = async () => {
      try {
        console.log('Fetching data for engagement:', sectionId);
        const response = await axios.get<Engagement[]>(`${process.env.REACT_APP_BACKEND_URL}/api/engagements/${sectionId}`, {
          params: {
            sectionid: sectionId  // Pass userSection as a query parameter
          }
        });
        setEngagements(response.data);
        console.log(response.data[0])




        const tacticsPromises = response.data.map(async (engagement) => {
          const tacticsResponse = await axios.get<Tactics[]>(`${process.env.REACT_APP_BACKEND_URL}/api/tactics/${engagement.engagementid}`);
          return { engagementId: engagement.engagementid, tactics: tacticsResponse.data };
        });

        const tacticsData = await Promise.all(tacticsPromises);

        const tacticsMap = new Map<string, Tactics[]>();
        tacticsData.forEach((tacticsItem) => {
          tacticsMap.set(tacticsItem.engagementId, tacticsItem.tactics);
        });

        setTacticsMap(tacticsMap);

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchEngagementData();
  }, [sectionId]);

  const renderTacticsRows = (tactics: Tactics[] | undefined) => {
    // Helper function to convert score to Yes/No
    const scoreToYesNo = (score: number | undefined) => (score && score > 0 ? 'Yes' : 'No');

    // Case 1: No engagements at all
    if (engagements.length === 0) {
      return (
        <Table.Tr>
          <Table.Td colSpan={4} align="center">No engagements found</Table.Td>
        </Table.Tr>
      );
    }

    // Case 2: Engagements exist but none selected
    if (!selectedEngagement) {
      return (
        <Table.Tr>
          <Table.Td colSpan={4} align="center">Select an engagement to view tactics</Table.Td>
        </Table.Tr>
      );
    }

    // Case 3: Engagement selected but tactics data not available
    if (!tactics || tactics.length === 0) {
      return (
        <Table.Tr>
          <Table.Td colSpan={4} align="center">No tactics data available for this engagement</Table.Td>
        </Table.Tr>
      );
    }
    
    const tacticQuestions = [
      { question: 'Aware of OPFOR?', friendlyKey: 'friendlyawareness', enemyKey: 'enemyawareness' },
      { question: 'Within Logistics Support Range?', friendlyKey: 'friendlylogistics', enemyKey: 'enemylogistics' },
      { question: 'Within RPA/ISR Coverage?', friendlyKey: 'friendlycoverage', enemyKey: 'enemycoverage' },
      { question: 'Working GPS?', friendlyKey: 'friendlygps', enemyKey: 'enemygps' },
      { question: 'Within Communications Range?', friendlyKey: 'friendlycomms', enemyKey: 'enemycomms' },
      { question: 'Within Fire Support Range?', friendlyKey: 'friendlyfire', enemyKey: 'enemyfire' },
      { question: 'Within Range of a Pattern Force?', friendlyKey: 'friendlypattern', enemyKey: 'enemypattern' },
    ];
    
    const tacticData = tactics[0]; 

    const getTooltipLabel = (friendly: string, enemy: string): string => {
      if (friendly === 'Yes' && enemy === 'Yes') {
        return "No advantage. Both sides succeeded in this tactic. This indicates a potential stalemate or equal advantage in this area.";
      } else if (friendly === 'Yes' && enemy === 'No') {
        return "Blue advantage. Friendly forces succeeded while the enemy failed. This is a key friendly advantage.";
      } else if (friendly === 'No' && enemy === 'Yes') {
        return "Red advantage. Enemy forces succeeded while friendlies failed. This is a critical friendly vulnerability.";
      } else { // This covers the (friendly === 'No' && enemy === 'No') case
        return "No advantage. Both sides failed in this tactic. This may indicate difficult conditions or mutual failure to execute.";
      }
    };

    const getAdvantageColor = (friendly: string, enemy: string): string => {
      if (friendly === 'Yes' && enemy === 'Yes') {
        return "grey";
      } else if (friendly === 'Yes' && enemy === 'No') {
        return "#3d85c6";
      } else if (friendly === 'No' && enemy === 'Yes') {
        return "#c1432d";
      } else { // This covers the (friendly === 'No' && enemy === 'No') case
        return "grey";
      }
    };

    return tacticQuestions.map((tactic, index) => {
      const friendlyAnswer = scoreToYesNo(tacticData[tactic.friendlyKey as keyof Tactics] as number);
      const enemyAnswer = scoreToYesNo(tacticData[tactic.enemyKey as keyof Tactics] as number);
      const tooltipLabel = getTooltipLabel(friendlyAnswer, enemyAnswer);
      const advantageColor = getAdvantageColor(friendlyAnswer, enemyAnswer);

      return (
        <Table.Tr key={`tactic-row-${index}`}>
          <Table.Td>{tactic.question}</Table.Td>
          <Table.Td>{friendlyAnswer}</Table.Td>
          <Table.Td>{enemyAnswer}</Table.Td>
          <Table.Td>
            <Tooltip
              label={tooltipLabel}
              withArrow
              position="right"
              color={advantageColor}
              z-index={200} 
              multiline // This enables the multiline feature
              w={220}
            >
              {/* This div is the critical fix for the ref warning */}
              <div>
                <FaInfoCircle style={{ cursor: 'pointer' }} color = {advantageColor}/>
              </div>
            </Tooltip>
          </Table.Td>
        </Table.Tr>
      );
    });
  };

  // const [isOpen, setIsOpen] = useState<boolean[]>(Array(engagements.length).fill(false));

  // const handleToggle = (index: number) => {
  //   setIsOpen(prev => {
  //     const newState = [...prev]; // Create a copy of isOpen array
  //     newState[index] = !newState[index]; // Toggle the state of the clicked row
  //     return newState;
  //   });
  // };

  // const row = engagements.map((rowData) => (
  //   <Table.Tr key={rowData.engagementid}>
  //     <Table.Td>{rowData.friendlyid}</Table.Td>
  //     <Table.Td>{rowData.engagementid}</Table.Td>
  //     <Table.Td>{rowData.friendlyid}</Table.Td>
  //     <Table.Td>
  //       <Progress.Root style={{ width: '600px', height: '50px' }}>
  //         <Progress.Section
  //           className={classes.progressSection}
  //           value={rowData.friendlytotalscore}
  //           color="#4e87c1">
  //         </Progress.Section>
  //       </Progress.Root>
  //     </Table.Td>
  //     <Table.Td>{rowData.enemyid}</Table.Td>
  //     <Table.Td>
  //       <Progress.Root style={{ width: '600px', height: '50px' }}>
  //         <Progress.Section
  //           className={classes.progressSection}
  //           value={rowData.enemytotalscore}
  //           color="#bd3058">
  //         </Progress.Section>
  //       </Progress.Root>
  //     </Table.Td>
  //   </Table.Tr>
  // ));


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
          <AppShell>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '45vh' }}>
              {engagements.length === 0 ? (<Title order={3} ta="center" c="gray">
                No engagements available for this section
              </Title>) : !selectedEngagement ? (<Title order={3} ta="center" c="gray">
                Select an engagement to view tactics
              </Title>) : (
                <Card shadow="sm" radius="md" withBorder style={{ overflow: 'visible', display: 'grid', height: '40vh', width: '600px', placeItems: 'center', marginBottom: '125px', marginTop: '100px', textAlign: 'center' }}>
                  <Card.Section >
                    <div style={{ textAlign: 'center' }}>
                      <h2 style={{ marginTop: 10 }}>Round ID: {selectedEngagement.engagementid}</h2>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 30 }}>
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
              {engagements.map((row, index) => ( 
                <Table.Tbody key={index}>
                  <Table.Tr key={row.engagementid} >
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
                      <Button className='.toggle-details' size="xs" onClick={() => setSelectedEngagement(row)}>
                        Show Engagement {/* {isOpen[index] ? 'Collapse' : 'Expand'} */}
                      </Button>
                    </Table.Td>
                  </Table.Tr>

                  <Table.Tr style={{ display: 'flex', justifyContent: 'center', width: '100%', marginLeft: '255%' }}>
                    {/* <Collapse in={isOpen[index]} style={{ width: '100%' }}>

                      <Table verticalSpacing={'xs'} style={{ maxWidth: '100%', width: '1000px' }} display={'fixed'}>
                        <Table.Thead>
                          <Table.Tr>
                            <Table.Th style={{ width: '1000px' }}>Tactic</Table.Th>
                            <Table.Th style={{ width: '250px', marginLeft: '100px' }}>Friendly Score</Table.Th>
                            <Table.Th style={{ width: '150px', marginLeft: '100px' }}>Enemy Score</Table.Th>
                          </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>{renderTacticsRows(tacticsMap.get(row.engagementid))}</Table.Tbody>
                      </Table>

                    </Collapse> */}
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

