import { Text, View } from 'react-native';

type Props = {
  label: string;
  value: string;
  accent?: string;
};

export function StatRow({ label, value, accent }: Props) {
  return (
    <View className="flex-row items-center justify-between border-b border-drive-border py-3">
      <Text className="text-base text-drive-muted">{label}</Text>
      <Text
        className="text-base font-semibold text-white"
        style={accent ? { color: accent } : undefined}
      >
        {value}
      </Text>
    </View>
  );
}
