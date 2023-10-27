<template>
  <div class="landing-page" data-aos="fade-up">
    <h1>Welcome to the Voting System</h1>
    <p>
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla vel libero
      at nunc auctor finibus. Duis in venenatis ipsum. Aenean lacinia,
      tortor in bibendum venenatis, neque ligula euismod neque.
    </p>
    <p>
      In our system, you can create and participate in polls to gather opinions
      and make informed decisions.
    </p>
    <div class="voting-system-image">
      <img src="../assets/voting.jpg" alt="Real-time Voting System" class="pulse-image" />
    </div>
    <router-link to="/login">
      <button class="get-started-button">Get Started</button>
    </router-link>
    <p>
      Experience real-time live voting where users can cast their votes and see
      results instantly. Our system provides a seamless and interactive way to
      engage in democratic processes and gather valuable insights.
    </p>
  </div>
</template>

<script>
import AOS from 'aos';
import 'aos/dist/aos.css'; // Import AOS CSS

export default {
  name: 'HomeComponent',
  // Component logic goes here
  mounted() {
    // Initialize AOS when the component is mounted
    AOS.init({
      // Global settings for AOS here (optional)
      duration: 1000, // Duration of animations (in milliseconds)
      // offset: 0, // Offset (in pixels) from the original trigger point
      // easing: 'ease-in-out', // Easing for animations
      // once: true, // Only run once on scroll
    });
  },
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.landing-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin: 0;
  padding: 30px;
  background-color: #fffdfd;
  min-height: 100vh;
}

h1 {
  font-size: 36px;
  margin-bottom: 20px;
}

p {
  font-size: 18px;
  margin-bottom: 10px;
}

.get-started-button {
  background-color: #007bff;
  color: #fff;
  font-size: 20px;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  text-decoration: none;
  transition: background-color 0.3s;
}

.get-started-button:hover {
  background-color: #0056b3;
}

img {
  height: 50vh;
  width: 100%;
}

.pulse-image {
  animation: pulse 2s infinite;
  /* Adjust the animation duration as needed */
}
</style>
