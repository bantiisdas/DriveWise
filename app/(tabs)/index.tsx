import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ScoreGauge } from '@/src/components/ScoreGauge';
import { getLatestSession } from '@/src/services/driveStorage';
import type { DriveSession } from '@/src/types/drive';
import { formatDateTime, formatDuration } from '@/src/utils/math';

export default function HomeScreen() {
  const router = useRouter();
  const [last, setLast] = useState<DriveSession | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getLatestSession().then((session) => {
        if (active) setLast(session);
      });
      return () => {
        active = false;
      };
    }, []),
  );

  return (
    <SafeAreaView className="flex-1 bg-drive-bg" edges={['bottom']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-10 pt-4"
      >
        <View className="mb-8">
          <Text className="text-4xl font-bold tracking-tight text-white">
            DriveWise
          </Text>
          <Text className="mt-2 text-base leading-6 text-drive-muted">
            Analyze driving behavior with device sensors and build a live
            safety score.
          </Text>
        </View>

        <Pressable
          onPress={() => router.push('/drive')}
          className="mb-8 items-center rounded-2xl bg-drive-accent px-6 py-5 active:opacity-90"
        >
          <Text className="text-lg font-bold text-drive-bg">Start Drive</Text>
          <Text className="mt-1 text-sm text-drive-bg/80">
            Sensors activate only during the session
          </Text>
        </Pressable>

        <View className="mb-4">
          <Text className="mb-3 text-sm font-semibold uppercase tracking-wider text-drive-muted">
            Last drive
          </Text>
          {last ? (
            <Pressable
              onPress={() => router.push(`/summary/${last.id}`)}
              className="items-center rounded-2xl bg-drive-surface px-4 py-6 active:opacity-90"
            >
              <ScoreGauge score={last.score} rating={last.rating} size="sm" />
              <View className="mt-4 w-full flex-row justify-between">
                <Text className="text-sm text-drive-muted">
                  {formatDateTime(last.startedAt)}
                </Text>
                <Text className="text-sm text-drive-muted">
                  {formatDuration(last.durationMs)} · {last.events.length} events
                </Text>
              </View>
            </Pressable>
          ) : (
            <View className="rounded-2xl bg-drive-surface px-4 py-8">
              <Text className="text-center text-sm text-drive-muted">
                No drives yet. Start your first session to see a score here.
              </Text>
            </View>
          )}
        </View>

        <View className="rounded-2xl border border-drive-border bg-drive-surface/60 px-4 py-4">
          <Text className="mb-2 text-sm font-semibold text-white">
            What we detect
          </Text>
          {[
            'Harsh braking & acceleration',
            'Sharp turns & aggressive steering',
            'Excessive device movement',
            'Possible phone handling while driving',
          ].map((item) => (
            <Text key={item} className="py-1 text-sm text-drive-muted">
              • {item}
            </Text>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
