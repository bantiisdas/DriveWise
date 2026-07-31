import { Text, View } from 'react-native';

import { EVENT_LABELS, EVENT_TYPES } from '@/src/constants/thresholds';
import type { EventBreakdown } from '@/src/types/drive';

type Props = {
  breakdown: EventBreakdown;
  total: number;
};

const BAR_COLORS: Record<string, string> = {
  harsh_brake: '#ef4444',
  harsh_accel: '#f97316',
  sharp_turn: '#f59e0b',
  aggressive_steer: '#eab308',
  excessive_movement: '#38bdf8',
  phone_handling: '#a855f7',
};

export function EventBreakdownBars({ breakdown, total }: Props) {
  return (
    <View className="gap-3 rounded-2xl bg-drive-surface p-4">
      {EVENT_TYPES.map((type) => {
        const count = breakdown[type];
        const pct = total > 0 ? (count / total) * 100 : 0;
        return (
          <View key={type}>
            <View className="mb-1 flex-row items-center justify-between">
              <Text className="text-sm text-drive-muted">
                {EVENT_LABELS[type]}
              </Text>
              <Text className="text-sm font-semibold text-white">{count}</Text>
            </View>
            <View className="h-2 overflow-hidden rounded-full bg-drive-border">
              <View
                className="h-full rounded-full"
                style={{
                  width: `${Math.max(pct, count > 0 ? 6 : 0)}%`,
                  backgroundColor: BAR_COLORS[type],
                }}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}
