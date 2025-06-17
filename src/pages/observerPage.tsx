/**
 * studentPage.tsx renders the student page where the students can view and start engagements with their units
 */
import '../App.css';
import { AppShell, Image, Button, MantineProvider, Grid } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUserRole } from '../context/UserContext';
import { FaArrowAltCircleLeft } from "react-icons/fa";
import { StatsSegments } from '../components/StatsSegments'; // Import the new component
import { StatsRingCard } from '../components/StatsRing';
import logo from '../images/logo/Tr_FullColor_NoSlogan.png';
import axios from 'axios';
import { Unit } from '../components/Cards';

// Function where the page renders
function ObserverPage() {
  const [mobileOpened] = useDisclosure(false);
  const [desktopOpened] = useDisclosure(false);
  const navigate = useNavigate();
  const { sectionId } = useParams();
  const { userRole, userSection } = useUserRole();

  // State to hold the counts
  const [friendlyCount, setFriendlyCount] = useState(0);
  const [enemyCount, setEnemyCount] = useState(0);
  const [killedCount, setKilledCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    if (userRole !== 'Observer' || userSection !== sectionId) {
      navigate('/');
    }
  }, [navigate, userRole, userSection, sectionId]);

  // useEffect to fetch data when the component mounts or sectionId changes
  useEffect(() => {
    const fetchUnitData = async () => {
      if (!sectionId) return;

      try {
        // Fetch friendly and enemy units in parallel
        const [friendlyRes, enemyRes] = await Promise.all([
          axios.get<Unit[]>(`${process.env.REACT_APP_BACKEND_URL}/api/units/sectionSort`, {params: { sectionid: userSection }}),
          axios.get<Unit[]>(`${process.env.REACT_APP_BACKEND_URL}/api/units/allEnemyUnits`, {params: { sectionid: userSection }})
        ]);
        
        const allFriendlies = friendlyRes.data;
        const allEnemies = enemyRes.data;
        console.log("ALL FRIENDLIES RECEIVED:", allFriendlies);
        console.log("ALL ENEMIES RECEIVED:", allEnemies);

        // 2. Calculate active units by filtering the results on the frontend.
        const activeFriendlies = allFriendlies.filter(unit => unit.unit_health > 0).length;
        const activeEnemies = allEnemies.filter(unit => unit.unit_health > 0).length;
        console.log("Active Friendly Count:", activeFriendlies);
        console.log("Active Enemy Count:", activeEnemies);

        // 3. Calculate killed units by subtracting active from total.
        const killedFriendlies = allFriendlies.length - activeFriendlies;
        const killedEnemies = allEnemies.length - activeEnemies;
        const totalKilled = killedFriendlies + killedEnemies;
        console.log("Killed Friendly Count:", killedFriendlies);
        console.log("Killed Enemy Count:", killedEnemies);
        console.log("TOTAL KILLED:", totalKilled);

        // 4. Set the state with the calculated values.
        setFriendlyCount(activeFriendlies);
        setEnemyCount(activeEnemies);
        setKilledCount(totalKilled);

      } catch (error) {
        console.error("Error fetching unit data:", error);
      }
    };

    fetchUnitData();
  }, [sectionId]);

  const handleLogoClick = () => {
    navigate('/'); // Navigate to the main login page
  };

  const handleArrowClick = () => {
    navigate('/');
  };

  const handleAARClick = () => {
    navigate(`/AAR/${sectionId}`);
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Button size='sm' variant='link' onClick={handleArrowClick} style={{ margin: '10px' }}>
                <FaArrowAltCircleLeft />
              </Button>
              <Image
                src={logo}
                radius="md"
                h={50}
                fallbackSrc="https://placehold.co/600x400?text=Placeholder"
                onClick={handleLogoClick}
                style={{ cursor: 'pointer', scale: '1', padding: '8px' }}
              />
            </div>
          </div>
        </AppShell.Header>

        <AppShell.Main>
          <div style={{ justifyContent: 'right', display: 'flex' }}>
            <Button size='sm' variant='link' onClick={handleAARClick} style={{ margin: '10px ' }}>After Action Reports</Button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              {sectionId && (
                <p>
                  You are observing: <strong>{sectionId}</strong>
                </p>
              )}
            </div>
          </div>
          <Grid>
            <Grid.Col span={12}>
              {/* Render the new component with the fetched data */}
              <StatsSegments
                friendlyCount={friendlyCount}
                enemyCount={enemyCount}
                killedCount={killedCount}
              />
               <StatsRingCard
                friendlyCount={friendlyCount}
                enemyCount={enemyCount}
                killedCount={killedCount}
              />
            </Grid.Col>
          </Grid>
        </AppShell.Main>
      </AppShell>
    </MantineProvider >
  );
}

export default ObserverPage;