import * as yup from 'yup';

export const createMealValidationSchema = yup.object().shape({
  name: yup
    .string()
    .required('Meal name is required')
    .min(3, 'Meal name must be at least 3 characters')
    .max(50, 'Meal name must be less than 50 characters'),
  
  description: yup
    .string()
    .required('Meal description is required')
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description must be less than 500 characters'),
  
  ingredients: yup
    .array()
    .of(
      yup.object().shape({
        name: yup.string().required('Ingredient name is required'),
      })
    )
    .min(1, 'At least one ingredient is required'),
});
