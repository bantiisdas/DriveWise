import { Text, View } from 'react-native';

import { EVENT_LABELS } from '@/src/constants/thresholds';
import type { DriveEvent } from '@/src/types/drive';
import { formatClock } from '@/src/utils/math';

type Props = {
  event: DriveEvent;
  compact?: boolean;
};

const TYPE_COLORS: Record<string, string> = {
  harsh_brake: '#ef4444',
  harsh_accel: '#f97316',
  sharp_turn: '#f59e0b',
  aggressive_steer: '#eab308',
  excessive_movement: '#38bdf8',
  phone_handling: '#a855f7',
};

export function EventRow({ event, compact }: Props) {
  const color = TYPE_COLORS[event.type] ?? '#8b9bb4';

  return (
    <View
      className={`flex-row items-center justify-between border-b border-drive-border ${
        compact ? 'py-2' : 'py-3'
      }`}
    >
      <View className="flex-1 flex-row items-center gap-3">
        <View
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: color }}
        />
        <View className="flex-1">
          <Text className="text-sm font-medium text-white">
            {EVENT_LABELS[event.type]}
          </Text>
          {!compact && (
            <Text className="text-xs text-drive-muted">
              {formatClock(event.timestamp)}
            </Text>
          )}
        </View>
      </View>
      <Text className="text-sm font-semibold" style={{ color: '#ef4444' }}>
        -{event.pointsDeducted}
      </Text>
    </View>
  );
}
