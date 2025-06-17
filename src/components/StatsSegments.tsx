/**
 *  StatsSegments.tsx renders the stats segments component 
 */

import { IconDeviceAnalytics } from '@tabler/icons-react';
import { Box, Group, Paper, Progress, SimpleGrid, Text } from '@mantine/core';
import classes from './StatsSegments.module.css';

interface StatsSegmentsProps {
  friendlyCount: number; // Represents ACTIVE friendly units
  enemyCount: number;    // Represents ACTIVE enemy units
  killedCount: number;   // Represents ALL killed units
}

export function StatsSegments({ friendlyCount, enemyCount, killedCount }: StatsSegmentsProps) {
  // 1. The new total is the sum of all units: active and killed.
  const totalInitialForce = friendlyCount + enemyCount + killedCount;

  // 2. Percentages are now calculated based on this new grand total.
  const friendlyPart = totalInitialForce > 0 ? (friendlyCount / totalInitialForce) * 100 : 0;
  const enemyPart = totalInitialForce > 0 ? (enemyCount / totalInitialForce) * 100 : 0;
  const killedPart = totalInitialForce > 0 ? (killedCount / totalInitialForce) * 100 : 0;

  const data = [
    { label: 'Friendly Units', count: friendlyCount.toString(), part: friendlyPart, color: '#3d85c6' },
    { label: 'Enemy Units', count: enemyCount.toString(), part: enemyPart, color: '#c1432d' },
    { label: 'Units Killed', count: killedCount.toString(), part: killedPart, color: 'grey' },
  ];

  // 3. The .slice(0, 2) is removed to include all three data elements in the progress bar.
  const segments = data.map((segment) => (
    <Progress.Section value={segment.part} color={segment.color} key={segment.color}>
      {segment.part > 5 && <Progress.Label className={classes.progressLabel}>{segment.part.toFixed(0)}%</Progress.Label>}
    </Progress.Section>
  ));

  const descriptions = data.map((stat) => (
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

  return (
    <Paper withBorder p="xl" radius="md">
      <Group justify="space-between">
        <Text fz={30} fw={700}>
          Scenario Statistics
        </Text>
        <IconDeviceAnalytics size={28} className={classes.icon} stroke={1.5} />
      </Group>

      <Text c="dimmed" fz="lg">
        Composition of Total Force
      </Text>

      <Progress.Root size={50} mt={40}>
        {segments}
      </Progress.Root>
      
      <SimpleGrid cols={{ base: 1, xs: 3 }} mt="xl">
        {descriptions}
      </SimpleGrid>
    </Paper>
  );
}