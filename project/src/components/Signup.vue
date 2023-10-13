<template>
  <div class="signup-container">
    <div class="signup-form" data-aos="flip-left">
      <h2>Sign Up</h2>
      <form @submit.prevent="signup">
        <div class="form-group">
          <label for="fullname">FullName:</label>
          <input type="text" id="fullname" v-model="user.fullname" required />
        </div>
        <div class="form-group">
          <label for="email">Email:</label>
          <input type="email" id="email" v-model="user.email" required />
        </div>
        <div class="form-group">
          <label for="password">Password:</label>
          <input type="password" id="password" v-model="user.password" required />
        </div>
        <div class="form-group">
          <label for="confirmPassword">Confirm Password:</label>
          <input type="password" id="confirmPassword" v-model="user.confirmPassword" required />
        </div>
        <button type="submit">Sign Up</button>
      </form>
      <p>Already have an account? <router-link to="/login">Login here</router-link></p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useToast } from 'vue-toastification';

export default {
  name: 'SignupPage',

  data() {
    return {
      user: {
        fullname: '',
        email: '',
        password: '',
        confirmPassword: '',
      },
    };
  },

  methods: {
    async signup() {
      const toast = useToast();

      // Assuming this.user contains user registration data (e.g., email, password)
      const registrationData = {
        fullname:this.user.fullname,
        email: this.user.email,
        password: this.user.password,
      };

      try {
        // Send the registration data to your server using axios
        const response = await axios.post('http://localhost:3000/register', registrationData);

        if (response.status === 201) {
          this.$router.push('/login');
          toast.success('Registration Successful', {
            // Toast configuration options
          });
        } else {
          toast.error('Registration Failed: ' + response.data.errorMessage, {
            // Toast configuration options
          });
        }
      } catch (error) {
        toast.error('Registration Failed: ' + error.message, {
          // Toast configuration options
        });
        console.error('Error:', error);
      }
    },
  },

  mounted() {
    // Initialize AOS when the component is mounted
    AOS.init({
      duration: 800,
      offset: 100,
      easing: 'ease-in-out',
    });
  },
};
</script>

  
<style scoped>
.signup-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f0f0;
  /* Background color for the entire page */
  margin: 0;
}

.signup-form {
  max-width: 300px;

  padding: 20px 40px;
  border: 1px solid #e0e0e0;
  border-radius: 5px;
  background-color: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  color: #007bff;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  font-weight: bold;
  color: #333;
}

input[type="text"],
input[type="email"],
input[type="password"] {
  width: 100%;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 5px;
  background-color: #f8f8f8;
  color: #333;
}

button {
  width: 50%;
  padding: 12px;
  background-color: #007bff;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s ease-in-out;
  margin: 0px 60px;
}

button:hover {
  background-color: #0056b3;
}

p {
  margin-top: 15px;
  text-align: center;
  color: #666;
}

.router-link {
  color: #007bff;
  text-decoration: none;
  font-weight: bold;
}

.router-link:hover {
  text-decoration: underline;
}
</style>
