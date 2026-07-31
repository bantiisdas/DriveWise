import { Text, View } from 'react-native';

import { scoreColor } from '@/src/constants/theme';
import type { SafetyRating } from '@/src/types/drive';

type Props = {
  score: number;
  rating: SafetyRating;
  size?: 'sm' | 'lg';
};

export function ScoreGauge({ score, rating, size = 'lg' }: Props) {
  const color = scoreColor(score);
  const isLarge = size === 'lg';

  return (
    <View className="items-center">
      <View
        className={`items-center justify-center rounded-full border-4 ${
          isLarge ? 'h-36 w-36' : 'h-24 w-24'
        }`}
        style={{ borderColor: color }}
      >
        <Text
          className={`font-bold text-white ${isLarge ? 'text-5xl' : 'text-3xl'}`}
          style={{ color }}
        >
          {score}
        </Text>
        <Text className="text-xs uppercase tracking-wider text-drive-muted">
          score
        </Text>
      </View>
      <Text
        className={`mt-3 font-semibold ${isLarge ? 'text-xl' : 'text-base'}`}
        style={{ color }}
      >
        {rating}
      </Text>
    </View>
  );
}
