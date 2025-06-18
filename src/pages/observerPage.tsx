/**
 * observerPage.tsx renders the observer page where the students can see a big picture view of the engagements and how well each side is doing, including a breakdown by unit type.
 */
import '../App.css';
import { AppShell, Image, Button, MantineProvider, Grid, SimpleGrid, Container, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUserRole } from '../context/UserContext';
import { FaArrowAltCircleLeft } from "react-icons/fa";
import { StatsSegments } from '../components/StatsSegments';
import logo from '../images/logo/Tr_FullColor_NoSlogan.png';
import axios from 'axios';
import { Unit } from '../components/Cards';

// Define a type for our stats objects to keep them consistent
type UnitStats = {
  friendlyCount: number;
  enemyCount: number;
  friendlyKilled: number;
  enemyKilled: number;
};

// Function where the page renders
function ObserverPage() {
  const [mobileOpened] = useDisclosure(false);
  const [desktopOpened] = useDisclosure(false);
  const navigate = useNavigate();
  const { sectionId } = useParams();
  const { userRole, userSection } = useUserRole();

  const [totalStats, setTotalStats] = useState<UnitStats>({ friendlyCount: 0, enemyCount: 0, friendlyKilled: 0, enemyKilled: 0 });
  const [statsByType, setStatsByType] = useState<Record<string, UnitStats>>({});

  useEffect(() => {
    if (userRole !== 'Observer' || userSection !== sectionId) {
      navigate('/');
    }
  }, [navigate, userRole, userSection, sectionId]);

  // Helper function to calculate stats from a given list of units
  const getStatsFromLists = (friendlyList: Unit[], enemyList: Unit[]): UnitStats => {
    const activeFriendlies = friendlyList.filter(unit => unit.unit_health > 0).length;
    const killedFriendlies = friendlyList.length - activeFriendlies;
    const activeEnemies = enemyList.filter(unit => unit.unit_health > 0).length;
    const killedEnemies = enemyList.length - activeEnemies;
    return { friendlyCount: activeFriendlies, enemyCount: activeEnemies, friendlyKilled: killedFriendlies, enemyKilled: killedEnemies };
  };
  
  // useEffect to fetch and process all data
  useEffect(() => {
    const fetchUnitData = async () => {
      if (!sectionId) return;

      try {
        const [friendlyRes, enemyRes] = await Promise.all([
          axios.get<Unit[]>(`${process.env.REACT_APP_BACKEND_URL}/api/units/sectionSort`, {params: { sectionid: userSection }}),
          axios.get<Unit[]>(`${process.env.REACT_APP_BACKEND_URL}/api/units/allEnemyUnits`, {params: { sectionid: userSection }})
        ]);
        
        const allFriendlies = friendlyRes.data;
        const allEnemies = enemyRes.data;

        const unitTypesToProcess = [
            { key: 'armor', name: 'Armor Company' },
            { key: 'specOps', name: 'Special Operations Forces' },
            { key: 'infantry', name: 'Infantry' },
            { key: 'artillery', name: 'Field Artillery' },
        ];
        
        const newStats: Record<string, UnitStats> = {};

        for (const typeInfo of unitTypesToProcess) {
            const friendliesOfType = allFriendlies.filter(u => u.unit_type === typeInfo.name);
            const enemiesOfType = allEnemies.filter(u => u.unit_type === typeInfo.name);
            newStats[typeInfo.key] = getStatsFromLists(friendliesOfType, enemiesOfType);
        }

        const definedTypes = unitTypesToProcess.map(t => t.name);
        const miscFriendlies = allFriendlies.filter(u => !definedTypes.includes(u.unit_type));
        const miscEnemies = allEnemies.filter(u => !definedTypes.includes(u.unit_type));
        newStats['misc'] = getStatsFromLists(miscFriendlies, miscEnemies);

        setTotalStats(getStatsFromLists(allFriendlies, allEnemies));
        setStatsByType(newStats);

      } catch (error) {
        console.error("Error fetching unit data:", error);
      }
    };

    fetchUnitData();
  }, [sectionId, userSection]);

  const handleLogoClick = () => navigate('/');
  const handleArrowClick = () => navigate('/');
  const handleAARClick = () => navigate(`/AAR/${sectionId}`);

  // --- THIS IS THE MISSING PIECE ---
  // Helper component to render each item in the 2x2 grid.
  // Place it inside the ObserverPage component, before the return statement.
  const StatsGridItem = ({ title, stats }: { title: string; stats: UnitStats | undefined }) => (
    <StatsSegments 
      title={title} // This line ensures the title is passed down.
      size="sm" // Pass "sm" to make the grid components smaller
      showLabel = {false}
      friendlyCount={stats?.friendlyCount ?? 0}
      enemyCount={stats?.enemyCount ?? 0}
      friendlyKilled={stats?.friendlyKilled ?? 0}
      enemyKilled={stats?.enemyKilled ?? 0}
    />
  );

  return (
    <MantineProvider defaultColorScheme='dark'>
      <AppShell
        header={{ height: 60 }}
        padding="md"
      >
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

        <AppShell.Main>
          <div style={{ justifyContent: 'right', display: 'flex' }}>
            <Button size='sm' variant='link' onClick={handleAARClick} style={{ margin: '10px ' }}>After Action Reports</Button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              {sectionId && (<p>You are observing: <strong>{sectionId}</strong></p>)}
            </div>
          </div>
          
          <Container my="md" fluid>
            {/* 1. Overall Scenario Statistics on top, taking the 2/3 width */}
            <Container size="67%" p={0} style={{ marginBottom: 'var(--mantine-spacing-xl)' }}>
              <div style={{ marginBottom: 'var(--mantine-spacing-xl)' }}>
                <StatsSegments {...totalStats} />
              </div>
            </Container>
            {/* 2. Unit Type breakdown below in a responsive 4-column grid */}
            <Text fz="h2" mb="md">Engagement Statistics by Unit Type</Text>
            <SimpleGrid
              cols={{ base: 1, sm: 2 }}
              spacing="md"
            >
              <StatsGridItem title="Infantry Units" stats={statsByType.infantry} />
              <StatsGridItem title="Armor Company Units" stats={statsByType.armor} />
              <StatsGridItem title="Special Operations Forces Units" stats={statsByType.specOps} />
              <StatsGridItem title="Artillery Units" stats={statsByType.artillery} />
            </SimpleGrid>

          </Container>

        </AppShell.Main>
      </AppShell>
    </MantineProvider >
  );
}

export default ObserverPage;