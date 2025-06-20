/**
 * observerPage.tsx renders the primary observer dashboard, displaying overall 
 * engagement statistics and a detailed breakdown of active units by type.
 */

import '../App.css'; 
// Import necessary UI components from the Mantine library
import { AppShell, Image, Button, MantineProvider, SimpleGrid, Container, Text, Group, ThemeIcon, Box } from '@mantine/core';
// Import hooks from React and Mantine for state management and side effects
// import { useDisclosure } from '@mantine/hooks';
// Import useCallback along with other React hooks
import { useEffect, useState, useCallback } from 'react';
// Import tools for page navigation and accessing URL parameters
import { useNavigate, useParams } from 'react-router-dom';
// Import custom context to get user role and section information
import { useUserRole } from '../context/UserContext';
// Import a specific icon from the react-icons library
import { FaArrowAltCircleLeft } from "react-icons/fa";
// Import custom, reusable components for displaying stats
import { StatsSegments } from '../components/StatsSegments';
import { StatsRing } from '../components/StatsRing'; 
// Import assets and helper tools
import logo from '../images/logo/Tr_FullColor_NoSlogan.png';
import axios from 'axios';
import { Unit } from '../components/Cards';

// Defines the data structure for holding statistics for any group of units.
type UnitStats = {
  friendlyCount: number;
  enemyCount: number;
  friendlyKilled: number;
  enemyKilled: number;
};

