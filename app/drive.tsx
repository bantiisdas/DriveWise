import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EventList } from '@/src/components/EventList';
import { ScoreGauge } from '@/src/components/ScoreGauge';
import { useDriveSession } from '@/src/hooks/useDriveSession';
import { formatDuration } from '@/src/utils/math';

export default function ActiveDriveScreen() {
  const router = useRouter();
  const { isActive, durationMs, events, score, rating, error, startDrive, endDrive } =
    useDriveSession();
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    startDrive();
  }, [startDrive]);

  const onEnd = () => {
    Alert.alert('End drive?', 'Sensors will stop and your summary will be saved.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'End Drive',
        style: 'destructive',
        onPress: async () => {
          const session = await endDrive();
          if (session) {
            router.replace(`/summary/${session.id}`);
          } else {
            router.replace('/');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-drive-bg" edges={['bottom']}>
      <View className="flex-1 px-5 pt-4">
        <View className="mb-2 flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <View className="h-2.5 w-2.5 rounded-full bg-drive-danger" />
            <Text className="text-sm font-semibold uppercase tracking-wider text-drive-danger">
              Recording
            </Text>
          </View>
          <Text className="font-mono text-xl text-white">
            {formatDuration(durationMs)}
          </Text>
        </View>

        {!isActive && !error ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#22c55e" size="large" />
            <Text className="mt-3 text-drive-muted">Starting sensors…</Text>
          </View>
        ) : (
          <>
            <View className="mb-6 mt-4 items-center">
              <ScoreGauge score={score} rating={rating} />
              <Text className="mt-2 text-sm text-drive-muted">
                {events.length} event{events.length === 1 ? '' : 's'} detected
              </Text>
            </View>

            {error ? (
              <View className="mb-4 rounded-xl border border-drive-warn/40 bg-drive-warn/10 px-3 py-3">
                <Text className="text-sm text-drive-warn">{error}</Text>
                <Text className="mt-1 text-xs text-drive-muted">
                  Emulators often lack sensors — use a physical device.
                </Text>
              </View>
            ) : null}

            <Text className="mb-2 text-sm font-semibold uppercase tracking-wider text-drive-muted">
              Live events
            </Text>
            <EventList events={events} maxHeight={260} />

            <View className="mt-auto pb-4 pt-6">
              <Pressable
                onPress={onEnd}
                className="items-center rounded-2xl bg-drive-danger px-6 py-4 active:opacity-90"
              >
                <Text className="text-lg font-bold text-white">End Drive</Text>
              </Pressable>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
