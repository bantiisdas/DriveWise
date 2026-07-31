import { ScrollView, Text, View } from 'react-native';

import { EventRow } from '@/src/components/EventRow';
import type { DriveEvent } from '@/src/types/drive';

type Props = {
  events: DriveEvent[];
  emptyLabel?: string;
  maxHeight?: number;
  reverse?: boolean;
};

export function EventList({
  events,
  emptyLabel = 'No events detected yet',
  maxHeight = 280,
  reverse = true,
}: Props) {
  const list = reverse ? [...events].reverse() : events;

  if (list.length === 0) {
    return (
      <View className="items-center rounded-2xl bg-drive-surface px-4 py-8">
        <Text className="text-sm text-drive-muted">{emptyLabel}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="rounded-2xl bg-drive-surface px-4"
      style={{ maxHeight }}
      nestedScrollEnabled
    >
      {list.map((event) => (
        <EventRow key={event.id} event={event} />
      ))}
    </ScrollView>
  );
}
