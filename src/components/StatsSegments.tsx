/**
 * StatsSegments.tsx renders a statistics card showing friendly vs. enemy 
 * force composition with progress bars and an active/killed summary.
 */

// Import Mantine components for UI layout and a specific icon from the Tabler library
import { IconSwords } from '@tabler/icons-react';
import { Box, Group, Paper, Progress, SimpleGrid, Text } from '@mantine/core';
import classes from './StatsSegments.module.css';

// Defines the props (properties) that this component accepts when it's used.
interface StatsSegmentsProps {
  friendlyCount: number;
  enemyCount: number;
  friendlyKilled: number;
  enemyKilled: number;
}

// The main function for the StatsSegments component.
// It accepts props and returns the JSX to be rendered.
export function StatsSegments({ friendlyCount, enemyCount, friendlyKilled, enemyKilled }: StatsSegmentsProps) {
  
  // --- CALCULATIONS ---
  // These calculations determine the width of each segment in the progress bars.
  
  // Calculate total friendly units to determine percentages.
  const totalFriendly = friendlyCount + friendlyKilled;
  const activeFriendlyPercent = totalFriendly > 0 ? (friendlyCount / totalFriendly) * 100 : 0;
  const killedFriendlyPercent = totalFriendly > 0 ? (friendlyKilled / totalFriendly) * 100 : 0;

  // Calculate total enemy units to determine percentages.
  const totalEnemy = enemyCount + enemyKilled;
  const activeEnemyPercent = totalEnemy > 0 ? (enemyCount / totalEnemy) * 100 : 0;
  const killedEnemyPercent = totalEnemy > 0 ? (enemyKilled / totalEnemy) * 100 : 0;

  // --- JSX HELPER FUNCTIONS ---

  // A helper function to create the JSX for the bottom description boxes.
  const createDescription = () => (
    <>
      <Box style={{ borderBottomColor: '#60acf7' }} className={classes.stat}>
        <Text c="dimmed" fz="lg">
          Friendly: Active / Killed
        </Text>
        <Group justify="space-between" align="flex-end" gap={0}>
          <Text c="blue" fz={30} fw={700} className={classes.statCount}>{`${friendlyCount} / ${friendlyKilled}`}</Text>
        </Group>
      </Box>

      <Box style={{ borderBottomColor: '#f4888a' }} className={classes.stat}>
        <Text c="dimmed" fz="lg">
          Enemy: Active / Killed
        </Text>
        <Group justify="space-between" align="flex-end" gap={0}>
          <Text c="red" fz={30} fw={700} className={classes.statCount}>{`${enemyCount} / ${enemyKilled}`}</Text>
        </Group>
      </Box>
    </>
  );

  // This variable holds the JSX for the two description boxes created by the helper function.
  const combinedDescriptions = createDescription();

  // Creates the JSX for the friendly progress bar's segments.
  // The 'map' function iterates over the two data points (active and killed).
  const friendlySegments = [
    { value: activeFriendlyPercent, color: '#3d85c6' },
    { value: killedFriendlyPercent, color: '#264363' },
  ].map((segment, index) => (
    <Progress.Section value={segment.value} color={segment.color} key={`friendly-${index}`}>
      {/* The percentage label is only shown if the segment is wide enough (> 10%). */}
      {segment.value > 10 && (
        <Progress.Label>
          {/* The text color is dimmed for the 'killed' segment (index 1) for visual clarity. */}
          <Text size="lg" fw={500} c={index === 1 ? '#0f1b28' : 'white'}>
            {segment.value.toFixed(0)}%
          </Text>
        </Progress.Label>
      )}
    </Progress.Section>
  ));

  // Creates the JSX for the enemy progress bar's segments, with the same logic as the friendly one.
  const enemySegments = [
    { value: activeEnemyPercent, color: '#c1432d' },
    { value: killedEnemyPercent, color: '#5c231a' },
  ].map((segment, index) => (
    <Progress.Section value={segment.value} color={segment.color} key={`enemy-${index}`}>
      {segment.value > 10 && (
        <Progress.Label>
          <Text size="lg" fw={500} c={index === 1 ? '#250e0a' : 'white'}>
            {segment.value.toFixed(0)}%
          </Text>
        </Progress.Label>
      )}
    </Progress.Section>
  ));


 // --- RENDERED COMPONENT (JSX) ---
 return (
    <Paper withBorder p= 'xl' radius="md">
      {/* The main title section of the card. */}
      <Group justify="space-between">
        <Text fz={35} fw={700}>
          Engagement Statistics
        </Text>
        <IconSwords size={28} stroke={1.5} />
      </Group>

      {/* Renders the friendly progress bar using the segments created above. */}
      <Text c="dimmed" fz="lg" mt="lg">
        Friendly Force Composition
      </Text>
      <Progress.Root size={50} mt='md'>
        {friendlySegments}
      </Progress.Root>

      {/* Renders the enemy progress bar using the segments created above. */}
      <Text c="dimmed" fz="lg" mt="lg">
        Enemy Force Composition
      </Text>
      <Progress.Root size={50} mt="md">
        {enemySegments}
      </Progress.Root>

      {/* Renders the "Active / Killed" summary in a 2-column grid at the bottom. */}
      <SimpleGrid cols={2} mt="xl">
        {combinedDescriptions}
      </SimpleGrid>

    </Paper>
  );
}