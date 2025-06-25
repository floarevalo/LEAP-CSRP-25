/**
 * StatsRing.tsx renders a modular stats ring component for a specific unit type.
 * It displays a concentric ring chart and numerical counts for friendly vs. enemy units.
 */

// Import Mantine components for UI layout and the chart itself
import { RingProgress, Text, Paper, Center, Group, Box, Tooltip } from '@mantine/core';
// Import specific icons from the Tabler library to be used in the chart
import { IconChess, IconTank, IconSpade, IconBomb, IconWorldShare, IconError404 } from '@tabler/icons-react';

import type { UnitStats } from '../pages/observerPage';


// Defines the props (properties) that this component accepts when it's used.
interface StatsRingProps {
  title: string;          // The title to display at the top of the card (e.g., "Infantry").
  friendlyCount: number;  // The number of active friendly units.
  enemyCount: number;     // The number of active enemy units.
  icon: string;
  statsBySize: Record<string, UnitStats>; // Stats breakdown by unit size.
}

// This object acts as a lookup map to connect a string identifier (e.g., 'infantry')
// to a renderable React icon component (e.g., IconChess). This is necessary
// because you cannot render a component directly from a string name in JSX.
const iconMap: Record<string, React.ElementType> = {
  infantry: IconChess,
  armor: IconTank,
  specOps: IconSpade,
  artillery: IconBomb,
  logistics: IconWorldShare,
};

// Ring color settings for friendly units, grouped by size
export const friendlySizeColors: Record<string, string> = {
  'Squad/Team': '#66d9ff',
  'Company/Battery': '#339af0',
  'Battalion': '#1c7ed6',
  'Brigade/Regiment': '#103b70',
};

// Ring color settings for enemy units, grouped by size
export const enemySizeColors: Record<string, string> = {
  'Squad/Team': '#ff6b6b',
  'Company/Battery': '#ff4d4d',
  'Battalion': '#e03131',
  'Brigade/Regiment': '#a11111',
};


// The main function for the StatsRing component. It receives props and returns the JSX to be rendered.
export function StatsRing({ title, friendlyCount, enemyCount, icon, statsBySize }: StatsRingProps) {

  // --- CALCULATIONS ---
  const totalUnits = friendlyCount + enemyCount; // Calculate the total number of active units to determine percentages.

  // Breakdown sections for each size category – used to create the segmented ring visuals
  const friendlySections = Object.entries(statsBySize).map(([size, stat], index) => ({
    value: friendlyCount > 0 ? (stat.friendlyCount / totalUnits) * 100 : 0,
    color: friendlySizeColors[size],
  }));

  const enemySections = Object.entries(statsBySize).map(([size, stat], index) => ({
    value: enemyCount > 0 ? (stat.enemyCount / totalUnits) * 100 : 0,
    color: enemySizeColors[size] ?? '#ccc',
  }));

  // Select the correct icon component from the map based on the 'icon' prop.
  // If no match is found in the map, use IconError404 as a safe fallback.
  const IconComponent = iconMap[icon] || IconError404;

  // --- RENDERED COMPONENT (JSX) ---
  return (
    <Paper withBorder p="md" radius="md" style={{ height: '100%' }}>
      {/* Display the title that was passed into the component. */}
      <Text ta="center" fz={28} fw={500}>
        {title}
      </Text>

      {/* A group to center the rings within the card. */}
      <Group justify="center" mt="md">
        {/* This Box is the container for the concentric rings. */}
        {/* 'position: relative' allows us to stack the rings inside it using absolute positioning. */}
        <Box style={{ width: 150, height: 150, position: 'relative' }}>
          {/* The outer ring, representing enemy units. */}
          <RingProgress
            size={150}
            thickness={14}
            roundCaps
            sections={enemySections}
            style={{ position: 'absolute', top: 0, left: 0 }}
          />
          {/* The inner, smaller ring for friendly units. It is offset to appear centered within the outer ring. */}
          <RingProgress
            size={114}
            thickness={14}
            roundCaps
            sections={friendlySections}
            style={{ position: 'absolute', top: 18, left: 18 }}
          />
          {/* This renders the dynamically chosen icon in the very center of the rings. */}
          <Center style={{ width: '100%', height: '100%' }}>
            <IconComponent size={28} stroke={1.5} />
          </Center>
        </Box>
      </Group>

      {/* This section displays the raw numerical counts for each faction below the rings. */}
      <Group justify="space-around" mt="md">
        {/* FRIENDLY COUNT WITH TOOLTIP */}
        <Box ta="center">
          <Tooltip
            label={
              <Box>
                {friendlyCount > 0 && friendlyCount ? (Object.entries(statsBySize).map(([label, stat]) =>
                  stat.friendlyCount > 0 ? (
                    <Text fz={16} fw={600} key={`f-${label}`}>
                      {label}: {stat.friendlyCount}
                    </Text>
                  ) : null
                )) : (
                  <Text fz={16} fw={600} >
                    No Friendly Units Detected
                  </Text>
                )}
              </Box>
            }
            withArrow
            multiline
            styles={{
              tooltip: {
                backgroundColor: '#1E2A3A',
                color: 'white',
                fontSize: '20px',
              },
            }}   // ✅ Correct way
          >
            <Text c="blue" fz={26} fw={700} style={{ cursor: 'pointer' }}>
              {friendlyCount}
            </Text>
          </Tooltip>
          <Text size="sm" c="dimmed">FRIENDLY</Text>
        </Box>

        {/* ENEMY COUNT WITH TOOLTIP */}
        <Box ta="center">
          <Tooltip
            label={
              <Box>
                {enemyCount && enemyCount > 0 ? (
                  Object.entries(statsBySize).map(([label, stat]) =>
                    stat.enemyCount > 0 ? (
                      <Text fz={16} fw={600} key={`e-${label}`}>
                        {label}: {stat.enemyCount}
                      </Text>
                    ) : null
                  )
                ) : (
                  <Text fz={16} fw={600} >
                    No Enemy Units Detected
                  </Text>
                )}
              </Box>
            }
            withArrow
            multiline
            styles={{
              tooltip: {
                backgroundColor: '#3A1E1E',
                color: 'white',
                fontSize: '20px',
              },
            }}
          >
            <Text c="red" fz={26} fw={700} style={{ cursor: 'pointer' }}>
              {enemyCount}
            </Text>
          </Tooltip>
          <Text size="sm" c="dimmed">ENEMY</Text>
        </Box>
      </Group>



    </Paper>

  );
}