import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ComparisonCard } from '@/src/components/ComparisonCard';
import { scoreColor } from '@/src/constants/theme';
import { loadSessions } from '@/src/services/driveStorage';
import { compareSessions } from '@/src/services/scoreEngine';
import type { DriveSession } from '@/src/types/drive';
import { formatDateTime, formatDuration } from '@/src/utils/math';

export default function HistoryScreen() {
  const router = useRouter();
  const [sessions, setSessions] = useState<DriveSession[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      loadSessions().then((data) => {
        if (active) {
          setSessions(data);
          setLoading(false);
        }
      });
      return () => {
        active = false;
      };
    }, []),
  );

  const latest = sessions[0] ?? null;
  const previous = sessions[1] ?? null;
  const comparison = latest
    ? compareSessions(latest, previous)
    : { scoreDelta: 0, eventDelta: 0, hasPrevious: false as const };

  return (
    <SafeAreaView className="flex-1 bg-drive-bg" edges={['bottom']}>
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#22c55e" />
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          contentContainerClassName="px-5 pb-10 pt-2"
          ListHeaderComponent={
            <View className="mb-4">
              <Text className="mb-1 text-2xl font-bold text-white">
                Drive History
              </Text>
              <Text className="mb-4 text-sm text-drive-muted">
                {sessions.length} saved session
                {sessions.length === 1 ? '' : 's'}
              </Text>
              {latest ? (
                <>
                  <Text className="mb-2 text-sm font-semibold uppercase tracking-wider text-drive-muted">
                    Latest vs previous
                  </Text>
                  <ComparisonCard {...comparison} />
                  <Text className="mb-2 mt-6 text-sm font-semibold uppercase tracking-wider text-drive-muted">
                    All drives
                  </Text>
                </>
              ) : null}
            </View>
          }
          ListEmptyComponent={
            <View className="mt-16 items-center px-6">
              <Text className="text-center text-base text-drive-muted">
                No drive history yet. Complete a session to see scores and
                comparisons here.
              </Text>
            </View>
          }
          renderItem={({ item, index }) => {
            const prev = sessions[index + 1] ?? null;
            const delta = prev ? item.score - prev.score : null;
            return (
              <Pressable
                onPress={() => router.push(`/summary/${item.id}`)}
                className="mb-3 rounded-2xl bg-drive-surface px-4 py-4 active:opacity-90"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-white">
                      {formatDateTime(item.startedAt)}
                    </Text>
                    <Text className="mt-1 text-sm text-drive-muted">
                      {formatDuration(item.durationMs)} · {item.events.length}{' '}
                      events · {item.rating}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text
                      className="text-2xl font-bold"
                      style={{ color: scoreColor(item.score) }}
                    >
                      {item.score}
                    </Text>
                    {delta != null ? (
                      <Text
                        className="text-xs"
                        style={{
                          color: delta >= 0 ? '#22c55e' : '#ef4444',
                        }}
                      >
                        {delta >= 0 ? `+${delta}` : delta} vs prev
                      </Text>
                    ) : null}
                  </View>
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}
