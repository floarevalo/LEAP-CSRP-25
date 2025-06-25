/**
 * studentPage.tsx renders the student page where the students can view and start engagements with their units
 */
import '../App.css';
import CarouselC from '../components/carousel'; // Remove the '.tsx' extension
import SearchResultList from '../components/searchResults'
import { AppShell, Group, Image, TextInput, Button, MantineProvider, SegmentedControl, Card, Progress, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useState, useEffect, SetStateAction } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUserRole } from '../context/UserContext';
import { useUnitProvider } from '../context/UnitContext';
import { FaArrowAltCircleLeft } from "react-icons/fa";
import logo from '../images/logo/Tr_FullColor_NoSlogan.png'
import { Unit } from '../components/Cards';
import axios from 'axios';

interface UnitStatsProps {
  friendlyCount: number;
  enemyCount: number;
}

function UnitStats({ friendlyCount, enemyCount }: UnitStatsProps) {
  const totalCount = friendlyCount + enemyCount;

  if (totalCount === 0) {
    return null; // Don't render anything if there are no units
  }

  return (
    <Card withBorder radius="md" padding="xl" bg="var(--mantine-color-body)" my="xl">
      <Text fz="xs" tt="uppercase" fw={700} c="dimmed">
        Active Units
      </Text>
      
      {/* Friendly Units Progress */}
      <Text fz="lg" fw={500} mt="sm">
        Friendly: {friendlyCount}
      </Text>
      <Progress value={(friendlyCount / totalCount) * 100} size="lg" radius="xl" color="#3d85c6" />

      {/* Enemy Units Progress */}
      <Text fz="lg" fw={500} mt="lg">
        Enemy: {enemyCount}
      </Text>
      <Progress value={(enemyCount / totalCount) * 100} size="lg" radius="xl" color="#c1432d" />
    </Card>
  );
}

// Function where the page renders
function App() {
  const [mobileOpened] = useDisclosure(false);
  const [desktopOpened] = useDisclosure(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { sectionId } = useParams(); // Retrieve sectionId from route parameters
  const { userRole, userSection } = useUserRole();
  const { selectedUnit } = useUnitProvider();
  const [view, setView] = useState('Unit Selection');
  const [friendlyUnits, setFriendlyUnits] = useState<Unit[]>([]);
  const [enemyUnits, setEnemyUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Redirects to the home page if the user is not a 'Student' or if their section ID does not match the current section ID.
  useEffect(() => {
  //  if (!userRole || !userSection || !sectionId) return; //waits for user data before authenticating
    if (userRole !== 'Student' || userSection !== sectionId) {
      console.log(`user Role: ${userRole}`);
      console.log(`user section: ${sectionId}`);
      console.trace('redirect to landing page');
      navigate('/');
    }
  }, [navigate, userRole, userSection, sectionId]);

  useEffect(() => {
    // Don't fetch if we don't have the userSection yet
    if (!userSection) return;

    const fetchAllUnitData = async () => {
      setIsLoading(true);
      try {
        // Create promises for both API calls
        const friendlyPromise = axios.get<Unit[]>(`${process.env.REACT_APP_BACKEND_URL}/api/units/sectionSort`, {
          params: { sectionid: userSection }
        });
        const enemyPromise = axios.get<Unit[]>(`${process.env.REACT_APP_BACKEND_URL}/api/units/enemyUnits`, {
          params: { sectionid: userSection }
        });

        // Wait for both promises to resolve
        const [friendlyResponse, enemyResponse] = await Promise.all([friendlyPromise, enemyPromise]);

        // Set the state with the data from the responses
        setFriendlyUnits(friendlyResponse.data);
        setEnemyUnits(enemyResponse.data);

      } catch (error) {
        console.error('Error fetching unit data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllUnitData();
  }, [userSection]); // Dependency: re-fetch if the userSection changes

//live updates
  useEffect(() => {
    if (!userSection) return;

    const eventSource = new EventSource(`${process.env.REACT_APP_BACKEND_URL}/events`);

    eventSource.onmessage = (event) => {
      const newUnit = JSON.parse(event.data);

      if (newUnit.section_id !== userSection) {
        return; // Ignore units from other sections
      }

      if (newUnit.is_friendly) {
      // Update friendly units
        setFriendlyUnits(prev => {
        // Avoid duplicates
          const exists = prev.some(unit => unit.unit_id === newUnit.unit_id);
          return exists ? prev : [...prev, newUnit];
        });
      } else {
      // Update enemy units
        setEnemyUnits(prev => {
          const exists = prev.some(unit => unit.unit_id === newUnit.unit_id);
          return exists ? prev : [...prev, newUnit];
        });
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE connection error:', err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [userSection]);

    



  const handleViewChange = (value: SetStateAction<string>) => {
    setView(value);
    if (value === 'After Action Reviews') {
      handleAARClick();
    }
  };

  // Updates the search state with the value from the input field
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setSearch(value);
  }

  // Navigate to the main login page
  const handleLogoClick = () => {
    navigate('/'); // Navigate to the main login page
  };

  // Navigate to the main login page
  const handleArrowClick = () => {
    navigate('/');
  };

  // Navigate to the After Action Reports page for the current section
  const handleAARClick = () => {
    navigate(`/AAR/${sectionId}`)
  }

  // Where student page renders
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
        {/* Header / Nav bar  */}
        <AppShell.Header>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {/* Back button */}
              <Button size='sm' variant='link' onClick={handleArrowClick} style={{ margin: '10px' }}>
                <FaArrowAltCircleLeft />
              </Button>
              {/* Clickable logo that takes user back to homepage */}
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

        {/* Everything that isn't the header / nav bar */}
        <AppShell.Main>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              {sectionId && (
                <h1>
                  Scenerio: <strong>{sectionId}</strong>
                </h1>
              )}
            </div>

            <SegmentedControl
              value={view}
              onChange={handleViewChange}
              data={[
                { label: 'Unit Selection', value: 'Unit Selection' },
                { label: 'After Action Reviews', value: 'After Action Reviews' }
              ]}
              size='md'
              style={{ margin: 15 }}
            />
          </div>

          <div style={{ width: '250px' }}>
            {/* Unit Search Bar */}
            <TextInput
              placeholder='Search'
              style={{ width: '100%' }}
              value={search}
              onChange={handleChange}
            />
          </div>

          {/* This renders the new stats component after loading is done */}
          {!isLoading && (
            <UnitStats
              friendlyCount={friendlyUnits.filter(unit => unit.unit_health > 0).length}
              enemyCount={enemyUnits.length}
            />
          )}

          <div className="App">
            {/* This shows a loading message OR the carousel/search results */}
            {isLoading ? (
              <Text>Loading units...</Text>
            ) : (
              <>
                {search ? (
                  <SearchResultList search={search} />
                ) : (
                  <CarouselC units={friendlyUnits} />
                )}
                <Group justify='center'>
                  <Button
                    disabled={!selectedUnit || selectedUnit.unit_health <= 0}
                    size='compact-xl'
                    onClick={() => navigate(`/battlePage`)}
                    style={{ margin: '30px' }}
                  >
                    Select for Engagement
                  </Button>
                </Group>
              </>
            )}
          </div>
        </AppShell.Main>
      </AppShell>
    </MantineProvider >
  ); // End of return statement
}

export default App;
