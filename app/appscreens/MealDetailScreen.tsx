import MealDetail from '@/components/MealDetail';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function MealDetailScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    
    // Parse the meal data from params
    const meal = params.meal ? JSON.parse(params.meal as string) : null;

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
