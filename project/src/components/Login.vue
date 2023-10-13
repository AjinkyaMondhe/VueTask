<template>
  <div class="login-container">
    <div class="login-form" data-aos="flip-right">
      <div class="form-header">
        <h2>Login</h2>
      </div>
      <form @submit.prevent="login">
        <div class="form-group">
          <label for="username">Email:</label>
          <input type="text" id="username" v-model="email" required />
        </div>
        <div class="form-group">
          <label for="password">Password:</label>
          <input type="password" id="password" v-model="password" required />
        </div>
        <button type="submit">Login</button>
      </form>
      <p>Don't have an account? <router-link to="/register">Sign up here</router-link></p>
      <!-- Display error message for invalid email or password -->
      <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </div>
  </div>
</template>
  
<script>
import AOS from 'aos';
import axios from 'axios';
import 'aos/dist/aos.css'; // Import AOS CSS
import { useToast } from 'vue-toastification'; // Import toastification

export default {
  name: 'LoginPage',
  data() {
    return {
      email: '',
      password: '',
      errorMessage: '', // Add a property to store error messages
    };
  },
  setup(){
    const toast = useToast();
    return {toast};
  },
  methods: {
    async login() {
      try {
        const response = await axios.post("http://localhost:3000/login", {
          email: this.email,
          password: this.password,
        });
        if (response.status === 200) {
          const { data } = response;
          localStorage.setItem('token', data.token);

          this.$router.push('/dashboard');
          this.toast.success("Log In Successfull!")
        } else if (response.status === 401) {
          // Handle invalid email or password
          this.toast.error("Invalid email or password");
          this.errorMessage = "Invalid email or password";
        } else {
          alert("Login Failed: Unexpected response from server");
        }
      } catch (error) {
        this.toast.error("Invalid email or password");
        console.error("Error:", error);
      }
    },
  },
  mounted() {
    // Initialize AOS when the component is mounted
    AOS.init({
      // Global settings for AOS here (optional)
      duration: 800, // Duration of animations (in milliseconds)
      offset: 100, // Offset (in pixels) from the original trigger point
      easing: 'ease-in-out', // Easing for animations
      // Only run once on scroll
    });
  },
};
</script>
  
<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  /* Ensure the component takes up at least the full viewport height */
}

.login-form {
  max-width: 300px;
  padding: 40px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.form-header {
  color: #007bff;
  text-align: center;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  font-weight: bold;
}

input[type="text"],
input[type="password"] {
  width: 100%;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 3px;
}

button {
  width: 50%;
  padding: 10px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  margin: 0px 60px;
}

button:hover {
  background-color: #00458e;
}
</style>
