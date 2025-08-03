<template>
  <div class="goals-page">
    <router-link to="/" class="back-button">← Back</router-link>
    <h2>Set Your Daily Macro Goals</h2>

    <form @submit.prevent="calculateGoals">
      <label>
        Age:
        <input type="number" v-model.number="age" min="0" required />
      </label>

      <label>
        Gender:
        <select v-model="gender" required>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </label>

      <label>
        Weight (kg):
        <input type="number" v-model.number="weight" min="0" required />
      </label>

      <label>
        Height (cm):
        <input type="number" v-model.number="height" min="0" required />
      </label>

      <label>
        Activity Level:
        <select v-model.number="activityLevel" required>
          <option :value="1.2">Sedentary</option>
          <option :value="1.375">Lightly Active</option>
          <option :value="1.55">Moderately Active</option>
          <option :value="1.725">Very Active</option>
          <option :value="1.9">Extra Active</option>
        </select>
      </label>

      <label>
        Goal:
        <select v-model="goalType" required>
          <option value="maintain">Maintain</option>
          <option value="lose">Lose Weight</option>
          <option value="gain">Gain Weight</option>
        </select>
      </label>

      <button type="submit" :disabled="isSubmitting">Calculate</button>
    </form>

    <div v-if="macroGoals">
      <h3>Your Daily Macro Goals</h3>
      <p>Calories: {{ macroGoals.calories }}</p>
      <p>Protein: {{ macroGoals.protein }} g</p>
      <p>Fat: {{ macroGoals.fat }} g</p>
      <p>Carbs: {{ macroGoals.carbs }} g</p>
    </div>
  </div>
</template>

<script>
export default {
  name: "GoalsPage",
  data() {
    return {
      age: null,
      gender: "male",
      weight: null,
      height: null,
      activityLevel: 1.2,
      goalType: "maintain",
      macroGoals: null,
      isSubmitting: false,
    };
  },
  methods: {
    async calculateGoals() {
      this.isSubmitting = true;
      // Mifflin-St Jeor BMR formula
      let bmr =
        this.gender === "male"
          ? 10 * this.weight + 6.25 * this.height - 5 * this.age + 5
          : 10 * this.weight + 6.25 * this.height - 5 * this.age - 161;

      // Multiply by activity level
      let calories = bmr * this.activityLevel;

      // Adjust based on goal
      if (this.goalType === "lose") calories -= 500;
      else if (this.goalType === "gain") calories += 500;

      // Macro breakdown: 40% carbs, 30% protein, 30% fats
      const protein = Math.round((0.3 * calories) / 4);
      const fat = Math.round((0.3 * calories) / 9);
      const carbs = Math.round((0.4 * calories) / 4);

      // Set and display macro goals
      this.macroGoals = {
        calories: Math.round(calories),
        protein,
        fat,
        carbs,
      };

      // Save to localStorage as fallback
      localStorage.setItem("macroGoals", JSON.stringify(this.macroGoals));

      // Save to backend (if logged in)
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        await fetch("http://localhost:5050/api/goals", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(this.macroGoals),
        });
      } catch (err) {
        console.error("Failed to save goals to backend:", err);
      } finally {
        this.isSubmitting = false;
      }
    },
  },
  mounted() {
    // Load fallback goals from localStorage on mount
    const saved = localStorage.getItem("macroGoals");
    if (saved) this.macroGoals = JSON.parse(saved);
  },
};
</script>

<style scoped>
.back-button {
  display: inline-block;
  margin-bottom: 1rem;
  color: #007bff;
  text-decoration: none;
  font-weight: bold;
}
.back-button:hover {
  text-decoration: underline;
}
.goals-page {
  padding: 2rem;
  max-width: 500px;
  margin: auto;
}
form {
  display: flex;
  flex-direction: column;
}
label {
  margin: 10px 0;
}
button {
  margin-top: 15px;
}
</style>