// The main functional component for the Observer Page.
function ObserverPage() {
  // Hooks for managing UI state, navigation, and URL parameters
  // const [mobileOpened] = useDisclosure(false);
  // const [desktopOpened] = useDisclosure(false);
  const navigate = useNavigate();
  const { sectionId } = useParams();
  const { userRole, userSection } = useUserRole();

  // --- STATE MANAGEMENT ---
  // State to hold the aggregated statistics for ALL units in the engagement.
  const [totalStats, setTotalStats] = useState<UnitStats>({ friendlyCount: 0, enemyCount: 0, friendlyKilled: 0, enemyKilled: 0 });
  // State to hold an object where keys are unit types (e.g., 'infantry') and values are their corresponding stats.
  const [statsByType, setStatsByType] = useState<Record<string, UnitStats>>({});
  // State to manage the countdown timer
  const [countdown, setCountdown] = useState(10);

  // --- SIDE EFFECTS (HOOKS) ---

  // This effect handles authorization. It checks if the logged-in user is an 'Observer'
  // for the section specified in the URL. If not, it redirects them to the home page.
  useEffect(() => {
    if (userRole !== 'Observer' || userSection !== sectionId) {
      navigate('/');
    }
  }, [navigate, userRole, userSection, sectionId]);

  // A utility function to avoid repeating calculation logic.
  // It takes lists of friendly and enemy units and returns a calculated UnitStats object.
  const getStatsFromLists = (friendlyList: Unit[], enemyList: Unit[]): UnitStats => {
    const activeFriendlies = friendlyList.filter(unit => unit.unit_health > 0).length;
    const killedFriendlies = friendlyList.length - activeFriendlies;
    const activeEnemies = enemyList.filter(unit => unit.unit_health > 0).length;
    const killedEnemies = enemyList.length - activeEnemies;
    return { friendlyCount: activeFriendlies, enemyCount: activeEnemies, friendlyKilled: killedFriendlies, enemyKilled: killedEnemies };
  };
  
  // Wraped the data fetching logic in useCallback to prevent it from being redefined on every render.
  // This allows it to be used safely inside other useEffect hooks.
  const fetchUnitData = useCallback(async () => {
    if (!sectionId) return;

    try {
      const [friendlyRes, enemyRes] = await Promise.all([
        axios.get<Unit[]>(`${process.env.REACT_APP_BACKEND_URL}/api/units/sectionSort`, {params: { sectionid: userSection }}),
        axios.get<Unit[]>(`${process.env.REACT_APP_BACKEND_URL}/api/units/allEnemyUnits`, {params: { sectionid: userSection }})
      ]);
      const allFriendlies = friendlyRes.data;
      const allEnemies = enemyRes.data;

      const unitTypesToProcess = [
          { key: 'infantry', names: ['Infantry', 'Combined Arms'] },
          { key: 'armor', names: ['Armor Company'] },
          { key: 'specOps', names: ['Special Operations Forces', 'Special Operations Forces - EZO'] },
          { key: 'artillery', names: ['Field Artillery'] },
      ];
      
      const newStats: Record<string, UnitStats> = {};

      for (const typeInfo of unitTypesToProcess) {
        const friendliesOfType = allFriendlies.filter(u => typeInfo.names.includes(u.unit_type));
        const enemiesOfType = allEnemies.filter(u => typeInfo.names.includes(u.unit_type));
        newStats[typeInfo.key] = getStatsFromLists(friendliesOfType, enemiesOfType);
      }

      const definedTypes = unitTypesToProcess.flatMap(t => t.names);
      const logisticsFriendlies = allFriendlies.filter(u => !definedTypes.includes(u.unit_type));
      const logisticsEnemies = allEnemies.filter(u => !definedTypes.includes(u.unit_type));
      newStats['logistics'] = getStatsFromLists(logisticsFriendlies, logisticsEnemies);

      setTotalStats(getStatsFromLists(allFriendlies, allEnemies));
      setStatsByType(newStats);

    } catch (error) {
      console.error("Error fetching unit data:", error);
    }
  }, [sectionId, userSection]); // Dependencies for useCallback
  
  // This effect runs the initial data fetch when the component mounts.
  useEffect(() => {
    fetchUnitData();
  }, [fetchUnitData]);

  // Effect to manage the 15-second countdown timer.
  useEffect(() => {
    // Create an interval that runs every 1000 milliseconds (1 second).
    const interval = setInterval(() => {
      setCountdown(prevCountdown => {
        // When the countdown reaches 1, trigger a data fetch and reset to 10.
        if (prevCountdown <= 1) {
          fetchUnitData();
          return 10;
        }
        // Otherwise, just decrement the counter.
        return prevCountdown - 1;
      });
    }, 1000);

    // Cleanup function: This is crucial to prevent memory leaks.
    // It clears the interval when the component is unmounted.
    return () => clearInterval(interval);
  }, [fetchUnitData]); // This effect depends on fetchUnitData.

  // --- EVENT HANDLERS ---
  const handleLogoClick = () => navigate('/');
  const handleArrowClick = () => navigate('/');
  const handleAARClick = () => navigate(`/AAR/${sectionId}`);

  // --- RENDERED COMPONENT (JSX) ---
  return (
    <MantineProvider defaultColorScheme='dark'>
      <AppShell
        header={{ height: 60 }}
        padding="md"
      >
        {/* Render header */}
        <AppShell.Header>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Button size='sm' variant='link' onClick={handleArrowClick} style={{ margin: '10px' }}>
                <FaArrowAltCircleLeft />
              </Button>
              <Image src={logo} radius="md" h={50} onClick={handleLogoClick} style={{ cursor: 'pointer', scale: '1', padding: '8px' }} />
            </div>
          </div>
        </AppShell.Header>

        {/* Render everything other than header */}
        <AppShell.Main>
          {/* Use a Group with justify="space-between" to position update and AAR button on opposite ends */}
          <Group justify="space-between">
            <Text c="dimmed">Updating data in {countdown} seconds</Text>
            <Button 
              size='sm' 
              variant='link' 
              onClick={handleAARClick} 
              style={{ margin: '10px ' }}>
                After Action Reports
            </Button>
          </Group>
          
          {/* Observing section label */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              {sectionId && (<p>You are observing: <strong>{sectionId}</strong></p>)}
            </div>
          </div>
          
          {/* Main page stats */}
          <Container my="md" fluid>
            
            {/* Render the main statistics card for overall engagement numbers. */}
            <Container size="67%" p={0} style={{ marginBottom: 'var(--mantine-spacing-xl)' }}>
              <StatsSegments {...totalStats} />
            </Container>
            
            <Box>
              
              {/* Title */}
              <Text fz={35} fw={700} style={{ marginBottom: 'var(--mantine-spacing-md)' }}> 
                Active Units by Type
              </Text>
              
              {/* Render a grid of StatsRing components, one for each unit type, passing the calculated stats. */}
              <SimpleGrid
                cols={{ base: 1, sm: 2, md: 3, lg: 5 }}
                spacing="md"
              >
                <StatsRing 
                  title="Infantry" 
                  icon="infantry" 
                  friendlyCount={statsByType.infantry?.friendlyCount ?? 0} 
                  enemyCount={statsByType.infantry?.enemyCount ?? 0} 
                />
                <StatsRing 
                  title="Armor Company" 
                  icon="armor" 
                  friendlyCount={statsByType.armor?.friendlyCount ?? 0} 
                  enemyCount={statsByType.armor?.enemyCount ?? 0} 
                />
                <StatsRing 
                  title="Special Forces" 
                  icon="specOps" 
                  friendlyCount={statsByType.specOps?.friendlyCount ?? 0} 
                  enemyCount={statsByType.specOps?.enemyCount ?? 0} 
                />
                <StatsRing 
                  title="Artillery" 
                  icon="artillery" 
                  friendlyCount={statsByType.artillery?.friendlyCount ?? 0} 
                  enemyCount={statsByType.artillery?.enemyCount ?? 0} 
                />
                <StatsRing 
                title="Logistics" 
                icon="logistics" 
                friendlyCount={statsByType.logistics?.friendlyCount ?? 0} 
                enemyCount={statsByType.logistics?.enemyCount ?? 0}
                />
              </SimpleGrid>
            
              {/* Render the legend for the ring charts at the bottom. */}
              <Group justify="center" mb="lg" style={{ marginTop: 'var(--mantine-spacing-lg)' }}>
                {/* friendly units */}
                <Group gap="xs" align="center">
                    <ThemeIcon color="#3d85c6" size="md" radius="xl"/>
                    <Text size="md">
                      Active Friendly Units
                    </Text>
                </Group>
                {/* enemy units */}
                <Group gap="xs" align="center">
                  <ThemeIcon color="#c1432d" size="md" radius="xl" />
                  <Text size="md">
                    Active Enemy Units
                  </Text>
                </Group>
              </Group>

            </Box> {/* End box statement for rings section of page */}
          </Container> {/* End container statement for main stats section of page */}
        </AppShell.Main>
      </AppShell>
    </MantineProvider >
  );
}

export default ObserverPage;