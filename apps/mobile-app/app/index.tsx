import { View, Text, StyleSheet, Button } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { formatDate } from '@puff/utils';
import { validateActivity } from '@puff/business-logic';
import type { Activity } from '@puff/types';

export default function Index() {
  const [currentDate, setCurrentDate] = useState(formatDate(new Date()));

  // 示例活动数据
  const activity: Activity = {
    id: '1',
    name: '双十一活动',
    type: 'halloween',
    startTime: '2024-11-01T00:00:00Z',
    endTime: '2024-11-11T23:59:59Z',
  };

  const isActivityValid = validateActivity(activity.startTime, activity.endTime);

  const handleRefreshDate = () => {
    setCurrentDate(formatDate(new Date()));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to Expo Router!</Text>

      <View style={styles.section}>
        <Text style={styles.label}>使用 @puff/utils:</Text>
        <Text style={styles.value}>当前日期: {currentDate}</Text>
        <Button title="刷新日期" onPress={handleRefreshDate} />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>使用 @puff/types 和 @puff/business-logic:</Text>
        <Text style={styles.value}>活动名称: {activity.name}</Text>
        <Text style={styles.value}>活动类型: {activity.type}</Text>
        <Text style={styles.value}>活动状态: {isActivityValid ? '进行中' : '已结束'}</Text>
      </View>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  section: {
    width: '100%',
    marginVertical: 15,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  value: {
    fontSize: 14,
    marginVertical: 5,
    color: '#666',
  },
});
