import { moderateScale } from '@/constants/constants';
import { Colors } from '@/constants/theme';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MealsScreen = () => {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Text style={styles.text}>Meals Screen</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  text: {
    fontSize: moderateScale(18),
    fontWeight: 'bold',
    color: Colors.text,
  },
});

export default MealsScreen;
