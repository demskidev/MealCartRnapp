import { SearchIcon } from '@/assets/svg';
import FilterModal from '@/components/FilterModal';
import { horizontalScale, moderateScale, verticalScale } from '@/constants/Constants';
import { Colors, FontFamilies } from '@/constants/Theme';
import { FontFamily } from '@/utils/Fonts';
import { useState } from 'react';
import { Dimensions, FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
const { height } = Dimensions.get('window');
const { width } = Dimensions.get('window');
const MealsScreen: React.FC = () => {
  const [search, setSearch] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const itemWidth = (width - horizontalScale(40) - horizontalScale(8)) / 2;

  const [isMyMeals, setIsMyMeals] = useState(true);

  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({
    category: null,
    difficulty: null,
    prepTime: null,
  });

  const mealData = [
    { id: '1', title: 'Classic Spaghetti Bolo...', tag: 'Dinner', image: require('@/assets/images/mealfoodA.png'), time: '30 min', difficulty: 'Moderate' },
    { id: '2', title: 'Example Meal', tag: 'Lunch', image: require('@/assets/images/mealfoodB.png'), time: '30 min', difficulty: 'Moderate' },
    { id: '3', title: 'Classic Spaghetti Bolo...', tag: 'Dinner', image: require('@/assets/images/mealfoodC.png'), time: '30 min', difficulty: 'Moderate' },
    { id: '4', title: 'Example Meal', tag: 'Lunch', image: require('@/assets/images/mealfoodD.png'), time: '30 min', difficulty: 'Moderate' },
    { id: '5', title: 'Classic Spaghetti Bolo...', tag: 'Dinner', image: require('@/assets/images/mealfoodE.png'), time: '30 min', difficulty: 'Moderate' },
    { id: '6', title: 'Example Meal', tag: 'Lunch', image: require('@/assets/images/mealfoodF.png'), time: '30 min', difficulty: 'Moderate' },
    { id: '7', title: 'Classic Spaghetti Bolo...', tag: 'Dinner', image: require('@/assets/images/mealfoodG.png'), time: '30 min', difficulty: 'Moderate' },
    { id: '8', title: 'Example Meal', tag: 'Lunch', image: require('@/assets/images/mealfoodH.png'), time: '30 min', difficulty: 'Moderate' },
  ];
  const filteredMeals = mealData.filter(item => {
    if (filters.category && item.tag !== filters.category) {
      return false;
    }

    if (filters.difficulty && item.difficulty !== filters.difficulty) {
      return false;
    }

    if (filters.prepTime) {
      const time = parseInt(item.time) || 0;
      if (filters.prepTime === '< 5 Mins' && time >= 5) return false;
      if (filters.prepTime === '5 - 10 Mins' && (time < 5 || time > 10)) return false;
      if (filters.prepTime === '10 - 15 Mins' && (time < 10 || time > 15)) return false;
      if (filters.prepTime === '> 15 Mins' && time <= 15) return false;
    }

    return true;
  });



  const renderMealCard = ({ item, index }) => (
    <View style={{
      backgroundColor: Colors.white,
      borderRadius: moderateScale(8),
      marginTop: moderateScale(8),
      flex: 1,
      elevation: 3,
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      overflow: 'visible',

      marginBottom: verticalScale(8),
      marginRight: index % 2 === 0 ? horizontalScale(14) : 0,
    }}>
      <Image source={item.image} resizeMode="cover" style={{ width: '99%', height: verticalScale(105), backgroundColor: Colors.white, alignSelf: 'center', borderTopLeftRadius: moderateScale(8), borderTopRightRadius: moderateScale(8) }}
      />

      <View style={{ padding: moderateScale(12) }}>
        <Text style={styles.mealNametext} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.timeText}>{item.time}  •  {item.difficulty}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.topTextParent}>
        <View style={styles.parentMymeal}>
          <View>
            <Text style={styles.title}>{isMyMeals ? 'My Meals' : 'Browse Meals'}</Text>
            <Text style={styles.subtitle}>{isMyMeals ? "Browse Meals" : "My Meals "}</Text>
          </View>

          <TouchableOpacity style={{ marginLeft: horizontalScale(6), }} onPress={() => setIsMyMeals(prev => !prev)}  >
            <Image source={require("@/assets/images/browseicon.png")} resizeMode="contain" style={{ width: moderateScale(24), height: moderateScale(26), }} />

          </TouchableOpacity>
        </View>


        <Image source={require("@/assets/images/gradientclose.png")} resizeMode="contain" style={{ width: moderateScale(56), height: moderateScale(56), alignSelf: 'flex-end', marginRight: horizontalScale(-17), }} />

      </View>
      <View style={styles.parentSearchBox}>
        <View style={styles.searchBox}>
          <SearchIcon width={verticalScale(22)} height={verticalScale(22)} color={Colors.tertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search your meals..."
            placeholderTextColor={Colors.tertiary}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity onPress={() => setFilterModalVisible(true)}>
          <Image source={require("@/assets/images/filtericon.png")} resizeMode="contain" style={{ width: moderateScale(24), height: moderateScale(24), }} />
        </TouchableOpacity>
      </View>

      {isMyMeals ?
        <View >
          <Text style={styles.recentText}>Recent Meals</Text>

          <View style={{ height: height * 0.35, }}>
            <FlatList
              data={mealData}
              renderItem={renderMealCard}
              keyExtractor={item => item.id}
              numColumns={2}
              columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: verticalScale(8) }}
              contentContainerStyle={{ paddingBottom: 60 }}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={<Text>No meals found</Text>}

            />
          </View>
          <Text style={styles.upcomingText}>Your Meals</Text>
          <View style={{ height: height * 0.3, }} >

            <FlatList
              data={mealData}
              renderItem={renderMealCard}
              keyExtractor={item => item.id}
              numColumns={2}
              columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: verticalScale(8) }}
              contentContainerStyle={{
                paddingBottom: verticalScale(100),

              }}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={<Text>No meals found</Text>}

            />
          </View>
        </View> :
        <View style={{ flex: 1 }}>
          <Text style={[styles.recentText, { marginVertical: verticalScale(10) }]}>All Meals</Text>

          <FlatList
            data={mealData}
            renderItem={renderMealCard}
            keyExtractor={item => item.id}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: verticalScale(8) }}
            contentContainerStyle={{ paddingBottom: 160 }}
            showsVerticalScrollIndicator={false}


          />


        </View>
      }

      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onConfirm={(selectedFilters) => {
          setFilters(selectedFilters);
          setFilterModalVisible(false);
        }}
        onReset={() => {
          setFilters({
            category: null,
            difficulty: null,
            prepTime: null,
          });
        }}
      />

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {

    backgroundColor: Colors.background,
    paddingHorizontal: horizontalScale(20),
    paddingBottom: verticalScale(15)

  },

  title: {
    fontFamily: FontFamilies.ROBOTO_SEMI_BOLD,
    fontSize: moderateScale(21),
    color: Colors.primary,
  },
  subtitle: {
    fontFamily: FontFamilies.ROBOTO_SEMI_BOLD,
    fontSize: moderateScale(12),
    color: '#667D4C',
    marginTop: verticalScale(3),
  },
  parentMymeal: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  topTextParent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: moderateScale(30),
    borderWidth: moderateScale(1),
    borderColor: Colors.borderColor,
    paddingHorizontal: horizontalScale(12),
    height: verticalScale(44),
    width: width * 0.6

  },
  searchInput: {
    flex: 1,
    fontFamily: FontFamilies.ROBOTO_REGULAR,
    fontSize: moderateScale(14),
    color: Colors.primary,
    marginLeft: horizontalScale(8),
  },
  parentSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: verticalScale(8),
    justifyContent: 'space-between',

  },
  parentOfRecentMeal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

  },
  recentText: {
    fontSize: moderateScale(21),
    fontFamily: FontFamily.ROBOTO_SEMI_BOLD,
    color: Colors.primary,
    marginBottom: verticalScale(4)
  },
  mealNametext: {

    fontSize: moderateScale(14), fontFamily: FontFamily.ROBOTO_MEDIUM, color: Colors.primary
  },
  timeText: {
    fontFamily: FontFamilies.ROBOTO_REGULAR,
    fontSize: moderateScale(10),
    color: Colors.tertiary
  },
  upcomingText: { fontSize: moderateScale(21), fontWeight: '600', color: Colors.primary, fontFamily: FontFamily.ROBOTO_SEMI_BOLD, marginVertical: verticalScale(14) },


});

export default MealsScreen;



