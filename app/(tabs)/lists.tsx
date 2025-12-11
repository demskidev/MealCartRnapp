import { moderateScale } from '@/constants/Constants';
import { Colors } from '@/constants/Theme';
import { StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ListsScreen = () => {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Text style={styles.text}>Lists Screen</Text>
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
    color: Colors.primary,
  },
});

export default ListsScreen;
