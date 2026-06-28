/* eslint-disable no-console, @typescript-eslint/no-unused-vars -- Example file for demonstration */
import React from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView } from 'react-native';
import { useFormState } from '../../src/forms/useFormState';
import { createValidationSchema, validators } from '../../src/forms/ValidationBuilder';
import { applyPhoneMask, applyCurrencyMask } from '../../src/forms/masks';

// 1. Define Form Data Type
interface SignUpForm {
  email: string;
  phone: string;
  age: number;
  salary: string; // Masked input usually managed as string
}

// 2. Create Validation Schema
const signUpSchema = createValidationSchema<SignUpForm>((z) => ({
  email: validators.email(),
  phone: validators.phone(),
  age: z.coerce.number().min(18, 'Must be at least 18'),
  salary: validators.required('Salary is required'),
}));

export const FormExample = () => {
  // 3. Initialize Form Hook
  const { form, errors, handleSubmit, isSubmitting, isValid, setValue, watch } =
    useFormState<SignUpForm>({
      schema: signUpSchema,
      defaultValues: {
        email: '',
        phone: '',
        age: 18,
        salary: '',
      },
      mode: 'onChange',
    });

  // Watch values for masking effects
  const phoneValue = watch('phone');
  const salaryValue = watch('salary');

  // 4. Submit Handler
  const onSubmit = async (data: SignUpForm) => {
    console.log('Form Submitted:', data);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    alert('Success!');
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Sign Up Form</Text>

      {/* Email Input */}
      <View style={styles.field}>
        <Text>Email</Text>
        <TextInput
          style={styles.input}
          onChangeText={(text) => setValue('email', text, { shouldValidate: true })}
          placeholder="email@example.com"
          autoCapitalize="none"
        />
        {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}
      </View>

      {/* Phone Input with Masking */}
      <View style={styles.field}>
        <Text>Phone</Text>
        <TextInput
          style={styles.input}
          value={phoneValue}
          onChangeText={(text) => {
            // Apply mask and update state
            const masked = applyPhoneMask(text);
            setValue('phone', masked, { shouldValidate: true });
          }}
          placeholder="(555) 555-5555"
          keyboardType="phone-pad"
        />
        {errors.phone && <Text style={styles.error}>{errors.phone.message}</Text>}
      </View>

      {/* Age Input */}
      <View style={styles.field}>
        <Text>Age</Text>
        <TextInput
          style={styles.input}
          onChangeText={(text) => setValue('age', Number(text), { shouldValidate: true })}
          placeholder="18"
          keyboardType="numeric"
        />
        {errors.age && <Text style={styles.error}>{errors.age.message}</Text>}
      </View>

      {/* Salary Input (Currency Mask) */}
      <View style={styles.field}>
        <Text>Expected Salary</Text>
        <TextInput
          style={styles.input}
          value={salaryValue}
          onChangeText={(text) => {
            // Simple currency mask handling
            const clean = text.replace(/[^0-9]/g, '');
            const numberVal = parseInt(clean || '0', 10) / 100;
            const masked = applyCurrencyMask(numberVal);
            setValue('salary', masked, { shouldValidate: true });
          }}
          placeholder="$0.00"
          keyboardType="numeric"
        />
        {errors.salary && <Text style={styles.error}>{errors.salary.message}</Text>}
      </View>

      {/* Submit Button */}
      <Button
        title={isSubmitting ? 'Submitting...' : 'Sign Up'}
        onPress={() => handleSubmit(onSubmit)}
        disabled={!isValid || isSubmitting}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  field: {
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginTop: 2,
  },
});
