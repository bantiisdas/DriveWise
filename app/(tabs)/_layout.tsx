import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';

function TabIcon({
  name,
  color,
}: {
  name: ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome name={name} size={22} color={color} style={{ marginBottom: -2 }} />;
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: '#0b1220' },
        headerTintColor: '#f1f5f9',
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: '#152033',
          borderTopColor: '#243247',
        },
        tabBarActiveTintColor: '#22c55e',
        tabBarInactiveTintColor: '#8b9bb4',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'DriveWise',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => (
            <TabIcon name="home" color={String(color)} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => (
            <TabIcon name="history" color={String(color)} />
          ),
        }}
      />
    </Tabs>
  );
}
