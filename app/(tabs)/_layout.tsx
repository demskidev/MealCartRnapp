import { IconCart, IconDate, IconHome, IconMeal } from '@/assets/svg';
import { moderateScale, verticalScale } from '@/constants/Constants';
import { Colors } from '@/constants/Theme';
import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { TourGuideZone } from 'rn-tourguide'; // Add this at the top
// Define tab icons with SVG support
const getTabIcon = (
  focused: boolean,
  tabName: 'home' | 'meals' | 'plans' | 'lists',
    color: string
) => {
  const iconProps = {
    width: moderateScale(24),
    height: moderateScale(24),
    fill: color,     
    stroke: color,  
  };

  switch (tabName) {
    case 'home':
      return <IconHome {...iconProps} />;
    case 'meals':
      return <IconMeal {...iconProps} />;
    case 'plans':
      return <IconDate {...iconProps} />;
    case 'lists':
      return <IconCart {...iconProps} />;
    default:
      return null;
  }
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.secondaryText,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: '#E8E8E8',
          borderTopWidth: 1,
          height: verticalScale(90),
          paddingBottom: verticalScale(30),
          paddingTop: verticalScale(8),
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.05,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: moderateScale(11),
          marginTop: verticalScale(6),
          fontWeight: '600',
        },
        tabBarIconStyle: {
          marginBottom: verticalScale(4),
        },
      }}
    >
      <Tabs.Screen
        name="0_HomeScreen"
        options={{
          title: 'Home',
     
          


          tabBarIcon: ({ focused , color }) => getTabIcon(focused, 'home',color),
          
        }}
        
      />
      <Tabs.Screen
        name="1_Meals"
        options={{
          title: 'Meals',
          
          tabBarIcon: ({ focused , color }) => getTabIcon(focused, 'meals',color),
        }}
      />
      <Tabs.Screen
        name="2_Plans"
        options={{
          title: 'Plans',
        
          tabBarIcon: ({ focused, color }) => 
             <TourGuideZone zone={3} shape="circle" borderRadius={12} maskOffset={10} >
            <View style={{ alignItems: 'center', justifyContent: 'center', minHeight: moderateScale(55), minWidth: moderateScale(40), }}>
            {getTabIcon(focused, 'plans',color)}
            </View>
            </TourGuideZone>
        }}
      />
      <Tabs.Screen
        name="3_Lists"
        options={{
          title: 'Lists',
         
          tabBarIcon: ({ focused, color }) => getTabIcon(focused, 'lists',color),
        }}
      />
    </Tabs>
  );
}
