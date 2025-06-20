/**
 *  StatsSegments.tsx renders the stats segments component 
 */

import { IconDeviceAnalytics } from '@tabler/icons-react';
import { Box, Group, Paper, Progress, SimpleGrid, Text } from '@mantine/core';
import classes from './StatsSegments.module.css';

// Define the shape of the data objects for clarity
interface StatItem {
  label: string;
  count: string;
  part: number;
  color: string;
}

// 1. Ensure the props interface includes the optional 'title'
interface StatsSegmentsProps {
  title?: string;
  size?: 'lg' | 'sm'; // 'lg' for large, 'sm' for small text 
  showLabel?: boolean; // New prop to control bottom label visibility
  friendlyCount: number;
  enemyCount: number;
  friendlyKilled: number;
  enemyKilled: number;
}

// 2. Ensure the function accepts the 'title' prop and sets a default value
export function StatsSegments({ title = "Engagement Statistics", size = 'lg', showLabel = true, friendlyCount, enemyCount, friendlyKilled, enemyKilled }: StatsSegmentsProps) {
  // All calculation logic remains the same
  const totalFriendly = friendlyCount + friendlyKilled;
  const activeFriendlyPercent = totalFriendly > 0 ? (friendlyCount / totalFriendly) * 100 : 0;
  const killedFriendlyPercent = totalFriendly > 0 ? (friendlyKilled / totalFriendly) * 100 : 0;

  const totalEnemy = enemyCount + enemyKilled;
  const activeEnemyPercent = totalEnemy > 0 ? (enemyCount / totalEnemy) * 100 : 0;
  const killedEnemyPercent = totalEnemy > 0 ? (enemyKilled / totalEnemy) * 100 : 0;

  const friendlyData: StatItem[] = [
    { label: 'Active Friendly', count: friendlyCount.toString(), part: activeFriendlyPercent, color: '#3d85c6' },
    { label: 'Killed Friendly', count: friendlyKilled.toString(), part: killedFriendlyPercent, color: '#16283b' },
  ];

  const enemyData: StatItem[] = [
    { label: 'Active Enemy', count: enemyCount.toString(), part: activeEnemyPercent, color: '#c1432d' },
    { label: 'Killed Enemy', count: enemyKilled.toString(), part: killedEnemyPercent, color: '#37150f' },
  ];

  const createDescription = (statsArray: StatItem[]) => statsArray.map((stat) => (
    <Box key={stat.label} style={{ borderBottomColor: stat.color }} className={classes.stat}>
      <Text tt="uppercase" fz="sm" c="dimmed" fw={700}>
        {stat.label}
      </Text>
      <Group justify="space-between" align="flex-end" gap={0}>
        <Text fw={700} className={classes.statCount}>{stat.count}</Text>
        <Text c={stat.color} fw={700} size="xl">
          {stat.part.toFixed(0)}%
        </Text>
      </Group>
    </Box>
  ));

  const friendlySegments = friendlyData.map((segment) => (
    <Progress.Section value={segment.part} color={segment.color} key={segment.label}>
      {segment.part > 10 && <Progress.Label className={classes.progressLabel}>{segment.part.toFixed(0)}%</Progress.Label>}
    </Progress.Section>
  ));
  const friendlyDescriptions = createDescription(friendlyData);

  const enemySegments = enemyData.map((segment) => (
    <Progress.Section value={segment.part} color={segment.color} key={segment.label}>
      {segment.part > 10 && <Progress.Label className={classes.progressLabel}>{segment.part.toFixed(0)}%</Progress.Label>}
    </Progress.Section>
  ));
  const enemyDescriptions = createDescription(enemyData);


 return (
    // 3. Use the size prop to conditionally change padding
    <Paper withBorder p={size === 'lg' ? 'xl' : 'md'} radius="md">
      <Group justify="space-between">
        {/* 3. Use the size prop to conditionally change font size */}
        <Text fz={size === 'lg' ? 30 : 20} fw={700}>
          {title}
        </Text>
        <IconDeviceAnalytics size={28} className={classes.icon} stroke={1.5} />
      </Group>

      {size === 'lg' && (
        <Text c="dimmed" fz="lg" mt="xl">
          Friendly Force Composition
        </Text>
      )}
      <Progress.Root
        size={size === 'lg' ? 50 : 30}
        mt='md'
      >
        {friendlySegments}
      </Progress.Root>

      {/* Conditionally render the "Enemy Force Composition" label only for the large version */}
      {size === 'lg' && (
        <Text c="dimmed" fz="lg" mt="xl">
          Enemy Force Composition
        </Text>
      )}
      <Progress.Root size={size === 'lg' ? 50 : 30} mt="md">
        {enemySegments}
      </Progress.Root>

      {/* 2. All four description boxes are now in a single grid below */}
      {showLabel && (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} mt="xl">
          {friendlyDescriptions}
          {enemyDescriptions}
        </SimpleGrid>
      )}
    </Paper>
  );
}