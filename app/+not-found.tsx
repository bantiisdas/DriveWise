import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View className="flex-1 items-center justify-center bg-drive-bg px-5">
        <Text className="mb-3 text-xl font-bold text-white">
          Screen not found
        </Text>
        <Link href="/" className="mt-2">
          <Text className="text-drive-accent">Go to home</Text>
        </Link>
      </View>
    </>
  );
}
