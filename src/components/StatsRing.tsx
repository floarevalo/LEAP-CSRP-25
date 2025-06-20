/**
 * StatsRing.tsx renders a modular stats ring component for a specific unit type.
 * It displays a concentric ring chart and numerical counts for friendly vs. enemy units.
 */

// Import Mantine components for UI layout and the chart itself
import { RingProgress, Text, Paper, Center, Group, Box } from '@mantine/core';
// Import specific icons from the Tabler library to be used in the chart
import { IconChess, IconTank, IconSpade, IconBomb, IconSwords, IconError404 } from '@tabler/icons-react';

// Defines the props (properties) that this component accepts when it's used.
interface StatsRingProps {
  title: string;          // The title to display at the top of the card (e.g., "Infantry").
  friendlyCount: number;  // The number of active friendly units.
  enemyCount: number;     // The number of active enemy units.
  icon: string;           // A string key to look up which icon to display.
}

// This object acts as a lookup map to connect a string identifier (e.g., 'infantry')
// to a renderable React icon component (e.g., IconChess). This is necessary
// because you cannot render a component directly from a string name in JSX.
const iconMap: Record<string, React.ElementType> = {
  infantry: IconChess,
  armor: IconTank,
  specOps: IconSpade,
  artillery: IconBomb,
  misc: IconSwords,
};

// The main function for the StatsRing component. It receives props and returns the JSX to be rendered.
export function StatsRing({ title, friendlyCount, enemyCount, icon }: StatsRingProps) {
  
  // --- CALCULATIONS ---
  const totalUnits = friendlyCount + enemyCount; // Calculate the total number of active units to determine percentages.
  const friendlyPercent = totalUnits > 0 ? (friendlyCount / totalUnits) * 100 : 0; // Calculate the percentage of total units that are friendly, to determine how "full" the blue ring should be.
  const enemyPercent = totalUnits > 0 ? (enemyCount / totalUnits) * 100 : 0; // Calculate the percentage for enemy units for the red ring.
  
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
            sections={[{ value: enemyPercent, color: '#c1432d' }]}
            style={{ position: 'absolute', top: 0, left: 0 }}
          />
          {/* The inner, smaller ring for friendly units. It is offset to appear centered within the outer ring. */}
          <RingProgress
            size={114}
            thickness={14}
            roundCaps
            sections={[{ value: friendlyPercent, color: '#3d85c6' }]}
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
        <Box ta="center">
          <Text c="blue" fz={26} fw={700}>{friendlyCount}</Text>
          <Text size="sm" c="dimmed">FRIENDLY</Text>
        </Box>
        <Box ta="center">
          <Text c="red" fz={26} fw={700}>{enemyCount}</Text>
          <Text size="sm" c="dimmed">ENEMY</Text>
        </Box>
      </Group>
    </Paper>
  );
}