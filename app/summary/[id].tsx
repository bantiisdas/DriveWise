import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ComparisonCard } from '@/src/components/ComparisonCard';
import { EventBreakdownBars } from '@/src/components/EventBreakdownBars';
import { EventTimeline } from '@/src/components/EventTimeline';
import { ScoreGauge } from '@/src/components/ScoreGauge';
import { StatRow } from '@/src/components/StatRow';
import { scoreColor } from '@/src/constants/theme';
import { getSessionById, loadSessions } from '@/src/services/driveStorage';
import {
  breakdownFromEvents,
  compareSessions,
} from '@/src/services/scoreEngine';
import type { DriveSession } from '@/src/types/drive';
import { formatDateTime, formatDuration } from '@/src/utils/math';

export default function SummaryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [session, setSession] = useState<DriveSession | null>(null);
  const [previous, setPrevious] = useState<DriveSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const current = await getSessionById(id);
      const all = await loadSessions();
      const idx = all.findIndex((s) => s.id === id);
      const prev = idx >= 0 ? all[idx + 1] ?? null : null;
      if (active) {
        setSession(current);
        setPrevious(prev);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-drive-bg">
        <ActivityIndicator color="#22c55e" />
      </View>
    );
  }

  if (!session) {
    return (
      <View className="flex-1 items-center justify-center bg-drive-bg px-6">
        <Text className="mb-4 text-center text-drive-muted">
          Drive session not found.
        </Text>
        <Pressable onPress={() => router.replace('/')}>
          <Text className="font-semibold text-drive-accent">Go home</Text>
        </Pressable>
      </View>
    );
  }

  const breakdown = breakdownFromEvents(session.events);
  const comparison = compareSessions(session, previous);

  return (
    <SafeAreaView className="flex-1 bg-drive-bg" edges={['bottom']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-10 pt-2"
      >
        <Text className="mb-1 text-sm text-drive-muted">
          {formatDateTime(session.startedAt)}
        </Text>
        <Text className="mb-6 text-2xl font-bold text-white">Drive Summary</Text>

        <View className="mb-6 items-center rounded-2xl bg-drive-surface py-6">
          <ScoreGauge score={session.score} rating={session.rating} />
        </View>

        <View className="mb-6 rounded-2xl bg-drive-surface px-4">
          <StatRow label="Drive Duration" value={formatDuration(session.durationMs)} />
          <StatRow label="Total Events" value={String(session.events.length)} />
          <StatRow
            label="Driving Score"
            value={String(session.score)}
            accent={scoreColor(session.score)}
          />
          <StatRow
            label="Safety Rating"
            value={session.rating}
            accent={scoreColor(session.score)}
          />
        </View>

        <Text className="mb-2 text-sm font-semibold uppercase tracking-wider text-drive-muted">
          Event breakdown
        </Text>
        <View className="mb-6">
          <EventBreakdownBars
            breakdown={breakdown}
            total={session.events.length}
          />
        </View>

        <Text className="mb-2 text-sm font-semibold uppercase tracking-wider text-drive-muted">
          Event timeline
        </Text>
        <View className="mb-6">
          <EventTimeline
            events={session.events}
            startedAt={session.startedAt}
          />
        </View>

        <Text className="mb-2 text-sm font-semibold uppercase tracking-wider text-drive-muted">
          Historical comparison
        </Text>
        <ComparisonCard {...comparison} />

        <Pressable
          onPress={() => router.replace('/')}
          className="mt-8 items-center rounded-2xl bg-drive-accent px-6 py-4 active:opacity-90"
        >
          <Text className="text-base font-bold text-drive-bg">Back to Home</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
