import MealDetail from '@/components/MealDetail';
import { useMealsViewModel } from '@/viewmodels/MealsViewModel';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';

export default function MealDetailScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const {updateMealData} = useMealsViewModel()
    
    // Parse the meal data from params
    const meal = params.meal ? JSON.parse(params.meal as string) : null;

    useEffect(() => {
       updateMealData({
           ...meal,
           lastViewedAt: new Date()
       },() => {
       })

    }, []);

    if (!meal) {
        return null;
    }

    return (
        <MealDetail 
            meal={meal} 
            onBack={() => router.back()} 
        />
    );
}
