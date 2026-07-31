import { Text, View } from 'react-native';

import { EVENT_LABELS } from '@/src/constants/thresholds';
import type { DriveEvent } from '@/src/types/drive';
import { formatClock, formatDuration } from '@/src/utils/math';

type Props = {
  events: DriveEvent[];
  startedAt: number;
};

export function EventTimeline({ events, startedAt }: Props) {
  if (events.length === 0) {
    return (
      <View className="items-center rounded-2xl bg-drive-surface px-4 py-8">
        <Text className="text-sm text-drive-muted">
          Clean drive — no events on the timeline
        </Text>
      </View>
    );
  }

  const sorted = [...events].sort((a, b) => a.timestamp - b.timestamp);

  return (
    <View className="rounded-2xl bg-drive-surface px-4 py-2">
      {sorted.map((event, index) => {
        const offset = formatDuration(event.timestamp - startedAt);
        const isLast = index === sorted.length - 1;
        return (
          <View key={event.id} className="flex-row">
            <View className="mr-3 w-10 items-center">
              <View className="mt-1.5 h-2.5 w-2.5 rounded-full bg-drive-accent" />
              {!isLast && <View className="mt-1 w-0.5 flex-1 bg-drive-border" />}
            </View>
            <View className={`flex-1 pb-4 ${isLast ? 'pb-2' : ''}`}>
              <Text className="text-xs text-drive-muted">
                +{offset} · {formatClock(event.timestamp)}
              </Text>
              <Text className="text-sm font-medium text-white">
                {EVENT_LABELS[event.type]}
              </Text>
              <Text className="text-xs text-drive-danger">
                −{event.pointsDeducted} pts
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
