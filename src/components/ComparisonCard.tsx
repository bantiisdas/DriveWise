import { Text, View } from 'react-native';

type Props = {
  scoreDelta: number;
  eventDelta: number;
  hasPrevious: boolean;
};

function deltaLabel(value: number, invertGood = false): { text: string; color: string } {
  if (value === 0) return { text: '0', color: '#8b9bb4' };
  const good = invertGood ? value < 0 : value > 0;
  return {
    text: value > 0 ? `+${value}` : `${value}`,
    color: good ? '#22c55e' : '#ef4444',
  };
}

export function ComparisonCard({ scoreDelta, eventDelta, hasPrevious }: Props) {
  if (!hasPrevious) {
    return (
      <View className="rounded-2xl bg-drive-surface px-4 py-4">
        <Text className="text-sm text-drive-muted">
          Complete another drive to see historical comparison.
        </Text>
      </View>
    );
  }

  const score = deltaLabel(scoreDelta);
  const events = deltaLabel(eventDelta, true);

  return (
    <View className="rounded-2xl bg-drive-surface px-4 py-4">
      <Text className="mb-3 text-sm font-semibold text-white">
        vs previous drive
      </Text>
      <View className="flex-row gap-4">
        <View className="flex-1">
          <Text className="text-xs text-drive-muted">Score</Text>
          <Text className="text-xl font-bold" style={{ color: score.color }}>
            {score.text}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-xs text-drive-muted">Events</Text>
          <Text className="text-xl font-bold" style={{ color: events.color }}>
            {events.text}
          </Text>
        </View>
      </View>
    </View>
  );
}
