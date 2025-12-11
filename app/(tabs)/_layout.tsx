import { IconCart, IconDate, IconHome, IconMeal } from '@/assets/svg';
import { moderateScale, verticalScale } from '@/constants/Constants';
import { Colors } from '@/constants/Theme';
import { Tabs } from 'expo-router';

// Define tab icons with SVG support
const getTabIcon = (
  focused: boolean,
  tabName: 'home' | 'meals' | 'plans' | 'lists'
) => {
  const iconProps = {
    width: moderateScale(24),
    height: moderateScale(24),
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
          height: verticalScale(70),
          paddingBottom: verticalScale(10),
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
        name="home_screen"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => getTabIcon(focused, 'home'),
        }}
      />
      <Tabs.Screen
        name="meals"
        options={{
          title: 'Meals',
          tabBarIcon: ({ focused }) => getTabIcon(focused, 'meals'),
        }}
      />
      <Tabs.Screen
        name="plans"
        options={{
          title: 'Plans',
          tabBarIcon: ({ focused }) => getTabIcon(focused, 'plans'),
        }}
      />
      <Tabs.Screen
        name="lists"
        options={{
          title: 'Lists',
          tabBarIcon: ({ focused }) => getTabIcon(focused, 'lists'),
        }}
      />
    </Tabs>
  );
}
