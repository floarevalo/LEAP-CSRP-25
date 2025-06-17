/**
 *  StatsRing.tsx renders the stats rings component 
 */

import { RingProgress, Text, SimpleGrid, Paper, Center, Group } from '@mantine/core';

interface StatsRingCardProps {
  friendlyCount: number;
  enemyCount: number;
  killedCount: number;
}

export function StatsRingCard({ friendlyCount, enemyCount, killedCount }: StatsRingCardProps) {
  // The total force is the sum of all units, which will represent 100%
  const totalInitialForce = friendlyCount + enemyCount + killedCount;

  // Calculate the percentage progress for each category
  const friendlyProgress = totalInitialForce > 0 ? (friendlyCount / totalInitialForce) * 100 : 0;
  const enemyProgress = totalInitialForce > 0 ? (enemyCount / totalInitialForce) * 100 : 0;
  const killedProgress = totalInitialForce > 0 ? (killedCount / totalInitialForce) * 100 : 0;

  // Structure the data to match the component's needs
  const data = [
    { label: 'Friendly Units', stats: friendlyCount.toString(), progress: friendlyProgress, color: '#3d85c6' },
    { label: 'Enemy Units', stats: enemyCount.toString(), progress: enemyProgress, color: '#c1432d' },
    { label: 'Units Killed', stats: killedCount.toString(), progress: killedProgress, color: 'grey' },
  ];

  const stats = data.map((stat) => (
    <Paper withBorder radius="md" p="xs" key={stat.label}>
      <Group>
        <RingProgress
          size={200}
          roundCaps
          thickness={17}
          sections={[{ value: stat.progress, color: stat.color }]}
          label={
            <Center>
              {/* Display the percentage in the center instead of an icon */}
              <Text size="xl" ta="center">
                {stat.progress.toFixed(0)}%
              </Text>
            </Center>
          }
        />

        <div>
          <Text c="dimmed" size="lg" tt="uppercase" fw={700}>
            {stat.label}
          </Text>
          <Text fw={700} size="xl">
            {stat.stats}
          </Text>
        </div>
      </Group>
    </Paper>
  ));

  return (
    <SimpleGrid cols={{ base: 1, sm: 3 }} mt="xl">
      {stats}
    </SimpleGrid>
  );
}